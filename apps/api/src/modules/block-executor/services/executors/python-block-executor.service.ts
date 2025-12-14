import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as Y from 'yjs';
import {
  ExecutionQueueItem,
  getPythonAttributes,
  PythonBlock,
  ExecutionQueueItemPythonMetadata,
  YBlock,
} from '@sandworm/editor';
import { DataFrame } from '@sandworm/types';
import { WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { DataframeService } from '../dataframe.service';
import { ExecutionContext } from "../../interfaces/execution-context.interface";

// import { executeCode as executePython } from '../../../../python/index.js';
// import { listDataFrames } from '../../../../python/query/index.js';
// import { advanceTutorial } from '../../../../tutorials.js';
// import { broadcastTutorialStepStates } from '../../../../websocket/workspace/tutorial.js';

// export interface PythonEvents {
//   pythonRun(): void;
//   advanceOnboarding(step: string): void;
// }

@Injectable()
export class PythonExecutorService {
  private readonly logger = new Logger(PythonExecutorService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepo: Repository<WorkspaceEntity>,
    private readonly dataframeService: DataframeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<PythonBlock>,
    metadata: ExecutionQueueItemPythonMetadata,
    context: ExecutionContext,
    events: PythonEvents,
  ): Promise<void> {
    events.pythonRun();
    block.setAttribute('result', []);

    try {
      block.setAttribute('startQueryTime', new Date().toISOString());

      this.logger.trace(
        {
          sessionId: context.sessionId,
          workspaceId: context.workspaceId,
          documentId: context.documentId,
          blockId: block.getAttribute('id'),
        },
        'executing python block'
      );

      const { aiSuggestions, source, id: blockId } = getPythonAttributes(block);

      const actualSource =
        (metadata.isSuggestion ? aiSuggestions : source)?.toJSON() ?? '';

      let errored = false;
      const { promise, abort } = await executePython(
        context.workspaceId,
        context.sessionId,
        actualSource,
        (outputs) => {
          const prevOutputs = block.getAttribute('result') ?? [];
          block.setAttribute('result', prevOutputs.concat(outputs));
          if (!errored) {
            for (const output of outputs) {
              if (output.type === 'error') {
                errored = true;
                break;
              }
            }
          }
        },
        { storeHistory: true }
      );

      let abortP = Promise.resolve(false);
      const cleanup = executionItem.observeStatus((status) => {
        if (status._tag === 'aborting') {
          abortP = abort().then(() => true);
        }
      });

      await promise;
      const aborted = await abortP;

      if (aborted) {
        executionItem.setCompleted('aborted');
        cleanup();
        return;
      }

      // Update dataframes
      const newDataframes = await listDataFrames(
        context.workspaceId,
        context.sessionId
      );

      const blocks = block.doc?.getMap('blocks');
      const blockIds = blocks ? new Set(Array.from(blocks.keys())) : new Set();

      const dataframes = block.doc?.getMap('dataframes') as Y.Map<DataFrame>;
      if (dataframes) {
        this.dataframeService.updateDataframesInMap(
          dataframes,
          newDataframes,
          blockId,
          blockIds
        );
      }

      block.setAttribute('lastQuery', block.getAttribute('source')?.toJSON());
      block.setAttribute('lastQueryTime', new Date().toISOString());

      this.logger.trace(
        {
          sessionId: context.sessionId,
          workspaceId: context.workspaceId,
          documentId: context.documentId,
          blockId: block.getAttribute('id'),
        },
        'python block executed'
      );

      executionItem.setCompleted(errored ? 'error' : 'success');

      // Tutorial advancement
      const tutorialState = await advanceTutorial(
        context.workspaceId,
        'onboarding',
        'runPython'
      );

      // Broadcast tutorial state (you'll need to inject socketServer)
      // await broadcastTutorialStepStates(socketServer, context.workspaceId, 'onboarding');

      if (tutorialState.didAdvance) {
        events.advanceOnboarding('runPython');
      }

      cleanup();
    } catch (err) {
      this.logger.error(
        {
          sessionId: context.sessionId,
          workspaceId: context.workspaceId,
          documentId: context.documentId,
          blockId: block.getAttribute('id'),
          err,
        },
        'Error while executing python block'
      );
      executionItem.setCompleted('error');
    }
  }
}