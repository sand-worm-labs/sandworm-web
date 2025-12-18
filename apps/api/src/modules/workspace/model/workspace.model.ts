import { ObjectType, registerEnumType } from '@nestjs/graphql';
import { BooleanField, StringField, StringFieldOptional, UUIDField } from '@sandworm/graphql';
import { Field } from '@nestjs/graphql';
import { Plan, WorkspaceEntity } from '@sandworm/postgresql-typeorm';

registerEnumType(Plan, {
  name: 'WorkspacePlan',
  description: 'Price plan of the workspace',
});

@ObjectType()
export class WorkspaceSecrets {
  @BooleanField()
  hasExternalModelApiKey!: boolean;
}

@ObjectType()
export class Workspace {
  @UUIDField()
  id!: string;

  @StringField()
  name!: string;

  @StringFieldOptional()
  source?: string;

  @Field(() => [String])
  useCases!: string[];

  @StringFieldOptional()
  useContext?: string;

  @Field(() => Plan)
  plan!: Plan;

  @UUIDField()
  ownerId!: string;

  static fromEntity(entity: WorkspaceEntity): Workspace {
    const workspace = new Workspace();
    workspace.id = entity.id;
    workspace.name = entity.name;
    workspace.source = entity.source;
    workspace.useCases = entity.useCases;
    workspace.useContext = entity.useContext;
    workspace.plan = entity.plan;
    workspace.ownerId = entity.ownerId;
    return workspace;
  }

  static fromEntities(entities: WorkspaceEntity[]): Workspace[] {
    return entities.map((entity) => Workspace.fromEntity(entity));
  }
}