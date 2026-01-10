// reusable-component.service.ts
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

    async getWorkspaceComponents(workspaceId: string): Promise<ReusableComponent[]> {
        const components = await this.componentRepository
            .createQueryBuilder('component')
            .innerJoin('component.document', 'document')
            .where('document.workspaceId = :workspaceId', { workspaceId })
            .getMany();

        return ReusableComponent.fromEntities(components);
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

        const component = this.componentRepository.create({
            title: input.title,
            type: input.type,
            state: Buffer.from(input.state, 'base64'),
            blockId: input.blockId,
            documentId: input.documentId,
            instancesCreated: true,
        });

        await this.componentRepository.save(component);

        // TODO: Update Yjs document to set componentId on block

        return ReusableComponent.fromEntity(component);
    }

    async updateComponent(
        componentId: string,
        workspaceId: string,
        input: UpdateReusableComponentInput,
    ): Promise<ReusableComponent> {
        const component = await this.componentRepository.findOne({
            where: { id: componentId },
            relations: ['document', 'instances'],
        });

        if (!component || component.document.workspaceId !== workspaceId) {
            throw new ValidationException(ErrorCode.E003);
        }

        if (input.title !== undefined) {
            component.title = input.title;
        }
        if (input.state !== undefined) {
            component.state = Buffer.from(input.state, 'base64');
        }

        await this.componentRepository.save(component);

        // TODO: Update all component instances in Yjs documents

        return ReusableComponent.fromEntity(component);
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
        return true;
    }

    async getComponentInstances(componentId: string): Promise<ReusableComponentInstance[]> {
        const instances = await this.instanceRepository.find({
            where: { reusableComponentId: componentId },
        });

        return instances.map((i) => ReusableComponentInstance.fromEntity(i));
    }
}