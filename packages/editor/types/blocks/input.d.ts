import * as Y from 'yjs';
import { BlockType, BaseBlock, YBlock, ResultStatus } from './index.js';
import { ExecutionQueue } from '../execution/queue.js';
import { ExecutionStatus } from '../execution/item.js';
export type EditableField<E, V = string> = {
    value: V;
    newValue: V;
    error: E | null;
};
export type InputBlock = BaseBlock<BlockType.Input> & {
    label: string;
    value: EditableField<'invalid-value' | 'unexpected-error'>;
    variable: EditableField<'invalid-value' | 'invalid-variable-name' | 'unexpected-error'>;
    inputType: 'text';
    executedAt: string | null;
};
export declare const isTextInputBlock: (block: YBlock) => block is Y.XmlElement<InputBlock>;
export declare const makeInputBlock: (id: string, blocks: Y.Map<YBlock>) => Y.XmlElement<InputBlock>;
export declare function getInputAttributes(block: Y.XmlElement<InputBlock>, blocks: Y.Map<YBlock>): InputBlock;
export declare function duplicateInputBlock(newId: string, block: Y.XmlElement<InputBlock>, blocks: Y.Map<YBlock>): Y.XmlElement<InputBlock>;
export declare function updateInputLabel(block: Y.XmlElement<InputBlock>, newValue: string): void;
export declare function updateInputValue(block: Y.XmlElement<InputBlock>, newValue: Partial<InputBlock['value']>): void;
export declare function getInputValueExecStatus(block: Y.XmlElement<InputBlock>, executionQueue: ExecutionQueue): ExecutionStatus;
export declare function updateInputVariable(block: Y.XmlElement<InputBlock>, blocks: Y.Map<YBlock>, newValue: Partial<InputBlock['variable']>): void;
export declare function getInputVariableExecStatus(block: Y.XmlElement<InputBlock>, executionQueue: ExecutionQueue): ExecutionStatus;
export declare function getInputBlockExecStatus(block: Y.XmlElement<InputBlock>, executionQueue: ExecutionQueue): ExecutionStatus;
export declare function getInputBlockResultStatus(block: Y.XmlElement<InputBlock>, blocks: Y.Map<YBlock>): ResultStatus;
export declare function getInputBlockExecutedAt(block: Y.XmlElement<InputBlock>, blocks: Y.Map<YBlock>): Date | null;
export declare function getInputBlockIsDirty(block: Y.XmlElement<InputBlock>, blocks: Y.Map<YBlock>): boolean;
export declare function updateInputBlockExecutedAt(block: Y.XmlElement<InputBlock>, executedAt: Date | null): void;
//# sourceMappingURL=input.d.ts.map