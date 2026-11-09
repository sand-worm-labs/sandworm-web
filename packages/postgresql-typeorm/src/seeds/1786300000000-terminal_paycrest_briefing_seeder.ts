import { DataSource, In } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as Y from 'yjs';
import { getBlocks, getPythonBlockResult, isPythonBlock } from '@sandworm/editor';
import type { Output } from '@sandworm/types';
import { AnalysisViewKind, BriefingKindId } from '@sandworm/types/terminal';
import {
    DocumentEntity,
    TerminalAnalysisSubjectEntity,
    TerminalBriefingItemEntity,
    TerminalClientEntity,
    YjsDocumentEntity,
    type TerminalBriefingDetail,
} from '../entities';

// What the Paycrest briefing says: findings from the team's Paycrest notebooks,
// each linked to the cell it came from. A cell that drew something keeps a
// frozen copy of its outputs, read from the notebook's saved state; a text cell
// keeps only the link. The notebooks are the local copies the Paycrest seeder
// makes. Run after it. Skips a client that already has a briefing.

const HOUR = 60 * 60 * 1000;

type Seed = {
    kind: BriefingKindId;
    title: string;
    summary: string;
    subject: string;
    notebook: string;
    blockId: string;
    ago: number;
    detail: TerminalBriefingDetail;
};

const MAIN = 'Paycrest: The Onchain Inside Story';
const PRICES = 'P2P.me prices vs Paycrest';

const ITEMS: Seed[] = [
    {
        kind: BriefingKindId.METRIC,
        title: 'About 190 Paycrest users place three or more orders a month',
        summary: 'Out of about 5,800 users in all. One app brought in 2,700 new ones in two months.',
        subject: 'Paycrest',
        notebook: MAIN,
        blockId: '436f73e3-1bbc-438c-9202-724306f23753',
        ago: 2 * HOUR,
        detail: {
            headline: { value: '~190', label: 'repeat users a month (3+ orders)', delta: { text: '5,800 users in all', tone: 'neutral' } },
            what: 'Paycrest has about 5,800 distinct users over its lifetime. In a typical month 120 to 200 of them place three or more orders (193 in September). One retail app grew from 43 monthly users in May to 2,009 in June, then fell back to 44 in August, a pattern typical of a time-limited campaign.',
            why: "The repeat core is small and steady, so the mid-2026 user totals are best read next to the repeat-user line. Paycrest's growth depends on keeping the users a campaign brings in.",
        },
    },
    {
        kind: BriefingKindId.METRIC,
        title: "Five integrators send 92% of Paycrest's volume",
        summary: 'More than half has no integrator set: likely Paycrest\'s own interface and API customers.',
        subject: 'Paycrest',
        notebook: MAIN,
        blockId: 'bd9b789b-e548-4e2e-bd0e-b986251d8475',
        ago: 5 * HOUR,
        detail: {
            headline: { value: '92%', label: 'of volume from the five largest integrators', delta: { text: '177 integrators in all', tone: 'neutral' } },
            what: '177 integrators have sent orders. The five largest account for 92% of volume: orders with no integrator set (57%), a cNGN desk that also acts as a liquidity provider (22%), an East-Africa payout account (7%), a Nigerian retail app (5%) and a second retail app (1%).',
            why: 'Volume rests on a few senders, so losing one of the larger ones would be felt quickly. Bringing in more integrators is a growth lever.',
        },
    },
    {
        kind: BriefingKindId.SIGNAL,
        title: "P2P.me pays Nigerian naira sellers 2.4% more than Paycrest's quote",
        summary: 'Since 17 September, and from one merchant. It can close as fast as it opened.',
        subject: 'Nigeria',
        notebook: PRICES,
        blockId: 'c74fc9ae-cf0a-44a3-87c2-dff35bc7abca',
        ago: 26 * HOUR,
        detail: {
            headline: { value: '+2.4%', label: 'more naira per USDC on P2P.me', delta: { text: 'In August: about 1% less', tone: 'negative' } },
            what: 'Over the last 30 days a Nigerian selling USDC on P2P.me got 3.4% more naira than Paycrest paid, and 2.4% more against its live quote. In August P2P.me paid about 1% less.',
            why: 'About seven priced naira orders a day come almost all from one merchant, so the gap can change quickly. Paycrest liquidity providers could quote closer to the street rate on the sell side.',
        },
    },
    {
        kind: BriefingKindId.METRIC,
        title: "64% of Paycrest's $10.2M volume is cNGN, a naira stablecoin",
        summary: 'USDC and USDT orders are the other $3.7M. cNGN volume comes in phases.',
        subject: 'Paycrest',
        notebook: MAIN,
        blockId: '22597bec-e15d-4608-920e-7cf7ec8a1c44',
        ago: 30 * HOUR,
        detail: {
            headline: { value: '64%', label: 'of lifetime volume is cNGN', delta: { text: '$10.2M in all', tone: 'neutral' } },
            what: 'cNGN is paid out in naira. Its volume grew from September 2025 to January 2026, was low from April to June 2026, and picked up again from August. USDC and USDT orders account for the remaining $3.7M and grow more steadily.',
            why: 'Naira is the core of the business, but it moves in phases. Fee income follows the dollar corridors more than cNGN, so that is where growth pays most.',
        },
    },
    {
        kind: BriefingKindId.METRIC,
        title: 'Tanzania refunded 43% of its orders in the last 90 days',
        summary: 'Most other corridors refunded about 5%.',
        subject: 'Tanzania',
        notebook: MAIN,
        blockId: 'bd29fd4a-85a6-4deb-bb70-5d8082a6cf5d',
        ago: 3 * 24 * HOUR,
        detail: {
            headline: { value: '43%', label: 'of Tanzanian orders refunded', delta: { text: 'Most corridors: about 5%', tone: 'negative' } },
            what: "A refund means the order wasn't filled at the quoted rate in time, usually because no liquidity provider had that currency. The Tanzania rate points to limited shilling liquidity.",
            why: 'This is worth fixing before opening more corridors, so new users do not meet failed orders.',
        },
    },
    {
        kind: BriefingKindId.METRIC,
        title: 'Kenya volume grew about 90× in six months',
        summary: 'One payout account drives most of it.',
        subject: 'Kenya',
        notebook: MAIN,
        blockId: '775d453a-1238-4bc4-b9dc-5f659fe69f1a',
        ago: 4 * 24 * HOUR,
        detail: {
            headline: { value: '$410K', label: 'Kenyan shilling volume in Q3', delta: { text: 'Q1: $4.6K', tone: 'positive' } },
            what: 'Volume to Kenya went from $4.6K in the first quarter of 2026 to $410K in the third, mostly from one East-Africa payout account that started in late March and has been active every month since.',
            why: 'A business sending regular payouts through Paycrest for seven months is a sign of product fit for that use case.',
        },
    },
];

