import { DataSource, In } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import type { RequestKindId, RequestScope, RequestStatusId, RequestTimingId, RequestUseCaseId } from '@sandworm/types/terminal';
import {
    DocumentEntity,
    TerminalAnalysisSubjectEntity,
    TerminalClientEntity,
    TerminalMemberEntity,
    TerminalRequestEntity,
} from '../entities';

// Requests for the first terminal client, one at each step of the research
// flow plus an answered question. The delivered one links to its report. Run
// after the analysis seeder. Skips a client that already has requests.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Seed = {
    kind: RequestKindId;
    question: string;
    status: RequestStatusId;
    useCase?: RequestUseCaseId;
    about?: string[];
    timing?: RequestTimingId;
    submitted: number;
    scoped?: number;
    approved?: number;
    closed?: number;
    scope?: Omit<RequestScope, 'dueAt'> & { dueIn: number };
    progressNote?: string;
    outcome?: string;
    report?: string;
};

const REQUESTS: Seed[] = [
    {
        kind: 'research', question: 'Brazil cash-out: users, apps and fees', status: 'submitted',
        useCase: 'plan-launch', about: ['Brazil'], timing: 'two-weeks', submitted: 3 * HOUR,
        progressNote: 'Got it. I will send a scope after I check how much Brazil data we have for your users.',
    },
    {
        kind: 'research', question: 'Solana token demand among our users', status: 'awaiting_approval',
        useCase: 'pick-partner', about: ['Solana'], timing: 'two-weeks', submitted: 2 * DAY, scoped: 4 * HOUR,
        scope: {
            summary: 'Which Solana tokens your users hold and trade that you do not list.',
            questions: [
                'How many of your users hold Solana tokens you do not list.',
                'Which tokens, ranked by how much they hold.',
                'How much they trade each month.',
            ],
            sources: ['Solana transfers', 'Jupiter swaps', 'Your wallet list'],
            dueIn: 17 * DAY,
        },
    },
    {
        kind: 'research', question: 'Stablecoin yield: what would it take?', status: 'in_progress',
        useCase: 'plan-launch', about: ['Aave', 'Morpho'], timing: 'no-rush', submitted: 15 * DAY, scoped: 13 * DAY, approved: 12 * DAY,
        scope: {
            summary: 'Where your users earn on stablecoins today, and at what rate they would move.',
            questions: ['Where your users hold stablecoins that earn.', 'What rates they get.', 'How many would move for 4% or more.'],
            sources: ['Aave', 'Morpho', 'Your wallet list'],
            dueIn: 9 * DAY,
        },
        progressNote: 'On track. First finding: 38,000 of your wallets earn on Aave, and most would accept 4% or more.',
    },
    {
        kind: 'research', question: 'LatAm cash-out sizing', status: 'delivered',
        useCase: 'investor-update', about: ['Argentina', 'Mexico', 'Brazil'], timing: 'two-weeks',
        submitted: 21 * DAY, scoped: 20 * DAY, approved: 19 * DAY, closed: 2 * HOUR,
        progressNote: 'Delivered. It also turned up the Argentina fee signal in your list.',
        report: "Argentina's off-ramps, ranked by fees",
    },
    {
        kind: 'research', question: 'NFT trading among our users', status: 'declined',
        about: ['NFTs'], submitted: 34 * DAY, closed: 33 * DAY,
        outcome: 'Too few of your users trade NFTs for a useful answer. This did not use your allowance.',
    },
    {
        kind: 'question', question: 'Does the 2.2% include the exchange-rate spread?', status: 'delivered',
        submitted: 2 * DAY, closed: 2 * DAY - 2 * HOUR,
        outcome: 'Yes. It is the full cost of cashing out, spread included.',
    },
];

export class TerminalRequestSeeder1785600000001 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const client = await dataSource.getRepository(TerminalClientEntity).findOne({ where: {}, order: { createdAt: 'ASC' } });
        if (!client) {
            console.log('[terminal-request] no terminal client, skipping');
            return;
        }
        const requests = dataSource.getRepository(TerminalRequestEntity);
        if (await requests.exist({ where: { clientId: client.id } })) {
            console.log('[terminal-request] client already has requests, skipping');
            return;
        }
        const member = await dataSource.getRepository(TerminalMemberEntity).findOneBy({ clientId: client.id, userId: client.ownerId });

        const subjects = await dataSource.getRepository(TerminalAnalysisSubjectEntity).find({ where: { clientId: client.id, view: 'project' } });
        const parentIds = subjects.flatMap(s => (s.documentId ? [s.documentId] : []));
        const reports = parentIds.length
            ? await dataSource.getRepository(DocumentEntity).find({ where: { parentId: In(parentIds) } })
            : [];

        const now = Date.now();
        const at = (ago?: number) => (ago === undefined ? null : new Date(now - ago));
        await requests.save(REQUESTS.map(seed => new TerminalRequestEntity({
            clientId: client.id,
            kind: seed.kind,
            requestedBy: member?.id ?? null,
            question: seed.question,
            useCase: seed.useCase ?? null,
            about: seed.about ?? [],
            timing: seed.timing ?? null,
            status: seed.status,
            scope: seed.scope
                ? {
                    summary: seed.scope.summary,
                    questions: seed.scope.questions,
                    sources: seed.scope.sources,
                    dueAt: new Date(now + seed.scope.dueIn).toISOString().slice(0, 10),
                }
                : null,
            progressNote: seed.progressNote ?? null,
            outcome: seed.outcome ?? null,
            reportId: reports.find(doc => doc.title === seed.report)?.id ?? null,
            submittedAt: at(seed.submitted)!,
            scopedAt: at(seed.scoped),
            approvedAt: at(seed.approved),
            approvedBy: seed.approved === undefined ? null : member?.id ?? null,
            closedAt: at(seed.closed),
        })));
        console.log(`[terminal-request] seeded ${REQUESTS.length} requests for "${client.name || client.id}"`);
    }
}
