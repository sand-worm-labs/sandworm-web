import * as Y from "yjs";
import { DashboardHeaderBlock, FileUploadBlock, InputBlock, PythonBlock, RichTextBlock, SQLBlock, YBlock } from "./blocks/index.js";
import { YBlockGroup } from "./operations/blockGroup.js";
import { DataFrame } from "@sandworm/types";
import { DropdownInputBlock } from "./blocks/dropdownInput.js";
import { YDashboardItem } from "./dashboard.js";
import { WritebackBlock } from "./blocks/writeback.js";
import { DateInputBlock } from "./blocks/dateInput.js";
import { PivotTableBlock } from "./blocks/pivotTable.js";
import { VisualizationV2Block } from "./blocks/visualization-v2.js";
export * from "./operations/index.js";
export * from "./blocks/index.js";
export * from "./blocks/visualization-v2.js";
export * from "./dashboard.js";
export * from "./metadata.js";
export * from "./component.js";
export * from "./execution/index.js";
export * from "./ai-tasks/index.js";
export declare function getBlocks(doc: Y.Doc): Y.Map<YBlock>;
export declare function getLayout(doc: Y.Doc): Y.Array<YBlockGroup>;
export declare function getDataframes(doc: Y.Doc): Y.Map<{
    name: string;
    columns: ({
        type: "byte" | "ubyte" | "short" | "ushort" | "i1" | "i2" | "i4" | "i8" | "int0" | "int" | "Int" | "int8" | "Int8" | "int16" | "Int16" | "int32" | "Int32" | "int64" | "Int64" | "long" | "longlong" | "u1" | "u2" | "u4" | "u8" | "uint0" | "uint8" | "uint16" | "uint32" | "uint64" | "UInt0" | "UInt8" | "UInt16" | "UInt32" | "UInt64" | "uint" | "UInt" | "ulong" | "ULong" | "ulonglong" | "ULongLong" | "f2" | "f4" | "f8" | "f16" | "float16" | "float32" | "float64" | "float128" | "Float" | "Float16" | "Float32" | "Float64" | "float" | "longfloat" | "double" | "longdouble" | "timedelta64" | "timedelta64[ns]" | "timedelta64[ns, UTC]" | "timedelta64[us]" | "timedelta64[us, UTC]";
        name: string | number;
    } | {
        type: "string" | "object" | "unicode" | "str" | "bytes" | "bytes0" | "str0" | "category" | "object0";
        name: string | number;
        categories?: (string | number | boolean)[] | undefined;
    } | {
        type: "dbdate" | "dbtime" | "datetime64" | "datetime64[ns]" | "datetime64[ns, UTC]" | "datetime64[ns, Etc/UTC]" | "datetime64[us]" | "datetime64[us, UTC]" | "datetime64[us, Etc/UTC]" | "period" | "period[Y-DEC]" | "period[Q-DEC]" | "period[M]" | "period[Q]" | "period[W]" | "period[D]" | "period[h]" | "period[min]" | "period[m]" | "period[s]" | "period[ms]" | "period[us]" | "period[ns]";
        name: string | number;
    } | {
        type: "boolean" | "bool" | "bool8" | "b1";
        name: string | number;
    })[];
    id?: string | undefined;
    updatedAt?: string | undefined;
    blockId?: string | undefined;
}>;
export declare function getClosestDataframe(doc: Y.Doc, pos: number): DataFrame | null;
export declare function getDashboard(doc: Y.Doc): Y.Map<YDashboardItem>;
export declare function getDocumentSourceWithBlockStartPos(doc: Y.Doc, blockId: string): {
    source: string;
    blockStartPos: number;
};
export declare function getLastUpdatedAt(doc: Y.Doc): string | null;
export declare function switchBlockType<T>(block: YBlock, handles: {
    onRichText: (block: Y.XmlElement<RichTextBlock>) => T;
    onSQL: (block: Y.XmlElement<SQLBlock>) => T;
    onPython: (block: Y.XmlElement<PythonBlock>) => T;
    onVisualization: (block: Y.XmlElement<any>) => T;
    onVisualizationV2: (block: Y.XmlElement<VisualizationV2Block>) => T;
    onInput: (block: Y.XmlElement<InputBlock>) => T;
    onDropdownInput: (block: Y.XmlElement<DropdownInputBlock>) => T;
    onDateInput: (block: Y.XmlElement<DateInputBlock>) => T;
    onFileUpload: (block: Y.XmlElement<FileUploadBlock>) => T;
    onDashboardHeader: (block: Y.XmlElement<DashboardHeaderBlock>) => T;
    onWriteback: (block: Y.XmlElement<WritebackBlock>) => T;
    onPivotTable: (block: Y.XmlElement<PivotTableBlock>) => T;
}): T;
export declare function updateYText(yText: Y.Text, next: string): void;
export declare function compareText(a: Y.Text | undefined | null, b: Y.Text | undefined | null): number;
export declare function getDataframe(block: Y.XmlElement<any | PivotTableBlock>, dataframes: Y.Map<DataFrame>): {
    name: string;
    columns: ({
        type: "byte" | "ubyte" | "short" | "ushort" | "i1" | "i2" | "i4" | "i8" | "int0" | "int" | "Int" | "int8" | "Int8" | "int16" | "Int16" | "int32" | "Int32" | "int64" | "Int64" | "long" | "longlong" | "u1" | "u2" | "u4" | "u8" | "uint0" | "uint8" | "uint16" | "uint32" | "uint64" | "UInt0" | "UInt8" | "UInt16" | "UInt32" | "UInt64" | "uint" | "UInt" | "ulong" | "ULong" | "ulonglong" | "ULongLong" | "f2" | "f4" | "f8" | "f16" | "float16" | "float32" | "float64" | "float128" | "Float" | "Float16" | "Float32" | "Float64" | "float" | "longfloat" | "double" | "longdouble" | "timedelta64" | "timedelta64[ns]" | "timedelta64[ns, UTC]" | "timedelta64[us]" | "timedelta64[us, UTC]";
        name: string | number;
    } | {
        type: "string" | "object" | "unicode" | "str" | "bytes" | "bytes0" | "str0" | "category" | "object0";
        name: string | number;
        categories?: (string | number | boolean)[] | undefined;
    } | {
        type: "dbdate" | "dbtime" | "datetime64" | "datetime64[ns]" | "datetime64[ns, UTC]" | "datetime64[ns, Etc/UTC]" | "datetime64[us]" | "datetime64[us, UTC]" | "datetime64[us, Etc/UTC]" | "period" | "period[Y-DEC]" | "period[Q-DEC]" | "period[M]" | "period[Q]" | "period[W]" | "period[D]" | "period[h]" | "period[min]" | "period[m]" | "period[s]" | "period[ms]" | "period[us]" | "period[ns]";
        name: string | number;
    } | {
        type: "boolean" | "bool" | "bool8" | "b1";
        name: string | number;
    })[];
    id?: string | undefined;
    updatedAt?: string | undefined;
    blockId?: string | undefined;
} | null;
export declare function duplicateYXmlFragment(fragment: Y.XmlFragment): Y.XmlFragment;
//# sourceMappingURL=index.d.ts.map