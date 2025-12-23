import { ObjectType } from '@nestjs/graphql';
import { UUIDField, DateField } from '@sandworm/graphql';
import { ReusableComponentInstanceEntity } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class ReusableComponentInstance {
    @UUIDField()
    id: string;

    @UUIDField()
    blockId: string;

    @UUIDField()
    reusableComponentId: string;

    @UUIDField()
    documentId: string;

    @DateField()
    createdAt: Date;

    @DateField()
    updatedAt: Date;

    static fromEntity(entity: ReusableComponentInstanceEntity): ReusableComponentInstance {
        const instance = new ReusableComponentInstance();
        instance.id = entity.id;
        instance.blockId = entity.blockId;
        instance.reusableComponentId = entity.reusableComponentId;
        instance.documentId = entity.documentId;
        instance.createdAt = entity.createdAt;
        instance.updatedAt = entity.updatedAt;
        return instance;
    }
}