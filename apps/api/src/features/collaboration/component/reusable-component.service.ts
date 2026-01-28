import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidationException } from '@sandworm/graphql';
import { ErrorCode } from '@/constants/error-code.constant';
import {
    ReusableComponentEntity,
    ReusableComponentInstanceEntity,
    DocumentEntity,
} from '@sandworm/postgresql-typeorm';
import { ReusableComponent } from './model/reusable-component.model';
import { ReusableComponentInstance } from './model/reusable-component-instance.model';
import {
    CreateReusableComponentInput,
    UpdateReusableComponentInput,
    CreateComponentInstanceInput,
} from './dto/reusable-component.dto';
import { EventEmitter2, EventEmitterReadinessWatcher } from '@nestjs/event-emitter';
import {
    WorkspaceComponentsEvent,
    ComponentUpdateEvent,
    ComponentRemovedEvent,
    EventNames,
} from '@/events/reusable-component.events';
import { APIReusableComponent } from '@/infrastructure/websocket/services/reusable-component.gateway';

@Injectable()
export class ReusableComponentService {
    private readonly logger = new Logger(ReusableComponentService.name);

    constructor(
        @InjectRepository(ReusableComponentEntity)
        private readonly componentRepository: Repository<ReusableComponentEntity>,
        @InjectRepository(ReusableComponentInstanceEntity)
        private readonly instanceRepository: Repository<ReusableComponentInstanceEntity>,
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        private readonly eventEmitter: EventEmitter2,
        private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
    ) { }

    async getComponent(componentId: string, workspaceId: string): Promise<ReusableComponent> {
        const component = await this.componentRepository.findOne({
            where: { id: componentId },
            relations: ['document'],
        });

        if (!component || component.document.workspaceId !== workspaceId) {
            throw new ValidationException(ErrorCode.E003);
        }

        return ReusableComponent.fromEntity(component);
    }

    async getWorkspaceComponents(workspaceId: string): Promise<ReusableComponentEntity[]> {
        const components = await this.componentRepository
            .createQueryBuilder('component')
            .innerJoin('component.document', 'document')
            .addSelect(['document.id', 'document.title'])
            .where('document.workspaceId = :workspaceId', { workspaceId })
            .getMany();

        return components;
    }

    async createComponent(
        workspaceId: string,
        input: CreateReusableComponentInput,
    ): Promise<ReusableComponent> {
        const document = await this.documentRepository.findOne({
            where: { id: input.documentId, workspaceId },
        });

        if (!document) {
            throw new ValidationException(ErrorCode.E003);
        }

        const componentEntity = this.componentRepository.create({
            title: input.title,
            type: input.type,
            state: Buffer.from(input.state, 'base64'),
            blockId: input.blockId,
            documentId: input.documentId,
            instancesCreated: true,
        });

        await this.componentRepository.save(componentEntity);

        // Reload with relations
        const savedComponent = await this.componentRepository.findOne({
            where: { id: componentEntity.id },
            relations: ['document'],
        });

        if (!savedComponent) {
            throw new ValidationException(ErrorCode.E003);
        }

        // Emit component update event
        await this.emitComponentUpdate(workspaceId, savedComponent);

        this.logger.log(`Component created: ${savedComponent.id} in workspace ${workspaceId}`);

        return ReusableComponent.fromEntity(savedComponent);
    }

    async updateComponent(
        componentId: string,
        workspaceId: string,
        input: UpdateReusableComponentInput,
    ): Promise<ReusableComponent> {
        const componentEntity = await this.componentRepository.findOne({
            where: { id: componentId },
            relations: ['document', 'instances'],
        });

        if (!componentEntity || componentEntity.document.workspaceId !== workspaceId) {
            throw new ValidationException(ErrorCode.E003);
        }

        if (input.title !== undefined) {
            componentEntity.title = input.title;
        }
        if (input.state !== undefined) {
            componentEntity.state = Buffer.from(input.state, 'base64');
        }

        await this.componentRepository.save(componentEntity);

        // Reload with relations
        const updatedComponent = await this.componentRepository.findOne({
            where: { id: componentId },
            relations: ['document'],
        });

        if (!updatedComponent) {
            throw new ValidationException(ErrorCode.E003);
        }

        // Emit component update event
        await this.emitComponentUpdate(workspaceId, updatedComponent);

        this.logger.log(`Component updated: ${componentId}`);

        return ReusableComponent.fromEntity(updatedComponent);
    }

