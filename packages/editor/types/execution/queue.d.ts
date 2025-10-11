import * as Y from "yjs";
import { ExecutionQueueBatch, YExecutionQueueBatch } from "./batch.js";
import { ExecutionQueueItem, ExecutionQueueItemMetadataWithoutNoop } from "./item.js";
import { YBlock, YBlockGroup } from "../index.js";
export type YExecutionQueue = Y.Array<YExecutionQueueBatch>;
export type Execution = {
    item: ExecutionQueueItem;
    batch: ExecutionQueueBatch;
};
export type ExecutionQueueOptions = {
    skipDependencyCheck: boolean;
};
export type RunAllSource = {
    _tag: "user";
    userId: string;
} | {
    _tag: "schedule";
    scheduleId: string;
};
export declare class ExecutionQueue {
    private readonly queue;
    private readonly blocks;
    private readonly layout;
    private readonly observers;
    private readonly options;
    private constructor();
    getCurrentBatch(): ExecutionQueueBatch | null;
    advance(): void;
    enqueueBlock(blockId: string | YBlock, userId: string | null, environmentStartedAt: string | null, metadata: ExecutionQueueItemMetadataWithoutNoop): void;
    enqueueBlockGroup(yDoc: Y.Doc, blockGroupId: string, userId: string | null): void;
    enqueueBlockOnwards(blockId: string | YBlock, userId: string | null, environmentStartedAt: string | null, metadata: ExecutionQueueItemMetadataWithoutNoop): void;
    enqueueRunAll(layout: Y.Array<YBlockGroup>, blocks: Y.Map<YBlock>, source: RunAllSource): ExecutionQueueBatch;
    getBlockExecutions(blockId: string, tag?: ExecutionQueueItemMetadataWithoutNoop["_tag"]): Execution[];
    observe(cb: () => void): () => void;
    toJSON(): ExecutionQueueBatch[];
    getRunAllBatches(): ExecutionQueueBatch[];
    private onObservation;
    getExecutionQueueMetadataForBlock(block: YBlock): ExecutionQueueItemMetadataWithoutNoop | null;
    get length(): number;
    static fromYjs(doc: Y.Doc, options?: Partial<ExecutionQueueOptions>): ExecutionQueue;
}
//# sourceMappingURL=queue.d.ts.map