import { randomUUID } from 'node:crypto';
import * as Y from 'yjs';
import { DataSource, In, Like } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import {
    addBlockGroup,
    appendRichTextContent,
    BlockType,
    getBlocks,
    getLayout,
    getRichTextAttributes,
} from '@sandworm/editor';
import { DocumentEntity, DocumentVisibility, FavoriteEntity, UserEntity, WorkspaceEntity, YjsDocumentEntity } from '../entities';
import { fake } from '../utils';
import { NOTEBOOK_TITLES, SAMPLE_QUERIES } from './data/explore-seed-data';

function pickSql(): string {
    return SAMPLE_QUERIES[Math.floor(Math.random() * SAMPLE_QUERIES.length)]!;
}

function shuffledTitles(count: number): string[] {
    return [...NOTEBOOK_TITLES].sort(() => Math.random() - 0.5).slice(0, count);
}

function slugify(title: string, documentId: string): string {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'notebook';
    return `${base}-${documentId.slice(0, 8)}`;
}

// Real starter content, not a blank canvas — a title heading, a short
// instructional paragraph, and one real runnable SQL block — built through
// the same block APIs the live editor uses (@sandworm/editor), so forking
// one of these actually forks something rather than an empty Yjs doc.
function starterYjsState(title: string): Buffer {
    const doc = new Y.Doc();

    const titleFragment = doc.getXmlFragment('doc-title');
    titleFragment.insert(0, [new Y.XmlText(title)]);

    const layout = getLayout(doc);
    const blocks = getBlocks(doc);

    const textBlockId = addBlockGroup(layout, blocks, { type: BlockType.RichText }, 0);
    const textBlock = blocks.get(textBlockId)!;
    const { content } = getRichTextAttributes(textBlock as Parameters<typeof getRichTextAttributes>[0]);
    appendRichTextContent(
        content,
        `# ${title}\n\nStarter notebook — the query below is a sample; adjust it to pull the data for this analysis.`,
    );

    addBlockGroup(
        layout,
        blocks,
        { type: BlockType.SQL, dataSourceId: null, isFileDataSource: false, source: pickSql() },
        1,
    );

    return Buffer.from(Y.encodeStateAsUpdate(doc));
}

export class ExploreSeeder1776676230562 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<any> {
        const userRepository = dataSource.getRepository(UserEntity);
        const workspaceRepository = dataSource.getRepository(WorkspaceEntity);
        const documentRepository = dataSource.getRepository(DocumentEntity);
        const favoriteRepository = dataSource.getRepository(FavoriteEntity);
        const yjsDocumentRepository = dataSource.getRepository(YjsDocumentEntity);

        const users = await userRepository.find();
        const workspaces = await workspaceRepository.find();
        if (!users.length || !workspaces.length) {
            console.log('No users or workspaces — skipping explore seed');
            return;
        }

        // Idempotent: clear whatever this seeder created last time (matched
        // by title, since ids/slugs are freshly random each run) before
        // reseeding, so reruns replace rather than pile up duplicates. Also
        // catches lorem-ipsum rows from an older version of this seeder.
        await documentRepository.delete([
            { title: In([...NOTEBOOK_TITLES, 'Sandworm Demo']) },
            { publishedSlug: Like('explore-%') },
            { publishedSlug: Like('featured-%') },
            { publishedSlug: 'sandworm-demo' },
        ]);

        const admin = await userRepository.findOneBy({ username: 'admin' });
        const adminWorkspace = admin ? workspaces.find((w) => w.ownerId === admin.id) : undefined;

        const titles = shuffledTitles(44);
        const specs = titles.map((title, i) => ({
            id: randomUUID(),
            title,
            featured: i < 4,
            orderIndex: i + 1,
            authorId: admin && i < 4 ? admin.id : users[i % users.length]!.id,
            workspaceId: adminWorkspace && i < 4 ? adminWorkspace.id : workspaces[i % workspaces.length]!.id,
            publishedAt: fake.date.recent({ days: i < 4 ? 7 : 60 }),
        }));

        const docs = specs.map((spec) =>
            documentRepository.create({
                id: spec.id,
                title: spec.title,
                orderIndex: spec.orderIndex,
                version: 1,
                authorId: spec.authorId,
                workspaceId: spec.workspaceId,
                visibility: DocumentVisibility.PUBLIC,
                publishedAt: spec.publishedAt,
                publishedSlug: slugify(spec.title, spec.id),
                runUnexecutedBlocks: false,
                runSQLSelection: true,
                shareLinksWithoutSidebar: true,
                featuredDocument: spec.featured,
            }),
        );
        const saved = await documentRepository.save(docs, { chunk: 20 });
        console.log(`✓ ${saved.filter((d) => d.featuredDocument).length} featured + ${saved.filter((d) => !d.featuredDocument).length} public explore documents`);

        // Every seeded document needs a Yjs doc with real starter content —
        // not just an empty one — so opening or forking it isn't blank.
        await yjsDocumentRepository.save(
            saved.map((doc) => yjsDocumentRepository.create({
                documentId: doc.id,
                state: starterYjsState(doc.title),
                clock: 0,
                clockUpdatedAt: new Date(),
            })),
            { chunk: 20 },
        );

        // ---- favorites for admin (getFavoriteExploreDocuments) ----
        if (admin) {
            await favoriteRepository.save(
                saved.slice(0, 10).map((doc) => favoriteRepository.create({ userId: admin.id, documentId: doc.id })),
                { chunk: 20 },
            );
            console.log('✓ 10 favorites for admin');
        }

        // ---- seed getPublishedDocumentBySlug — one demo doc ----
        const demoId = randomUUID();
        const demoTitle = 'Sandworm Demo';
        const demoDoc = await documentRepository.save(
            documentRepository.create({
                id: demoId,
                title: demoTitle,
                orderIndex: 999,
                version: 1,
                authorId: admin ? admin.id : users[0]!.id,
                workspaceId: adminWorkspace ? adminWorkspace.id : workspaces[0]!.id,
                visibility: DocumentVisibility.PUBLIC,
                publishedAt: new Date(),
                publishedSlug: slugify(demoTitle, demoId),
                runUnexecutedBlocks: false,
                runSQLSelection: true,
                shareLinksWithoutSidebar: true,
                featuredDocument: false,
            }),
        );
        await yjsDocumentRepository.save(
            yjsDocumentRepository.create({
                documentId: demoDoc.id,
                state: starterYjsState(demoDoc.title),
                clock: 0,
                clockUpdatedAt: new Date(),
            }),
        );
        console.log('✓ sandworm-demo slug document');
    }
}