    async deleteComponent(componentId: string, workspaceId: string): Promise<boolean> {
        const component = await this.componentRepository.findOne({
            where: { id: componentId },
            relations: ['document'],
        });

        if (!component) {
            throw new ValidationException(ErrorCode.E003);
        }

        if (component.document.workspaceId !== workspaceId) {
            throw new ValidationException(ErrorCode.E003);
        }

        await this.componentRepository.remove(component);

        // Emit component removed event
        await this.emitComponentRemoved(workspaceId, componentId);

        // Also emit updated workspace components list
        await this.emitWorkspaceComponents(workspaceId);

        this.logger.log(`Component deleted: ${componentId} from workspace ${workspaceId}`);

        return true;
    }

    async createInstance(
        componentId: string,
        workspaceId: string,
        input: CreateComponentInstanceInput,
    ): Promise<ReusableComponentInstance> {
        const component = await this.componentRepository.findOne({
            where: { id: componentId },
            relations: ['document'],
        });

        if (!component || component.document.workspaceId !== workspaceId) {
            throw new ValidationException(ErrorCode.E003);
        }

        const instance = this.instanceRepository.create({
            reusableComponentId: componentId,
            blockId: input.blockId,
            documentId: input.documentId,
        });

        await this.instanceRepository.save(instance);

        this.logger.log(
            `Component instance created: ${instance.id} for component ${componentId}`,
        );

        return ReusableComponentInstance.fromEntity(instance);
    }

    async deleteInstance(
        componentId: string,
        blockId: string,
        workspaceId: string,
    ): Promise<boolean> {
        const instance = await this.instanceRepository.findOne({
            where: { blockId, reusableComponentId: componentId },
            relations: ['reusableComponent', 'reusableComponent.document'],
        });

        if (!instance || instance.reusableComponent.document.workspaceId !== workspaceId) {
            throw new ValidationException(ErrorCode.E003);
        }

        await this.instanceRepository.remove(instance);

        this.logger.log(`Component instance deleted: ${blockId} from component ${componentId}`);

        return true;
    }

    async getComponentInstances(componentId: string): Promise<ReusableComponentInstance[]> {
        const instances = await this.instanceRepository.find({
            where: { reusableComponentId: componentId },
        });

        return instances.map((i) => ReusableComponentInstance.fromEntity(i));
    }

    // ========================================
    // Event Emission Helpers
    // ========================================
    private async emitComponentUpdate(
        workspaceId: string,
        component: ReusableComponentEntity,
    ): Promise<void> {
        await this.eventEmitterReadinessWatcher.waitUntilReady();

        const apiComponent = this.toAPIReusableComponent(component);

        this.eventEmitter.emit(
            EventNames.COMPONENT_UPDATE,
            new ComponentUpdateEvent(workspaceId, apiComponent),
        );
    }

    private async emitComponentRemoved(
        workspaceId: string,
        componentId: string,
    ): Promise<void> {
        await this.eventEmitterReadinessWatcher.waitUntilReady();

        this.eventEmitter.emit(
            EventNames.COMPONENT_REMOVED,
            new ComponentRemovedEvent(workspaceId, componentId),
        );
    }

    private async emitWorkspaceComponents(workspaceId: string): Promise<void> {
        await this.eventEmitterReadinessWatcher.waitUntilReady();

        const components = await this.getWorkspaceComponents(workspaceId);
        const apiComponents = components.map((c) => this.toAPIReusableComponent(c));

        this.eventEmitter.emit(
            EventNames.WORKSPACE_COMPONENTS,
            new WorkspaceComponentsEvent(workspaceId, apiComponents),
        );
    }

    // Convert entity to API format
    private toAPIReusableComponent(component: ReusableComponentEntity): APIReusableComponent {
        return {
            id: component.id,
            title: component.title,
            type: component.type,
            state: component.state.toString('base64'), // Convert Buffer to base64 string
            blockId: component.blockId,
            documentId: component.documentId,
            instancesCreated: component.instancesCreated,
            createdAt: component.createdAt.toISOString(), // Convert Date to ISO string
            updatedAt: component.updatedAt.toISOString(), // Convert Date to ISO string
            document: {
                id: component.document.id,
                title: component.document.title,
            },
        };
    }
}