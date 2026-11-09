import { DataSource, In } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { AnalysisViewKind, EvidenceId, SignalStatusId } from '@sandworm/types/terminal';
import {
    DocumentEntity,
    TerminalAnalysisSubjectEntity,
    TerminalClientEntity,
    TerminalSignalEntity,
} from '../entities';

// Signals for the first terminal client, worded as what was seen and what it
// could mean, never as "an opportunity". Each links to the analysis report it
// came from when one with that title exists. Run after the analysis seeder.
// Skips a client that already has signals.

const DAY = 24 * 60 * 60 * 1000;

type Seed = {
    status: SignalStatusId;
    title: string;
    observed: string;
    couldMean: string;
    kind: string;
    size: string;
    sizeLabel: string;
    evidence: EvidenceId;
    subject: string;
    ago: number;
    report?: string;
};

const SIGNALS: Seed[] = [
    {
        status: SignalStatusId.NEW,
        title: "Argentina's off-ramps charge 2× Nigeria's fees",
        observed: '11,200 of your wallets cash out to pesos, paying 2.2% on average.',
        couldMean: 'A cheaper peso route inside your app could keep some of that flow.',
        kind: 'Market', size: '$14.2M/mo', sizeLabel: 'cashed out to pesos',
        evidence: EvidenceId.STRONG, subject: 'Argentina', ago: 2 * 60 * 60 * 1000,
        report: "Argentina's off-ramps, ranked by fees",
    },
    {
        status: SignalStatusId.NEW,
        title: 'Your users send money home through Paycrest',
        observed: '2,140 of your users moved $5.1M through Paycrest last month.',
        couldMean: 'Sending money home from inside the app may be something they want.',
        kind: 'Partner', size: '$5.1M/mo', sizeLabel: 'sent through Paycrest',
        evidence: EvidenceId.SOME, subject: 'Paycrest', ago: DAY,
        report: 'Paycrest: who actually cashes out in Africa',
    },
    {
        status: SignalStatusId.NEW,
        title: 'Your users bridge to Solana for tokens you do not list',
        observed: '24,500 of your wallets bridged to Solana and bought tokens there.',
        couldMean: 'Some of that trading might stay with you if those tokens were listed.',
        kind: 'Product', size: '$96M/mo', sizeLabel: 'traded on Solana',
        evidence: EvidenceId.SOME, subject: 'Solana', ago: 7 * DAY,
        report: 'Bridging to Solana tripled this quarter',
    },
    {
        status: SignalStatusId.LOOKING,
        title: 'Your users earn on stablecoins elsewhere',
        observed: '38,000 of your wallets hold $212M in Aave stablecoin pools.',
        couldMean: 'Interest on stablecoins in-app could bring some of it back.',
        kind: 'Product', size: '$212M', sizeLabel: 'deposited in Aave',
        evidence: EvidenceId.STRONG, subject: 'Aave', ago: 8 * DAY,
        report: 'Stablecoin yields: where your users earn',
    },
    {
        status: SignalStatusId.LOOKING,
        title: 'Brazilian users buy crypto through Pix in other apps',
        observed: '19,600 of your wallets in Brazil top up through other apps.',
        couldMean: 'Pix inside your app may shorten that path.',
        kind: 'Market', size: '19,600', sizeLabel: 'wallets in Brazil',
        evidence: EvidenceId.SOME, subject: 'Brazil', ago: 19 * DAY,
    },
    {
        status: SignalStatusId.ACTING,
        title: 'More of your leavers go to Phantom',
        observed: '1,670 of your leavers went to Phantom in October, up from 11% to 17%.',
        couldMean: 'What Phantom offers on Solana may be part of why they leave.',
        kind: 'Retention', size: '1,670', sizeLabel: 'wallets in October',
        evidence: EvidenceId.SOME, subject: 'Phantom', ago: 26 * DAY,
        report: 'Updated: Phantom is gaining your Solana users',
    },
    {
        status: SignalStatusId.DISMISSED,
        title: 'Few of your users trade NFTs',
        observed: 'Your users traded $0.4M of NFTs last month.',
        couldMean: 'Too small to say much yet.',
        kind: 'Product', size: '$0.4M/mo', sizeLabel: 'NFT volume',
        evidence: EvidenceId.EARLY, subject: 'NFTs', ago: 33 * DAY,
    },
];

export class TerminalSignalSeeder1785600000000 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const client = await dataSource.getRepository(TerminalClientEntity).findOne({ where: {}, order: { createdAt: 'ASC' } });
        if (!client) {
            console.log('[terminal-signal] no terminal client, skipping');
            return;
        }
        const signals = dataSource.getRepository(TerminalSignalEntity);
        if (await signals.exist({ where: { clientId: client.id } })) {
            console.log('[terminal-signal] client already has signals, skipping');
            return;
        }

        // The client's reports, by title
        const subjects = await dataSource.getRepository(TerminalAnalysisSubjectEntity).find({ where: { clientId: client.id, view: AnalysisViewKind.PROJECT } });
        const parentIds = subjects.flatMap(s => (s.documentId ? [s.documentId] : []));
        const reports = parentIds.length
            ? await dataSource.getRepository(DocumentEntity).find({ where: { parentId: In(parentIds) } })
            : [];
        const reportId = (title?: string) => reports.find(doc => doc.title === title)?.id ?? null;

        const now = Date.now();
        await signals.save(SIGNALS.map(({ ago, report, ...seed }) => new TerminalSignalEntity({
            ...seed,
            clientId: client.id,
            documentId: reportId(report),
            publishedAt: new Date(now - ago),
        })));
        console.log(`[terminal-signal] seeded ${SIGNALS.length} signals for "${client.name || client.id}"`);
    }
}
