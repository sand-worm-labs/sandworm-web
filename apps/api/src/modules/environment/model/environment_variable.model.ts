import { ObjectType } from '@nestjs/graphql';
import { DateField, StringField, UUIDField } from '@sandworm/graphql';
import { EnvironmentVariableEntity } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class EnvironmentVariable {
  @UUIDField()
  id!: string;

  @StringField()
  name!: string;

  @StringField()
  value!: string;

  @UUIDField()
  workspaceId!: string;

  @DateField()
  updatedAt!: Date;

  static fromEntity(entity: EnvironmentVariableEntity): EnvironmentVariable {
    const envVar = new EnvironmentVariable();
    envVar.id = entity.id;
    envVar.name = entity.name;
    envVar.value = entity.value;
    envVar.workspaceId = entity.workspaceId;
    envVar.updatedAt = entity.updatedAt;
    return envVar;
  }

  static fromEntities(entities: EnvironmentVariableEntity[]): EnvironmentVariable[] {
    return entities.map((entity) => EnvironmentVariable.fromEntity(entity));
  }
}