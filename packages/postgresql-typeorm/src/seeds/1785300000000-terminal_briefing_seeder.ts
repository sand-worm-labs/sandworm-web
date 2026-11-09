import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as Y from 'yjs';
import { getBlocks, getPythonBlockResult, isPythonBlock } from '@sandworm/editor';
import type { Output } from '@sandworm/types';
import { BriefingKindId } from '@sandworm/types/terminal';
import {
    DocumentEntity,
    TerminalBriefingItemEntity,
    TerminalBriefingReadEntity,
    TerminalClientEntity,
    TerminalMemberEntity,
    UserEntity,
    YjsDocumentEntity,
    type TerminalBriefingDetail,
} from '../entities';

// A briefing for one terminal client (the Acme exchange story the terminal's
// fixtures tell), each item linked to a random cell of a random notebook. Uses the
// first terminal client, or makes one for the oldest user. Skips a client that
// already has a briefing.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Seed = {
    kind: BriefingKindId;
    title: string;
    summary: string;
    subject: string;
    ago: number;
    isRead: boolean;
    isPersonal?: boolean;
    detail?: TerminalBriefingDetail;
};

const ITEMS: Seed[] = [
    {
        kind: BriefingKindId.SIGNAL,
        title: "Argentina's off-ramps charge 2× Nigeria's fees",
        summary: '11,200 of your wallets cash out to pesos. Worth about $43K a month.',
        subject: 'Argentina',
        ago: 2 * HOUR,
        isRead: false,
        detail: {
            headline: { value: '2.2%', label: 'average fee to cash out to pesos', delta: { text: 'Nigeria: 0.9%', tone: 'neutral' } },
            what: "Cashing out stablecoins to pesos costs 2.2% on average, more than twice what it costs in Nigeria. Argentina's ramps have stayed this expensive for six months while volume kept growing.",
            why: '11,200 of your wallets cash out to pesos every month, about $14.2M. A cheaper route inside Acme Wallet could keep that flow and earn about $43K a month.',
        },
    },
    {
        kind: BriefingKindId.METRIC,
        title: 'Swap volume fell 9% this month',
        summary: '7 of your top 50 wallets traded less.',
        subject: 'Acme Wallet',
        ago: 2 * HOUR + 2 * 60 * 1000,
        isRead: false,
        detail: {
            headline: { value: '$1.84B', label: 'swap volume in October', delta: { text: '▼ 9% vs September', tone: 'negative' } },
            what: '7 of your 50 largest wallets traded 41% less than in September. Everyone else traded about the same as before.',
            why: 'Your top 50 wallets make 38% of swap volume, so a few of them slowing down moves the whole number.',
        },
    },
    {
        kind: BriefingKindId.ANALYSIS,
        title: 'Paycrest: who actually cashes out in Africa',
        summary: 'New report. 2,140 of your users sent money through Paycrest.',
        subject: 'Paycrest',
        ago: DAY - 6 * HOUR,
        isRead: false,
    },
    {
        kind: BriefingKindId.METRIC,
        title: 'Your notebook: active wallets up 4%',
        summary: 'From your own notebook. 312,400 wallets were active in October.',
        subject: 'Acme Wallet',
        ago: DAY - 2 * HOUR,
        isRead: false,
        isPersonal: true,
    },
    {
        kind: BriefingKindId.SIGNAL,
        title: 'Let users send money home with Paycrest',
        summary: '$5.1M a month already leaves your app to do this.',
        subject: 'Paycrest',
        ago: DAY + 3 * HOUR,
        isRead: true,
    },
    {
        kind: BriefingKindId.ANALYSIS,
        title: 'Updated: Phantom is gaining your Solana users',
        summary: 'Leavers going to Phantom rose from 11% to 17%.',
        subject: 'Phantom',
        ago: 6 * DAY,
        isRead: true,
    },
    {
        kind: BriefingKindId.METRIC,
        title: 'Bridging to Solana tripled this quarter',
        summary: '$96M moved last month.',
        subject: 'Solana',
        ago: 7 * DAY,
        isRead: true,
    },
];

type Cell = { documentId: string; blockId: string; outputs: Output[] };

function pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]!;
}

