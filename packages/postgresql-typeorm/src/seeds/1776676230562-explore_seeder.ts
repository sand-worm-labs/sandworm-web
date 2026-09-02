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
    writeTitleFragment,
} from '@sandworm/editor';
import { DocumentEntity, DocumentVisibility, FavoriteEntity, UserEntity, UserWorkspaceEntity, UserWorkspaceRole, UserWorkspaceStatus, WorkspaceEntity, YjsDocumentEntity } from '../entities';
import { fake } from '../utils';
import { NOTEBOOK_TITLES, SAMPLE_QUERIES, QUERY_SECTIONS, POWER_TOOLS, WORKSPACE_ICON_COLORS } from './data/explore-seed-data';

function randomWorkspaceIcon(): string {
    return WORKSPACE_ICON_COLORS[Math.floor(Math.random() * WORKSPACE_ICON_COLORS.length)]!;
}

function shuffledTitles(count: number): string[] {
    return [...NOTEBOOK_TITLES].sort(() => Math.random() - 0.5).slice(0, count);
}

// Appends a short id suffix so republished slugs stay unique across reseeds.
function publishedSlugFor(title: string, documentId: string): string {
    return `${slugify(title) || 'notebook'}-${documentId.slice(0, 8)}`;
}

function addRichText(layout: ReturnType<typeof getLayout>, blocks: ReturnType<typeof getBlocks>, index: number, markdown: string, isMarkdownBlock = false): void {
    const blockId = addBlockGroup(layout, blocks, { type: isMarkdownBlock ? BlockType.Markdown : BlockType.RichText }, index);
    const block = blocks.get(blockId)!;
    const { content } = getRichTextAttributes(block as Parameters<typeof getRichTextAttributes>[0]);
    appendRichTextContent(content, markdown);
}

// Deliberately large — exercises every block type the live "Add block" menu
// offers (except DashboardHeader, which belongs to the Dashboard view, not
// the notebook body), with one full section (heading, SQL, Python, chart,
// pivot) per SAMPLE_QUERIES entry, so a seeded notebook is a real stress
// test for the editor with a long, heavy document — not a token example.
function starterYjsState(title: string): Buffer {
    const doc = new Y.Doc();
    writeTitleFragment(doc, title);

    const layout = getLayout(doc);
    const blocks = getBlocks(doc);
    let i = 0;

    addRichText(
        layout, blocks, i++,
        `# ${title}\n\n` +
        `Starter notebook covering ${QUERY_SECTIONS.length} angles on this dataset — daily activity, protocol/trader breakdowns, ` +
        `NFT secondary sales, unique-sender counts, and gas price context. Every query below is real and runnable; ` +
        `swap the data source in and re-run to pull live numbers.\n\n` +
        `- Each section has its own SQL query, a Python cell for quick post-processing, a chart, and a pivot table\n` +
        `- Dataframe names are threaded through each section so the chart/pivot blocks reference the right query\n` +
        `- The PowerToolbox blocks near the end wire up ${POWER_TOOLS.length} of the platform's built-in analytics tools`,
    );

    QUERY_SECTIONS.forEach((section, idx) => {
        addRichText(layout, blocks, i++, `## ${idx + 1}. ${section.heading}\n\n${section.body}`, true);

        addBlockGroup(
            layout, blocks,
            { type: BlockType.SQL, dataSourceId: null, isFileDataSource: false, source: SAMPLE_QUERIES[idx]!, dataframeName: section.df },
            i++,
        );

        addBlockGroup(layout, blocks, { type: BlockType.Python, source: section.python }, i++);
        addBlockGroup(layout, blocks, { type: BlockType.VisualizationV2, dataframeName: section.df }, i++);

        // Pivot every other section — enough repetition to stress-test, not
        // so much that every section is identical.
        if (idx % 2 === 0) {
            addBlockGroup(layout, blocks, { type: BlockType.PivotTable, dataframeName: section.df }, i++);
        }
    });

    addRichText(
        layout, blocks, i++,
        `## Built-in tools\n\nThe platform ships ${POWER_TOOLS.length} analytics tools relevant to this notebook — configure and run each below.`,
        true,
    );
    POWER_TOOLS.forEach((toolId) => {
        addBlockGroup(layout, blocks, { type: BlockType.PowerToolbox, toolId, inputs: {} }, i++);
    });

    addRichText(
        layout, blocks, i++,
        '## Parameters\n\nInputs below can be wired into any SQL/Python block above via their variable name.',
        true,
    );
    addBlockGroup(layout, blocks, { type: BlockType.Input }, i++);
    addBlockGroup(layout, blocks, { type: BlockType.DropdownInput }, i++);
    addBlockGroup(layout, blocks, { type: BlockType.DateInput }, i++);
    addBlockGroup(layout, blocks, { type: BlockType.FileUpload }, i++);

    addRichText(
        layout, blocks, i++,
        '## Notes & next steps\n\n' +
        `- **Methodology**: all queries use a trailing lookback window rather than fixed calendar dates, so results stay current on re-run\n` +
        `- **Known limitations**: sample queries assume a standard Dune-style schema (\`ethereum.transactions\`, \`dex.trades\`, \`nft.trades\`, \`erc20.*_evt_Transfer\`) — point the data source at your actual warehouse before trusting the numbers\n` +
        `- **Next steps**: replace the PowerToolbox placeholders with real parameter values, then chain the Python cells into a combined summary table\n\n` +
        `Notes on **${title}** — replace this section with real findings once the queries above have actually run.`,
        true,
    );

    return Buffer.from(Y.encodeStateAsUpdate(doc));
}

