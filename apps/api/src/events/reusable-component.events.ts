import { APIReusableComponent } from "@/infrastructure/websocket/services/reusable-component.gateway";

export class WorkspaceComponentsEvent {
    workspaceId: string;
    components: APIReusableComponent[];
}

export class ComponentUpdateEvent {
    workspaceId: string;
    component: APIReusableComponent;
}

export class ComponentRemovedEvent {
    workspaceId: string;
    componentId: string;
}


export const EventNames = {
    WORKSPACE_COMPONENTS: 'workspace-components',
    COMPONENT_UPDATE: 'workspace-component-update',
    COMPONENT_REMOVED: 'workspace-component-removed',
} as const;