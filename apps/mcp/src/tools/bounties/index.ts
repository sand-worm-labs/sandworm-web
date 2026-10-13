import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { notebookId } from '../notebooks/shared.ts';
import { handle, workspaceId } from '../shared.ts';

// Attesting re-runs the notebook and sends two transactions, so it outlasts the usual call.
const ATTEST_TIMEOUT_MS = 150_000;

const slug = z.string().min(1).describe('The bounty\'s slug, as returned by list_bounties');

type Attestation = {
  id: string;
  agentId: string;
  requestHash: string;
  receiptUri: string;
  codeHash: string;
  ranAt: string;
  validator: string;
  response?: number | null;
  requestTx: string;
  responseTx?: string | null;
};

type Entry = {
  id: string;
  bountySlug: string;
  documentId: string;
  notebookTitle: string;
  notebookSlug?: string | null;
  submittedAt?: string | null;
  trusted: boolean;
  attestation?: Attestation | null;
};

const ATTESTATION_FIELDS =
  'id agentId requestHash receiptUri codeHash ranAt validator response requestTx responseTx';
const ENTRY_FIELDS = `id bountySlug documentId notebookTitle notebookSlug submittedAt trusted attestation { ${ATTESTATION_FIELDS} }`;

const WORKFLOW =
  'The order is: build the notebook and run it, attest_notebook, publish_notebook, then submit_to_bounty. Changing any cell after attesting makes the attestation stale, so attest again.';

export function registerBountyTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'list_bounties',
    {
      description:
        'List the bounties that are listed on Sandworm, with their reward, status and summary. Use get_bounty for a bounty\'s full brief. Only notebooks that are attested (trusted) can be submitted to a bounty.',
    },
    handle(async () => {
      const data = await graphql<{ getBounties: Record<string, unknown>[] }>(
        ctx,
        `query { getBounties { slug title sponsor type reward status summary deadline sample } }`,
      );
      return data.getBounties;
    }),
  );

  server.registerTool(
    'get_bounty',
    {
      description:
        'Get one bounty\'s full brief: the questions to answer, what to submit, how it is judged and data hints. Read it before building the notebook that answers it.',
      inputSchema: { slug },
    },
    handle(async ({ slug }) => {
      const data = await graphql<{ getBounty: Record<string, unknown> | null }>(
        ctx,
        `query ($slug: String!) {
          getBounty(slug: $slug) {
            slug title sponsor type reward status summary details background requirements deliverables
            prizes judging dataHints deadline sample
          }
        }`,
        { slug },
      );
      if (!data.getBounty) throw new Error(`No bounty ${slug}`);
      return data.getBounty;
    }),
  );

  server.registerTool(
    'start_bounty',
    {
      description: `Record the notebook you are building for a bounty, so it shows as the user's entry in progress. Does not submit it. ${WORKFLOW}`,
      inputSchema: { slug, notebookId },
    },
    handle(async ({ slug, notebookId }) => {
      const data = await graphql<{ startBountyEntry: Entry }>(
        ctx,
        `mutation ($slug: String!, $documentId: String!) {
          startBountyEntry(slug: $slug, documentId: $documentId) { ${ENTRY_FIELDS} }
        }`,
        { slug, documentId: notebookId },
      );
      return data.startBountyEntry;
    }),
  );

  server.registerTool(
    'list_bounty_entries',
    {
      description: 'List the submitted entries to a bounty: the notebooks, who wrote them, and whether each is trusted (attested onchain).',
      inputSchema: { slug },
    },
    handle(async ({ slug }) => {
      const data = await graphql<{ getBountyEntries: Entry[] }>(
        ctx,
        `query ($slug: String!) { getBountyEntries(slug: $slug) { ${ENTRY_FIELDS} author } }`,
        { slug },
      );
      return data.getBountyEntries;
    }),
  );

  server.registerTool(
    'my_bounty_entries',
    {
      description: 'List the bounties the user has started or submitted an entry to, with each entry\'s notebook and whether it is trusted.',
    },
    handle(async () => {
      const data = await graphql<{ getMyBountyEntries: Entry[] }>(
        ctx,
        `query { getMyBountyEntries { ${ENTRY_FIELDS} } }`,
      );
      return data.getMyBountyEntries;
    }),
  );

  server.registerTool(
    'check_notebook_trust',
    {
      description: `Check whether a notebook can be submitted to a bounty right now: attested onchain, validated, and unchanged since. If not, says why. ${WORKFLOW}`,
      inputSchema: { notebookId, workspaceId },
    },
    handle(async ({ notebookId, workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ getNotebookTrust: { trusted: boolean; reason?: string | null; attestation?: Attestation | null } }>(
        ctx,
        `query ($workspaceId: String!, $documentId: String!) {
          getNotebookTrust(workspaceId: $workspaceId, documentId: $documentId) { trusted reason attestation { ${ATTESTATION_FIELDS} } }
        }`,
        { workspaceId: ws, documentId: notebookId },
      );
      return data.getNotebookTrust;
    }),
  );

  server.registerTool(
    'attest_notebook',
    {
      description: [
        'Make a notebook trusted: commit its inputs onchain (the code, data sources and parameters of every cell, and when it last ran) and have a validator re-run it and check them. Run the notebook first, so every cell has a result. Takes up to a minute.',
        'The attestation says exactly what was run and by which agent. It does not hash the output, which changes as the data does, and it does not prove the logic is correct.',
        'Cloud notebooks only. The code is pinned publicly (IPFS) for good, so attest only a notebook you are happy to share. Bounties accept only attested notebooks.',
        WORKFLOW,
      ].join(' '),
      inputSchema: { notebookId, workspaceId },
    },
    handle(async ({ notebookId, workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ attestNotebook: Attestation }>(
        ctx,
        `mutation ($workspaceId: String!, $documentId: String!) {
          attestNotebook(workspaceId: $workspaceId, documentId: $documentId) { ${ATTESTATION_FIELDS} }
        }`,
        { workspaceId: ws, documentId: notebookId },
        { timeoutMs: ATTEST_TIMEOUT_MS },
      );
      const a = data.attestNotebook;
      return {
        trusted: a.response === 100,
        ...a,
        message:
          a.response === 100
            ? 'The validator passed it. Publish the notebook, then submit it with submit_to_bounty.'
            : 'The validator did not pass it: a cell failed when it was run again, or the notebook changed while it was checked. Fix it, run it, and attest again.',
      };
    }),
  );

  server.registerTool(
    'submit_to_bounty',
    {
      description: [
        'Submit a notebook as the user\'s entry to a bounty. The notebook must be published and trusted: attested with attest_notebook, with no cell changed since. A bounty funded in escrow also needs the wallet address the reward should be paid to; ask the user for it, never invent one.',
        WORKFLOW,
      ].join(' '),
      inputSchema: {
        slug,
        notebookId,
        wallet: z.string().optional().describe('The wallet address to pay the reward to. Required for a bounty funded in escrow'),
      },
    },
    handle(async ({ slug, notebookId, wallet }) => {
      const data = await graphql<{ submitBountyEntry: Entry }>(
        ctx,
        `mutation ($slug: String!, $documentId: String!, $wallet: String) {
          submitBountyEntry(slug: $slug, documentId: $documentId, wallet: $wallet) { ${ENTRY_FIELDS} }
        }`,
        { slug, documentId: notebookId, wallet },
      );
      return data.submitBountyEntry;
    }),
  );
}
