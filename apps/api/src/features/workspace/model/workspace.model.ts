import { ObjectType, registerEnumType } from '@nestjs/graphql';
import { BooleanField, StringField, StringFieldOptional, UUIDField } from '@sandworm/graphql';
import { Field } from '@nestjs/graphql';
import { Plan, UserWorkspaceStatus, WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { User } from '../../user/model/graphql/user.model';
import { UserWorkspaceRole } from '@sandworm/postgresql-typeorm';

registerEnumType(Plan, {
  name: 'WorkspacePlan',
  description: 'Price plan of the workspace',
});

registerEnumType(UserWorkspaceStatus, {
  name: 'UserWorkspaceStatus',
  description: 'User workspace status',
});

registerEnumType(UserWorkspaceRole, {
  name: 'UserWorkspaceRole',
  description: 'User role within a workspace',
});

@ObjectType()
export class WorkspaceSecrets {
  @BooleanField()
  hasAiModelApiKey!: boolean;
}

@ObjectType()
export class Workspace {
  @UUIDField()
  id!: string;

  @StringField()
  name!: string;

  @StringFieldOptional()
  icon?: string;

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
    workspace.icon = entity.icon;
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


@ObjectType()
export class WorkspaceInvitationInfo {
  @Field(() => Workspace, { description: 'The workspace being invited to' })
  workspace: Workspace;

  @Field(() => User, { description: 'The user who sent the invitation' })
  inviter: User;

  @Field(() => User, { description: 'The user being invited' })
  invitedUser: User;

  @Field(() => String, { description: 'The role the user will have in the workspace' })
  role: UserWorkspaceRole;
}

