import { ObjectType, Field } from '@nestjs/graphql';
import {
  StringField,
  UUIDField,
  DateField
} from '@sandworm/graphql';

@ObjectType()
export class WorkspaceMember {
  @UUIDField()
  userId!: string;

  @StringField()
  role!: string;
}

@ObjectType()
export class WorkspaceInfo {
  @UUIDField()
  id!: string;

  @StringField()
  name!: string;

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
  }): WorkspaceInfo {
    const workspaceInfo = new WorkspaceInfo();
    workspaceInfo.id = data.id;
    workspaceInfo.name = data.name;
    workspaceInfo.ownerId = data.ownerId;
    workspaceInfo.createdAt = data.createdAt;
    workspaceInfo.updatedAt = data.updatedAt;
    workspaceInfo.role = data.role;

    return workspaceInfo;
  }
}