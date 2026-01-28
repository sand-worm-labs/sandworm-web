import { APIReusableComponent } from "@/infrastructure/websocket/services/reusable-component.gateway";

export class WorkspaceComponentsEvent {
    workspaceId: string;
    components: APIReusableComponent[];

    constructor(workspaceId: string, components: APIReusableComponent[]) {
        this.workspaceId = workspaceId;
        this.components = components;
    }
}

export class ComponentUpdateEvent {
    workspaceId: string;
    component: APIReusableComponent;

    constructor(workspaceId: string, component: APIReusableComponent) {
        this.workspaceId = workspaceId;
        this.component = component;
    }
}

export class ComponentRemovedEvent {
    workspaceId: string;
    componentId: string;

    constructor(workspaceId: string, componentId: string) {
        this.workspaceId = workspaceId;
        this.componentId = componentId;
    }
}

export const EventNames = {
    WORKSPACE_COMPONENTS: 'workspace-components',
    COMPONENT_UPDATE: 'workspace-component-update',
    COMPONENT_REMOVED: 'workspace-component-removed',
} as const;