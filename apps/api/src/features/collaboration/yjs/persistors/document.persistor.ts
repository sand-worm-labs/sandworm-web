import { Logger } from '@nestjs/common';
import { Repository, EntityManager, LessThan } from 'typeorm';
import * as Y from 'yjs';
import { decoding } from 'lib0';
import {
  YjsDocumentEntity,
  YjsUpdateEntity,
} from '@sandworm/postgresql-typeorm';
import { ILockService } from '@sandworm/redis';
import {
  Persistor,
  ReplaceStateResult,
  LoadStateResult,
  TransactionOrigin,
  WSSharedDoc
} from '../interfaces';

const logger = new Logger('DocumentPersistor');

export class DocumentPersistor implements Persistor {

  constructor(
    private readonly documentId: string,
    private readonly yjsDocumentRepository: Repository<YjsDocumentEntity>,
    private readonly yjsUpdateRepository: Repository<YjsUpdateEntity>,
    private readonly lockService: ILockService,
  ) { }


  static create(
    documentId: string,
    yjsDocumentRepository: Repository<YjsDocumentEntity>,
    yjsUpdateRepository: Repository<YjsUpdateEntity>,
    lockService: ILockService
  ): DocumentPersistor {
    return new DocumentPersistor(
      documentId,
      yjsDocumentRepository,
      yjsUpdateRepository,
      lockService
    );
  }




  private applyUpdate(ydoc: Y.Doc, update: Buffer | Uint8Array): number {
    const start = Date.now();
    Y.applyUpdate(ydoc, update);
    return Date.now() - start;
  }

  public async load(tx?: EntityManager): Promise<LoadStateResult> {
    try {
      const repo = tx ? tx.getRepository(YjsDocumentEntity) : this.yjsDocumentRepository;
      const updateRepo = tx ? tx.getRepository(YjsUpdateEntity) : this.yjsUpdateRepository;

      const ydoc = new Y.Doc();
      const dbDoc = await repo.findOne({
        where: { documentId: this.documentId },
      });

      if (!dbDoc) {
        logger.debug(`No existing YJS document found for ${this.documentId}, creating new`);
        return {
          ydoc,
          clock: 0,
          byteLength: Y.encodeStateAsUpdate(ydoc).length,
          applyUpdateLatency: 0,
          clockUpdatedAt: new Date(),
        };
      }

      const updates = await updateRepo.find({
        where: {
          yjsDocumentId: dbDoc.id,
          clock: dbDoc.clock,
        },
        order: { createdAt: 'ASC' },
      });

      let applyUpdateLatency = this.applyUpdate(ydoc, dbDoc.state);

      if (updates.length > 0) {
        logger.debug(`Applying ${updates.length} updates for document ${this.documentId}`);
        const mergedUpdate = Y.mergeUpdates(updates.map((u) => u.update));
        applyUpdateLatency += this.applyUpdate(ydoc, mergedUpdate);
      }

      return {
        ydoc,
        clock: dbDoc.clock,
        byteLength: dbDoc.state.length,
        applyUpdateLatency,
        clockUpdatedAt: dbDoc.clockUpdatedAt ?? new Date(Date.now() - 24 * 60 * 60 * 1000),
      };
    } catch (err) {
      logger.error(`Failed to load Yjs document state for ${this.documentId}:`, err);
      throw err;
    }
  }

  public async persist(ydoc: WSSharedDoc, tx?: EntityManager): Promise<void> {
    return this.lockService.acquireLock(`document-persistor:${this.documentId}`, async () => {
      const repo = tx ? tx.getRepository(YjsDocumentEntity) : this.yjsDocumentRepository;

      let dbDoc = await repo.findOne({
        where: { documentId: this.documentId },
      });

      const state = Buffer.from(Y.encodeStateAsUpdate(ydoc.ydoc));

      if (!dbDoc) {
        logger.debug(`Creating new YJS document for ${this.documentId}`);
        dbDoc = repo.create({
          documentId: this.documentId,
          state,
          clock: 0,
        });
        await repo.save(dbDoc);
        return;
      }

      await repo.update(
        { id: dbDoc.id },
        { state }
      );

      // Cleanup old updates
      await this.cleanupOldUpdates(dbDoc.id, dbDoc.clock);
    });
  }

  private async cleanupOldUpdates(yjsDocumentId: string, clock: number): Promise<void> {
    const updatesCount = await this.yjsUpdateRepository.count({
      where: { yjsDocumentId },
    });

    if (updatesCount > 100) {
      logger.debug(`Cleaning up old updates for document ${this.documentId}. Current count: ${updatesCount}`);

      const deleted = await this.yjsUpdateRepository.delete({
        yjsDocumentId,
        createdAt: LessThan(new Date()),
        clock: LessThan(clock),
      });

      logger.debug(`Deleted ${deleted.affected} old updates for document ${this.documentId}`);
    }
  }

  public canWrite(
    _decoder: decoding.Decoder,
    _doc: WSSharedDoc,
    transactionOrigin: TransactionOrigin
  ): boolean {
    switch (transactionOrigin.role) {
      case 'admin':
      case 'editor':
        return true;
      case 'viewer':
        return false;
      default:
        return false;
    }
  }

  public async replaceState(clock: number, newState: Buffer): Promise<ReplaceStateResult> {
    const result = await this.yjsDocumentRepository
      .createQueryBuilder()
      .update(YjsDocumentEntity)
      .set({
        state: newState,
        clock: () => 'clock + 1',
        clockUpdatedAt: new Date(),
      })
      .where('documentId = :documentId', { documentId: this.documentId })
      .andWhere('clock = :clock', { clock })
      .returning(['clock', 'clockUpdatedAt'])
      .execute();

    if (result.affected === 0) {
      logger.warn(`Found old clock when replacing state for ${this.documentId}, reloading instead`);
      const loadResult = await this.load();
      return {
        ...loadResult,
        replaced: false,
      };
    }

    const ydoc = new Y.Doc();
    const applyUpdateLatency = this.applyUpdate(ydoc, newState);
    const updated = result.raw[0];

    logger.debug(`Successfully replaced state for document ${this.documentId}`);

    return {
      ydoc,
      clock: updated.clock,
      byteLength: newState.length,
      replaced: true,
      applyUpdateLatency,
      clockUpdatedAt: updated.clockUpdatedAt ?? new Date(Date.now() - 24 * 60 * 60 * 1000),
    };
  }
}