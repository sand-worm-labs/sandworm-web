import * as Y from "yjs";
import * as z from "zod";
export declare const AITaskItemStatus: z.ZodUnion<[z.ZodObject<{
    _tag: z.ZodLiteral<"enqueued">;
}, "strip", z.ZodTypeAny, {
    _tag: "enqueued";
}, {
    _tag: "enqueued";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"aborting">;
    ping: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    _tag: "aborting";
    ping: number;
}, {
    _tag: "aborting";
    ping: number;
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"running">;
    ping: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    _tag: "running";
    ping: number;
}, {
    _tag: "running";
    ping: number;
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
export type AITaskItemStatus = z.infer<typeof AITaskItemStatus>;
export type AITaskStatus = AITaskItemStatus["_tag"] | "idle";
export declare function isAITaskStatusLoading(status: AITaskStatus): status is "running" | "aborting" | "enqueued";
export declare const AITaskItemEditPythonMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"edit-python">;
}, "strip", z.ZodTypeAny, {
    _tag: "edit-python";
}, {
    _tag: "edit-python";
}>;
export type AITaskItemEditPythonMetadata = z.infer<typeof AITaskItemEditPythonMetadata>;
export declare const AITaskItemFixPythonMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"fix-python">;
}, "strip", z.ZodTypeAny, {
    _tag: "fix-python";
}, {
    _tag: "fix-python";
}>;
export type AITaskItemFixPythonMetadata = z.infer<typeof AITaskItemFixPythonMetadata>;
export declare const AITaskItemEditSQLMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"edit-sql">;
}, "strip", z.ZodTypeAny, {
    _tag: "edit-sql";
}, {
    _tag: "edit-sql";
}>;
export type AITaskItemEditSQLMetadata = z.infer<typeof AITaskItemEditSQLMetadata>;
export declare const AITaskItemFixSQLMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"fix-sql">;
}, "strip", z.ZodTypeAny, {
    _tag: "fix-sql";
}, {
    _tag: "fix-sql";
}>;
export type AITaskItemFixSQLMetadata = z.infer<typeof AITaskItemFixSQLMetadata>;
export declare const AITaskItemNoopMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"noop">;
}, "strip", z.ZodTypeAny, {
    _tag: "noop";
}, {
    _tag: "noop";
}>;
export type AITaskItemNoopMetadata = z.infer<typeof AITaskItemNoopMetadata>;
export declare const AITaskItemMetadata: z.ZodUnion<[z.ZodObject<{
    _tag: z.ZodLiteral<"edit-python">;
}, "strip", z.ZodTypeAny, {
    _tag: "edit-python";
}, {
    _tag: "edit-python";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"fix-python">;
}, "strip", z.ZodTypeAny, {
    _tag: "fix-python";
}, {
    _tag: "fix-python";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"edit-sql">;
}, "strip", z.ZodTypeAny, {
    _tag: "edit-sql";
}, {
    _tag: "edit-sql";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"fix-sql">;
}, "strip", z.ZodTypeAny, {
    _tag: "fix-sql";
}, {
    _tag: "fix-sql";
}>, z.ZodObject<{
    _tag: z.ZodLiteral<"noop">;
}, "strip", z.ZodTypeAny, {
    _tag: "noop";
}, {
    _tag: "noop";
}>]>;
export type AITaskItemMetadata = z.infer<typeof AITaskItemMetadata>;
export type AITaskItemMetadataWithoutNoop = Exclude<AITaskItemMetadata, AITaskItemNoopMetadata>;
export declare const AITaskItemAttrs: z.ZodObject<{
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
        ping: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        _tag: "aborting";
        ping: number;
    }, {
        _tag: "aborting";
        ping: number;
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"running">;
        ping: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        _tag: "running";
        ping: number;
    }, {
        _tag: "running";
        ping: number;
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
        _tag: z.ZodLiteral<"edit-python">;
    }, "strip", z.ZodTypeAny, {
        _tag: "edit-python";
    }, {
        _tag: "edit-python";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"fix-python">;
    }, "strip", z.ZodTypeAny, {
        _tag: "fix-python";
    }, {
        _tag: "fix-python";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"edit-sql">;
    }, "strip", z.ZodTypeAny, {
        _tag: "edit-sql";
    }, {
        _tag: "edit-sql";
    }>, z.ZodObject<{
        _tag: z.ZodLiteral<"fix-sql">;
    }, "strip", z.ZodTypeAny, {
        _tag: "fix-sql";
    }, {
        _tag: "fix-sql";
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
        ping: number;
    } | {
        _tag: "running";
        ping: number;
    } | {
        status: "aborted" | "success" | "error";
        _tag: "completed";
    } | {
        _tag: "unknown";
    };
    blockId: string;
    userId: string | null;
    metadata: {
        _tag: "edit-python";
    } | {
        _tag: "fix-python";
    } | {
        _tag: "edit-sql";
    } | {
        _tag: "fix-sql";
    } | {
        _tag: "noop";
    };
}, {
    status: {
        _tag: "enqueued";
    } | {
        _tag: "aborting";
        ping: number;
    } | {
        _tag: "running";
        ping: number;
    } | {
        status: "aborted" | "success" | "error";
        _tag: "completed";
    } | {
        _tag: "unknown";
    };
    blockId: string;
    userId: string | null;
    metadata: {
        _tag: "edit-python";
    } | {
        _tag: "fix-python";
    } | {
        _tag: "edit-sql";
    } | {
        _tag: "fix-sql";
    } | {
        _tag: "noop";
    };
}>;
export type YAITaskItemAttrs = z.infer<typeof AITaskItemAttrs>;
export type YAITaskItem = Y.XmlElement<YAITaskItemAttrs>;
export declare function createYAITaskItem(blockId: string, userId: string | null, metadata: AITaskItemMetadataWithoutNoop): YAITaskItem;
export declare class AITaskItem {
    private readonly item;
    private constructor();
    private statusObservers;
    getCompleteStatus(): "success" | "error" | "aborted" | null;
    getMetadata(): AITaskItemMetadata;
    getBlockId(): string;
    getUserId(): string | null;
    setRunning(): void;
    ping(): void;
    setAborting(): void;
    setCompleted(status: "success" | "error" | "aborted"): void;
    getStatus(): AITaskItemStatus;
    observeStatus(callback: (status: AITaskItemStatus) => void): () => void;
    toJSON(): {
        status?: {
            _tag: "enqueued";
        } | {
            _tag: "aborting";
            ping: number;
        } | {
            _tag: "running";
            ping: number;
        } | {
            status: "aborted" | "success" | "error";
            _tag: "completed";
        } | {
            _tag: "unknown";
        } | undefined;
        blockId?: string | undefined;
        userId?: string | null | undefined;
        metadata?: {
            _tag: "edit-python";
        } | {
            _tag: "fix-python";
        } | {
            _tag: "edit-sql";
        } | {
            _tag: "fix-sql";
        } | {
            _tag: "noop";
        } | undefined;
    };
    private onStatusObservation;
    static fromYjs(item: YAITaskItem): AITaskItem;
}
//# sourceMappingURL=item.d.ts.map