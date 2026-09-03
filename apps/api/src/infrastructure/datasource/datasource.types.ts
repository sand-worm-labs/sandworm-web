import { DataSourceId, DataSourceType } from '@sandworm/types';

export interface DuckDBDataSource extends BaseDataSource {
    path: string;
    notes: string;
    readOnly: boolean;
}


export interface DataSourceColumn {
    name: string;
    type: string; 
}

// DataSourceTable
export interface DataSourceTable {
    columns: DataSourceColumn[];
}


export interface BaseDataSource {
    id: DataSourceId;
    workspaceId: string;
    name: string;
    connStatus: 'online' | 'offline' | 'checking';
    lastConnection: string | null;
    connError: DataSourceConnectionError | null;
    isDefault: boolean;
    isDemo: boolean;
    createdAt: string;
    updatedAt: string;
}


export interface DataSourceConnectionError {
    name: string;
    message: string;
}



export interface SandwormCloudDataSource extends BaseDataSource {
    host: string;
    port: string;
    catalog: string;
    username: string;
    password: string | null;
    notes: string;
    readOnly: boolean;

    // SandwormCloud-specific fields (optional)
    clusterName?: string;
    region?: string;
    apiEndpoint?: string;
}

export interface DuneDataSource extends BaseDataSource {
    host: string;
    port: string;
    catalog: string;
    username: string;
    password: string | null;
    notes: string;
    readOnly: boolean;
}

export type DataSource =
    | { type: typeof DataSourceType.sandwormCloud; data: SandwormCloudDataSource }
    | { type: typeof DataSourceType.dune; data: DuneDataSource }
    | { type: typeof DataSourceType.duckdb; data: DuckDBDataSource };