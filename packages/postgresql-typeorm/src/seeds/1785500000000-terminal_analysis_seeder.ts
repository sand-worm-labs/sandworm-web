import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { AnalysisViewKind } from '@sandworm/types/terminal';
import {
    DocumentEntity,
    TerminalAnalysisSubjectEntity,
    TerminalClientEntity,
    WorkspaceEntity,
} from '../entities';

// The Analysis catalog for the first terminal client (the exchange story the
// terminal's fixtures tell). Each project becomes a parent document in the
// owner's workspace and its reports become child documents. Regions and sectors
// are rows only: reports reach them through tags that hold their ids. Run after the briefing seeder, which makes the client. Skips a client
// that already has a catalog.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type SubjectSeed = { view: AnalysisViewKind; slug: string; name: string; kind: string; impact: string; impactSize: number };
type ReportSeed = { title: string; line: string; ago: number; regions?: string[]; sectors?: string[] };
type ProjectSeed = Omit<SubjectSeed, 'view'> & { reports: ReportSeed[] };

const PROJECTS: ProjectSeed[] = [
    {
        slug: 'paycrest', name: 'Paycrest', kind: 'Payments · Africa', impact: '2,140 of your users', impactSize: 2140,
        reports: [
            { title: 'Paycrest: who actually cashes out in Africa', line: 'Who uses it, where the money goes and what each route costs.', ago: 18 * HOUR, regions: ['africa'], sectors: ['payments-and-remittances', 'cash-out-and-off-ramps'] },
            { title: 'Paycrest corridors: Kenya and Ghana', line: 'Volume and fees on the two fastest-growing routes.', ago: 16 * DAY, regions: ['africa'], sectors: ['payments-and-remittances'] },
            { title: 'Stablecoin payouts to Nigeria, Q3', line: 'How much moves, through whom, and how fast it grows.', ago: 35 * DAY, regions: ['africa'], sectors: ['payments-and-remittances'] },
        ],
    },
    {
        slug: 'lemon', name: 'Lemon', kind: 'Cash-out · Argentina', impact: '6,300 of your wallets', impactSize: 6300,
        reports: [
            { title: "Argentina's off-ramps, ranked by fees", line: 'Every peso route your users take, cheapest first.', ago: 2 * HOUR, regions: ['latin-america'], sectors: ['cash-out-and-off-ramps'] },
            { title: 'Lemon Card: where Argentines spend stablecoins', line: 'Card spend by category and city.', ago: 20 * DAY, regions: ['latin-america'], sectors: ['payments-and-remittances'] },
        ],
    },
    {
        slug: 'phantom', name: 'Phantom', kind: 'Wallet', impact: '1,670 of your leavers', impactSize: 1670,
        reports: [
            { title: 'Updated: Phantom is gaining your Solana users', line: 'Leavers going to Phantom rose from 11% to 17%.', ago: 6 * DAY, regions: ['north-america'], sectors: ['wallets'] },
            { title: "Phantom's swap fees against yours", line: 'Route by route, on the pairs your users trade most.', ago: 14 * DAY, sectors: ['wallets', 'trading'] },
            { title: 'Who leaves for Phantom, by country', line: 'Where the switchers live and how much they hold.', ago: 25 * DAY, regions: ['europe'], sectors: ['wallets'] },
            { title: 'Phantom on Solana: Q3 recap', line: 'Users, volume and the features that pulled them in.', ago: 40 * DAY, sectors: ['wallets'] },
        ],
    },
    {
        slug: 'aave', name: 'Aave', kind: 'Lending', impact: '38,000 of your wallets', impactSize: 38000,
        reports: [
            { title: 'Stablecoin yields: where your users earn', line: 'Which pools hold your users’ stablecoins and what they pay.', ago: 8 * DAY, sectors: ['lending-and-yield'] },
            { title: 'Aave on Base: who borrows', line: 'Borrowers, collateral and how close they run to liquidation.', ago: 30 * DAY, sectors: ['lending-and-yield'] },
        ],
    },
    {
        slug: 'bitso', name: 'Bitso', kind: 'Exchange · Mexico', impact: '2,700 of your wallets', impactSize: 2700,
        reports: [
            { title: "Bitso and Mexico's cash-out routes", line: 'Fees and speed from stablecoins to pesos.', ago: 9 * DAY, regions: ['latin-america'], sectors: ['cash-out-and-off-ramps'] },
        ],
    },
    {
        slug: 'coinbase-wallet', name: 'Coinbase Wallet', kind: 'Wallet', impact: '3,050 of your leavers', impactSize: 3050,
        reports: [
            { title: 'Where your leavers go', line: 'The wallets your users move to, and what they take.', ago: 14 * DAY, regions: ['north-america'], sectors: ['wallets'] },
            { title: "Coinbase Wallet's Base push", line: 'Who it pulled onto Base, and from where.', ago: 28 * DAY, regions: ['north-america'], sectors: ['wallets'] },
            { title: 'Smart wallets: who switched', line: 'Early adopters and how they use them.', ago: 45 * DAY, sectors: ['wallets'] },
        ],
    },
    {
        slug: 'yellow-card', name: 'Yellow Card', kind: 'Payments · Africa', impact: '640 of your users', impactSize: 640,
        reports: [
            { title: 'Yellow Card against Paycrest', line: 'Fees, speed and coverage, route by route.', ago: 15 * DAY, regions: ['africa'], sectors: ['payments-and-remittances', 'cash-out-and-off-ramps'] },
            { title: 'Yellow Card in Nigeria', line: 'Its share of naira cash-outs, month by month.', ago: 33 * DAY, regions: ['africa'], sectors: ['cash-out-and-off-ramps'] },
        ],
    },
    {
        slug: 'metamask', name: 'MetaMask', kind: 'Wallet', impact: '2,160 of your leavers', impactSize: 2160,
        reports: [
            { title: 'MetaMask swaps: fees and routes', line: 'What your leavers pay to swap there.', ago: 20 * DAY, regions: ['europe'], sectors: ['wallets', 'trading'] },
            { title: 'MetaMask Card in Europe', line: 'Who spends with it and where.', ago: 38 * DAY, regions: ['europe'], sectors: ['payments-and-remittances'] },
        ],
    },
    {
        slug: 'uniswap-wallet', name: 'Uniswap Wallet', kind: 'Wallet', impact: '890 of your leavers', impactSize: 890,
        reports: [
            { title: 'Who switched to Uniswap Wallet in Q3', line: 'Switchers by size and what they trade.', ago: 26 * DAY, sectors: ['wallets'] },
            { title: "Uniswap Wallet's swap routes", line: 'Where its volume goes, pool by pool.', ago: 41 * DAY, sectors: ['trading'] },
        ],
    },
    {
        slug: 'jupiter', name: 'Jupiter', kind: 'Trading · Solana', impact: '11,900 of your wallets', impactSize: 11900,
        reports: [
            { title: 'Bridging to Solana tripled this quarter', line: '$96M moved last month, most of it into Jupiter.', ago: 7 * DAY, sectors: ['bridges', 'trading'] },
            { title: 'What your users trade on Jupiter', line: 'Tokens, sizes and how often they come back.', ago: 27 * DAY, regions: ['southeast-asia'], sectors: ['trading'] },
            { title: 'Memecoin flows through Jupiter', line: 'Who buys early and who is left holding.', ago: 36 * DAY, regions: ['southeast-asia'], sectors: ['trading'] },
        ],
    },
    {
        slug: 'morpho', name: 'Morpho', kind: 'Lending', impact: '4,100 of your wallets', impactSize: 4100,
        reports: [
            { title: 'Morpho: who borrows and why', line: 'Borrowers, what they borrow against and what for.', ago: 34 * DAY, sectors: ['lending-and-yield'] },
        ],
    },
];

