import * as Y from 'yjs';
import * as z from 'zod';
export declare const ExecutionQueueItemStatus: z.ZodUnion<readonly [z.ZodObject<{
    _tag: z.ZodLiteral<"enqueued">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"aborting">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"running">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"completed">;
    status: z.ZodUnion<readonly [z.ZodLiteral<"success">, z.ZodLiteral<"error">, z.ZodLiteral<"aborted">]>;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"unknown">;
}, z.core.$strip>]>;
export type ExecutionQueueItemStatus = z.infer<typeof ExecutionQueueItemStatus>;
export type ExecutionStatus = ExecutionQueueItemStatus['_tag'] | 'idle';
export declare function isExecutionStatusLoading(status: ExecutionStatus): status is 'running' | 'aborting' | 'enqueued';
export declare const ExecutionQueueItemPythonMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"python">;
    isSuggestion: z.ZodBoolean;
}, z.core.$strip>;
export type ExecutionQueueItemPythonMetadata = z.infer<typeof ExecutionQueueItemPythonMetadata>;
export declare const ExecutionQueueItemSQLMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"sql">;
    isSuggestion: z.ZodBoolean;
    selectedCode: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type ExecutionQueueItemSQLMetadata = z.infer<typeof ExecutionQueueItemSQLMetadata>;
