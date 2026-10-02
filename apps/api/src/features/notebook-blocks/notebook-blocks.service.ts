import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ExecutionQueue,
  getBlocks,
  getLayout,
  getPowerToolboxAttributes,
  getTabsFromBlockGroup,
  isPowerToolboxBlock,
  removeBlock,
  removeBlockGroup,
  writeDocTitle,
  type ParamDefinition,
  type YBlock,
} from '@sandworm/editor';
import type * as Y from 'yjs';
import { addBlocks } from '../collaboration/yjs/shared-doc/ai-blocks';
import { ToolService } from '../tool/tool.service';
import { getDefinition, getDefinitionFor, summarizeBlock } from './blocks/registry';
import { validatePowerToolInputs } from './blocks/power-toolbox.block';
import type { BlockPatch, BlockSummary } from './blocks/block-definition';
import type { CreateBlocksDto } from './dto/create-blocks.dto';
import type { UpdateBlockDto } from './dto/update-block.dto';
import { NotebookDocService, type NotebookRef } from './notebook-doc.service';
import { liveStates } from './run/cell-result';

@Injectable()
export class NotebookBlocksService {
  constructor(
    private readonly docs: NotebookDocService,
    private readonly toolService: ToolService,
  ) {}

  async createBlocks(ref: NotebookRef, { blocks: inputs, position }: CreateBlocksDto): Promise<BlockSummary[]> {
    await this.assertToolsExist(inputs);
    const specs = inputs.map(({ kind, ...input }) => getDefinition(kind).toSpec(input));

    return this.docs.use(ref, 'editor', ({ ydoc }) => {
      const ids = addBlocks(ydoc, specs, position);
      const blocks = getBlocks(ydoc);
      return ids.map(id => summarizeBlock(blocks.get(id)!, blocks));
    });
  }

  // The editor shows the title from the Yjs document; the database column follows its title observer.
  async setTitle(ref: NotebookRef, title: string): Promise<void> {
    await this.docs.use(ref, 'editor', ({ ydoc }) => ydoc.transact(() => writeDocTitle(ydoc, title)));
  }

  // Changes a block in place. Its kind decides which fields it takes; the
  // block keeps its id, position and any result from an earlier run.
  async updateBlock(ref: NotebookRef, blockId: string, dto: UpdateBlockDto): Promise<BlockSummary> {
    const { title, source, dataSource, dataframeName, inputs } = dto;
    const patch: BlockPatch = { title, source, dataSource, dataframeName, inputs };
    if (Object.values(patch).every(value => value === undefined)) {
      throw new BadRequestException('Nothing to change: send at least one of title, source, dataSource, dataframeName or inputs');
    }

    return this.docs.use(ref, 'editor', async ({ ydoc }) => {
      const found = this.find(ydoc, blockId);
      if (inputs !== undefined && isPowerToolboxBlock(found)) {
        await this.assertToolInputs(getPowerToolboxAttributes(found).toolId, inputs);
      }

      // Looked up again: the catalog lookup above gave others time to act.
      const blocks = getBlocks(ydoc);
      const block = this.find(ydoc, blockId);
      const definition = getDefinitionFor(block);
      if (!definition) {
        throw new BadRequestException('This kind of cell can only be changed in the editor');
      }
      this.assertNotExecuting(ydoc, blockId);

      ydoc.transact(() => definition.update(block, blocks, patch));
      return summarizeBlock(block, blocks);
    });
  }

  // Removes a block the way the editor's delete does. A block that is also on
  // the dashboard is only removed when the caller says so.
  async deleteBlock(ref: NotebookRef, blockId: string, removeFromDashboard: boolean): Promise<void> {
    await this.docs.use(ref, 'editor', ({ ydoc }) => {
      this.find(ydoc, blockId);
      const blocks = getBlocks(ydoc);
      const group = getLayout(ydoc)
        .toArray()
        .map(candidate => getTabsFromBlockGroup(candidate, blocks))
        .find(tabs => tabs.some(tab => tab.blockId === blockId));
      if (!group) throw new NotFoundException(`No cell with id ${blockId} in this notebook`);
      this.assertNotExecuting(ydoc, blockId);

      // As in the editor: a cell on its own goes with its group, a cell that
      // shares a group with other tabs is taken out of it.
      const { blockGroupId } = group[0]!;
      const result =
        group.length === 1
          ? removeBlockGroup(ydoc, blockGroupId, removeFromDashboard)
          : removeBlock(ydoc, blockGroupId, blockId, removeFromDashboard);
      if (result._tag === 'dashboard-conflict') {
        throw new ConflictException('This cell is shown on the dashboard. Set removeFromDashboard to delete it from there too');
      }
    });
  }

  private find(ydoc: Y.Doc, blockId: string): YBlock {
    const block = getBlocks(ydoc).get(blockId);
    if (!block) throw new NotFoundException(`No cell with id ${blockId} in this notebook`);
    return block;
  }

  // The executor reads and writes a cell while it runs it, so changing or
  // removing one mid-run would leave its result describing something else.
  private assertNotExecuting(ydoc: Y.Doc, blockId: string): void {
    const state = liveStates(ExecutionQueue.fromYjs(ydoc)).get(blockId);
    if (state) {
      throw new ConflictException(`This cell is ${state === 'queued' ? 'queued to run' : 'running'}. Wait for the run to finish first`);
    }
  }

  private async assertToolInputs(toolId: string | null, inputs: BlockPatch['inputs']): Promise<void> {
    const tool = toolId ? (await this.toolService.getTools()).find(t => t.toolId === toolId) : undefined;
    if (!toolId || !tool) {
      throw new BadRequestException('This cell has no tool selected, so its inputs cannot be checked');
    }
    validatePowerToolInputs(toolId, tool.params as ParamDefinition[], inputs);
  }

  private async assertToolsExist(inputs: CreateBlocksDto['blocks']): Promise<void> {
    const powerTools = inputs.filter(b => b.kind === 'power_toolbox');
    if (!powerTools.length) return;

    const catalog = new Map((await this.toolService.getTools()).map(t => [t.toolId, t]));
    for (const { toolId, inputs: values } of powerTools) {
      const tool = toolId ? catalog.get(toolId) : undefined;
      if (!toolId || !tool) {
        throw new BadRequestException(`Unknown tool "${toolId ?? ''}". Use search_tools to find a tool id from the catalog.`);
      }
      validatePowerToolInputs(toolId, tool.params as ParamDefinition[], values);
    }
  }
}
