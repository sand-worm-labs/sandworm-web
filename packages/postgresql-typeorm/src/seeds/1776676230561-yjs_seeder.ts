import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import {
    getBlocks,
    getLayout,
    addBlockGroup,
    BlockType,
    setTitle, createDocState
} from '@sandworm/editor';
import { DocumentEntity, YjsDocumentEntity } from '../entities';

const PYTHON_PROGRAMS = [
    `print("hello from sandworm")`,
    `x = 1 + 1\nprint(x)`,
    `print(2 ** 10)`,
    `name = "sandworm"\nprint(f"gm {name}")`,
    `total = sum(range(100))\nprint(total)`,
    `import math\nprint(math.pi)`,
    `nums = [1, 2, 3, 4, 5]\nprint(sum(nums) / len(nums))`,
    `for i in range(5):\n    print(i)`,
    `print("ETH" * 3)`,
    `a, b = 3, 4\nprint(a ** 2 + b ** 2)`,
];

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]!;
}

export class Yjs1776676230561 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        _factoryManager: SeederFactoryManager,
    ): Promise<any> {
        const documentRepo = dataSource.getRepository(DocumentEntity);
        const yjsRepo = dataSource.getRepository(YjsDocumentEntity);

        const documents = await documentRepo
            .createQueryBuilder('doc')
            .leftJoin('doc.yjsDocuments', 'yjs')
            .where('yjs.id IS NULL')
            .getMany();

        if (!documents.length) {
            console.log('No documents without yjs docs — skipping');
            return;
        }

        const entities = documents.map((doc) => {
            const state = Buffer.from(
                createDocState((ydoc) => {
                    const blocks = getBlocks(ydoc);
                    const layout = getLayout(ydoc);

                    const blockId = addBlockGroup(layout, blocks, {
                        type: BlockType.Python,
                        source: randomItem(PYTHON_PROGRAMS),
                    }, 0);

                    const block = blocks.get(blockId);
                    if (block) {
                        setTitle(block, doc.title ?? 'Untitled');
                    }
                })
            );

            return yjsRepo.create({
                documentId: doc.id,
                state,
                clock: 0,
            });
        });

        await yjsRepo.save(entities, { chunk: 100 });

        console.log(`Seeded ${entities.length} yjs documents`);
    }
}