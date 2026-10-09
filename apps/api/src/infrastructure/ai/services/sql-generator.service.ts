import { Injectable } from '@nestjs/common';
import { GeneratorContext } from '../types/generator.types';
import { CellEditClient, CellEditResult } from './cell-edit.client';

export type SqlGeneratorContext = GeneratorContext;
export type SqlGeneratorResponse = CellEditResult;

// Edits and fixes SQL cells. The AI service applies the change itself.
@Injectable()
export class SqlGeneratorService {
  constructor(private readonly cells: CellEditClient) {}

  edit(context: SqlGeneratorContext, blockId: string, prompt: string) {
    return this.cells.edit('sql', context, blockId, prompt);
  }

  fix(context: SqlGeneratorContext, blockId: string, error_message: string) {
    return this.cells.fix('sql', context, blockId, error_message);
  }
}
