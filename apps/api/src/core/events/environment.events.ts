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

// The workspace's Python kernel was restarted, so it is a fresh process: nothing a
// session set up in it (the theme, the query helper, variables) is there any more.
export class KernelRestartedEvent {
    constructor(public readonly workspaceId: string) {}
}

export const EventNames = {
    ENVIRONMENT_STATUS_UPDATE: 'environment-status-update',
    ENVIRONMENT_STATUS_ERROR: 'environment-status-error',
    KERNEL_RESTARTED: 'environment-kernel-restarted',
} as const;