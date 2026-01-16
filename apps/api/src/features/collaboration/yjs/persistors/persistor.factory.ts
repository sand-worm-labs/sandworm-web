import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    YjsDocumentEntity,
    YjsUpdateEntity,
    YjsAppDocumentEntity,
    UserYjsAppDocumentEntity,
} from '@sandworm/postgresql-typeorm';
import { LockService } from '@sandworm/redis';
import { DocumentPersistor } from './document.persistor';
import { AppPersistor } from './app.persistor';
import { Persistor } from '../interfaces/persistor.interface';

@Injectable()
export class PersistorFactory {
    constructor(
        @InjectRepository(YjsDocumentEntity)
        private readonly yjsDocumentRepository: Repository<YjsDocumentEntity>,
        @InjectRepository(YjsUpdateEntity)
        private readonly yjsUpdateRepository: Repository<YjsUpdateEntity>,
        @InjectRepository(YjsAppDocumentEntity)
        private readonly yjsAppDocumentRepository: Repository<YjsAppDocumentEntity>,
        @InjectRepository(UserYjsAppDocumentEntity)
        private readonly userYjsAppDocumentRepository: Repository<UserYjsAppDocumentEntity>,
        private readonly lockService: LockService,
    ) { }

    createDocumentPersistor(documentId: string): Persistor {
        const docId = this.getDocId(documentId, null);
        return DocumentPersistor.create(
            docId,
            documentId,
            this.yjsDocumentRepository,
            this.yjsUpdateRepository,
            this.lockService,
        );
    }

    createAppPersistor(
        documentId: string,
        yjsAppDocumentId: string,
        userId: string | null,
    ): Persistor {
        const docId = this.getDocId(documentId, { id: yjsAppDocumentId, userId });
        return AppPersistor.create(
            docId,
            yjsAppDocumentId,
            userId,
            this.yjsAppDocumentRepository,
            this.userYjsAppDocumentRepository,
            this.lockService,
        );
    }

    getDocId(
        documentId: string,
        app: { id: string; userId: string | null } | null,
    ): string {
        if (app) {
            return [documentId, app.id, String(app.userId)].join('-');
        }
        return [documentId, 'null'].join('-');
    }
}