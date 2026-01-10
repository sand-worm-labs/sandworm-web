// reusable-component.resolver.ts
import {
    Args,
    Mutation,
    Parent,
    Query,
    ResolveField,
    Resolver,
} from '@nestjs/graphql';
import { ReusableComponentService } from './reusable-component.service';
import { ReusableComponent } from './model/reusable-component.model';
import { ReusableComponentInstance } from './model/reusable-component-instance.model';
import {
    CreateReusableComponentInput,
    UpdateReusableComponentInput,
    CreateComponentInstanceInput,
} from './dto/reusable-component.dto';

const COMPONENT_UPDATED = 'componentUpdated';
const COMPONENT_DELETED = 'componentDeleted';

@Resolver(() => ReusableComponent)
export class ReusableComponentResolver {
    constructor(
        private readonly componentService: ReusableComponentService,
    ) { }

    @Query(() => ReusableComponent, {
        name: 'getComponent',
        description: 'Get a reusable component by ID',
    })
    async getComponent(
        @Args('componentId') componentId: string,
        @Args('workspaceId') workspaceId: string,
    ): Promise<ReusableComponent> {
        return this.componentService.getComponent(componentId, workspaceId);
    }

    @Query(() => [ReusableComponent], {
        name: 'getWorkspaceComponents',
        description: 'Get all reusable components in a workspace',
    })
    async getWorkspaceComponents(
        @Args('workspaceId') workspaceId: string,
    ): Promise<ReusableComponent[]> {
        return this.componentService.getWorkspaceComponents(workspaceId);
    }


    @Mutation(() => ReusableComponent, {
        name: 'createComponent',
        description: 'Create a new reusable component',
    })
    async createComponent(
        @Args('workspaceId') workspaceId: string,
        @Args('input') input: CreateReusableComponentInput,
    ): Promise<ReusableComponent> {
        const component = await this.componentService.createComponent(workspaceId, input);
        return component;
    }

    @Mutation(() => ReusableComponent, {
        name: 'updateComponent',
        description: 'Update a reusable component',
    })
    async updateComponent(
        @Args('componentId') componentId: string,
        @Args('workspaceId') workspaceId: string,
        @Args('input') input: UpdateReusableComponentInput,
    ): Promise<ReusableComponent> {
        const component = await this.componentService.updateComponent(
            componentId,
            workspaceId,
            input,
        );
        return component;
    }

    @Mutation(() => Boolean, {
        name: 'deleteComponent',
        description: 'Delete a reusable component',
    })
    async deleteComponent(
        @Args('componentId') componentId: string,
        @Args('workspaceId') workspaceId: string,
    ): Promise<boolean> {
        await this.componentService.deleteComponent(componentId, workspaceId);
        return true;
    }

    @Mutation(() => ReusableComponentInstance, {
        name: 'createComponentInstance',
        description: 'Create a component instance',
    })
    async createComponentInstance(
        @Args('componentId') componentId: string,
        @Args('workspaceId') workspaceId: string,
        @Args('input') input: CreateComponentInstanceInput,
    ): Promise<ReusableComponentInstance> {
        return this.componentService.createInstance(componentId, workspaceId, input);
    }

    @Mutation(() => Boolean, {
        name: 'deleteComponentInstance',
        description: 'Delete a component instance',
    })
    async deleteComponentInstance(
        @Args('componentId') componentId: string,
        @Args('blockId') blockId: string,
        @Args('workspaceId') workspaceId: string,
    ): Promise<boolean> {
        return this.componentService.deleteInstance(componentId, blockId, workspaceId);
    }


    @ResolveField(() => [ReusableComponentInstance], { name: 'instances' })
    async instances(@Parent() component: ReusableComponent): Promise<ReusableComponentInstance[]> {
        return this.componentService.getComponentInstances(component.id);
    }
}