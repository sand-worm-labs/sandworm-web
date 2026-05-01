import { Logger } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import * as Y from 'yjs';
import { decoding } from 'lib0';
import { equals, omit } from 'ramda';
import {
  YjsAppDocumentEntity,
  UserYjsAppDocumentEntity,
} from '@sandworm/postgresql-typeorm';
import {
  YBlock,
  YBlockGroup,
  getBaseAttributes,
  getLayout,
  getBlocks,
  switchBlockType,
  compareText,
  PythonBlock,
  SQLBlock,
  DateInputBlock,
  getDateInputAttributes,
} from '@sandworm/editor';
import { Persistor } from '../interfaces/persistor.interface';
import { LoadStateResult, ReplaceStateResult } from '../interfaces/load-state-result.interface';
import { TransactionOrigin } from '../interfaces/transaction-origin.interface';
import { WSSharedDoc } from "../interfaces"
import { readUpdate } from 'y-protocols/sync';
import { LockService } from '@/infrastructure/lock/lock.services';

export class AppPersistor implements Persistor {

  private readonly logger = new Logger(AppPersistor.name);

  constructor(
    private readonly docId: string,
    private readonly yjsAppDocumentId: string,
    private readonly userId: string | null,
    private readonly yjsAppDocumentRepository: Repository<YjsAppDocumentEntity>,
    private readonly userYjsAppDocumentRepository: Repository<UserYjsAppDocumentEntity>,
    private readonly lockService: LockService
  ) { }


  static create(
    docId: string,
    yjsAppDocumentId: string,
    userId: string | null,
    yjsAppDocumentRepository: Repository<YjsAppDocumentEntity>,
    userYjsAppDocumentRepository: Repository<UserYjsAppDocumentEntity>,
    lockService: LockService
  ): AppPersistor {
    return new AppPersistor(
      docId,
      yjsAppDocumentId,
      userId,
      yjsAppDocumentRepository,
      userYjsAppDocumentRepository,
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
      const repo = tx ? tx.getRepository(YjsAppDocumentEntity) : this.yjsAppDocumentRepository;
      const userRepo = tx ? tx.getRepository(UserYjsAppDocumentEntity) : this.userYjsAppDocumentRepository;

      const yjsAppDoc = await repo.findOne({
        where: { id: this.yjsAppDocumentId },
        relations: ['userYjsAppDocuments'],
      });

      if (!yjsAppDoc) {
        throw new Error(`YjsAppDocument ${this.yjsAppDocumentId} not found`);
      }

      const ydoc = new Y.Doc();
      let userYjsAppDoc: UserYjsAppDocumentEntity | null = null;

      if (this.userId) {
        userYjsAppDoc = await userRepo.findOne({
          where: {
            yjsAppDocumentId: this.yjsAppDocumentId,
            userId: this.userId,
          },
        });
      }

      let byteLength: number;
      let clock: number;
      let applyUpdateLatency: number;
      let clockUpdatedAt: Date;

      if (!this.userId) {
        // Published state
        applyUpdateLatency = this.applyUpdate(ydoc, yjsAppDoc.state);
        byteLength = yjsAppDoc.state.length;
        clock = yjsAppDoc.clock;
        clockUpdatedAt = yjsAppDoc.clockUpdatedAt ?? new Date();
      } else if (!userYjsAppDoc) {
        // User never opened the app before, duplicate the state
        userYjsAppDoc = userRepo.create({
          yjsAppDocumentId: this.yjsAppDocumentId,
          userId: this.userId,
          state: yjsAppDoc.state,
          clock: yjsAppDoc.clock,
        });
        await userRepo.save(userYjsAppDoc);

        applyUpdateLatency = this.applyUpdate(ydoc, userYjsAppDoc.state);
        byteLength = userYjsAppDoc.state.length;
        clock = userYjsAppDoc.clock;
        clockUpdatedAt = userYjsAppDoc.clockUpdatedAt ?? new Date();
      } else {
        applyUpdateLatency = this.applyUpdate(ydoc, userYjsAppDoc.state);
        byteLength = userYjsAppDoc.state.length;
        clock = userYjsAppDoc.clock;
        clockUpdatedAt = userYjsAppDoc.clockUpdatedAt ?? new Date();
      }

      return {
        ydoc,
        clock,
        byteLength,
        applyUpdateLatency,
        clockUpdatedAt,
      };
    } catch (err) {
      this.logger.error(
        `Failed to load Yjs app document state for ${this.yjsAppDocumentId}, userId: ${this.userId}:`,
        err
      );
      throw err;
    }
  }

