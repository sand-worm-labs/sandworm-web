import * as Y from 'yjs';
import { 
  ExecutionQueueItem, 
  RichTextBlock, 
  DropdownInputBlock, 
  DateInputBlock 
} from '@sandworm/editor';
import { ExecutionContext } from './execution-context.interface';

export interface ITextInputBlockExecutor {

  run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<RichTextBlock>,
    context: ExecutionContext,
  ): Promise<void>;
}

export interface IDropdownInputBlockExecutor {

  run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<DropdownInputBlock>,
    context: ExecutionContext,
  ): Promise<void>;
}

export interface IDateInputBlockExecutor {

  run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<DateInputBlock>,
    context: ExecutionContext,
  ): Promise<void>;
}

export interface InputValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: (value: any) => boolean | string;
}

export interface DateInputValidation extends InputValidation {
  minDate?: string;
  maxDate?: string;
  allowedDates?: string[];
  disabledDates?: string[];
}