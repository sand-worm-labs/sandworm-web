import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotebookAttestationEntity } from '@sandworm/postgresql-typeorm';
import {
  REGISTRIES,
  TAG,
  VALIDATION_ABI,
  agentOwner,
  buildReceipt,
  encode,
  extractInputs,
  fetchBytes,
  hashCode,
  inputHashIsConsistent,
  parseReceipt,
  publicClient,
  publish,
  ranAt,
  runnableCellIds,
  score,
  txUrl,
  validationStatus,
  type Checks,
  type Receipt,
} from '@sandworm/trust';
import { keccak256, type Hex } from 'viem';
import type * as Y from 'yjs';
import { Repository } from 'typeorm';
import { DocumentService } from '../document/service/document.service';
import { NotebookDocService } from '../notebook-blocks/notebook-doc.service';
import type { NotebookRef } from './trust.gate';
import { NotebookRunService } from '../notebook-blocks/notebook-run.service';
import { trustedValidators, trustSigners } from './trust.config';

const RERUN_WAIT_SECONDS = 45;
const MAX_POLLS = 12;
const FETCH_TRIES = 4;

const CHECK_PROBLEMS: Record<keyof Checks, string> = {
  receiptMatchesRequest: 'the receipt could not be read back from where it was published',
  inputHashConsistent: 'the receipt is inconsistent',
  notebookStillMatches: 'the notebook changed while it was being checked',
  reran: 'a cell failed when the notebook was run again',
};

