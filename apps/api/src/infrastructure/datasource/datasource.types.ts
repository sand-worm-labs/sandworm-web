// DataSourceColumn
export interface DataSourceColumn {
    name: string;
    type: string; // e.g., 'string', 'bigint', 'timestamp', 'decimal', 'boolean', etc.
}

// DataSourceTable
export interface DataSourceTable {
    columns: DataSourceColumn[];
}


export interface BaseDataSource {
    id: string;
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
    // Trino connection fields
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

// Add to DataSource union type in @briefer/types
export type DataSource =
    | { type: 'sandwormcloud'; data: SandwormCloudDataSource };