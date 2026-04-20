import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DocumentEntity, DocumentVisibility, FavoriteEntity, UserEntity, WorkspaceEntity } from '../entities';
import { fake } from '../utils';

export class ExploreSeeder1776676230562 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        _factoryManager: SeederFactoryManager,
    ): Promise<any> {
        const userRepository = dataSource.getRepository(UserEntity);
        const workspaceRepository = dataSource.getRepository(WorkspaceEntity);
        const documentRepository = dataSource.getRepository(DocumentEntity);
        const favoriteRepository = dataSource.getRepository(FavoriteEntity);

        const users = await userRepository.find();
        const workspaces = await workspaceRepository.find();

        if (!users.length || !workspaces.length) {
            console.log('No users or workspaces — skipping explore seed');
            return;
        }

        // ---- 4 featured documents (getFeaturedDocuments) ----
        const featuredDocs: DocumentEntity[] = [];
        for (let i = 0; i < 4; i++) {
            const user = users[i % users.length]!;
            const workspace = workspaces[i % workspaces.length]!;
            featuredDocs.push(
                documentRepository.create({
                    title: `Featured: ${fake.lorem.sentence()}`,
                    slug: 'slug',
                    orderIndex: i + 1,
                    version: 1,
                    authorId: user.id,
                    workspaceId: workspace.id,
                    visibility: DocumentVisibility.PUBLIC,
                    publishedAt: fake.date.recent({ days: 7 }),
                    publishedSlug: `featured-${fake.lorem.slug()}-${Date.now()}-${i}`,
                    isSyncedWithYjs: false,
                    runUnexecutedBlocks: false,
                    runSQLSelection: true,
                    shareLinksWithoutSidebar: true,
                    featuredDocument: true,
                }),
            );
        }
        const savedFeatured = await documentRepository.save(featuredDocs, { chunk: 10 });
        console.log(`✓ ${savedFeatured.length} featured documents`);

        // ---- 40 public documents (getExploreDocuments) ----
        const publicDocs: DocumentEntity[] = [];
        for (let i = 0; i < 40; i++) {
            const user = users[i % users.length]!;
            const workspace = workspaces[i % workspaces.length]!;
            publicDocs.push(
                documentRepository.create({
                    title: fake.lorem.sentence(),
                    slug: 'Slug',
                    orderIndex: i + 100,
                    version: 1,
                    authorId: user.id,
                    workspaceId: workspace.id,
                    visibility: DocumentVisibility.PUBLIC,
                    publishedAt: fake.date.recent({ days: 60 }),
                    publishedSlug: `explore-${fake.lorem.slug()}-${Date.now()}-${i}`,
                    isSyncedWithYjs: false,
                    runUnexecutedBlocks: false,
                    runSQLSelection: true,
                    shareLinksWithoutSidebar: true,
                    featuredDocument: false,
                }),
            );
        }
        const savedPublic = await documentRepository.save(publicDocs, { chunk: 20 });
        console.log(`✓ ${savedPublic.length} public explore documents`);

        // ---- favorites for admin (getFavoriteExploreDocuments) ----
        const admin = await userRepository.findOneBy({ username: 'admin' });
        if (admin) {
            const allPublic = [...savedFeatured, ...savedPublic];
            const toFavorite = allPublic.slice(0, 10);

            const favorites: FavoriteEntity[] = [];
            for (const doc of toFavorite) {
                const exists = await favoriteRepository.findOne({
                    where: { userId: admin.id, documentId: doc.id },
                });
                if (!exists) {
                    favorites.push(
                        favoriteRepository.create({
                            userId: admin.id,
                            documentId: doc.id,
                        }),
                    );
                }
            }
            await favoriteRepository.save(favorites, { chunk: 20 });
            console.log(`✓ ${favorites.length} favorites for admin`);
        }

        // ---- seed getPublishedDocumentBySlug — one doc with known slug ----
        const existing = await documentRepository.findOne({
            where: { publishedSlug: 'sandworm-demo' },
        });
        if (!existing) {
            const user = users[0]!;
            const workspace = workspaces[0]!;
            await documentRepository.save(
                documentRepository.create({
                    title: 'Sandworm Demo',
                    slug: 'DocumentSlug',
                    orderIndex: 999,
                    version: 1,
                    authorId: user.id,
                    workspaceId: workspace.id,
                    visibility: DocumentVisibility.PUBLIC,
                    publishedAt: new Date(),
                    publishedSlug: 'sandworm-demo',
                    isSyncedWithYjs: false,
                    runUnexecutedBlocks: false,
                    runSQLSelection: true,
                    shareLinksWithoutSidebar: true,
                    featuredDocument: false,
                }),
            );
            console.log('✓ sandworm-demo slug document');
        }
    }
}