import * as Y from "yjs";
import { YBlockGroup, TabRef } from "./blockGroup.js";
import { BlockType, YBlock } from "../blocks/index.js";
export type AddBlockGroupBlock = {
    type: BlockType.RichText | BlockType.Input | BlockType.DropdownInput | BlockType.DateInput | BlockType.FileUpload | BlockType.Writeback;
} | {
    type: BlockType.Python;
    source?: string;
} | {
    type: BlockType.SQL;
    dataSourceId: string | null;
    isFileDataSource: boolean;
    source?: string;
} | {
    type: BlockType.Visualization | BlockType.VisualizationV2 | BlockType.PivotTable;
    dataframeName: string | null;
} | {
    type: BlockType.DashboardHeader;
    content: string;
};
export declare function addBlockGroupAfterBlock(yLayout: Y.Array<YBlockGroup>, yBlockDefs: Y.Map<YBlock>, addBlock: AddBlockGroupBlock, blockId: string): string;
export declare function appendBlock(id: string, block: YBlock, blocks: Y.Map<YBlock>, yLayout: Y.Array<YBlockGroup>): void;
export declare const addBlockGroup: (yLayout: Y.Array<YBlockGroup>, yBlockDefs: Y.Map<YBlock>, block: AddBlockGroupBlock, index: number) => string;
export declare const updateOrder: (yLayout: Y.Array<YBlockGroup>, sourceGroupId: string, targetIndex: number) => void;
export declare const groupBlockGroups: (yLayout: Y.Array<YBlockGroup>, droppedGroupId: string, targetGroupId: string) => void;
export declare const groupBlocks: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string, blockId: string, targetGroupId: string) => void;
export declare const checkCanDropBlockGroup: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string, desiredIndex: number) => boolean;
export declare const checkCanDropBlock: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string, targetIndex: number) => boolean;
export type RemoveBlockGroupDashboardConflictResult = {
    _tag: "dashboard-conflict";
    blockGroupId: string;
    tabRefs: TabRef[];
};
export type RemoveBlockGroupResult = {
    _tag: "success";
} | RemoveBlockGroupDashboardConflictResult;
export declare const removeBlockGroup: (yDoc: Y.Doc, blockGroupId: string, removeFromDashboard: boolean) => RemoveBlockGroupResult;
export declare const addDashboardOnlyBlock: (yBlockDefs: Y.Map<YBlock>, block: AddBlockGroupBlock) => string;
export declare const removeDashboardBlock: (yBlockDefs: Y.Map<YBlock>, blockId: string) => void;
export declare const addGroupedBlock: (yLayout: Y.Array<YBlockGroup>, yBlockDefs: Y.Map<YBlock>, blockGroupId: string, blockId: string, block: AddBlockGroupBlock, position: "before" | "after") => string | null;
export declare const duplicateBlockGroup: (yLayout: Y.Array<YBlockGroup>, yBlocks: Y.Map<YBlock>, blockGroupId: string, newVariableName: boolean) => void;
//# sourceMappingURL=document.d.ts.map