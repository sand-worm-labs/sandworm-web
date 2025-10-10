import * as Y from "yjs";
import { BlockType, BaseBlock, YBlock, EditableField, ResultStatus } from "./index.js";
import { AggregateFunction, DataFrameColumn, PivotTableResult, PivotTableSort } from "@sandworm/types";
import { ExecutionStatus } from "../execution/item.js";
import { ExecutionQueue } from "../execution/queue.js";
export type PivotTableRow = {
    column: DataFrameColumn | null;
};
export type PivotTableColumn = {
    column: DataFrameColumn | null;
};
export type PivotTableMetric = {
    column: DataFrameColumn | null;
    aggregateFunction: AggregateFunction;
};
export type PivotTableBlock = BaseBlock<BlockType.PivotTable> & {
    dataframeName: string | null;
    variable: EditableField<"invalid-variable-name" | "unexpected-error">;
    rows: PivotTableRow[];
    columns: PivotTableColumn[];
    metrics: PivotTableMetric[];
    sort: PivotTableSort | null;
    controlsHidden: boolean;
    error: "dataframe-not-found" | "unknown" | null;
    updatedAt: string | null;
    page: number;
    result: PivotTableResult | null;
};
export declare const makePivotTableBlock: (id: string, blocks: Y.Map<YBlock>, dataframeName?: string | null) => Y.XmlElement<PivotTableBlock>;
export declare function getPivotTableAttributes(block: Y.XmlElement<PivotTableBlock>, blocks: Y.Map<YBlock>): PivotTableBlock;
export declare function duplicatePivotTableBlock(newId: string, block: Y.XmlElement<PivotTableBlock>, blocks: Y.Map<YBlock>, newVariable: boolean): Y.XmlElement<PivotTableBlock>;
export declare function getPivotTableBlockExecStatus(block: Y.XmlElement<PivotTableBlock>, executionQueue: ExecutionQueue): ExecutionStatus;
export declare function getPivotTableBlockResultStatus(block: Y.XmlElement<PivotTableBlock>): ResultStatus;
export declare function getPivotTableBlockExecutedAt(block: Y.XmlElement<PivotTableBlock>, blocks: Y.Map<YBlock>): Date | null;
export declare function getPivotTableBlockIsDirty(_block: Y.XmlElement<PivotTableBlock>): boolean;
export declare function getPivotTableBlockErrorMessage(block: Y.XmlElement<PivotTableBlock>): string | null;
export declare const isPivotTableBlock: (block: YBlock) => block is Y.XmlElement<PivotTableBlock>;
//# sourceMappingURL=pivotTable.d.ts.map