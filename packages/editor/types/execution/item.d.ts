import * as Y from 'yjs';
import * as z from 'zod';
export declare const ExecutionQueueItemStatus: z.ZodUnion<[z.ZodObject<{
    _tag: z.ZodLiteral<"enqueued">;
}, "strip", z.ZodTypeAny, {
    _tag: "enqueued";
}, {
    _tag: "enqueued";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"aborting">;
}, "strip", z.ZodTypeAny, {
    _tag: "aborting";
}, {
    _tag: "aborting";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"running">;
}, "strip", z.ZodTypeAny, {
    _tag: "running";
}, {
    _tag: "running";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"completed">;
    status: z.ZodUnion<[z.ZodLiteral<"success">, z.ZodLiteral<"error">, z.ZodLiteral<"aborted">]>;
}, "strip", z.ZodTypeAny, {
    status: "aborted" | "success" | "error";
    _tag: "completed";
}, {
    status: "aborted" | "success" | "error";
    _tag: "completed";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"unknown">;
}, "strip", z.ZodTypeAny, {
    _tag: "unknown";
}, {
    _tag: "unknown";
}>]>;
export type ExecutionQueueItemStatus = z.infer<typeof ExecutionQueueItemStatus>;
export type ExecutionStatus = ExecutionQueueItemStatus['_tag'] | 'idle';
export declare function isExecutionStatusLoading(status: ExecutionStatus): status is 'running' | 'aborting' | 'enqueued';
export declare const ExecutionQueueItemPythonMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"python">;
    isSuggestion: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    _tag: "python";
    isSuggestion: boolean;
}, {
    _tag: "python";
    isSuggestion: boolean;
}>;
export type ExecutionQueueItemPythonMetadata = z.infer<typeof ExecutionQueueItemPythonMetadata>;
export declare const ExecutionQueueItemSQLMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"sql">;
    isSuggestion: z.ZodBoolean;
    selectedCode: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    _tag: "sql";
    isSuggestion: boolean;
    selectedCode: string | null;
}, {
    _tag: "sql";
    isSuggestion: boolean;
    selectedCode: string | null;
}>;
export type ExecutionQueueItemSQLMetadata = z.infer<typeof ExecutionQueueItemSQLMetadata>;
export declare const ExecutionQueueItemSQLLoadPageMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"sql-load-page">;
}, "strip", z.ZodTypeAny, {
    _tag: "sql-load-page";
}, {
    _tag: "sql-load-page";
}>;
export type ExecutionQueueItemSQLLoadPageMetadata = z.infer<typeof ExecutionQueueItemSQLLoadPageMetadata>;
export declare const ExecutionQueueItemSQLRenameDataframeMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"sql-rename-dataframe">;
}, "strip", z.ZodTypeAny, {
    _tag: "sql-rename-dataframe";
}, {
    _tag: "sql-rename-dataframe";
}>;
export type ExecutionQueueItemSQLRenameDataframeMetadata = z.infer<typeof ExecutionQueueItemSQLRenameDataframeMetadata>;
export declare const ExecutionQueueItemVisualizationMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"visualization">;
}, "strip", z.ZodTypeAny, {
    _tag: "visualization";
}, {
    _tag: "visualization";
}>;
export type ExecutionQueueItemVisualizationMetadata = z.infer<typeof ExecutionQueueItemVisualizationMetadata>;
export declare const ExecutionQueueItemVisualizationV2Metadata: z.ZodObject<{
    _tag: z.ZodLiteral<"visualization-v2">;
}, "strip", z.ZodTypeAny, {
    _tag: "visualization-v2";
}, {
    _tag: "visualization-v2";
}>;
export type ExecutionQueueItemVisualizationV2Metadata = z.infer<typeof ExecutionQueueItemVisualizationV2Metadata>;
export declare const ExecutionQueueItemTextInputSaveValueMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"text-input-save-value">;
}, "strip", z.ZodTypeAny, {
    _tag: "text-input-save-value";
}, {
    _tag: "text-input-save-value";
}>;
export type ExecutionQueueItemTextInputSaveValueMetadata = z.infer<typeof ExecutionQueueItemTextInputSaveValueMetadata>;
export declare const ExecutionQueueItemTextInputRenameVariableMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"text-input-rename-variable">;
}, "strip", z.ZodTypeAny, {
    _tag: "text-input-rename-variable";
}, {
    _tag: "text-input-rename-variable";
}>;
export type ExecutionQueueItemTextInputRenameVariableMetadata = z.infer<typeof ExecutionQueueItemTextInputRenameVariableMetadata>;
export declare const ExecutionQueueItemDropdownInputSaveValueMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"dropdown-input-save-value">;
}, "strip", z.ZodTypeAny, {
    _tag: "dropdown-input-save-value";
}, {
    _tag: "dropdown-input-save-value";
}>;
export type ExecutionQueueItemDropdownInputSaveValueMetadata = z.infer<typeof ExecutionQueueItemDropdownInputSaveValueMetadata>;
export declare const ExecutionQueueItemDropdownInputRenameVariableMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"dropdown-input-rename-variable">;
}, "strip", z.ZodTypeAny, {
    _tag: "dropdown-input-rename-variable";
}, {
    _tag: "dropdown-input-rename-variable";
}>;
export type ExecutionQueueItemDropdownInputRenameVariableMetadata = z.infer<typeof ExecutionQueueItemDropdownInputRenameVariableMetadata>;
export declare const ExecutionQueueItemDateInputMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"date-input">;
}, "strip", z.ZodTypeAny, {
    _tag: "date-input";
}, {
    _tag: "date-input";
}>;
export type ExecutionQueueItemDateInputMetadata = z.infer<typeof ExecutionQueueItemDateInputMetadata>;
export declare const ExecutionQueueItemPivotTableMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"pivot-table">;
}, "strip", z.ZodTypeAny, {
    _tag: "pivot-table";
}, {
    _tag: "pivot-table";
}>;
export type ExecutionQueueItemPivotTableMetadata = z.infer<typeof ExecutionQueueItemPivotTableMetadata>;
export declare const ExecutionQueueItemPivotTableLoadPageMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"pivot-table-load-page">;
}, "strip", z.ZodTypeAny, {
    _tag: "pivot-table-load-page";
}, {
    _tag: "pivot-table-load-page";
}>;
export type ExecutionQueueItemPivotTableLoadPageMetadata = z.infer<typeof ExecutionQueueItemPivotTableLoadPageMetadata>;
export declare const ExecutionQueueItemWritebackMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"writeback">;
}, "strip", z.ZodTypeAny, {
    _tag: "writeback";
}, {
    _tag: "writeback";
}>;
export type ExecutionQueueItemWritebackMetadata = z.infer<typeof ExecutionQueueItemWritebackMetadata>;
export declare const ExecutionQueueItemNoopMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"noop">;
}, "strip", z.ZodTypeAny, {
    _tag: "noop";
}, {
    _tag: "noop";
}>;
export type ExecutionQueueItemNoopMetadata = z.infer<typeof ExecutionQueueItemNoopMetadata>;
export declare const ExecutionQueueItemMetadata: z.ZodUnion<[z.ZodObject<{
    _tag: z.ZodLiteral<"python">;
    isSuggestion: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    _tag: "python";
    isSuggestion: boolean;
}, {
    _tag: "python";
    isSuggestion: boolean;
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"sql">;
    isSuggestion: z.ZodBoolean;
    selectedCode: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    _tag: "sql";
    isSuggestion: boolean;
    selectedCode: string | null;
}, {
    _tag: "sql";
    isSuggestion: boolean;
    selectedCode: string | null;
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"sql-load-page">;
}, "strip", z.ZodTypeAny, {
    _tag: "sql-load-page";
}, {
    _tag: "sql-load-page";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"sql-rename-dataframe">;
}, "strip", z.ZodTypeAny, {
    _tag: "sql-rename-dataframe";
}, {
    _tag: "sql-rename-dataframe";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"visualization">;
}, "strip", z.ZodTypeAny, {
    _tag: "visualization";
}, {
    _tag: "visualization";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"visualization-v2">;
}, "strip", z.ZodTypeAny, {
    _tag: "visualization-v2";
}, {
    _tag: "visualization-v2";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"text-input-save-value">;
}, "strip", z.ZodTypeAny, {
    _tag: "text-input-save-value";
}, {
    _tag: "text-input-save-value";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"text-input-rename-variable">;
}, "strip", z.ZodTypeAny, {
    _tag: "text-input-rename-variable";
}, {
    _tag: "text-input-rename-variable";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"date-input">;
}, "strip", z.ZodTypeAny, {
    _tag: "date-input";
}, {
    _tag: "date-input";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"dropdown-input-save-value">;
}, "strip", z.ZodTypeAny, {
    _tag: "dropdown-input-save-value";
}, {
    _tag: "dropdown-input-save-value";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"dropdown-input-rename-variable">;
}, "strip", z.ZodTypeAny, {
    _tag: "dropdown-input-rename-variable";
}, {
    _tag: "dropdown-input-rename-variable";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"pivot-table">;
}, "strip", z.ZodTypeAny, {
    _tag: "pivot-table";
}, {
    _tag: "pivot-table";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"pivot-table-load-page">;
}, "strip", z.ZodTypeAny, {
    _tag: "pivot-table-load-page";
}, {
    _tag: "pivot-table-load-page";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"writeback">;
}, "strip", z.ZodTypeAny, {
    _tag: "writeback";
}, {
    _tag: "writeback";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"noop">;
}, "strip", z.ZodTypeAny, {
    _tag: "noop";
}, {
    _tag: "noop";
}>]>;
export type ExecutionQueueItemMetadata = z.infer<typeof ExecutionQueueItemMetadata>;
export type ExecutionQueueItemMetadataWithoutNoop = Exclude<ExecutionQueueItemMetadata, ExecutionQueueItemNoopMetadata>;
export declare const ExecutionQueueItemAttrs: z.ZodObject<{
    blockId: z.ZodEffects<z.ZodString, string, string>;
    userId: z.ZodNullable<z.ZodEffects<z.ZodString, string, string>>;
    status: z.ZodUnion<[z.ZodObject<{
        _tag: z.ZodLiteral<"enqueued">;
    }, "strip", z.ZodTypeAny, {
        _tag: "enqueued";
    }, {
        _tag: "enqueued";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"aborting">;
    }, "strip", z.ZodTypeAny, {
        _tag: "aborting";
    }, {
        _tag: "aborting";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"running">;
    }, "strip", z.ZodTypeAny, {
        _tag: "running";
    }, {
        _tag: "running";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"completed">;
        status: z.ZodUnion<[z.ZodLiteral<"success">, z.ZodLiteral<"error">, z.ZodLiteral<"aborted">]>;
    }, "strip", z.ZodTypeAny, {
        status: "aborted" | "success" | "error";
        _tag: "completed";
    }, {
        status: "aborted" | "success" | "error";
        _tag: "completed";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"unknown">;
    }, "strip", z.ZodTypeAny, {
        _tag: "unknown";
    }, {
        _tag: "unknown";
    }>]>;
    metadata: z.ZodUnion<[z.ZodObject<{
        _tag: z.ZodLiteral<"python">;
        isSuggestion: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        _tag: "python";
        isSuggestion: boolean;
    }, {
        _tag: "python";
        isSuggestion: boolean;
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"sql">;
        isSuggestion: z.ZodBoolean;
        selectedCode: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        _tag: "sql";
        isSuggestion: boolean;
        selectedCode: string | null;
    }, {
        _tag: "sql";
        isSuggestion: boolean;
        selectedCode: string | null;
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"sql-load-page">;
    }, "strip", z.ZodTypeAny, {
        _tag: "sql-load-page";
    }, {
        _tag: "sql-load-page";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"sql-rename-dataframe">;
    }, "strip", z.ZodTypeAny, {
        _tag: "sql-rename-dataframe";
    }, {
        _tag: "sql-rename-dataframe";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"visualization">;
    }, "strip", z.ZodTypeAny, {
        _tag: "visualization";
    }, {
        _tag: "visualization";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"visualization-v2">;
    }, "strip", z.ZodTypeAny, {
        _tag: "visualization-v2";
    }, {
        _tag: "visualization-v2";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"text-input-save-value">;
    }, "strip", z.ZodTypeAny, {
        _tag: "text-input-save-value";
    }, {
        _tag: "text-input-save-value";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"text-input-rename-variable">;
    }, "strip", z.ZodTypeAny, {
        _tag: "text-input-rename-variable";
    }, {
        _tag: "text-input-rename-variable";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"date-input">;
    }, "strip", z.ZodTypeAny, {
        _tag: "date-input";
    }, {
        _tag: "date-input";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"dropdown-input-save-value">;
    }, "strip", z.ZodTypeAny, {
        _tag: "dropdown-input-save-value";
    }, {
        _tag: "dropdown-input-save-value";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"dropdown-input-rename-variable">;
    }, "strip", z.ZodTypeAny, {
        _tag: "dropdown-input-rename-variable";
    }, {
        _tag: "dropdown-input-rename-variable";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"pivot-table">;
    }, "strip", z.ZodTypeAny, {
        _tag: "pivot-table";
    }, {
        _tag: "pivot-table";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"pivot-table-load-page">;
    }, "strip", z.ZodTypeAny, {
        _tag: "pivot-table-load-page";
    }, {
        _tag: "pivot-table-load-page";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"writeback">;
    }, "strip", z.ZodTypeAny, {
        _tag: "writeback";
    }, {
        _tag: "writeback";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"noop">;
    }, "strip", z.ZodTypeAny, {
        _tag: "noop";
    }, {
        _tag: "noop";
    }>]>;
}, "strip", z.ZodTypeAny, {
    status: {
        _tag: "enqueued";
    } | {
        _tag: "aborting";
    } | {
        _tag: "running";
    } | {
        status: "aborted" | "success" | "error";
        _tag: "completed";
    } | {
        _tag: "unknown";
    };
    blockId: string;
    userId: string | null;
    metadata: {
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
    };
}, {
    status: {
        _tag: "enqueued";
    } | {
        _tag: "aborting";
    } | {
        _tag: "running";
    } | {
        status: "aborted" | "success" | "error";
        _tag: "completed";
    } | {
        _tag: "unknown";
    };
    blockId: string;
    userId: string | null;
    metadata: {
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
    };
}>;
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
            status: "aborted" | "success" | "error";
            _tag: "completed";
        } | {
            _tag: "unknown";
        } | undefined;
        blockId?: string | undefined;
        userId?: string | null | undefined;
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
    };
    private onStatusObservation;
    static fromYjs(item: YExecutionQueueItem): ExecutionQueueItem;
}
//# sourceMappingURL=item.d.ts.map