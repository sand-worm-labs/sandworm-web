import * as Y from "yjs";
import { RunQueryResult, SQLQueryConfiguration, TableSort } from "@sandworm/types";
import { BlockType, BaseBlock, YBlock } from "./index.js";
import { ResultStatus } from "../index.js";
type DataSourceType = "psql" | "bigquery" | "mysql" | "snowflake" | "trino" | "redshift" | "athena" | "oracle" | "sqlserver" | "databrickssql";
export type DataframeName = {
    value: string;
    newValue: string;
    error?: "invalid-name" | "unexpected";
};
export type SQLBlock = BaseBlock<BlockType.SQL> & {
    source: Y.Text;
    dataframeName: DataframeName;
    dataSourceId: string | null;
    isFileDataSource: boolean;
    result: RunQueryResult | null;
    page: number;
    dashboardPage: number;
    dashboardPageSize: number;
    lastQuery: string | null;
    lastQueryTime: string | null;
    startQueryTime: string | null;
    isCodeHidden: boolean;
    isResultHidden: boolean;
    editWithAIPrompt: Y.Text;
    isEditWithAIPromptOpen: boolean;
    aiSuggestions: Y.Text | null;
    configuration: SQLQueryConfiguration | null;
    sort: TableSort | null;
    componentId: string | null;
};
export declare const isSQLBlock: (block: YBlock) => block is Y.XmlElement<SQLBlock>;
export declare const makeSQLBlock: (id: string, blocks: Y.Map<YBlock>, opts?: {
    dataSourceId?: string | null;
    isFileDataSource?: boolean;
    source?: string;
}) => Y.XmlElement<SQLBlock>;
export declare function getSQLAttributes(block: Y.XmlElement<SQLBlock>, blocks: Y.Map<YBlock>): SQLBlock;
export declare function duplicateSQLBlock(newId: string, block: Y.XmlElement<SQLBlock>, blocks: Y.Map<YBlock>, options?: {
    datasourceMap?: Map<string, string>;
    componentId?: string;
    noState?: boolean;
    newVariableName?: boolean;
}): Y.XmlElement<SQLBlock>;
export declare function getSQLBlockResultStatus(block: Y.XmlElement<SQLBlock>): ResultStatus;
export declare function getSQLSource(block: Y.XmlElement<SQLBlock>): Y.Text;
export declare function getSQLAISuggestions(block: Y.XmlElement<SQLBlock>): Y.Text | null;
export declare function getSQLBlockEditWithAIPrompt(block: Y.XmlElement<SQLBlock>): Y.Text;
export declare function isSQLBlockEditWithAIPromptOpen(block: Y.XmlElement<SQLBlock>): boolean;
export declare function toggleSQLEditWithAIPromptOpen(block: Y.XmlElement<SQLBlock>): void;
export declare function closeSQLEditWithAIPrompt(block: Y.XmlElement<SQLBlock>, cleanPrompt: boolean): void;
export declare function updateSQLAISuggestions(block: Y.XmlElement<SQLBlock>, suggestions: string): void;
export declare function getSQLBlockExecutedAt(block: Y.XmlElement<SQLBlock>, blocks: Y.Map<YBlock>): Date | null;
export declare function getSQLBlockIsDirty(block: Y.XmlElement<SQLBlock>, blocks: Y.Map<YBlock>): boolean;
export declare function getSQLBlockErrorMessage(block: Y.XmlElement<SQLBlock>): string | null;
export declare function getSQLCodeFormatted(source: Y.Text, dialect: DataSourceType | null): Y.Text | null;
export {};
//# sourceMappingURL=sql.d.ts.map