import * as Y from 'yjs';
import { ExecutionQueueItem, ExecutionStatus, YExecutionQueueItem } from './item.js';
export type YExecutionQueueBatchAttrs = {
    version: 1;
    queue: Y.Array<YExecutionQueueItem>;
    isRunAll: boolean;
    scheduleId: string | null;
};
export type YExecutionQueueBatch = Y.XmlElement<YExecutionQueueBatchAttrs>;
export declare function createYExecutionQueueBatch(items: YExecutionQueueItem[], { isRunAll, scheduleId }: {
    isRunAll: boolean;
    scheduleId: string | null;
}): YExecutionQueueBatch;
export declare class ExecutionQueueBatch {
    private readonly batch;
    private constructor();
    isRunAll(): boolean;
    getScheduleId(): string | null;
    getCurrent(): ExecutionQueueItem | null;
    [Symbol.iterator](): Iterator<ExecutionQueueItem>;
    toJSON(): {
        version: number;
        queue: ExecutionQueueItem[];
        isRunAll: boolean;
    };
    abort(): void;
    waitForCompletion(): Promise<string | null>;
    get length(): number;
    get remaining(): number;
    get status(): ExecutionStatus;
    removeItem(blockId: string): void;
    static fromYjs(doc: YExecutionQueueBatch): ExecutionQueueBatch;
}
//# sourceMappingURL=batch.d.ts.map