// Python cells whose last run drew something (a chart, table, card, text) and
// did not fail: what a briefing item freezes a copy of.
function ranCells(state: Buffer): Omit<Cell, 'documentId'>[] {
    const doc = new Y.Doc();
    Y.applyUpdate(doc, new Uint8Array(state));
    const cells: Omit<Cell, 'documentId'>[] = [];
    getBlocks(doc).forEach((block, blockId) => {
        if (!UUID.test(blockId) || !isPythonBlock(block)) return;
        const outputs = getPythonBlockResult(block);
        if (outputs.some(o => o.type === 'error')) return;
        const drawn = outputs.filter(o => o.type !== 'stdio');
        if (drawn.length) cells.push({ blockId, outputs: drawn });
    });
    return cells;
}

export class TerminalBriefingSeeder1785300000000 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const clients = dataSource.getRepository(TerminalClientEntity);
        const members = dataSource.getRepository(TerminalMemberEntity);
        const items = dataSource.getRepository(TerminalBriefingItemEntity);

        let client = await clients.findOne({ where: {}, order: { createdAt: 'ASC' } });
        if (!client) {
            const owner = await dataSource.getRepository(UserEntity).findOne({ where: {}, order: { createdAt: 'ASC' } });
            if (!owner) {
                console.log('[terminal-briefing] no users, skipping');
                return;
            }
            client = await clients.save(new TerminalClientEntity({
                ownerId: owner.id,
                type: 'exchange',
                name: 'Acme',
                website: 'https://acme.example',
            }));
        }

        let member = await members.findOne({ where: { clientId: client.id, userId: client.ownerId } });
        if (!member) {
            member = await members.save(new TerminalMemberEntity({ clientId: client.id, userId: client.ownerId, access: 'admin' }));
        }

        if (await items.exist({ where: { clientId: client.id } })) {
            console.log('[terminal-briefing] client already has a briefing, skipping');
            return;
        }

        // Notebooks with at least one cell that ran, and which of them the owner wrote
        const rows = await dataSource.getRepository(YjsDocumentEntity)
            .createQueryBuilder('yjs')
            .innerJoin(DocumentEntity, 'doc', 'doc.id = yjs.document_id AND doc.deleted_at IS NULL')
            .select(['yjs.document_id AS "documentId"', 'yjs.state AS state', 'doc.author_id AS "authorId"'])
            .getRawMany<{ documentId: string; state: Buffer; authorId: string }>();

        const all: Cell[] = [];
        const own: Cell[] = [];
        for (const row of rows) {
            const cells = ranCells(row.state);
            if (!cells.length) continue;
            const cell = { documentId: row.documentId, ...pick(cells) };
            all.push(cell);
            if (row.authorId === client.ownerId) own.push(cell);
        }
        if (!all.length) {
            console.log('[terminal-briefing] no notebook has a Python cell that ran, skipping');
            return;
        }

        const now = Date.now();
        const saved = await items.save(ITEMS.map(seed => {
            const cell = pick(seed.isPersonal && own.length ? own : all);
            const publishedAt = new Date(now - seed.ago);
            return new TerminalBriefingItemEntity({
                clientId: client.id,
                memberId: seed.isPersonal ? member.id : null,
                kind: seed.kind,
                title: seed.title,
                summary: seed.summary,
                subject: seed.subject,
                detail: seed.detail ?? {},
                outputs: cell.outputs,
                documentId: cell.documentId,
                blockId: cell.blockId,
                // Each item from its own run, so two items may share a cell
                ranAt: new Date(publishedAt.getTime() - 5 * 60 * 1000),
                publishedAt,
                createdBy: null,
            });
        }));

        const read = saved.filter((_, i) => ITEMS[i]!.isRead);
        await dataSource.getRepository(TerminalBriefingReadEntity).save(
            read.map(item => new TerminalBriefingReadEntity({ itemId: item.id, memberId: member.id, readAt: new Date(item.publishedAt!.getTime() + HOUR) })),
        );
        await members.update(member.id, { lastSeenBriefingAt: new Date(now - DAY) });

        console.log(`[terminal-briefing] seeded ${saved.length} items for "${client.name || client.id}", ${read.length} read`);
    }
}
