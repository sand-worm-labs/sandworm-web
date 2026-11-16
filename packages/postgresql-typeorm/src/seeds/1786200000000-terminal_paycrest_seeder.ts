import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { AnalysisViewKind, EvidenceId, KpiDirection, KpiFormatKind, SignalStatusId, type KpiFormat, type SignalDetail, type SubjectIcon } from '@sandworm/types/terminal';
import {
    DocumentEntity,
    TerminalAnalysisSubjectEntity,
    TerminalClientEntity,
    TerminalInviteEntity,
    TerminalKpiEntity,
    TerminalKpiValueEntity,
    TerminalSignalEntity,
    UserEntity,
    WorkspaceEntity,
    YjsDocumentEntity,
} from '../entities';

// What the Paycrest terminal shows, from the team's Paycrest research: its key
// numbers, its signals and its analysis (each report a notebook of that
// research, empty here). The client is made as the team would make it, with no
// owner and an invite for the dev admin, who becomes its member on first
// sign-in. Run after the other terminal seeders. Skips a Paycrest that already
// has an analysis catalog.
//
// Three reports are real notebooks: local copies of the team's notebooks with the
// live values typed in as sample data, so they run without Dune credits. Their
// saved state is in data/paycrest-notebooks.json, by title; the other reports
// are empty shells.

const DAY = 24 * 60 * 60 * 1000;
const NOTEBOOKS_FILE = path.resolve(__dirname, '..', '..', 'src', 'seeds', 'data', 'paycrest-notebooks.json');

const KPIS: { key: string; label: string; format: KpiFormat; direction: KpiDirection; value: number }[] = [
    { key: 'volume', label: 'Volume', format: { kind: KpiFormatKind.CURRENCY, currency: 'USD', compact: true }, direction: KpiDirection.UP_GOOD, value: 10_200_000 },
    { key: 'orders', label: 'Orders', format: { kind: KpiFormatKind.NUMBER, compact: true }, direction: KpiDirection.UP_GOOD, value: 59_800 },
    { key: 'protocol-fees', label: 'Protocol fees', format: { kind: KpiFormatKind.CURRENCY, currency: 'USD', compact: true }, direction: KpiDirection.UP_GOOD, value: 31_000 },
    { key: 'refund-rate', label: 'Refund rate', format: { kind: KpiFormatKind.PERCENT }, direction: KpiDirection.DOWN_GOOD, value: 5 },
];

const SIGNALS: { title: string; observed: string; kind: string; size: string; sizeLabel: string; evidence: EvidenceId; subject: string; detail: SignalDetail }[] = [
    {
        title: 'Open Argentina with Lemon Cash as the first peso provider',
        observed: 'Lemon pays out about $16M a week and already holds pesos.',
        kind: 'Market entry', size: '$16M', sizeLabel: 'paid out a week', evidence: EvidenceId.SOME, subject: 'Argentina',
        detail: {
          facts: [
            { label: 'Weekly payouts', value: '~$16M', source: 'Lemon Cash onchain payouts' },
            { label: 'Holds pesos', value: 'Yes', source: 'Lemon Cash wallet balances' },
          ],
          gap: 'How much is cash-out to pesos?',
          entities: [
            { name: 'Lemon Cash', role: 'Peso provider', stat: '$16M paid out a week', icon: { kind: 'logo', slug: 'lemon-cash' } },
            { name: 'Argentina', role: 'Market', stat: '4 platforms', icon: { kind: 'flag', code: 'AR' } },
          ],
          nextSteps: [
            'Ask Lemon Cash what weekly volume it could route through Paycrest',
            'Compare its payout fees with the other Argentine platforms',
          ],
        },
    },
    {
        title: "Fix the Tanzania gap before opening more corridors",
        observed: '43% of Tanzanian orders were refunded in the last 90 days.',
        kind: 'Reliability', size: '43%', sizeLabel: 'refunded', evidence: EvidenceId.STRONG, subject: 'Tanzania',
        detail: {
          facts: [
            { label: 'Refunded orders', value: '43%', source: 'Paycrest orders, last 90 days' },
          ],
          gap: 'One provider or the whole corridor?',
          entities: [
            { name: 'Tanzania', role: 'Corridor', stat: '43% refunded', icon: { kind: 'flag', code: 'TZ' } },
          ],
          nextSteps: [
            'Find which providers the refunded orders went through',
            'Pause new Tanzania volume until the refund rate is understood',
          ],
        },
    },
    {
        title: "Talk to the merchant who fills P2P.me's naira orders",
        observed: 'It runs a balanced book every day and already holds naira.',
        kind: 'Liquidity', size: '~75%', sizeLabel: 'of P2P.me naira volume', evidence: EvidenceId.SOME, subject: 'Nigeria',
        detail: {
          facts: [
            { label: 'Share of P2P.me naira volume', value: '~75%', source: 'P2P.me naira orders' },
            { label: 'Activity', value: 'Every day', source: 'P2P.me naira orders' },
          ],
          gap: 'One operator or several wallets?',
          entities: [
            { name: 'Naira merchant', role: 'Liquidity provider', stat: '~75% of P2P.me naira volume', icon: null },
            { name: 'P2P.me', role: 'Benchmark', stat: 'Naira orders', icon: { kind: 'logo', slug: 'p2p-me' } },
          ],
          nextSteps: [
            'Find out who runs the merchant and reach out',
            'Ask what it would take to fill Paycrest naira orders',
          ],
        },
    },
    {
        title: 'Open Mexico with Bitso and MXNB as liquidity',
        observed: 'P2P.me barely serves pesos, so nobody competes there yet.',
        kind: 'Market entry', size: '$1.09B', sizeLabel: 'Bitso paid out in 90 days', evidence: EvidenceId.EARLY, subject: 'Mexico',
        detail: {
          facts: [
            { label: 'Bitso payouts, 90 days', value: '$1.09B', source: 'Bitso onchain payouts' },
            { label: 'P2P.me peso volume', value: 'Barely any', source: 'P2P.me orders by currency' },
          ],
          gap: 'Would Bitso take Paycrest orders?',
          entities: [
            { name: 'Bitso', role: 'Liquidity source', stat: '$1.09B paid out in 90 days', icon: null },
            { name: 'Mexico', role: 'Market', stat: 'Nobody competes yet', icon: { kind: 'flag', code: 'MX' } },
          ],
          nextSteps: [
            'Ask Bitso about supplying liquidity for Paycrest',
            'Size the Mexican peso demand before committing',
          ],
        },
    },
];

