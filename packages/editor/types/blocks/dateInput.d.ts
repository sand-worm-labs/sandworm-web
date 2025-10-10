import * as Y from "yjs";
import { BlockType, BaseBlock, YBlock } from "./index.js";
import { ExecutionQueue, ExecutionStatus, ResultStatus } from "../index.js";
export type DateInputValue = {
    year: number;
    month: number;
    day: number;
    hours: number;
    minutes: number;
    seconds: number;
    timezone: string;
};
export declare function dateInputValueFromDate(date: Date, timezone: string): DateInputValue;
export declare function dateInputValueFromString(str: string, value: DateInputValue): DateInputValue;
export declare function formatDateInputValue(dateInputValue: DateInputValue, dateType: "date" | "datetime"): string;
export type DateInputBlock = BaseBlock<BlockType.DateInput> & {
    label: Y.Text;
    variable: string;
    value: {
        year: number;
        month: number;
        day: number;
        hours: number;
        minutes: number;
        seconds: number;
        timezone: string;
    };
    executedAt: string | null;
    configOpen: boolean;
    dateType: "date" | "datetime";
    newValue: Y.Text;
    newVariable: Y.Text;
    error: "invalid-value" | "invalid-variable" | "invalid-variable-and-value" | "unexpected-error" | null;
};
export declare const makeDateInputBlock: (id: string, blocks: Y.Map<YBlock>) => Y.XmlElement<DateInputBlock>;
export declare function duplicateDateInputBlock(newId: string, block: Y.XmlElement<DateInputBlock>, blocks: Y.Map<YBlock>): Y.XmlElement<DateInputBlock>;
export declare function getDateInputBlockExecStatus(block: Y.XmlElement<DateInputBlock>, executionQueue: ExecutionQueue): ExecutionStatus;
export declare function isDateInputBlock(block: YBlock): block is Y.XmlElement<DateInputBlock>;
export declare function getDateInputAttributes(block: Y.XmlElement<DateInputBlock>, blocks: Y.Map<YBlock>): DateInputBlock;
export declare function getDateInputBlockExecutedAt(block: Y.XmlElement<DateInputBlock>, blocks: Y.Map<YBlock>): Date | null;
export declare function getDateInputBlockFormatStr(dateType: "date" | "datetime"): string;
export declare function requestDateInputRun(executionQueue: ExecutionQueue, block: Y.XmlElement<DateInputBlock>, blocks: Y.Map<YBlock>, userId: string | null, environmentStartedAt: string | null): void;
export declare function updateDateInputBlockTimeZone(block: Y.XmlElement<DateInputBlock>, blocks: Y.Map<YBlock>, timezone: string): void;
export declare function updateDateInputBlockDateType(block: Y.XmlElement<DateInputBlock>, blocks: Y.Map<YBlock>, dateType: "date" | "datetime"): void;
export declare function getDateInputBlockResultStatus(block: Y.XmlElement<DateInputBlock>, blocks: Y.Map<YBlock>): ResultStatus;
//# sourceMappingURL=dateInput.d.ts.map