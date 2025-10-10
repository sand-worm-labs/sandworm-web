import * as Y from 'yjs';
import { AITaskItem, AITaskItemMetadataWithoutNoop, YAITaskItem } from './item.js';
export * from './item.js';
export type YAITasks = Y.Array<YAITaskItem>;
export declare const AI_TASK_PING_TIMEOUT: number;
export declare class AITasks {
    private readonly tasks;
    private readonly observers;
    private constructor();
    enqueue(blockId: string, userId: string | null, metadata: AITaskItemMetadataWithoutNoop): void;
    next(): AITaskItem | null;
    getBlockTasks(blockId: string, tag?: AITaskItemMetadataWithoutNoop['_tag']): AITaskItem[];
    observe(cb: () => void): () => void;
    private onObservation;
    size(): number;
    static fromYjs(doc: Y.Doc): AITasks;
}
//# sourceMappingURL=index.d.ts.map