  public async persist(ydoc: WSSharedDoc, tx?: EntityManager): Promise<void> {
    return this.lockService.acquireLock(`app-persistor:${this.docId}`, async () => {
      const state = Buffer.from(Y.encodeStateAsUpdate(ydoc.ydoc));

      if (this.userId) {
        const repo = tx ? tx.getRepository(UserYjsAppDocumentEntity) : this.userYjsAppDocumentRepository;

        const existing = await repo.findOne({
          where: {
            yjsAppDocumentId: this.yjsAppDocumentId,
            userId: this.userId,
          },
        });

        if (existing) {
          await repo.update(
            {
              yjsAppDocumentId: this.yjsAppDocumentId,
              userId: this.userId,
            },
            { state }
          );
        } else {
          const newDoc = repo.create({
            yjsAppDocumentId: this.yjsAppDocumentId,
            userId: this.userId,
            state,
            clock: ydoc.clock,
          });
          await repo.save(newDoc);
        }
      } else {
        const repo = tx ? tx.getRepository(YjsAppDocumentEntity) : this.yjsAppDocumentRepository;

        await repo.update(
          { id: this.yjsAppDocumentId },
          { state }
        );
      }
    });
  }

  public canWrite(
    decoder: decoding.Decoder,
    doc: WSSharedDoc,
    transactionOrigin: TransactionOrigin
  ): boolean {
    const prevState = Y.encodeStateAsUpdate(doc.ydoc);
    const nextDoc = new Y.Doc();

    this.applyUpdate(nextDoc, prevState);
    readUpdate(decoding.clone(decoder), nextDoc, transactionOrigin);

    const layout = doc.layout;
    const nextLayout = getLayout(nextDoc);
    const isLayoutEqual = this.isLayoutEqual(layout, nextLayout);

    if (!isLayoutEqual) {
      return false;
    }

    const blocks = doc.blocks;
    const nextBlocks = getBlocks(nextDoc);
    return this.areBlocksAcceptable(blocks, nextBlocks);
  }

  private isLayoutEqual(
    prevLayout: Y.Array<YBlockGroup>,
    nextLayout: Y.Array<YBlockGroup>
  ): boolean {
    if (prevLayout.length !== nextLayout.length) {
      return false;
    }

    for (let i = 0; i < prevLayout.length; i++) {
      const prevGroup = prevLayout.get(i);
      const nextGroup = nextLayout.get(i);

      if (!this.isBlockGroupAcceptable(prevGroup, nextGroup)) {
        return false;
      }
    }

    return true;
  }

  private isBlockGroupAcceptable(
    prevGroup: YBlockGroup,
    nextGroup: YBlockGroup
  ): boolean {
    if (prevGroup.getAttribute('id') !== nextGroup.getAttribute('id')) {
      return false;
    }

    const prevCurrent = prevGroup.getAttribute('current');
    const nextCurrent = nextGroup.getAttribute('current');

    if (prevCurrent?.getAttribute('id') !== nextCurrent?.getAttribute('id')) {
      return false;
    }

    const prevTabs = prevGroup
      .getAttribute('tabs')
      ?.toArray()
      .map((t) => t.getAttribute('id'));
    const nextTabs = nextGroup
      .getAttribute('tabs')
      ?.toArray()
      .map((t) => t.getAttribute('id'));

    return equals(prevTabs, nextTabs);
  }

  private areBlocksAcceptable(
    prevBlocks: Y.Map<YBlock>,
    nextBlocks: Y.Map<YBlock>
  ): boolean {
    if (prevBlocks.size !== nextBlocks.size) {
      return false;
    }

    const nextBlockIds = new Set(nextBlocks.keys());

    for (const [prevBlockId, prevBlock] of prevBlocks) {
      const nextBlock = nextBlocks.get(prevBlockId);
      if (!nextBlock) {
        return false;
      }

      const prevType = prevBlock.getAttribute('type');
      const nextType = nextBlock.getAttribute('type');

      if (prevType !== nextType) {
        return false;
      }

      if (!this.isBlockAcceptable(prevBlock, prevBlocks, nextBlock, nextBlocks)) {
        return false;
      }

      nextBlockIds.delete(prevBlockId);
    }

    // A block was added
    return nextBlockIds.size === 0;
  }