export class ExploreSeeder1776676230562 implements Seeder {
    track = false;

    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<any> {
        const userRepository = dataSource.getRepository(UserEntity);
        const workspaceRepository = dataSource.getRepository(WorkspaceEntity);
        const userWorkspaceRepository = dataSource.getRepository(UserWorkspaceEntity);
        const documentRepository = dataSource.getRepository(DocumentEntity);
        const favoriteRepository = dataSource.getRepository(FavoriteEntity);
        const yjsDocumentRepository = dataSource.getRepository(YjsDocumentEntity);
        const yjsAppDocumentRepository = dataSource.getRepository(YjsAppDocumentEntity);

        const users = await userRepository.find();
        if (!users.length) {
            console.log('No users — skipping explore seed');
            return;
        }

        // A document's workspace must belong to its author, or it never
        // shows up when that author looks at their own workspace. Give
        // every user their own (active) workspace here rather than
        // assuming the workspace seeder already did.
        const existingWorkspaces = await workspaceRepository.find();
        const workspaceByOwner = new Map(existingWorkspaces.map((w) => [w.ownerId, w]));

        for (const user of users) {
            if (workspaceByOwner.has(user.id)) continue;

            const workspace = await workspaceRepository.save(
                workspaceRepository.create({
                    icon: randomWorkspaceIcon(),
                    name: user.getTeamName(),
                    useCases: [],
                    ownerId: user.id,
                }),
            );
            await userWorkspaceRepository.save(
                userWorkspaceRepository.create({
                    userId: user.id,
                    workspaceId: workspace.id,
                    role: UserWorkspaceRole.ADMIN,
                    status: UserWorkspaceStatus.ACTIVE,
                    inviterId: null,
                }),
            );
            workspaceByOwner.set(user.id, workspace);
            console.log(`✓ created workspace for ${user.username ?? user.id}`);
        }

        // Idempotent: clear whatever this seeder created last time (matched
        // by title, since ids/slugs are freshly random each run) before
        // reseeding, so reruns replace rather than pile up duplicates. Also
        // catches lorem-ipsum rows and the old fixed-slug demo doc from
        // older versions of this seeder.
        await documentRepository.delete([
            { title: In(NOTEBOOK_TITLES) },
            { title: 'Sandworm Demo' },
            { publishedSlug: Like('explore-%') },
            { publishedSlug: Like('featured-%') },
            { publishedSlug: 'sandworm-demo' },
        ]);

        const admin = users.find((u) => u.username === 'admin');

        const titles = shuffledTitles(44);
        const specs = titles.map((title, idx) => {
            const featured = idx < 4;
            const author = featured && admin ? admin : users[idx % users.length]!;
            // Every user got a workspace above, so this is always defined.
            const workspace = workspaceByOwner.get(author.id)!;
            return {
                id: randomUUID(),
                title,
                featured,
                orderIndex: idx + 1,
                authorId: author.id,
                workspaceId: workspace.id,
                publishedAt: fake.date.recent({ days: featured ? 7 : 60 }),
            };
        });

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
                slug: publishedSlugFor(spec.title, spec.id),
                runUnexecutedBlocks: false,
                runSQLSelection: true,
                shareLinksWithoutSidebar: true,
                featuredDocument: spec.featured,
            }),
        );
        const saved = await documentRepository.save(docs, { chunk: 20 });
        console.log(`✓ ${saved.filter((d) => d.featuredDocument).length} featured + ${saved.filter((d) => !d.featuredDocument).length} public explore documents`);

        // Every seeded document needs a Yjs doc with real starter content —
        // not just an empty one — so opening or forking it isn't blank. One
        // state per document, reused for both rows below (mirroring
        // YjsDocumentService.publishDocument, which re-encodes the same live
        // edit doc as the app/view copy) — NOT two separate
        // starterYjsState() calls, which would produce divergent content
        // (a different random sample query each call) between edit and view.
        const states = new Map(saved.map((doc) => [doc.id, starterYjsState(doc.title)]));

        await yjsDocumentRepository.save(
            saved.map((doc) => yjsDocumentRepository.create({
                documentId: doc.id,
                state: states.get(doc.id)!,
                clock: 0,
                clockUpdatedAt: new Date(),
            })),
            { chunk: 20 },
        );

        // Also seed the "app" (published/view-mode) copy — without this,
        // the view-mode Yjs websocket handshake is rejected server-side
        // (no yjs_app_document row for the document) and the notebook
        // renders blank until you switch to edit mode.
        await yjsAppDocumentRepository.save(
            saved.map((doc) => yjsAppDocumentRepository.create({
                documentId: doc.id,
                state: states.get(doc.id)!,
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
    }
}