export declare const ExecutionQueueItemSQLLoadPageMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"sql-load-page">;
}, z.core.$strip>;
export type ExecutionQueueItemSQLLoadPageMetadata = z.infer<typeof ExecutionQueueItemSQLLoadPageMetadata>;
export declare const ExecutionQueueItemSQLRenameDataframeMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"sql-rename-dataframe">;
}, z.core.$strip>;
export type ExecutionQueueItemSQLRenameDataframeMetadata = z.infer<typeof ExecutionQueueItemSQLRenameDataframeMetadata>;
export declare const ExecutionQueueItemVisualizationMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"visualization">;
}, z.core.$strip>;
export type ExecutionQueueItemVisualizationMetadata = z.infer<typeof ExecutionQueueItemVisualizationMetadata>;
export declare const ExecutionQueueItemVisualizationV2Metadata: z.ZodObject<{
    _tag: z.ZodLiteral<"visualization-v2">;
}, z.core.$strip>;
export type ExecutionQueueItemVisualizationV2Metadata = z.infer<typeof ExecutionQueueItemVisualizationV2Metadata>;
export declare const ExecutionQueueItemTextInputSaveValueMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"text-input-save-value">;
}, z.core.$strip>;
export type ExecutionQueueItemTextInputSaveValueMetadata = z.infer<typeof ExecutionQueueItemTextInputSaveValueMetadata>;
export declare const ExecutionQueueItemTextInputRenameVariableMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"text-input-rename-variable">;
}, z.core.$strip>;
export type ExecutionQueueItemTextInputRenameVariableMetadata = z.infer<typeof ExecutionQueueItemTextInputRenameVariableMetadata>;
export declare const ExecutionQueueItemDropdownInputSaveValueMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"dropdown-input-save-value">;
}, z.core.$strip>;
export type ExecutionQueueItemDropdownInputSaveValueMetadata = z.infer<typeof ExecutionQueueItemDropdownInputSaveValueMetadata>;
export declare const ExecutionQueueItemDropdownInputRenameVariableMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"dropdown-input-rename-variable">;
}, z.core.$strip>;
export type ExecutionQueueItemDropdownInputRenameVariableMetadata = z.infer<typeof ExecutionQueueItemDropdownInputRenameVariableMetadata>;
export declare const ExecutionQueueItemDateInputMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"date-input">;
}, z.core.$strip>;
export type ExecutionQueueItemDateInputMetadata = z.infer<typeof ExecutionQueueItemDateInputMetadata>;
export declare const ExecutionQueueItemPivotTableMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"pivot-table">;
}, z.core.$strip>;
export type ExecutionQueueItemPivotTableMetadata = z.infer<typeof ExecutionQueueItemPivotTableMetadata>;
export declare const ExecutionQueueItemPivotTableLoadPageMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"pivot-table-load-page">;
}, z.core.$strip>;
export type ExecutionQueueItemPivotTableLoadPageMetadata = z.infer<typeof ExecutionQueueItemPivotTableLoadPageMetadata>;
export declare const ExecutionQueueItemWritebackMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"writeback">;
}, z.core.$strip>;
export type ExecutionQueueItemWritebackMetadata = z.infer<typeof ExecutionQueueItemWritebackMetadata>;
export declare const ExecutionQueueItemNoopMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"noop">;
}, z.core.$strip>;
export type ExecutionQueueItemNoopMetadata = z.infer<typeof ExecutionQueueItemNoopMetadata>;
export declare const ExecutionQueueItemMetadata: z.ZodUnion<readonly [z.ZodObject<{
    _tag: z.ZodLiteral<"python">;
    isSuggestion: z.ZodBoolean;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"sql">;
    isSuggestion: z.ZodBoolean;
    selectedCode: z.ZodNullable<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"sql-load-page">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"sql-rename-dataframe">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"visualization">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"visualization-v2">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"text-input-save-value">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"text-input-rename-variable">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"date-input">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"dropdown-input-save-value">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"dropdown-input-rename-variable">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"pivot-table">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"pivot-table-load-page">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"writeback">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"noop">;
}, z.core.$strip>]>;
export type ExecutionQueueItemMetadata = z.infer<typeof ExecutionQueueItemMetadata>;
export type ExecutionQueueItemMetadataWithoutNoop = Exclude<ExecutionQueueItemMetadata, ExecutionQueueItemNoopMetadata>;
export declare const ExecutionQueueItemAttrs: z.ZodObject<{
    blockId: z.ZodString;
    userId: z.ZodNullable<z.ZodString>;
    status: z.ZodUnion<readonly [z.ZodObject<{
        _tag: z.ZodLiteral<"enqueued">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"aborting">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"running">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"completed">;
        status: z.ZodUnion<readonly [z.ZodLiteral<"success">, z.ZodLiteral<"error">, z.ZodLiteral<"aborted">]>;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"unknown">;
    }, z.core.$strip>]>;
    metadata: z.ZodUnion<readonly [z.ZodObject<{
        _tag: z.ZodLiteral<"python">;
        isSuggestion: z.ZodBoolean;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"sql">;
        isSuggestion: z.ZodBoolean;
        selectedCode: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"sql-load-page">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"sql-rename-dataframe">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"visualization">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"visualization-v2">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"text-input-save-value">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"text-input-rename-variable">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"date-input">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"dropdown-input-save-value">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"dropdown-input-rename-variable">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"pivot-table">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"pivot-table-load-page">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"writeback">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"noop">;
    }, z.core.$strip>]>;
}, z.core.$strip>;
export type YExecutionQueueItemAttrs = z.infer<typeof ExecutionQueueItemAttrs>;
export type YExecutionQueueItem = Y.XmlElement<YExecutionQueueItemAttrs>;
export declare function createYExecutionQueueItem(blockId: string, userId: string | null, metadata: ExecutionQueueItemMetadataWithoutNoop): YExecutionQueueItem;
export type MetadataCallbacks<T> = {
    python: (metadata: ExecutionQueueItemPythonMetadata) => T;
    sql: (metadata: ExecutionQueueItemSQLMetadata) => T;
};
export declare class ExecutionQueueItem {
    private readonly item;
    private constructor();
    private statusObservers;
    getCompleteStatus(): 'success' | 'error' | 'aborted' | null;
    getMetadata(): ExecutionQueueItemMetadata;
    getBlockId(): string;
    getUserId(): string | null;
    setRunning(): void;
    setAborting(): void;
    setCompleted(status: 'success' | 'error' | 'aborted'): void;
    getStatus(): ExecutionQueueItemStatus;
    observeStatus(callback: (status: ExecutionQueueItemStatus) => void): () => void;
    toJSON(): {
        status?: {
            _tag: "enqueued";
        } | {
            _tag: "aborting";
        } | {
            _tag: "running";
        } | {
            _tag: "completed";
            status: "error" | "success" | "aborted";
        } | {
            _tag: "unknown";
        } | undefined;
        blockId?: string | undefined;
        metadata?: {
            _tag: "python";
            isSuggestion: boolean;
        } | {
            _tag: "sql";
            isSuggestion: boolean;
            selectedCode: string | null;
        } | {
            _tag: "sql-load-page";
        } | {
            _tag: "sql-rename-dataframe";
        } | {
            _tag: "visualization";
        } | {
            _tag: "visualization-v2";
        } | {
            _tag: "text-input-save-value";
        } | {
            _tag: "text-input-rename-variable";
        } | {
            _tag: "dropdown-input-save-value";
        } | {
            _tag: "dropdown-input-rename-variable";
        } | {
            _tag: "date-input";
        } | {
            _tag: "pivot-table";
        } | {
            _tag: "pivot-table-load-page";
        } | {
            _tag: "writeback";
        } | {
            _tag: "noop";
        } | undefined;
        userId?: string | null | undefined;
    };
    private onStatusObservation;
    static fromYjs(item: YExecutionQueueItem): ExecutionQueueItem;
}
//# sourceMappingURL=item.d.ts.map