  private isBlockAcceptable(
    prevBlock: YBlock,
    prevBlocks: Y.Map<YBlock>,
    nextBlock: YBlock,
    nextBlocks: Y.Map<YBlock>
  ): boolean {
    return switchBlockType(prevBlock, {
      onRichText: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onRichText: (nextBlock) => prevBlock.toJSON() === nextBlock.toJSON(),
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onSQL: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onSQL: (nextBlock) => this.isSQLBlockAcceptable(prevBlock, nextBlock),
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onPython: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onPython: (nextBlock) => this.isPythonBlockAcceptable(prevBlock, nextBlock),
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onVisualization: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onVisualization: (nextBlock) => equals(prevBlock.getAttributes(), nextBlock.getAttributes()),
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onVisualizationV2: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onVisualizationV2: (nextBlock) => equals(prevBlock.getAttributes(), nextBlock.getAttributes()),
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPivotTable: () => false,
          onPowerToolbox: () => false
        });
      },
      onInput: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onInput: (nextBlock) => {
            const prevAttrs = prevBlock.getAttributes();
            const nextAttrs = nextBlock.getAttributes();
            return equals(omit(['value'], prevAttrs), omit(['value'], nextAttrs));
          },
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onDropdownInput: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onDropdownInput: (nextBlock) => {
            const prevAttrs = prevBlock.getAttributes();
            const nextAttrs = nextBlock.getAttributes();
            return equals(omit(['value'], prevAttrs), omit(['value'], nextAttrs));
          },
          onInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onDateInput: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onDateInput: (nextBlock) => this.isDateInputBlockAcceptable(prevBlock, prevBlocks, nextBlock, nextBlocks),
          onInput: () => false,
          onDropdownInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onFileUpload: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onFileUpload: (nextBlock) => equals(prevBlock.getAttributes(), nextBlock.getAttributes()),
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onDashboardHeader: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onDashboardHeader: (nextBlock) => equals(prevBlock.getAttributes(), nextBlock.getAttributes()),
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onPowerToolbox: () => false,
          onPivotTable: () => false,
        });
      },
      onPowerToolbox: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onPowerToolbox: (nextBlock) => equals(prevBlock.getAttributes(), nextBlock.getAttributes()),
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPivotTable: () => false,
        });
      },
      onPivotTable: (prevBlock) => {
        return switchBlockType(nextBlock, {
          onPivotTable: (nextBlock) => {
            const prevAttrs = prevBlock.getAttributes();
            const nextAttrs = nextBlock.getAttributes();
            return equals(omit(['page', 'sort'], prevAttrs), omit(['page', 'sort'], nextAttrs));
          },
          onInput: () => false,
          onDropdownInput: () => false,
          onDateInput: () => false,
          onPython: () => false,
          onRichText: () => false,
          onSQL: () => false,
          onVisualization: () => false,
          onVisualizationV2: () => false,
          onFileUpload: () => false,
          onDashboardHeader: () => false,
          onPowerToolbox: () => false,
        });
      },
    });
  }

  private isSQLBlockAcceptable(
    prevBlock: Y.XmlElement<SQLBlock>,
    nextBlock: Y.XmlElement<SQLBlock>
  ): boolean {
    const prevAttrs = prevBlock.getAttributes();
    const nextAttrs = nextBlock.getAttributes();

    if (compareText(prevAttrs.source, nextAttrs.source) !== 0) {
      return false;
    }

    if (compareText(prevAttrs.editWithAIPrompt, nextAttrs.editWithAIPrompt) !== 0) {
      return false;
    }

    return equals(
      omit(['source', 'editWithAIPrompt', 'sort', 'dashboardPageSize', 'dashboardPage', 'page'], prevAttrs),
      omit(['source', 'editWithAIPrompt', 'sort', 'dashboardPageSize', 'dashboardPage', 'page'], nextAttrs)
    );
  }

  private isPythonBlockAcceptable(
    prevBlock: Y.XmlElement<PythonBlock>,
    nextBlock: Y.XmlElement<PythonBlock>
  ): boolean {
    const prevAttrs = prevBlock.getAttributes();
    const nextAttrs = nextBlock.getAttributes();

    if (compareText(prevAttrs.source, nextAttrs.source) !== 0) {
      return false;
    }

    if (compareText(prevAttrs.editWithAIPrompt, nextAttrs.editWithAIPrompt) !== 0) {
      return false;
    }

    return equals(
      omit(['source', 'editWithAIPrompt'], prevAttrs),
      omit(['source', 'editWithAIPrompt'], nextAttrs)
    );
  }

  private isDateInputBlockAcceptable(
    prevBlock: Y.XmlElement<DateInputBlock>,
    prevBlocks: Y.Map<YBlock>,
    nextBlock: Y.XmlElement<DateInputBlock>,
    nextBlocks: Y.Map<YBlock>
  ): boolean {
    const prevAttrs = getDateInputAttributes(prevBlock, prevBlocks);
    const nextAttrs = getDateInputAttributes(nextBlock, nextBlocks);

    if (compareText(prevAttrs.label, nextAttrs.label) !== 0) {
      return false;
    }

    if (prevAttrs.variable !== nextAttrs.variable) {
      return false;
    }

    if (compareText(prevAttrs.newVariable, nextAttrs.newVariable) !== 0) {
      return false;
    }

    if (prevAttrs.value.timezone !== nextAttrs.value.timezone) {
      return false;
    }

    const prevToCompare = {
      ...getBaseAttributes(prevBlock),
      executedAt: prevAttrs.executedAt,
      configOpen: prevAttrs.configOpen,
      dateType: prevAttrs.dateType,
      error: prevAttrs.error,
    };

    const nextToCompare = {
      ...getBaseAttributes(nextBlock),
      executedAt: nextAttrs.executedAt,
      configOpen: nextAttrs.configOpen,
      dateType: nextAttrs.dateType,
      error: nextAttrs.error,
    };

    return equals(prevToCompare, nextToCompare);
  }

  public async replaceState(clock: number, newState: Buffer): Promise<ReplaceStateResult> {
    const ydoc = new Y.Doc();
    const applyUpdateLatency = this.applyUpdate(ydoc, newState);

    if (this.userId) {
      const result = await this.userYjsAppDocumentRepository
        .createQueryBuilder()
        .update(UserYjsAppDocumentEntity)
        .set({
          state: newState,
          clock: () => 'clock + 1',
          clockUpdatedAt: new Date(),
        })
        .where('yjsAppDocumentId = :yjsAppDocumentId', { yjsAppDocumentId: this.yjsAppDocumentId })
        .andWhere('userId = :userId', { userId: this.userId })
        .andWhere('clock = :clock', { clock })
        .returning(['clock', 'clockUpdatedAt'])
        .execute();

      if (result.affected === 0) {
        this.logger.warn(`Found old clock when replacing user app state, reloading instead`);
        const loadResult = await this.load();
        return { ...loadResult, replaced: false };
      }

      const updated = result.raw[0];
      return {
        ydoc,
        clock: updated.clock,
        byteLength: newState.length,
        replaced: true,
        applyUpdateLatency,
        clockUpdatedAt: updated.clockUpdatedAt ?? new Date(Date.now() - 24 * 60 * 60 * 1000),
      };
    }

    const result = await this.yjsAppDocumentRepository
      .createQueryBuilder()
      .update(YjsAppDocumentEntity)
      .set({
        state: newState,
        clock: () => 'clock + 1',
        clockUpdatedAt: new Date(),
      })
      .where('id = :id', { id: this.yjsAppDocumentId })
      .andWhere('clock = :clock', { clock })
      .returning(['clock', 'clockUpdatedAt'])
      .execute();

    if (result.affected === 0) {
      this.logger.warn(`Found old clock when replacing app state, reloading instead`);
      const loadResult = await this.load();
      return { ...loadResult, replaced: false };
    }

    const updated = result.raw[0];
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