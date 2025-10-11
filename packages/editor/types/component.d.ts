import * as Y from 'yjs';
import { PythonBlock, SQLBlock, YBlock } from './blocks/index.js';
export declare function createComponentState(component: Y.XmlElement<SQLBlock | PythonBlock>, blocks: Y.Map<YBlock>): {
    id: string;
    state: string;
};
export declare function decodeComponentState<T extends SQLBlock | PythonBlock>(state: string): Y.XmlElement<T>;
export declare function updateBlockFromComponent(component: YBlock, block: YBlock, blocks: Y.Map<YBlock>): boolean;
export declare function addComponentToDocument(component: Y.XmlElement<SQLBlock | PythonBlock>, newBlockId: string, doc: Y.Doc): void;
//# sourceMappingURL=component.d.ts.map