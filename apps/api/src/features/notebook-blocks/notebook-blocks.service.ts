import { BadRequestException, Injectable } from '@nestjs/common';
import { getBlocks, writeDocTitle, type ParamDefinition } from '@sandworm/editor';
import { DocumentService } from '../document/service/document.service';
import { PersistorFactory } from '../collaboration/yjs/persistors/persistor.factory';
import { addBlocks } from '../collaboration/yjs/shared-doc/ai-blocks';
import { YjsDocumentService } from '../collaboration/yjs/yjs-document.service';
import { ToolService } from '../tool/tool.service';
import { WorkspaceMembershipService } from '../workspace/service/workspace-membership.service';
import { getDefinition, summarizeBlock } from './blocks/registry';
import { validatePowerToolInputs } from './blocks/power-toolbox.block';
import type { BlockSummary } from './blocks/block-definition';
import type { CreateBlocksDto } from './dto/create-blocks.dto';

export type NotebookRef = { userId: string; workspaceId: string; documentId: string };

@Injectable()
export class NotebookBlocksService {
  constructor(
    private readonly yjsDocumentService: YjsDocumentService,
    private readonly persistorFactory: PersistorFactory,
    private readonly documentService: DocumentService,
    private readonly membershipService: WorkspaceMembershipService,
    private readonly toolService: ToolService,
  ) {}

  async createBlocks(ref: NotebookRef, { blocks: inputs, position }: CreateBlocksDto): Promise<BlockSummary[]> {
    await this.assertToolsExist(inputs);
    const specs = inputs.map(({ kind, ...input }) => getDefinition(kind).toSpec(input));
    const { ydoc } = await this.open(ref);

    const ids = addBlocks(ydoc, specs, position);
    const blocks = getBlocks(ydoc);
    return ids.map(id => summarizeBlock(blocks.get(id)!, blocks));
  }

  // The editor shows the title from the Yjs document; the database column follows its title observer.
  async setTitle(ref: NotebookRef, title: string): Promise<void> {
    const { ydoc } = await this.open(ref);
    ydoc.transact(() => writeDocTitle(ydoc, title));
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

  private async open({ userId, workspaceId, documentId }: NotebookRef) {
    await this.membershipService.assertActiveMember(workspaceId, userId);
    await this.documentService.getDocument(documentId, workspaceId);

    return this.yjsDocumentService.getYDocForUpdateAsync(
      this.yjsDocumentService.getDocId(documentId, null),
      documentId,
      null,
      workspaceId,
      this.persistorFactory.createDocumentPersistor(documentId),
    );
  }
}