const REGIONS: Omit<SubjectSeed, 'view'>[] = [
    { slug: 'latin-america', name: 'Latin America', kind: 'Argentina, Brazil, Mexico', impact: '41,800 wallets', impactSize: 41800 },
    { slug: 'africa', name: 'Africa', kind: 'Nigeria, Kenya, Ghana', impact: '9,600 wallets', impactSize: 9600 },
    { slug: 'north-america', name: 'North America', kind: 'United States, Canada', impact: '188,000 wallets', impactSize: 188000 },
    { slug: 'southeast-asia', name: 'Southeast Asia', kind: 'Philippines, Vietnam, Indonesia', impact: '14,200 wallets', impactSize: 14200 },
    { slug: 'europe', name: 'Europe', kind: 'EU and United Kingdom', impact: '52,300 wallets', impactSize: 52300 },
];

const SECTORS: Omit<SubjectSeed, 'view'>[] = [
    { slug: 'cash-out-and-off-ramps', name: 'Cash-out and off-ramps', kind: 'Turning stablecoins into local money', impact: '27,400 wallets', impactSize: 27400 },
    { slug: 'payments-and-remittances', name: 'Payments and remittances', kind: 'Sending money across borders', impact: '9,600 wallets', impactSize: 9600 },
    { slug: 'wallets', name: 'Wallets', kind: 'Where your users go next', impact: '9,840 leavers', impactSize: 9840 },
    { slug: 'lending-and-yield', name: 'Lending and yield', kind: 'Earning on stablecoins', impact: '42,100 wallets', impactSize: 42100 },
    { slug: 'trading', name: 'Trading', kind: 'Swaps and token listings', impact: '24,500 wallets', impactSize: 24500 },
    { slug: 'bridges', name: 'Bridges', kind: 'Moving between chains', impact: '24,500 wallets', impactSize: 24500 },
];

