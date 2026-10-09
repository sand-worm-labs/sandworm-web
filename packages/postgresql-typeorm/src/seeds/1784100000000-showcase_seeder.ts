import { randomUUID } from 'node:crypto';
import * as Y from 'yjs';
import { DataSource, Like } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import {
    addBlockGroup,
    BlockType,
    getBlocks,
    getLayout,
    getMarkdownSource,
    updateYText,
    writeTitleFragment,
} from '@sandworm/editor';
import {
    DocumentEntity,
    DocumentVisibility,
    ShowcaseCategoryEntity,
    UserEntity,
    WorkspaceEntity,
    YjsAppDocumentEntity,
    YjsDocumentEntity,
} from '../entities';
import { slugify } from '../utils';

// Fills the Showcase with plain sample notebooks, for testing its pages. For
// each category in the taxonomy it publishes one category notebook and one
// case study per protocol the category lists, so every link on the Showcase
// (/showcase/solana, /showcase/solana/jupiter, ...) opens a real published
// notebook. They hold a few lines of text and no data.
// Reruns replace what the last run made (matched by the slug prefix).

const SLUG_PREFIX = 'showcase-sample';
const SAMPLE_NOTE = 'Sample notebook. It is here to show how the page works; the analysis is still to be written.';

// A notebook that is a title and markdown cells, one per section.
function plainNotebook(title: string, sections: string[]): Buffer {
    const doc = new Y.Doc();
    writeTitleFragment(doc, title);
    const layout = getLayout(doc);
    const blocks = getBlocks(doc);

    sections.forEach((markdown, index) => {
        const blockId = addBlockGroup(layout, blocks, { type: BlockType.Markdown }, index);
        updateYText(getMarkdownSource(blocks.get(blockId) as Parameters<typeof getMarkdownSource>[0]), markdown);
    });

    return Buffer.from(Y.encodeStateAsUpdate(doc));
}

export class ShowcaseSeeder1784100000000 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<any> {
        const documentRepository = dataSource.getRepository(DocumentEntity);
        const yjsDocumentRepository = dataSource.getRepository(YjsDocumentEntity);
        const yjsAppDocumentRepository = dataSource.getRepository(YjsAppDocumentEntity);

        const categories = await dataSource.getRepository(ShowcaseCategoryEntity).find({ order: { position: 'ASC' } });
        if (!categories.length) {
            console.log('No Showcase categories — run the migrations first. Skipping showcase seed');
            return;
        }

        // Sample notebooks live in the admin's workspace, which is the one to
        // name in SHOWCASE_OFFICIAL_WORKSPACE_IDS.
        const users = await dataSource.getRepository(UserEntity).find();
        const author = users.find(user => user.username === 'admin') ?? users[0];
        const workspace = author && (await dataSource.getRepository(WorkspaceEntity).findOne({ where: { ownerId: author.id } }));
        if (!author || !workspace) {
            console.log('No user with a workspace — skipping showcase seed');
            return;
        }

        await documentRepository.delete({ slug: Like(`${SLUG_PREFIX}%`) });

        const documents: DocumentEntity[] = [];
        const states = new Map<string, Buffer>();

        // One published notebook: its row, and the content both copies share.
        const add = (title: string, description: string, slug: string, showcase: Record<string, unknown>, sections: string[]) => {
            const id = randomUUID();
            documents.push(documentRepository.create({
                id,
                title,
                description,
                slug,
                showcase,
                tags: ['Sample'],
                orderIndex: 1000 + documents.length,
                version: 1,
                authorId: author.id,
                workspaceId: workspace.id,
                visibility: DocumentVisibility.PUBLIC,
                publishedAt: new Date(),
                runUnexecutedBlocks: false,
                runSQLSelection: true,
                shareLinksWithoutSidebar: true,
                featuredDocument: false,
            }));
            states.set(id, plainNotebook(title, sections));
        };

        categories.forEach(category => {
            const shared = { category: category.slug, chains: category.chains, status: 'published', heroStats: [] };

            add(
                `${category.name} (sample)`,
                category.question,
                `${SLUG_PREFIX}-${category.slug}`,
                { ...shared, kind: 'category' },
                [SAMPLE_NOTE, `## Leaderboard\n\nThe ranking of ${category.name} protocols goes here.`],
            );

            category.protocols.forEach(protocol => {
                add(
                    `${protocol} (sample case study)`,
                    `A sample case study of ${protocol} in ${category.name}.`,
                    `${SLUG_PREFIX}-${category.slug}-${slugify(protocol) || 'protocol'}`,
                    { ...shared, kind: 'case_study', protocol },
                    [SAMPLE_NOTE, `## The short version\n\nWhat the chain shows about ${protocol} goes here.`],
                );
                // A second notebook, so a project's page has more to list.
                add(
                    `${protocol}: working notebook (sample)`,
                    `A sample working notebook on ${protocol}.`,
                    `${SLUG_PREFIX}-${category.slug}-${slugify(protocol) || 'protocol'}-working`,
                    { ...shared, kind: 'working', protocol, parentCaseStudy: `${SLUG_PREFIX}-${category.slug}-${slugify(protocol) || 'protocol'}` },
                    [SAMPLE_NOTE, `## Questions to ask next\n\nFollow-up analysis on ${protocol} goes here.`],
                );
            });
        });

        const saved = await documentRepository.save(documents, { chunk: 20 });

        // The edit copy and the published copy hold the same state, as they
        // do after a real publish.
        const yjsRow = (doc: DocumentEntity) => ({ documentId: doc.id, state: states.get(doc.id)!, clock: 0, clockUpdatedAt: new Date() });
        await yjsDocumentRepository.save(saved.map(doc => yjsDocumentRepository.create(yjsRow(doc))), { chunk: 20 });
        await yjsAppDocumentRepository.save(saved.map(doc => yjsAppDocumentRepository.create(yjsRow(doc))), { chunk: 20 });

        console.log(`✓ ${saved.length} sample Showcase notebooks across ${categories.length} categories`);
        console.log(`  To show them, set in apps/api/.env:  SHOWCASE_OFFICIAL_WORKSPACE_IDS=${workspace.id}`);
    }
}
