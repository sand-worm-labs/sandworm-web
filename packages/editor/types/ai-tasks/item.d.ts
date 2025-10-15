import * as Y from "yjs";
import * as z from "zod";
export declare const AITaskItemStatus: z.ZodUnion<readonly [z.ZodObject<{
    _tag: z.ZodLiteral<"enqueued">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"aborting">;
    ping: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"running">;
    ping: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"completed">;
    status: z.ZodUnion<readonly [z.ZodLiteral<"success">, z.ZodLiteral<"error">, z.ZodLiteral<"aborted">]>;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"unknown">;
}, z.core.$strip>]>;
export type AITaskItemStatus = z.infer<typeof AITaskItemStatus>;
export type AITaskStatus = AITaskItemStatus["_tag"] | "idle";
export declare function isAITaskStatusLoading(status: AITaskStatus): status is "running" | "aborting" | "enqueued";
export declare const AITaskItemEditPythonMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"edit-python">;
}, z.core.$strip>;
export type AITaskItemEditPythonMetadata = z.infer<typeof AITaskItemEditPythonMetadata>;
export declare const AITaskItemFixPythonMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"fix-python">;
}, z.core.$strip>;
export type AITaskItemFixPythonMetadata = z.infer<typeof AITaskItemFixPythonMetadata>;
export declare const AITaskItemEditSQLMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"edit-sql">;
}, z.core.$strip>;
export type AITaskItemEditSQLMetadata = z.infer<typeof AITaskItemEditSQLMetadata>;
export declare const AITaskItemFixSQLMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"fix-sql">;
}, z.core.$strip>;
export type AITaskItemFixSQLMetadata = z.infer<typeof AITaskItemFixSQLMetadata>;
export declare const AITaskItemNoopMetadata: z.ZodObject<{
    _tag: z.ZodLiteral<"noop">;
}, z.core.$strip>;
export type AITaskItemNoopMetadata = z.infer<typeof AITaskItemNoopMetadata>;
export declare const AITaskItemMetadata: z.ZodUnion<readonly [z.ZodObject<{
    _tag: z.ZodLiteral<"edit-python">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"fix-python">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"edit-sql">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"fix-sql">;
}, z.core.$strip>, z.ZodObject<{
    _tag: z.ZodLiteral<"noop">;
}, z.core.$strip>]>;
export type AITaskItemMetadata = z.infer<typeof AITaskItemMetadata>;
export type AITaskItemMetadataWithoutNoop = Exclude<AITaskItemMetadata, AITaskItemNoopMetadata>;
export declare const AITaskItemAttrs: z.ZodObject<{
    blockId: z.ZodString;
    userId: z.ZodNullable<z.ZodString>;
    status: z.ZodUnion<readonly [z.ZodObject<{
        _tag: z.ZodLiteral<"enqueued">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"aborting">;
        ping: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"running">;
        ping: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"completed">;
        status: z.ZodUnion<readonly [z.ZodLiteral<"success">, z.ZodLiteral<"error">, z.ZodLiteral<"aborted">]>;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"unknown">;
    }, z.core.$strip>]>;
    metadata: z.ZodUnion<readonly [z.ZodObject<{
        _tag: z.ZodLiteral<"edit-python">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"fix-python">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"edit-sql">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"fix-sql">;
    }, z.core.$strip>, z.ZodObject<{
        _tag: z.ZodLiteral<"noop">;
    }, z.core.$strip>]>;
}, z.core.$strip>;
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
            _tag: "completed";
            status: "error" | "success" | "aborted";
        } | {
            _tag: "unknown";
        } | undefined;
        blockId?: string | undefined;
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
        userId?: string | null | undefined;
    };
    private onStatusObservation;
    static fromYjs(item: YAITaskItem): AITaskItem;
}
//# sourceMappingURL=item.d.ts.map