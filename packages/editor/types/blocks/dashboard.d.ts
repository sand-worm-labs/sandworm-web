import * as Y from "yjs";
import { BaseBlock, BlockType } from "../../src/index.js";
export type DashboardHeaderBlock = BaseBlock<BlockType.DashboardHeader> & {
    content: string;
};
export declare const makeDashboardHeaderBlock: (id: string, init?: Partial<DashboardHeaderBlock>) => Y.XmlElement<DashboardHeaderBlock>;
export declare function duplicateDashboardHeaderBlock(newId: string, block: Y.XmlElement<DashboardHeaderBlock>): Y.XmlElement<DashboardHeaderBlock>;
//# sourceMappingURL=dashboard.d.ts.map