// Reports name their regions and sectors by the seed's own `slug` key; the tag
// that is stored is the subject's id
function tagsOf(report: ReportSeed, ids: Map<string, string>): string[] {
    return [...(report.regions ?? []), ...(report.sectors ?? [])].map(slug => ids.get(slug)!);
}

export class TerminalAnalysisSeeder1785500000000 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const client = await dataSource.getRepository(TerminalClientEntity).findOne({ where: {}, order: { createdAt: 'ASC' } });
        if (!client) {
            console.log('[terminal-analysis] no terminal client, skipping');
            return;
        }

        const subjects = dataSource.getRepository(TerminalAnalysisSubjectEntity);
        if (await subjects.exist({ where: { clientId: client.id } })) {
            console.log('[terminal-analysis] client already has a catalog, skipping');
            return;
        }

        const workspace = await dataSource.getRepository(WorkspaceEntity).findOne({ where: { ownerId: client.ownerId }, order: { createdAt: 'ASC' } });
        if (!workspace) {
            console.log('[terminal-analysis] the client owner has no workspace, skipping');
            return;
        }

        const now = Date.now();
        const doc = (init: Partial<DocumentEntity>) => new DocumentEntity({ workspaceId: workspace.id, authorId: client.ownerId, ...init });

        await dataSource.transaction(async manager => {
            const grouped = await manager.save([
                ...REGIONS.map(({ slug, ...region }) => new TerminalAnalysisSubjectEntity({ ...region, view: AnalysisViewKind.REGION, clientId: client.id, documentId: null })),
                ...SECTORS.map(({ slug, ...sector }) => new TerminalAnalysisSubjectEntity({ ...sector, view: AnalysisViewKind.SECTOR, clientId: client.id, documentId: null })),
            ]);
            const ids = new Map([...REGIONS, ...SECTORS].map(({ slug }, index) => [slug, grouped[index]!.id]));

            const parents = await manager.save(PROJECTS.map((project, index) => doc({
                title: project.name,
                description: project.kind,
                orderIndex: index,
                parentId: null,
            })));

            const reports = PROJECTS.flatMap((project, p) => project.reports.map((report, index) => {
                const createdAt = new Date(now - report.ago);
                return doc({
                    title: report.title,
                    description: report.line,
                    tags: tagsOf(report, ids),
                    orderIndex: index,
                    parentId: parents[p]!.id,
                    createdAt,
                    updatedAt: createdAt,
                });
            }));
            await manager.save(reports);

            await manager.save(PROJECTS.map(({ reports: _, slug, ...project }, p) => new TerminalAnalysisSubjectEntity({ ...project, view: AnalysisViewKind.PROJECT, clientId: client.id, documentId: parents[p]!.id })));
        });

        const reportCount = PROJECTS.reduce((sum, project) => sum + project.reports.length, 0);
        console.log(`[terminal-analysis] seeded ${PROJECTS.length} projects (${reportCount} reports), ${REGIONS.length} regions and ${SECTORS.length} sectors for "${client.name || client.id}"`);
    }
}
