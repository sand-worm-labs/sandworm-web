import * as Y from 'yjs';
import { BlockType, YBlock } from '../blocks/index.js';
export type TabRef = {
    blockGroupId: string;
    blockId: string;
    type: BlockType;
    title: string | null;
    isCurrent: boolean;
    isHiddenInPublished: boolean;
};
type BlockRef = {
    id: string;
    isHiddenInPublished: boolean;
};
export type YBlockRef = Y.XmlElement<BlockRef>;
export type YBlockGroupAttributes = {
    id: string;
    tabs: Y.Array<YBlockRef>;
    current: YBlockRef;
};
export type YBlockGroup = Y.XmlElement<YBlockGroupAttributes>;
export declare function makeYBlockGroup(groupId: string, firstBlockId: string, restBlockIds: string[]): YBlockGroup;
export declare const cloneTabs: (tab: Y.Array<YBlockRef>) => Y.Array<YBlockRef>;
export declare const cloneBlockGroup: (blockGroup: YBlockGroup) => YBlockGroup;
export declare const switchActiveTab: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string, tabId: string) => void;
export declare const getTabsFromBlockGroup: (blockGroup: YBlockGroup, yBlocks: Y.Map<YBlock>) => TabRef[];
export declare const getTabsFromBlockGroupId: (yLayout: Y.Array<YBlockGroup>, yBlocks: Y.Map<YBlock>, blockGroupId: string) => TabRef[];
export declare const getBlockGroup: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string) => YBlockGroup | null;
export declare const ungroupTab: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string, blockId: string, targetIndex: number) => void;
export declare const getCurrentTabId: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string, yBlocks: Y.Map<YBlock>, isApp: boolean) => string | undefined;
export declare const canReorderTab: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string, sourceTabId: string, targetTabId: string, direction: "left" | "right") => boolean;
export declare const reorderTab: (yLayout: Y.Array<YBlockGroup>, blockGroupId: string, sourceTabId: string, targetTabId: string, direction: "left" | "right") => void;
export type RemoveBlockResult = {
    _tag: 'success';
} | RemoveBlockDashboardConflictResult;
export type RemoveBlockDashboardConflictResult = {
    _tag: 'dashboard-conflict';
    blockGroupId: string;
    tabId: string;
};
export declare const removeBlock: (yDoc: Y.Doc, blockGroupId: string, tabId: string, removeFromDashboard: boolean) => RemoveBlockResult;
export declare const duplicateTab: (yLayout: Y.Array<YBlockGroup>, yBlocks: Y.Map<YBlock>, blockGroupId: string, tabId: string, newVariableName: boolean) => void;
export declare const toggleIsBlockHiddenInPublished: (blockGroup: YBlockGroup, blockId: string) => void;
export {};
//# sourceMappingURL=blockGroup.d.ts.map