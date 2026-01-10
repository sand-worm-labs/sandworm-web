import { Injectable, Logger } from '@nestjs/common';
import { DataFrame } from '@sandworm/types';
import { equals } from 'ramda';
import * as Y from 'yjs';
import { DataFrameService } from '@/features/code-execution/query-engine/dataframe/dataframe.service';

@Injectable()
export class BlockExecutorDataframeService {
  private readonly logger = new Logger(BlockExecutorDataframeService.name);

  async updateDataframes(
    workspaceId: string,
    sessionId: string,
    currentBlockId: string,
    blocks: Set<string>,
    dataframes: Y.Map<DataFrame>,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Updating dataframes for block ${currentBlockId} in workspace ${workspaceId}`,
      );

      const newDataframes = await listDataFrames(workspaceId, sessionId);

      this.logger.debug(`Found ${newDataframes.length} dataframes in Python session`);

      this.updateDataframesInMap(dataframes, newDataframes, currentBlockId, blocks);
    } catch (err) {
      this.logger.error(
        { workspaceId, sessionId, currentBlockId, err },
        'Error updating dataframes',
      );
      throw err;
    }
  }


  updateDataframesInMap(
    oldDataframes: Y.Map<DataFrame>,
    newDataframes: DataFrame[],
    currentBlockId: string,
    blocks: Set<string>,
  ): void {
    const update = () => {
      const previousDataframes = new Set(Array.from(oldDataframes.keys()));
      const dataframesToUpdate = new Map<string, DataFrame>();
      const dataframesToAdd = new Map(newDataframes.map((df) => [df.name, df]));
      const dataframesToRemove = new Set(previousDataframes);

      // Categorize each new dataframe
      newDataframes.forEach((dataframe) => {
        if (dataframesToRemove.has(dataframe.name)) {
          dataframesToRemove.delete(dataframe.name);
        }

        if (oldDataframes.has(dataframe.name)) {
          dataframesToUpdate.set(dataframe.name, dataframe);
          dataframesToAdd.delete(dataframe.name);
        }
      });

      // REMOVE: Delete dataframes that should be removed
      dataframesToRemove.forEach((name) => {
        const df = oldDataframes.get(name);
        if (!df?.blockId) return;

        // Only remove if the block that created it doesn't exist anymore
        // OR we just ran that block and it's not defined in Python anymore
        if (!blocks.has(df.blockId) || df.blockId === currentBlockId) {
          this.logger.debug(`Removing dataframe '${name}' (owned by block ${df.blockId})`);
          oldDataframes.delete(name);
        }
      });

      // ADD: Add new dataframes
      dataframesToAdd.forEach((df, name) => {
        df.blockId = currentBlockId;
        this.logger.debug(`Adding dataframe '${name}' (owned by block ${currentBlockId})`);
        oldDataframes.set(name, df);
      });

      // UPDATE: Update existing dataframes if schema changed
      dataframesToUpdate.forEach((df, name) => {
        const previous = oldDataframes.get(name);
        if (!previous) {
          oldDataframes.set(name, df);
          return;
        }

        if (equals(previous.columns, df.columns)) {
          return;
        }

        this.logger.debug(`Updating dataframe '${name}' schema (columns changed)`);

        if (!df.blockId) {
          df.blockId = currentBlockId;
        }

        oldDataframes.set(name, df);
      });
    };

    if (oldDataframes.doc) {
      oldDataframes.doc.transact(update);
    } else {
      update();
    }
  }

  getDataframe(dataframes: Y.Map<DataFrame>, name: string): DataFrame | undefined {
    return dataframes.get(name);
  }

  hasDataframe(dataframes: Y.Map<DataFrame>, name: string): boolean {
    return dataframes.has(name);
  }

  getDataframeNames(dataframes: Y.Map<DataFrame>): string[] {
    return Array.from(dataframes.keys());
  }

  getAllDataframes(dataframes: Y.Map<DataFrame>): DataFrame[] {
    return Array.from(dataframes.values());
  }

  getDataframesByBlock(dataframes: Y.Map<DataFrame>, blockId: string): DataFrame[] {
    return Array.from(dataframes.values()).filter((df) => df.blockId === blockId);
  }

  deleteDataframe(dataframes: Y.Map<DataFrame>, name: string): boolean {
    if (!dataframes.has(name)) {
      return false;
    }

    dataframes.delete(name);
    this.logger.debug(`Deleted dataframe '${name}'`);
    return true;
  }

  renameDataframe(
    dataframes: Y.Map<DataFrame>,
    oldName: string,
    newName: string,
  ): boolean {
    const df = dataframes.get(oldName);
    if (!df) {
      this.logger.warn(`Cannot rename dataframe '${oldName}' to '${newName}': not found`);
      return false;
    }

    if (dataframes.has(newName)) {
      this.logger.warn(
        `Cannot rename dataframe '${oldName}' to '${newName}': name already exists`,
      );
      return false;
    }

    const update = () => {
      const updatedDf = { ...df, name: newName };
      dataframes.set(newName, updatedDf);
      dataframes.delete(oldName);
      this.logger.debug(`Renamed dataframe '${oldName}' to '${newName}'`);
    };

    if (dataframes.doc) {
      dataframes.doc.transact(update);
    } else {
      update();
    }

    return true;
  }

  clearAllDataframes(dataframes: Y.Map<DataFrame>): void {
    const update = () => {
      dataframes.clear();
      this.logger.debug('Cleared all dataframes');
    };

    if (dataframes.doc) {
      dataframes.doc.transact(update);
    } else {
      update();
    }
  }

  isValidDataframeName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }
}