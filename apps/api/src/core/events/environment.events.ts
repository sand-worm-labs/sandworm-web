import { EnvironmentStatus } from "@sandworm/postgresql-typeorm/entities/enums";


export class EnvironmentStatusEvent {
    workspaceId: string;
    status: EnvironmentStatus;
    startedAt: string | null;

    constructor(workspaceId: string, status: EnvironmentStatus, startedAt: string | null) {
        this.workspaceId = workspaceId;
        this.status = status;
        this.startedAt = startedAt;
    }
}

export const EventNames = {
    ENVIRONMENT_STATUS_UPDATE: 'environment-status-update',
    ENVIRONMENT_STATUS_ERROR: 'environment-status-error',
} as const;