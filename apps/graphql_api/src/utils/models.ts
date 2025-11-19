 import { UserEntity, WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { User } from '@/api/user/model/user.model';
import { Workspace } from '@/api/workspace/model/workspace.model';

export const toGraphQLUserUtils = (entity: UserEntity): User => {
    return {
      ...entity,
    };
};

export const toGraphQLWorkspaceUtils = (entity: WorkspaceEntity): Workspace => {
  return { 
    ...entity,
}
};
