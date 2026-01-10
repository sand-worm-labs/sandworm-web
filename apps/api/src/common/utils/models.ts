 import { DocumentEntity, UserEntity, WorkspaceEntity } from '@sandworm/postgresql-typeorm';
import { User } from '@/api/user/model/graphql/user.model';
import { Workspace } from '@/api/workspace/model/workspace.model';
import { Document } from '@/api/document/model/document.model';


export const toGraphQLWorkspaceUtils = (entity: WorkspaceEntity): Workspace => {
  return { 
    ...entity,
  };
};