import * as Y from "yjs";
import { BlockType, BaseBlock, ResultStatus, YBlock } from "./index.js";
import { WriteBackErrorResult, WriteBackResult } from "@sandworm/types";
import { ExecutionStatus } from "../execution/item.js";
import { ExecutionQueue } from "../execution/queue.js";
export type WritebackBlock = BaseBlock<BlockType.Writeback> & {
    dataframeName: string | null;
    dataSourceId: string | null;
    tableName: Y.Text;
    overwriteTable: boolean;
    onConflict: "update" | "ignore";
    onConflictColumns: string[];
    result: WriteBackResult | null;
    isCollapsed: boolean;
};
export declare const makeWritebackBlock: (id: string) => Y.XmlElement<WritebackBlock>;
export declare function getWritebackAttributes(block: Y.XmlElement<WritebackBlock>): WritebackBlock;
export declare function duplicateWritebackBlock(newId: string, block: Y.XmlElement<WritebackBlock>, options?: {
    datasourceMap?: Map<string, string>;
}): Y.XmlElement<WritebackBlock>;
export declare function getWritebackBlockExecutedAt(block: Y.XmlElement<WritebackBlock>): Date | null;
export declare function getValidationErrorMessage(reason: "dataframe-not-found" | "datasource-not-found" | "invalid-table-name"): string;
export declare function getPrettyStep(step: WriteBackErrorResult["step"]): string;
export declare function getWritebackBlockErrorMessage(block: Y.XmlElement<WritebackBlock>): string | null;
export declare function getWritebackBlockExecStatus(block: Y.XmlElement<WritebackBlock>, executionQueue: ExecutionQueue): ExecutionStatus;
export declare function getWritebackBlockResultStatus(block: Y.XmlElement<WritebackBlock>): ResultStatus;
export declare function isWritebackBlock(block: YBlock): block is Y.XmlElement<WritebackBlock>;
//# sourceMappingURL=writeback.d.ts.map