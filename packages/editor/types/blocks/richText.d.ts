import * as Y from "yjs";
import { BlockType, BaseBlock, YBlock } from "./index.js";
import { ExecutionStatus } from "../execution/item.js";
export type RichTextBlock = BaseBlock<BlockType.RichText> & {
    content: Y.XmlFragment;
};
export declare const isRichTextBlock: (block: YBlock) => block is Y.XmlElement<RichTextBlock>;
export declare const makeRichTextBlock: (id: string) => Y.XmlElement<RichTextBlock>;
export declare function getRichTextAttributes(block: Y.XmlElement<RichTextBlock>): RichTextBlock;
export declare function duplicateRichTextBlock(newId: string, block: Y.XmlElement<RichTextBlock>): Y.XmlElement<RichTextBlock>;
export declare function getRichTextBlockExecStatus(_block: Y.XmlElement<RichTextBlock>): ExecutionStatus;
//# sourceMappingURL=richText.d.ts.map