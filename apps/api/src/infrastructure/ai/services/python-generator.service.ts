import { Injectable } from '@nestjs/common';
import { GeneratorContext } from '../types/generator.types';
import { CellEditClient, CellEditResult } from './cell-edit.client';

export type PythonGeneratorContext = GeneratorContext;
export type PythonGeneratorResponse = CellEditResult;

// Edits and fixes Python cells. The AI service applies the change itself.
@Injectable()
export class PythonGeneratorService {
  constructor(private readonly cells: CellEditClient) {}

  edit(context: PythonGeneratorContext, blockId: string, prompt: string) {
    return this.cells.edit('code', context, blockId, prompt);
  }

  fix(context: PythonGeneratorContext, blockId: string, error_message: string) {
    return this.cells.fix('code', context, blockId, error_message);
  }
}
