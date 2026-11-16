import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { KpiDirection, KpiFormatKind, type KpiComparison, type KpiFormat } from '@sandworm/types/terminal';
import { TerminalClientEntity, TerminalKpiEntity, TerminalKpiValueEntity } from '../entities';

// The key numbers on the Acme exchange Overview (what the terminal's preview
// fixtures show), for the first terminal client, each with three monthly
// readings so the change since last month is worked out, not typed. Skips a
// client that already has key numbers.

const DAY = 24 * 60 * 60 * 1000;

type Seed = {
    key: string;
    label: string;
    format: KpiFormat;
    direction: KpiDirection;
    comparison?: KpiComparison;
    // Newest first: now, a month ago, two months ago
    readings: [number, number, number];
};

const KPIS: Seed[] = [
    {
        key: 'swap-volume',
        label: 'Swap volume',
        format: { kind: KpiFormatKind.CURRENCY, currency: 'USD', compact: true },
        direction: KpiDirection.UP_GOOD,
        readings: [1_840_000_000, 2_022_000_000, 1_960_000_000],
    },
    {
        key: 'active-wallets',
        label: 'Active wallets',
        format: { kind: KpiFormatKind.NUMBER },
        direction: KpiDirection.UP_GOOD,
        readings: [312_400, 300_400, 288_900],
    },
    {
        key: 'new-wallets',
        label: 'New wallets',
        format: { kind: KpiFormatKind.NUMBER },
        direction: KpiDirection.UP_GOOD,
        readings: [21_900, 24_900, 23_100],
    },
    {
        key: 'retention-90',
        label: 'Still trading after 90 days',
        format: { kind: KpiFormatKind.PERCENT },
        direction: KpiDirection.UP_GOOD,
        readings: [34, 37, 36],
    },
];

export class TerminalKpiSeeder1785900000000 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const client = await dataSource.getRepository(TerminalClientEntity).findOne({ where: {}, order: { createdAt: 'ASC' } });
        if (!client) {
            console.log('[terminal-kpi] no terminal client, skipping');
            return;
        }
        const kpis = dataSource.getRepository(TerminalKpiEntity);
        if (await kpis.exist({ where: { clientId: client.id } })) {
            console.log('[terminal-kpi] client already has key numbers, skipping');
            return;
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        for (const [position, seed] of KPIS.entries()) {
            const kpi = await kpis.save(
                kpis.create({
                    clientId: client.id,
                    subjectId: null,
                    key: seed.key,
                    label: seed.label,
                    position,
                    format: seed.format,
                    direction: seed.direction,
                    comparison: seed.comparison ?? { kind: 'previous' },
                    source: { kind: 'manual' },
                }),
            );
            await dataSource.getRepository(TerminalKpiValueEntity).save(
                seed.readings.map((value, month) =>
                    dataSource.getRepository(TerminalKpiValueEntity).create({
                        kpiId: kpi.id,
                        asOf: new Date(today.getTime() - month * 30 * DAY),
                        value,
                    }),
                ),
            );
        }
        console.log(`[terminal-kpi] ${KPIS.length} key numbers for client ${client.id}`);
    }
}
