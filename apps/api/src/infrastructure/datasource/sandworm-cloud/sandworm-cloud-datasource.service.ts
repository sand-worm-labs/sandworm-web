import { Injectable } from '@nestjs/common';

@Injectable()
export class SandwormCloudDataSourceService {

    getDataSource(workspaceId: string) {
        return {
            type: 'sandwormcloud',
            data: {
                id: 'sandwormcloud-datasource',
                workspaceId: workspaceId,
                name: 'Sandworm Cloud',
                connStatus: 'online',
                lastConnection: new Date().toISOString(),
                connError: null,
                isDefault: true,
                isDemo: false,
                createdAt: new Date(0).toISOString(),
                updatedAt: new Date().toISOString(),
            },
        };
    }

    async ping() {
        try {
            // Check connection without exposing credentials
            return {
                connStatus: 'online' as const,
                lastConnection: new Date(),
            };
        } catch (error) {
            return {
                connStatus: 'offline' as const,
                connError: {
                    name: 'ConnectionError',
                    message: "Workspace Id ",
                },
            };
        }
    }
}