// apps/api/src/modules/block-executor/services/dataframe.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { DataFrame } from '@sandworm/types';
import { equals } from 'ramda';
import * as Y from 'yjs';
import { listDataFrames } from '../../../python/query/index.js';

@Injectable()
export class DataframeService {
  private readonly logger = new Logger(DataframeService.name);

  /**
   * Update dataframes in the YJS document after Python execution
   * Fetches current dataframes from Python session and syncs to YJS map
   */
  async updateDataframes(
    workspaceId: string,
    sessionId: string,
    currentBlockId: string,
    blocks: Set<string>,
    dataframes: Y.Map<DataFrame>,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Updating dataframes for block ${currentBlockId} in workspace ${workspaceId}`
      );

      // Fetch current dataframes from Python session
      const newDataframes = await listDataFrames(workspaceId, sessionId);

      this.logger.debug(
        `Found ${newDataframes.length} dataframes in Python session`
      );

      // Update the YJS map
      this.updateDataframesInMap(
        dataframes,
        newDataframes,
        currentBlockId,
        blocks
      );
    } catch (err) {
      this.logger.error(
        {
          workspaceId,
          sessionId,
          currentBlockId,
          err,
        },
        'Error updating dataframes'
      );
      throw err;
    }
  }

  /**
   * Update dataframes in a Y.Map
   * This is the core logic from Briefer's updateDataframes function
   * 
   * Algorithm:
   * 1. REMOVE dataframes that:
   *    - Existed before but don't exist in Python anymore
   *    - AND their owner block was deleted OR is the current block
   * 2. ADD new dataframes from Python (tag with current block as owner)
   * 3. UPDATE existing dataframes if their schema changed
   */
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
        // If it exists in Python, don't remove it
        if (dataframesToRemove.has(dataframe.name)) {
          dataframesToRemove.delete(dataframe.name);
        }

        // If it already exists in YJS, mark for potential update
        if (oldDataframes.has(dataframe.name)) {
          dataframesToUpdate.set(dataframe.name, dataframe);
          dataframesToAdd.delete(dataframe.name);
        }
      });

      // REMOVE: Delete dataframes that should be removed
      dataframesToRemove.forEach((name) => {
        const df = oldDataframes.get(name);
        if (!df) {
          return;
        }

        // Don't remove if no blockId (shouldn't happen)
        if (!df.blockId) {
          return;
        }

        // Only remove if:
        // - The block that created it doesn't exist anymore
        // - OR we just ran that block and it's not defined in Python anymore
        if (!blocks.has(df.blockId) || df.blockId === currentBlockId) {
          this.logger.debug(
            `Removing dataframe '${name}' (owned by block ${df.blockId})`
          );
          oldDataframes.delete(name);
        }
      });

      // ADD: Add new dataframes
      dataframesToAdd.forEach((df, name) => {
        // Tag with current block as owner
        df.blockId = currentBlockId;

        this.logger.debug(
          `Adding dataframe '${name}' (owned by block ${currentBlockId})`
        );
        oldDataframes.set(name, df);
      });

      // UPDATE: Update existing dataframes if schema changed
      dataframesToUpdate.forEach((df, name) => {
        const previous = oldDataframes.get(name);
        if (!previous) {
          // Shouldn't happen, but handle gracefully
          oldDataframes.set(name, df);
          return;
        }

        // Only update if columns changed (schema evolution)
        if (equals(previous.columns, df.columns)) {
          // Schema unchanged, skip update
          return;
        }

        this.logger.debug(
          `Updating dataframe '${name}' schema (columns changed)`
        );

        // Transfer ownership if needed
        if (!df.blockId) {
          df.blockId = currentBlockId;
        }

        oldDataframes.set(name, df);
      });
    };

    // Execute update in YJS transaction for atomicity
    if (oldDataframes.doc) {
      oldDataframes.doc.transact(update);
    } else {
      update();
    }
  }

  /**
   * Get a dataframe by name from the YJS map
   */
  getDataframe(
    dataframes: Y.Map<DataFrame>,
    name: string,
  ): DataFrame | undefined {
    return dataframes.get(name);
  }

  /**
   * Check if a dataframe exists
   */
  hasDataframe(dataframes: Y.Map<DataFrame>, name: string): boolean {
    return dataframes.has(name);
  }

  /**
   * Get all dataframe names
   */
  getDataframeNames(dataframes: Y.Map<DataFrame>): string[] {
    return Array.from(dataframes.keys());
  }

  /**
   * Get all dataframes
   */
  getAllDataframes(dataframes: Y.Map<DataFrame>): DataFrame[] {
    return Array.from(dataframes.values());
  }

  /**
   * Get dataframes owned by a specific block
   */
  getDataframesByBlock(
    dataframes: Y.Map<DataFrame>,
    blockId: string,
  ): DataFrame[] {
    return Array.from(dataframes.values()).filter(
      (df) => df.blockId === blockId
    );
  }

  /**
   * Delete a dataframe by name
   */
  deleteDataframe(dataframes: Y.Map<DataFrame>, name: string): boolean {
    if (!dataframes.has(name)) {
      return false;
    }

    dataframes.delete(name);
    this.logger.debug(`Deleted dataframe '${name}'`);
    return true;
  }

  /**
   * Rename a dataframe
   * Used by SQL executor when user renames the result dataframe
   */
  renameDataframe(
    dataframes: Y.Map<DataFrame>,
    oldName: string,
    newName: string,
  ): boolean {
    const df = dataframes.get(oldName);
    if (!df) {
      this.logger.warn(
        `Cannot rename dataframe '${oldName}' to '${newName}': not found`
      );
      return false;
    }

    // Check if new name already exists
    if (dataframes.has(newName)) {
      this.logger.warn(
        `Cannot rename dataframe '${oldName}' to '${newName}': name already exists`
      );
      return false;
    }

    const update = () => {
      // Create new entry with updated name
      const updatedDf = { ...df, name: newName };
      dataframes.set(newName, updatedDf);

      // Remove old entry
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

  /**
   * Clear all dataframes (used when resetting document)
   */
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

  /**
   * Validate dataframe name follows Python variable naming rules
   */
  isValidDataframeName(name: string): boolean {
    const dfNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return dfNameRegex.test(name);
  }
}