const failedChecks = (checks: Checks): string =>
  (Object.keys(CHECK_PROBLEMS) as (keyof Checks)[])
    .filter(name => !checks[name])
    .map(name => CHECK_PROBLEMS[name])
    .join('; ');

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every(id => b.includes(id));
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class TrustService {
  private readonly logger = new Logger(TrustService.name);
  // One transaction at a time per wallet, or two attestations would race for a nonce.
  private chainQueue: Promise<unknown> = Promise.resolve();
  // Attestations in flight, and the last one that failed, by notebook. Kept in memory: a restart
  // forgets them, and the notebook is simply checked again.
  private readonly running = new Map<string, { state: 'pending' } | { state: 'failed'; reason: string }>();

  constructor(
    @InjectRepository(NotebookAttestationEntity)
    private readonly attestations: Repository<NotebookAttestationEntity>,
    private readonly docs: NotebookDocService,
    private readonly runs: NotebookRunService,
    private readonly documents: DocumentService,
  ) {}

  // The latest attestation of a notebook, trusted or not, for showing.
  latest(documentId: string): Promise<NotebookAttestationEntity | null> {
    return this.attestations.findOne({ where: { documentId }, order: { createdAt: 'DESC' } });
  }

  // =====================================
  // ⬢ Start
  // =====================================
  // Begins an attestation and returns at once: it re-runs the notebook and sends two
  // transactions, longer than most clients will wait. Follow it with `status`.
  async start(ref: NotebookRef): Promise<void> {
    if (this.running.get(ref.documentId)?.state === 'pending') return;

    // What can be refused now is, so the caller hears it straight away and not after a wait.
    await this.docs.assertRunsInCloud(ref);
    trustSigners();
    await this.docs.use(ref, 'editor', ({ ydoc }) => this.snapshot(ydoc));

    this.running.set(ref.documentId, { state: 'pending' });
    void this.attest(ref).then(
      attestation => {
        if (attestation.response === 100) this.running.delete(ref.documentId);
      },
      (error: unknown) => {
        this.logger.error(`Attesting ${ref.documentId} failed`, error instanceof Error ? error.stack : String(error));
        this.running.set(ref.documentId, {
          state: 'failed',
          reason: error instanceof Error ? error.message : 'The attestation failed',
        });
      },
    );
  }

  // =====================================
  // ⬢ Attest
  // =====================================
  // Commits to the notebook's inputs, asks the validator to check them, and records the
  // verdict. The agent and validator wallets are this server's; see trust.config.ts.
  async attest(ref: NotebookRef): Promise<NotebookAttestationEntity> {
    await this.docs.assertRunsInCloud(ref);
    const { agent, validator, agentId } = trustSigners();
    const document = await this.documents.getDocument(ref.documentId, ref.workspaceId);

    const snapshot = await this.docs.use(ref, 'editor', ({ ydoc }) => this.snapshot(ydoc));
    const blockNumber = (await publicClient().getBlockNumber()).toString();
    const { receipt, bytes, requestHash } = buildReceipt({
      agentId: agentId.toString(),
      finding: document.title ?? 'Untitled notebook',
      notebook: { workspaceId: ref.workspaceId, notebookId: ref.documentId },
      inputs: snapshot.inputs,
      ranAt: snapshot.ranAt,
      blockNumber,
    });

    const existing = await this.attestations.findOneBy({ requestHash });
    if (existing?.response === 100) return existing;

    const receiptUri = await publish(bytes, `sandworm-receipt-${requestHash.slice(2, 10)}.json`);
    const requestTx = await this.send(() =>
      this.chain().simulateContract({
        account: agent.account,
        address: REGISTRIES.validation,
        abi: VALIDATION_ABI,
        functionName: 'validationRequest',
        args: [validator.account.address, agentId, receiptUri, requestHash],
      }),
      request => agent.client.writeContract(request),
    );

    const { checks, observed } = await this.check(ref, receipt, receiptUri, requestHash);
    const response = score(checks);
    const report = encode({
      type: 'sandworm-validation/v1',
      requestHash,
      agentId: agentId.toString(),
      inputHash: receipt.inputHash,
      checks,
      originalRanAt: receipt.ranAt,
      observed,
      validatedAt: new Date().toISOString(),
    });
    const responseUri = await publish(report.bytes, `sandworm-validation-${requestHash.slice(2, 10)}.json`);
    const responseTx = await this.send(() =>
      this.chain().simulateContract({
        account: validator.account,
        address: REGISTRIES.validation,
        abi: VALIDATION_ABI,
        functionName: 'validationResponse',
        args: [requestHash, response, responseUri, report.requestHash, TAG],
      }),
      request => validator.client.writeContract(request),
    );

    this.logger.log(`Attested ${ref.documentId}: response ${response}, ${txUrl(responseTx)}`);
    if (response !== 100) this.running.set(ref.documentId, { state: 'failed', reason: failedChecks(checks) });
    return this.attestations.save(
      this.attestations.create({
        documentId: ref.documentId,
        workspaceId: ref.workspaceId,
        agentId: agentId.toString(),
        requestHash,
        receiptUri,
        codeHash: receipt.codeHash,
        inputHash: receipt.inputHash,
        ranAt: new Date(receipt.ranAt),
        validator: validator.account.address,
        response,
        requestTx,
        responseTx,
      }),
    );
  }

  // =====================================
  // ⬢ Trusted
  // =====================================
  // The attestation that makes this notebook trusted right now, or an error saying why
  // none does. Read from the chain and the notebook, never from what the database says alone.
  async trusted(ref: NotebookRef): Promise<NotebookAttestationEntity> {
    const rows = await this.attestations.find({
      where: { documentId: ref.documentId },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    if (rows.length === 0) {
      throw new BadRequestException('This notebook is not trusted yet: attest it first, then submit it');
    }

    let reason = '';
    for (const row of rows) {
      reason = (await this.problem(ref, row)) ?? '';
      if (!reason) return row;
    }
    throw new BadRequestException(`This notebook is not trusted: ${reason}`);
  }

  // The same check as `trusted`, answered instead of thrown, for showing before anything is submitted.
  // While an attestation is in flight the answer is "pending", and after one that failed, why.
  async status(ref: NotebookRef): Promise<{
    trusted: boolean;
    pending: boolean;
    reason?: string;
    attestation?: NotebookAttestationEntity;
  }> {
    const running = this.running.get(ref.documentId);
    if (running?.state === 'pending') return { trusted: false, pending: true };

    try {
      return { trusted: true, pending: false, attestation: await this.trusted(ref) };
    } catch (error) {
      if (!(error instanceof BadRequestException)) throw error;
      const reason = running?.state === 'failed' ? running.reason : error.message.replace(/^This notebook is not trusted: /, '');
      return { trusted: false, pending: false, reason };
    }
  }

  private async problem(ref: NotebookRef, row: NotebookAttestationEntity): Promise<string | null> {
    const { validator, agentId, response } = await validationStatus(row.requestHash as Hex);

    if (response !== 100) return 'the validator did not pass it';
    if (!trustedValidators().has(validator.toLowerCase())) return 'it was checked by a validator we do not trust';
    if (agentId.toString() !== row.agentId) return 'the onchain record is for a different agent';

    const owner = await agentOwner(agentId);
    if (owner.toLowerCase() === validator.toLowerCase()) return 'the agent and its validator are the same wallet';

    const bytes = await this.receiptBytes(row.receiptUri);
    if (keccak256(bytes) !== row.requestHash) return 'the receipt does not match its hash';
    const receipt = parseReceipt(bytes);
    if (receipt.notebook.notebookId !== ref.documentId) return 'the receipt is for a different notebook';
    if (!inputHashIsConsistent(receipt)) return 'the receipt is inconsistent';

    const ids = receipt.inputs.map(input => input.cellId);
    const live = await this.docs.use(ref, 'member', ({ ydoc }) => ({
      code: hashCode(extractInputs(ydoc, ids)),
      cells: runnableCellIds(ydoc),
    }));
    if (live.code !== receipt.codeHash) return 'the notebook was changed after it was attested';
    if (!sameSet(live.cells, ids)) return 'the notebook has cells the attestation does not cover';
    return null;
  }

  // =====================================
  // ⬢ Checks
  // =====================================
  private snapshot(ydoc: Y.Doc) {
    const ids = runnableCellIds(ydoc);
    if (ids.length === 0) throw new BadRequestException('This notebook has no code or parameters to attest');
    try {
      return { ids, inputs: extractInputs(ydoc, ids), ranAt: ranAt(ydoc, ids) };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Could not read the notebook');
    }
  }

  // What the validator does: fetch the receipt, compare it with the notebook, run it again.
  private async check(ref: NotebookRef, receipt: Receipt, uri: string, requestHash: Hex) {
    const bytes = await this.receiptBytes(uri).catch(() => null);
    const ids = receipt.inputs.map(input => input.cellId);

    const live = await this.docs.use(ref, 'member', ({ ydoc }) => ({
      code: hashCode(extractInputs(ydoc, ids)),
      cells: runnableCellIds(ydoc),
    }));
    const observed = await this.rerun(ref, ids);

    const checks: Checks = {
      receiptMatchesRequest: bytes !== null && keccak256(bytes) === requestHash,
      inputHashConsistent: inputHashIsConsistent(receipt),
      notebookStillMatches: live.code === receipt.codeHash && sameSet(live.cells, ids),
      reran: ids.every(id => observed[id] === 'success'),
    };
    return { checks, observed };
  }

  // Runs the notebook again and reports how each chosen cell ended.
  private async rerun(ref: NotebookRef, ids: string[]): Promise<Record<string, string>> {
    let report = await this.runs.start(ref, { waitSeconds: RERUN_WAIT_SECONDS });
    for (let poll = 0; report.status === 'running' && poll < MAX_POLLS; poll++) {
      report = await this.runs.results(ref, { waitSeconds: RERUN_WAIT_SECONDS });
    }
    if (report.status === 'running') throw new ServiceUnavailableException('The notebook is still running: try again');
    return Object.fromEntries(ids.map(id => [id, report.cells.find(cell => cell.id === id)?.state ?? 'missing']));
  }

  // The receipt can lag behind its pin for a moment, so it is fetched with a few tries.
  private async receiptBytes(uri: string): Promise<Uint8Array> {
    let last: unknown;
    for (let attempt = 0; attempt < FETCH_TRIES; attempt++) {
      try {
        return await fetchBytes(uri);
      } catch (error) {
        last = error;
        await sleep(2000);
      }
    }
    throw last instanceof Error ? last : new Error('Could not fetch the receipt');
  }

  // =====================================
  // ⬢ Chain
  // =====================================
  private chain() {
    return publicClient();
  }

  // Simulates, then sends, then waits to be mined. Serialised, so nonces never collide.
  private send<R>(simulate: () => Promise<{ request: R }>, write: (request: R) => Promise<Hex>): Promise<Hex> {
    const run = async () => {
      const { request } = await simulate();
      const hash = await write(request);
      await this.chain().waitForTransactionReceipt({ hash });
      return hash;
    };
    const next = this.chainQueue.then(run, run);
    this.chainQueue = next.catch(() => undefined);
    return next;
  }
}
