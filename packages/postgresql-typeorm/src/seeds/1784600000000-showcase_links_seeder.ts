import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ShowcaseProtocolEntity } from '../entities';

// Imports each protocol's links (website, X, GitHub, and Discord or Telegram where it has them):
// seeds/data/protocol-links.json, by slug. They came from DefiLlama, CoinGecko and the
// protocols' own sites. After this, links are edited in the studio. Reruns keep a protocol that
// is already there, so links changed in the studio are not overwritten.

// Read from src in both places the seeder runs from (src/seeds and dist/seeds).
const LINKS_FILE = path.resolve(__dirname, '..', '..', 'src', 'seeds', 'data', 'protocol-links.json');

export class ShowcaseLinksSeeder1784600000000 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(ShowcaseProtocolEntity);
        const entries = JSON.parse(readFileSync(LINKS_FILE, 'utf8')) as Record<string, { name: string; links: Record<string, string> }>;

        let added = 0;
        for (const [slug, entry] of Object.entries(entries)) {
            if (await repository.exist({ where: { slug } })) continue;
            await repository.insert({ slug, name: entry.name, links: entry.links });
            added += 1;
        }
        console.log(`[showcase-links] added links for ${added} protocols`);
    }
}
