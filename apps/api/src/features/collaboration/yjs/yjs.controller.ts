import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ApiAuth, ApiPublic } from '@sandworm/api/decorators/http.decorators';
import { YjsDocumentService } from './yjs-document.service';
import { PersistorFactory } from './persistors/persistor.factory';

@ApiTags('YjsDocuments')
@Controller({
  path: 'yjs_documents',
  version: '1',
})

export class YjsDocumentController {
  constructor(
    private readonly yjsService: YjsDocumentService,
    private readonly persistorFactory: PersistorFactory,
  ) {}

  @Get(':documentId/ai-context')
  @ApiAuth({
    summary: 'Retrieve serialized notebook context for AI processing',
  })
  @ApiPublic({
    summary: 'Register a new user',
    statusCode: 200,
  })
  @ApiQuery({ name: 'focusedBlockId', required: false, description: 'The block ID the user is currently interacting with' })
  @ApiQuery({ name: 'workspaceId', required: true, description: 'The workspace ownership context' })
  async getDocContext(
    @Param('documentId') documentId: string,
    @Query('workspaceId') workspaceId: string,
    @Query('focusedBlockId') focusedBlockId?: string,
  ) {
    try {
      // 1. Resolve internal Doc ID (handles the 'edit' vs 'app' logic internally)
      const id = this.yjsService.getDocId(documentId, null);

      // 2. Initialize the persistence layer for this specific document
      const persistor = this.persistorFactory.createDocumentPersistor(documentId);

      // 3. Get the SharedDoc. 
      // getYDoc handles the LRU cache lookup and mutex creation automatically.
      const sharedDoc = await this.yjsService.getYDoc(
        id,
        documentId,
        workspaceId,
        persistor,
      );

      if (!sharedDoc) {
        throw new NotFoundException(`Document ${documentId} not found or failed to load.`);
      }

       //const context = serializeDocForAI(sharedDoc.ydoc, focusedBlockId);

      return {
        documentId,
        workspaceId,
        focusedBlockId: focusedBlockId || null,
        timestamp: new Date().toISOString(),
        blocks: sharedDoc.ydoc.toJSON()
      };
    } catch (error: any) {
      // Logic for handling database or Yjs sync errors
      throw error instanceof NotFoundException 
        ? error 
        : new NotFoundException(`Error retrieving AI context: ${error.message}`);
    }
  }


  @Post(':documentId/blocks')
  @ApiAuth({
    summary: 'Append a new Python block to the notebook',
  })
  @ApiQuery({ name: 'workspaceId', required: true, description: 'The workspace ownership context' })
  async appendBlock(
    @Param('documentId') documentId: string,
    @Query('workspaceId') workspaceId: string,
  ) {
      const blockId = await this.yjsService.appendBlockToNotebook(documentId, workspaceId, null);
      return { blockId };
  }

}