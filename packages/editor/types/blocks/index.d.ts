import * as Y from "yjs";
import { RichTextBlock } from "./richText.js";
import { SQLBlock } from "./sql.js";
import { PythonBlock } from "./python.js";
import { InputBlock } from "./input.js";
import { ExecutionStatus, YBlockGroup } from "../index.js";
import { FileUploadBlock } from "./fileUpload.js";
import { DropdownInputBlock } from "./dropdownInput.js";
import { DashboardHeaderBlock } from "./dashboard.js";
import { WritebackBlock } from "./writeback.js";
import { DateInputBlock } from "./dateInput.js";
import { PivotTableBlock } from "./pivotTable.js";
import { VisualizationV2Block } from "./visualization-v2.js";
export declare enum BlockType {
    RichText = "RICH_TEXT",
    SQL = "SQL",
    Python = "PYTHON",
    Visualization = "VISUALIZATION",
    VisualizationV2 = "VISUALIZATION_V2",
    Input = "INPUT",
    DropdownInput = "DROPDOWN_INPUT",
    DateInput = "DATE_INPUT",
    FileUpload = "FILE_UPLOAD",
    DashboardHeader = "DASHBOARD_HEADER",
    Writeback = "WRITEBACK",
    PivotTable = "PIVOT_TABLE"
}
export type ResultStatus = "idle" | "error" | "success";
export type BaseBlock<T extends BlockType> = {
    id: string;
    index: number | null;
    title: string;
    type: T;
};
export type Block = RichTextBlock | SQLBlock | PythonBlock | InputBlock | DropdownInputBlock | DateInputBlock | FileUploadBlock | DashboardHeaderBlock | WritebackBlock | PivotTableBlock | VisualizationV2Block;
export type YBlock = Y.XmlElement<Block>;
export declare const setTitle: (block: YBlock, title: string) => void;
export declare const execStatusIsDisabled: (status: ExecutionStatus) => boolean;
export declare const getResultStatus: (block: YBlock, blocks: Y.Map<YBlock>) => ResultStatus;
export declare const getPrettyTitle: (type: BlockType) => string;
export type ValueTypes = Object | number | null | Array<any> | string | Uint8Array | Y.AbstractType<any>;
export declare function getAttributeOr<B extends {
    [key: string]: ValueTypes;
}, K extends keyof B & string>(block: Y.XmlElement<B>, key: K, defaultValue: B[K]): B[K];
export declare function getBaseAttributes<T extends BlockType>(block: YBlock): BaseBlock<T>;
export declare function duplicateBaseAttributes<T extends BlockType>(newId: string, prevAttributes: BaseBlock<T>): BaseBlock<T>;
export declare function isExecutableBlock(block: YBlock): boolean;
export declare function isInputBlock(block: YBlock): boolean;
export declare function duplicateYText(text: Y.Text): Y.Text;
export declare function duplicateBlock(newBlockId: string, block: YBlock, blocks: Y.Map<YBlock>, duplicatingDocument: boolean, options?: {
    datasourceMap?: Map<string, string>;
    componentId?: string;
    noState?: boolean;
    newVariableName?: boolean;
}): YBlock;
export declare function computeDepencyQueue(block: YBlock, layout: Y.Array<YBlockGroup>, blocks: Y.Map<YBlock>, skipDependencyCheck: boolean, environmentStartedAt: string | null): YBlock[];
export declare function getErrorMessage(block: YBlock): string | null;
export declare const isRunnableBlock: <B extends YBlock>(block: B) => boolean;
export declare function getBlockFlatPosition(blockId: string, layout: Y.Array<YBlockGroup>, blocks: Y.Map<YBlock>): number;
export * from "./dashboard.js";
export * from "./richText.js";
export * from "./sql.js";
export * from "./python.js";
export * from "./visualization-v2.js";
export * from "./input.js";
export * from "./dropdownInput.js";
export * from "./dateInput.js";
export * from "./fileUpload.js";
export * from "./writeback.js";
export * from "./pivotTable.js";
//# sourceMappingURL=index.d.ts.map