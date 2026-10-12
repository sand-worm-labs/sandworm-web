import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ShowcaseCategoryEntity, ShowcaseProtocolLogoEntity } from '../entities';
import { slugify } from '../utils';

// Imports the protocol logos DefiLlama has no icon for (tokens, fiat ramps, funds, renamed
// projects): the PNGs in seeds/data/protocol-logos, named by slug. After this, logos are
// added in the studio. Reruns keep a logo that is already there, so one replaced in the
// studio is not overwritten.

// Read from src in both places the seeder runs from (src/seeds and dist/seeds).
const LOGO_DIR = path.resolve(__dirname, '..', '..', 'src', 'seeds', 'data', 'protocol-logos');

export class ShowcaseLogoSeeder1784500000000 implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const logos = dataSource.getRepository(ShowcaseProtocolLogoEntity);

        // The names the categories list, so a logo keeps the protocol's real spelling.
        const categories = await dataSource.getRepository(ShowcaseCategoryEntity).find();
        const names = new Map(categories.flatMap(category => category.protocols).map(name => [slugify(name), name]));

        let added = 0;
        for (const file of readdirSync(LOGO_DIR).filter(name => name.endsWith('.png'))) {
            const slug = path.basename(file, '.png');
            if (await logos.exist({ where: { slug } })) continue;

            const data = readFileSync(path.join(LOGO_DIR, file));
            await logos.insert({
                slug,
                name: names.get(slug) ?? slug,
                contentType: 'image/png',
                data,
                etag: createHash('sha1').update(data).digest('hex'),
            });
            added += 1;
        }
        console.log(`[showcase-logos] added ${added} protocol logos`);
    }
}
