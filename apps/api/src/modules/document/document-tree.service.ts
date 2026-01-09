import { Injectable } from '@nestjs/common'
import * as dfns from 'date-fns'
import PQueue from 'p-queue'
import * as yjsDocsV2 from './yjs/v2/documents.js'
import { PrismaService } from '../prisma/prisma.service'
import { Document, PrismaTransaction } from '@briefer/database'
import { SocketService } from '../websocket/socket.service'

const queues = new Map<string, PQueue>()

@Injectable()
export class DocumentTreeService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly socket: SocketService,
    ) { }

    private async wrapInQueue<T>(
        workspaceId: string,
        fn: () => Promise<T>,
    ): Promise<T> {
        const queue =
            queues.get(workspaceId) ?? new PQueue({ concurrency: 1 })

        queues.set(workspaceId, queue)
        return (await queue.add(fn))!
    }

    async upsertDocument(
        id: string,
        title: string,
        workspaceId: string,
        parentId: string | null,
        orderIndex: number,
        version: number,
        tx: PrismaTransaction,
    ) {
        return this.wrapInQueue(workspaceId, async () => {
            const childrenCount = await tx.document.count({
                where: { workspaceId, parentId, deletedAt: null },
            })

            const lastChild = await tx.document.findFirst({
                where: { workspaceId, parentId, deletedAt: null },
                orderBy: { orderIndex: 'desc' },
                select: { orderIndex: true },
            })

            const finalOrderIndex =
                orderIndex === -1 || orderIndex > childrenCount
                    ? (lastChild?.orderIndex ?? childrenCount - 1) + 1
                    : orderIndex

            await tx.document.updateMany({
                where: { workspaceId, parentId, orderIndex: { gte: finalOrderIndex } },
                data: { orderIndex: { increment: 1 } },
            })

            const document = await tx.document.upsert({
                where: { id, workspaceId },
                update: { title, parentId, orderIndex: finalOrderIndex },
                create: {
                    id,
                    title,
                    workspaceId,
                    parentId,
                    orderIndex: finalOrderIndex,
                    version,
                },
            })

            return {
                created: dfns.isEqual(document.createdAt, document.updatedAt),
                document,
            }
        })
    }
}
