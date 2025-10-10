import * as Y from "yjs";
import { Output } from "@sandworm/types";
import { BlockType, BaseBlock, YBlock } from "./index.js";
import { ResultStatus } from "../index.js";
export type PythonBlock = BaseBlock<BlockType.Python> & {
    source: Y.Text;
    result: Output[];
    isResultHidden: boolean;
    isCodeHidden: boolean;
    lastQuery: string;
    lastQueryTime: string;
    startQueryTime: string;
    editWithAIPrompt: Y.Text;
    isEditWithAIPromptOpen: boolean;
    aiSuggestions: Y.Text | null;
    componentId: string | null;
};
export declare const isPythonBlock: (block: YBlock) => block is Y.XmlElement<PythonBlock>;
export declare const makePythonBlock: (id: string, options?: {
    source?: string;
}) => Y.XmlElement<PythonBlock>;
export declare function getPythonAttributes(block: Y.XmlElement<PythonBlock>): PythonBlock;
export declare function duplicatePythonBlock(newId: string, block: Y.XmlElement<PythonBlock>, options?: {
    componentId?: string;
    noState?: boolean;
}): Y.XmlElement<PythonBlock>;
export declare function getPythonBlockResultStatus(block: Y.XmlElement<PythonBlock>): ResultStatus;
export declare function getPythonSource(block: Y.XmlElement<PythonBlock>): Y.Text;
export declare function getPythonAISuggestions(block: Y.XmlElement<PythonBlock>): Y.Text | null;
export declare function getPythonBlockEditWithAIPrompt(block: Y.XmlElement<PythonBlock>): Y.Text;
export declare function isPythonBlockEditWithAIPromptOpen(block: Y.XmlElement<PythonBlock>): boolean;
export declare function togglePythonEditWithAIPromptOpen(block: Y.XmlElement<PythonBlock>): void;
export declare function closePythonEditWithAIPrompt(block: Y.XmlElement<PythonBlock>, cleanPrompt: boolean): void;
export declare function updatePythonAISuggestions(block: Y.XmlElement<PythonBlock>, suggestions: string): void;
export declare function getPythonBlockResult(block: Y.XmlElement<PythonBlock>): Output[];
export declare function getPythonBlockExecutedAt(block: Y.XmlElement<PythonBlock>): Date | null;
export declare function getPythonBlockIsDirty(block: Y.XmlElement<PythonBlock>): boolean;
export declare function getPythonBlockErrorMessage(block: Y.XmlElement<PythonBlock>): string | null;
//# sourceMappingURL=python.d.ts.map