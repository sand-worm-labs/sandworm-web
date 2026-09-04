import { ObjectType, Field } from '@nestjs/graphql';
import {
  StringField,
  UUIDField,
  DateField
} from '@sandworm/graphql';
import { User } from '../../user/model/graphql/user.model';

@ObjectType()
export class WorkspaceMember {
  @UUIDField()
  userId!: string;

  @StringField()
  role!: string;

  @StringField({ nullable: true })
  requestedRole?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @StringField({ nullable: true })
  workspaceName?: string;

  @UUIDField({ nullable: true })
  workspaceId?: string;

  @DateField({ nullable: true })
  joinedAt?: Date;

}

@ObjectType()
export class WorkspaceInfo {
  @UUIDField()
  id!: string;

  @StringField()
  name!: string;

  @StringField()
  icon!: string;

  @UUIDField()
  ownerId!: string;

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  @StringField()
  role!: string;


  static fromService(data: {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    role: string;
    icon: string;
    owner?: User;
  }): WorkspaceInfo {
    const workspaceInfo = new WorkspaceInfo();
    workspaceInfo.id = data.id;
    workspaceInfo.name = data.name;
    workspaceInfo.ownerId = data.ownerId;
    workspaceInfo.createdAt = data.createdAt;
    workspaceInfo.updatedAt = data.updatedAt;
    workspaceInfo.role = data.role;
    workspaceInfo.icon = data.icon;
    return workspaceInfo;
  }
}