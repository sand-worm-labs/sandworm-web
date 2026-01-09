import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { DateField, NumberField, UUIDField } from '@sandworm/graphql';
import { EnvironmentEntity, EnvironmentStatus } from '@sandworm/postgresql-typeorm';

registerEnumType(EnvironmentStatus, {
  name: 'EnvironmentStatus',
  description: 'The status of the Jupyter environment',
});

@ObjectType()
export class Environment {
  @UUIDField()
  id!: string;

  @UUIDField()
  workspaceId!: string;

  @Field(() => EnvironmentStatus)
  status!: EnvironmentStatus;

  @NumberField()
  resourceVersion!: number;

  @DateField()
  lastActivityAt!: Date;

  static fromEntity(entity: EnvironmentEntity): Environment {
    const environment = new Environment();
    environment.id = entity.id;
    environment.workspaceId = entity.workspaceId;
    environment.status = entity.status;
    environment.resourceVersion = entity.resourceVersion;
    environment.lastActivityAt = entity.lastActivityAt;
    return environment;
  }

  static fromEntities(entities: EnvironmentEntity[]): Environment[] {
    return entities.map((entity) => Environment.fromEntity(entity));
  }
}