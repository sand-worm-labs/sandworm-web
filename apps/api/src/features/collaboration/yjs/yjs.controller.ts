import { 
  Controller, 
  Get, 
  Param, 
  Query, 
  NotFoundException,
  Post,
  Logger,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ApiAuth, ApiPublic } from '@sandworm/api/decorators/http.decorators';
import { YjsDocumentService } from './yjs-document.service';
import { PersistorFactory } from './persistors/persistor.factory';
import { addBlockGroupAfterBlock, docToMarkdown } from '@sandworm/editor';
import type { FastifyReply } from 'fastify/types/reply';

@ApiTags('YjsDocuments')
@Controller({
  path: 'yjs_documents',
  version: '1',
})

export class YjsDocumentController {

   private readonly logger = new Logger(YjsDocumentController.name);

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
    @Res() res: FastifyReply,
    @Query('focusedBlockId') focusedBlockId?: string,
  ) {
    try {
      const id = this.yjsService.getDocId(documentId, null);
      const persistor = this.persistorFactory.createDocumentPersistor(documentId);
      const sharedDoc = await this.yjsService.getYDoc(id, documentId, workspaceId, persistor);

      if (!sharedDoc) {
        throw new NotFoundException(`Document ${documentId} not found or failed to load.`);
      }

      const markdown = docToMarkdown(sharedDoc.ydoc, {
        focusedBlockId: focusedBlockId ?? null,
      });

      return res
        .header('Content-Type', 'text/plain; charset=utf-8')
        .send(markdown);

    } catch (error: any) {
      throw error instanceof NotFoundException
        ? error
        : new NotFoundException(`Error retrieving AI context: ${error.message}`);
    }
  }

}