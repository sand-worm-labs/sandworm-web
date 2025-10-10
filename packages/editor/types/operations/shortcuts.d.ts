import * as Y from 'yjs';
import { YBlockGroup } from './blockGroup.js';
import { YBlock } from '../blocks/index.js';
export declare const getRelativeBlockId: (yLayout: Y.Array<YBlockGroup>, yBlockDefs: Y.Map<YBlock>, blockId: string | null, pos: "above" | "below" | "left" | "right") => {
    blockGroupId: string;
    blockId: string | null;
} | null;
export declare const getNextBlockIdAfterDelete: (yLayout: Y.Array<YBlockGroup>, yBlockDefs: Y.Map<YBlock>, blockId: string) => string | null;
//# sourceMappingURL=shortcuts.d.ts.map