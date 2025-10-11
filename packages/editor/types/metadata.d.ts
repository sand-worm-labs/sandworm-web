import * as Y from 'yjs';
import * as z from 'zod';
declare const Metadata: z.ZodObject<{
    isDirty: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    isDirty: boolean;
}, {
    isDirty: boolean;
}>;
export type Metadata = z.infer<typeof Metadata>;
export type YMetadata = Y.XmlElement<Metadata>;
export declare function getMetadata(yDoc: Y.Doc): YMetadata;
export declare function isDirty(yDoc: Y.Doc): boolean;
export declare function setDirty(yDoc: Y.Doc): void;
export declare function setPristine(yDoc: Y.Doc): void;
export {};
//# sourceMappingURL=metadata.d.ts.map