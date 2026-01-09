import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import {
    UUIDField,
    StringField,
    DateField,
    BooleanField,
} from '@sandworm/graphql';
import { ReusableComponentEntity, ReusableComponentType } from '@sandworm/postgresql-typeorm';

registerEnumType(ReusableComponentType, {
    name: 'ReusableComponentType',
});

@ObjectType()
export class ReusableComponent {
    @UUIDField()
    id: string;

    @StringField()
    title: string;

    @Field(() => ReusableComponentType)
    type: ReusableComponentType;

    @Field(() => String)
    state: string; // Base64 encoded

    @UUIDField()
    blockId: string;

    @UUIDField()
    documentId: string;

    @BooleanField()
    instancesCreated: boolean;

    @DateField()
    createdAt: Date;

    @DateField()
    updatedAt: Date;

    static fromEntity(entity: ReusableComponentEntity): ReusableComponent {
        const component = new ReusableComponent();
        component.id = entity.id;
        component.title = entity.title;
        component.type = entity.type;
        component.state = entity.state.toString('base64');
        component.blockId = entity.blockId;
        component.documentId = entity.documentId;
        component.instancesCreated = entity.instancesCreated;
        component.createdAt = entity.createdAt;
        component.updatedAt = entity.updatedAt;
        return component;
    }

    static fromEntities(entities: ReusableComponentEntity[]): ReusableComponent[] {
        return entities.map((e) => ReusableComponent.fromEntity(e));
    }
}