// An icon is a company logo (kept in the Showcase's logo store by slug), a flag or a symbol
type Group = { name: string; icon: SubjectIcon; kind: string; impact: string; impactSize: number };
const REGIONS: Group[] = [{ name: 'Argentina', icon: { kind: 'flag', code: 'AR' }, kind: 'Lemon, Buenbit, El Dorado', impact: '4 platforms', impactSize: 4 }];
const SECTORS: Group[] = [{ name: 'Cash-out and off-ramps', icon: { kind: 'symbol', key: 'cash-out' }, kind: 'Turning stablecoins into local money', impact: '5 platforms', impactSize: 5 }];

// Reports are the Paycrest notebooks, by their titles. `groups` names the
// regions and sectors a report also shows under.
type Report = { title: string; line: string; ago: number; groups: string[] };
const PROJECTS: (Group & { reports: Report[] })[] = [
    {
        name: 'Paycrest', icon: { kind: 'logo', slug: 'paycrest' }, kind: 'Payments protocol · Africa', impact: '$10.2M lifetime volume', impactSize: 102,
        reports: [{ title: 'Paycrest: The Onchain Inside Story', line: '60,000 orders, 8 chains, $10.2M in volume. Who sends the money, who fills it, and where it goes.', ago: 1, groups: ['Cash-out and off-ramps'] }],
    },
    {
        name: 'Lemon Cash', icon: { kind: 'logo', slug: 'lemon-cash' }, kind: 'Wallet and exchange · Argentina', impact: '$16M a week', impactSize: 16,
        reports: [{ title: 'Lemon Cash · insights for Paycrest', line: 'About $16M a week in payouts, and no Paycrest orders yet.', ago: 9, groups: ['Argentina', 'Cash-out and off-ramps'] }],
    },
    {
        name: 'P2P.me', icon: { kind: 'logo', slug: 'p2p-me' }, kind: 'Payments · Nigeria and Latin America', impact: '+2.4% on naira', impactSize: 24,
        reports: [
            { title: 'P2P.me in Nigeria', line: "One merchant fills about three-quarters of its naira orders.", ago: 10, groups: ['Cash-out and off-ramps'] },
            { title: 'P2P.me prices vs Paycrest', line: 'On naira cash-outs P2P.me now pays more than Paycrest, from one merchant.', ago: 2, groups: ['Cash-out and off-ramps'] },
        ],
    },
    {
        name: 'Buenbit and Nexo', icon: { kind: 'logo', slug: 'nexo' }, kind: 'Exchange · Argentina, Peru, Mexico', impact: '$1.3bn in 2 months', impactSize: 13,
        reports: [
            { title: 'Buenbit · Argentina', line: "Nexo's Buenos Aires hub and what it moves.", ago: 11, groups: ['Argentina'] },
            { title: 'Buenbit / Nexo labels · last 2 months', line: 'Every onchain label for both, two months back.', ago: 11, groups: ['Argentina'] },
        ],
    },
    {
        name: 'El Dorado', icon: { kind: 'logo', slug: 'el-dorado' }, kind: 'P2P exchange · Latin America', impact: '12 countries', impactSize: 12,
        reports: [{ title: 'El Dorado · Insights for Paycrest', line: 'Agents pay out in 12 countries through 70+ local methods.', ago: 12, groups: ['Argentina'] }],
    },
];

