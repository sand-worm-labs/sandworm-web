import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as Y from "yjs";
import {
    YjsDocumentEntity,
    YjsAppDocumentEntity,
    UserYjsAppDocumentEntity,
    DocumentEntity,
} from "@sandworm/postgresql-typeorm";
import { WSSharedDocV2 } from './shared-doc/ws-shared-doc';
import { LRUCache } from 'lru-cache';

export interface LoadYDocResult {
    yDoc: Y.Doc;
    state: Buffer;
    clock: number;
}

@Injectable()
export class YjsDocumentService {
    private readonly logger = new Logger(YjsDocumentService.name);

    constructor(
        @InjectRepository(YjsDocumentEntity)
        private readonly yjsDocumentRepo: Repository<YjsDocumentEntity>,
        @InjectRepository(YjsAppDocumentEntity)
        private readonly yjsAppDocumentRepo: Repository<YjsAppDocumentEntity>,
        @InjectRepository(UserYjsAppDocumentEntity)
        private readonly userYjsAppDocumentRepo: Repository<UserYjsAppDocumentEntity>,
        @InjectRepository(DocumentEntity)
        private readonly documentRepo: Repository<DocumentEntity>,
    ) { }

    async loadEditYDoc(documentId: string): Promise<LoadYDocResult> {
        const yDoc = new Y.Doc();

        const yjsDoc = await this.yjsDocumentRepo.findOne({
            where: { documentId },
        });

        if (!yjsDoc) {
            const emptyState = Buffer.from(Y.encodeStateAsUpdate(yDoc));
            return { yDoc, state: emptyState, clock: 0 };
        }

        Y.applyUpdate(yDoc, yjsDoc.state);

        return {
            yDoc,
            state: yjsDoc.state,
            clock: yjsDoc.clock,
        };
    }

    async loadAppYDoc(documentId: string, userId: string): Promise<LoadYDocResult> {
        const yDoc = new Y.Doc();

        const yjsAppDoc = await this.yjsAppDocumentRepo.findOne({
            where: { documentId },
            order: { createdAt: "DESC" },
        });

        if (!yjsAppDoc) {
            const emptyState = Buffer.from(Y.encodeStateAsUpdate(yDoc));
            return { yDoc, state: emptyState, clock: 0 };
        }

        const userYjsAppDoc = await this.userYjsAppDocumentRepo.findOne({
            where: {
                yjsAppDocumentId: yjsAppDoc.id,
                userId,
            },
        });

        if (userYjsAppDoc) {
            Y.applyUpdate(yDoc, userYjsAppDoc.state);
            return {
                yDoc,
                state: userYjsAppDoc.state,
                clock: userYjsAppDoc.clock,
            };
        }

        // First time user opens app - create their copy
        Y.applyUpdate(yDoc, yjsAppDoc.state);

        await this.userYjsAppDocumentRepo.save({
            yjsAppDocumentId: yjsAppDoc.id,
            userId,
            state: yjsAppDoc.state,
            clock: yjsAppDoc.clock,
        });

        return {
            yDoc,
            state: yjsAppDoc.state,
            clock: yjsAppDoc.clock,
        };
    }

    async saveEditYDoc(documentId: string, yDoc: Y.Doc): Promise<void> {
        const state = Buffer.from(Y.encodeStateAsUpdate(yDoc));

        await this.yjsDocumentRepo.upsert(
            {
                documentId,
                state,
            },
            {
                conflictPaths: ["documentId"],
                skipUpdateIfNoValuesChanged: true,
            },
        );
    }

    async saveAppYDoc(
        yjsAppDocumentId: string,
        userId: string | null,
        yDoc: Y.Doc,
    ): Promise<void> {
        const state = Buffer.from(Y.encodeStateAsUpdate(yDoc));

        if (userId) {
            await this.userYjsAppDocumentRepo.upsert(
                {
                    yjsAppDocumentId,
                    userId,
                    state,
                },
                {
                    conflictPaths: ["yjsAppDocumentId", "userId"],
                    skipUpdateIfNoValuesChanged: true,
                },
            );
        } else {
            await this.yjsAppDocumentRepo.update(yjsAppDocumentId, { state });
        }
    }

    async publishDocument(documentId: string): Promise<YjsAppDocumentEntity> {
        const editYDoc = await this.loadEditYDoc(documentId);
        const state = Buffer.from(Y.encodeStateAsUpdate(editYDoc.yDoc));

        // Check if app document exists
        let yjsAppDoc = await this.yjsAppDocumentRepo.findOne({
            where: { documentId },
            order: { createdAt: "DESC" },
        });

        if (yjsAppDoc) {
            // Update existing
            yjsAppDoc.state = state;
            yjsAppDoc.clock += 1;
            yjsAppDoc.clockUpdatedAt = new Date();
            await this.yjsAppDocumentRepo.save(yjsAppDoc);

            // Update all user copies
            await this.userYjsAppDocumentRepo.update(
                { yjsAppDocumentId: yjsAppDoc.id },
                {
                    state,
                    clock: yjsAppDoc.clock,
                    clockUpdatedAt: new Date(),
                },
            );
        } else {
            // Create new
            yjsAppDoc = await this.yjsAppDocumentRepo.save({
                documentId,
                state,
                clock: 0,
                clockUpdatedAt: new Date(),
            });
        }

        // Update document publishedAt
        await this.documentRepo.update(documentId, {
            publishedAt: new Date(),
        });

        return yjsAppDoc;
    }

    async getYDocState(
        documentId: string,
        isApp: boolean,
        userId?: string,
    ): Promise<string | null> {
        if (isApp && userId) {
            const result = await this.loadAppYDoc(documentId, userId);
            return result.state.toString("base64");
        }

        const result = await this.loadEditYDoc(documentId);
        return result.state.toString("base64");
    }
}