export class TerminalPaycrestBriefingSeeder1786300000000 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const client = await dataSource.getRepository(TerminalClientEntity).findOneBy({ name: 'Paycrest' });
        if (!client) {
            console.log('[terminal-paycrest-briefing] no Paycrest client, skipping');
            return;
        }
        const items = dataSource.getRepository(TerminalBriefingItemEntity);
        if (await items.exist({ where: { clientId: client.id } })) {
            console.log('[terminal-paycrest-briefing] Paycrest already has a briefing, skipping');
            return;
        }

        // The notebooks, as the reports of the client's projects
        const projects = await dataSource.getRepository(TerminalAnalysisSubjectEntity).find({ where: { clientId: client.id, view: AnalysisViewKind.PROJECT } });
        const reports = await dataSource.getRepository(DocumentEntity).find({ where: { parentId: In(projects.map(project => project.documentId!)) } });
        const states = new Map((await dataSource.getRepository(YjsDocumentEntity).find({ where: { documentId: In(reports.map(doc => doc.id)) } })).map(yjs => [yjs.documentId, yjs.state]));
        // What the cell drew, without what it printed
        const outputsOf = (documentId: string, blockId: string): Output[] => {
            const state = states.get(documentId);
            if (!state) return [];
            const ydoc = new Y.Doc();
            Y.applyUpdate(ydoc, state);
            const block = getBlocks(ydoc).get(blockId);
            return block && isPythonBlock(block) ? getPythonBlockResult(block).filter(output => output.type !== 'stdio') : [];
        };

        const now = Date.now();
        await items.save(ITEMS.map(({ notebook, ago, ...seed }) => {
            const report = reports.find(doc => doc.title === notebook);
            if (!report) throw new Error(`[terminal-paycrest-briefing] no report titled "${notebook}", run the Paycrest seeder first`);
            return new TerminalBriefingItemEntity({
                ...seed,
                clientId: client.id,
                memberId: null,
                outputs: outputsOf(report.id, seed.blockId),
                documentId: report.id,
                ranAt: new Date(now - ago - 5 * 60 * 1000),
                publishedAt: new Date(now - ago),
                createdBy: null,
            });
        }));
        console.log(`[terminal-paycrest-briefing] seeded ${ITEMS.length} items for Paycrest`);
    }
}