// Reports about a region, not one project: they sit under no project document and
// belong to the client through the regions and sectors they are tagged with.
const REGION_REPORTS: Report[] = [
    { title: 'Argentina protocols · insights for Paycrest', line: 'Lemon Cash pays out about $16M a week, mostly USDT on BNB and Tron.', ago: 3, groups: ['Argentina', 'Cash-out and off-ramps'] },
];

export class TerminalPaycrestSeeder1786200000000 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const owner = await dataSource.getRepository(UserEntity).findOne({ where: {}, order: { createdAt: 'ASC' } });
        const workspace = owner && await dataSource.getRepository(WorkspaceEntity).findOne({ where: { ownerId: owner.id }, order: { createdAt: 'ASC' } });
        if (!owner?.email || !workspace) {
            console.log('[terminal-paycrest] no user with a workspace, skipping');
            return;
        }

        await dataSource.transaction(async manager => {
            let client = await manager.findOneBy(TerminalClientEntity, { name: 'Paycrest' });
            if (!client) {
                client = await manager.save(new TerminalClientEntity({
                    type: 'protocol', name: 'Paycrest', icon: { kind: 'logo', slug: 'paycrest' }, website: 'https://paycrest.io', plan: 'pro', status: 'invite_sent', createdBy: owner.id,
                }));
                await manager.save(new TerminalInviteEntity({ clientId: client.id, email: owner.email!, name: 'admin', access: 'admin', status: 'sent', sentAt: new Date() }));
            }
            if (await manager.existsBy(TerminalAnalysisSubjectEntity, { clientId: client.id })) {
                console.log('[terminal-paycrest] Paycrest already has a catalog, skipping');
                return;
            }

            const grouped = [...REGIONS.map(group => ({ ...group, view: AnalysisViewKind.REGION })), ...SECTORS.map(group => ({ ...group, view: AnalysisViewKind.SECTOR }))];
            const saved = await manager.save(grouped.map(group => new TerminalAnalysisSubjectEntity({ ...group, clientId: client.id, documentId: null })));
            const ids = new Map(saved.map(subject => [subject.name, subject.id]));

            const doc = (init: Partial<DocumentEntity>) => new DocumentEntity({ workspaceId: workspace.id, authorId: owner.id, ...init });
            const parents = await manager.save(PROJECTS.map((project, index) => doc({ title: project.name, description: project.kind, orderIndex: index, parentId: null })));
            const now = Date.now();
            const reportDoc = (report: Report, init: Partial<DocumentEntity>) => {
                const createdAt = new Date(now - report.ago * DAY);
                return doc({
                    title: report.title, description: report.line, tags: report.groups.map(name => ids.get(name)!),
                    createdAt, updatedAt: createdAt, ...init,
                });
            };
            const reports = await manager.save([
                ...PROJECTS.flatMap((project, p) => project.reports.map((report, index) => reportDoc(report, { orderIndex: index, parentId: parents[p]!.id }))),
                ...REGION_REPORTS.map((report, index) => reportDoc(report, { orderIndex: PROJECTS.length + index, parentId: null })),
            ]);
            const states = JSON.parse(readFileSync(NOTEBOOKS_FILE, 'utf8')) as Record<string, string>;
            await manager.save(reports.flatMap(report => states[report.title] ? [manager.create(YjsDocumentEntity, { documentId: report.id, state: Buffer.from(states[report.title]!, 'base64') })] : []));
            await manager.save(PROJECTS.map(({ reports: _, ...project }, p) => new TerminalAnalysisSubjectEntity({ ...project, view: AnalysisViewKind.PROJECT, clientId: client.id, documentId: parents[p]!.id })));

            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            for (const [position, { value, ...kpi }] of KPIS.entries()) {
                const saved = await manager.save(new TerminalKpiEntity({ ...kpi, clientId: client.id, subjectId: null, position, comparison: { kind: 'previous' }, source: { kind: 'manual' } }));
                await manager.save(new TerminalKpiValueEntity({ kpiId: saved.id, asOf: today, value }));
            }

            await manager.save(SIGNALS.map((signal, index) => new TerminalSignalEntity({
                ...signal, status: SignalStatusId.NEW, clientId: client.id, documentId: null, publishedAt: new Date(now - (index + 1) * DAY),
            })));
            console.log(`[terminal-paycrest] seeded Paycrest: ${PROJECTS.length} projects, ${KPIS.length} key numbers, ${SIGNALS.length} signals`);
        });
    }
}
