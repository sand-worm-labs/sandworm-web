import { Injectable } from '@nestjs/common';
import { GeneratorContext } from '../types/generator.types';
import { CellEditClient, CellEditResult } from './cell-edit.client';

export type MarkdownGeneratorContext = GeneratorContext;
export type MarkdownGeneratorResponse = CellEditResult;

// Edits markdown cells. The AI service applies the change itself.
@Injectable()
export class MarkdownGeneratorService {
  constructor(private readonly cells: CellEditClient) {}

  edit(context: MarkdownGeneratorContext, blockId: string, prompt: string, signal?: AbortSignal) {
    return this.cells.edit('markdown', context, blockId, prompt, signal);
  }
}
