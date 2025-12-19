import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type AdvanceTutorialInput = {
  ifCurrentStep?: InputMaybe<Scalars['String']['input']>;
  tutorialType: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type AdvanceTutorialResult = {
  __typename?: 'AdvanceTutorialResult';
  currentState?: Maybe<TutorialState>;
  didAdvance: Scalars['Boolean']['output'];
  prevStep?: Maybe<OnboardingTutorialStep>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  id: Scalars['String']['output'];
  roles?: Maybe<Scalars['JSON']['output']>;
  token: Scalars['String']['output'];
  tokenExpires: Scalars['Float']['output'];
  user: User;
};

export type Comment = {
  __typename?: 'Comment';
  authorId: Scalars['String']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateCommentInput = {
  body: Scalars['String']['input'];
  id: Scalars['String']['input'];
};

export type CreateDocumentInput = {
  parentId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  version: Scalars['Float']['input'];
};

/** User register request */
export type CreateUserInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type DeleteCommentInput = {
  commentId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type DeleteDocumentInput = {
  documentId: Scalars['String']['input'];
  isPermanent?: InputMaybe<Scalars['Boolean']['input']>;
  workspaceId: Scalars['String']['input'];
};

export type DeleteFileInput = {
  path: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type DismissTutorialInput = {
  tutorialType: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type Document = {
  __typename?: 'Document';
  appClock: Scalars['Float']['output'];
  appId: Scalars['String']['output'];
  authorId: Scalars['String']['output'];
  children: Array<Document>;
  clock: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  hasDashboard: Scalars['Boolean']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isDataApp: Scalars['Boolean']['output'];
  isSyncedWithYjs: Scalars['Boolean']['output'];
  orderIndex: Scalars['Float']['output'];
  parent?: Maybe<Document>;
  parentId?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  runSQLSelection: Scalars['Boolean']['output'];
  runUnexecutedBlocks: Scalars['Boolean']['output'];
  shareLinksWithoutSidebar: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userAppClock: Scalars['JSON']['output'];
  version: Scalars['Float']['output'];
  workspaceId: Scalars['String']['output'];
};

export type DuplicateDocumentInput = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type Environment = {
  __typename?: 'Environment';
  id: Scalars['String']['output'];
  lastActivityAt: Scalars['DateTime']['output'];
  resourceVersion: Scalars['Float']['output'];
  status: EnvironmentStatus;
  workspaceId: Scalars['String']['output'];
};

/** The status of the Jupyter environment */
export enum EnvironmentStatus {
  Failing = 'FAILING',
  Running = 'RUNNING',
  Starting = 'STARTING',
  Stopped = 'STOPPED',
  Stopping = 'STOPPING'
}

export type EnvironmentVariable = {
  __typename?: 'EnvironmentVariable';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  value: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type EnvironmentVariableInput = {
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type FavoriteDocumentInput = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type GetAllUsersInput = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  sortBy?: Scalars['String']['input'];
  sortOrder?: Scalars['String']['input'];
};

export type GetTutorialStateInput = {
  tutorialType: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type ListFilesInput = {
  path?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};

/** Login input */
export type LoginInput = {
  /** Email address */
  email: Scalars['String']['input'];
  /** Password */
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Accept workspace invitation with hash from email */
  acceptWorkspaceInvitation: Scalars['Boolean']['output'];
  /** Mark a document as a favorite */
  addFavoriteDocument: Document;
  /** Advance to the next step in the tutorial */
  advanceTutorial: AdvanceTutorialResult;
  /** Create a new comment on a document */
  createComment: Comment;
  /** Create a new document in a workspace */
  createDocument: Document;
  /** Register new user */
  createUser: User;
  /** Create a new workspace */
  createWorkspace: Workspace;
  /** Delete a comment (only by comment author) */
  deleteComment: Scalars['Boolean']['output'];
  /** Soft delete or permanently delete a document */
  deleteDocument: Document;
  /** Delete a single environment variable */
  deleteEnvironmentVariable: Scalars['Boolean']['output'];
  /** Delete a file from the workspace */
  deleteFile: Scalars['Boolean']['output'];
  /** Dismiss a completed tutorial */
  dismissTutorial: TutorialState;
  /** Create a fork/duplicate of a document */
  duplicateDocument: Document;
  /** Follow User */
  followUser: Profile;
  /** Invite a user to workspace by email */
  inviteUserToWorkspace: Scalars['Boolean']['output'];
  /** Sign in */
  login: AuthPayload;
  /** Publish a document */
  publishDocument: Document;
  /** Unmark a document as a favorite */
  removeFavoriteDocument: Document;
  /** Remove a user from workspace */
  removeUserFromWorkspace: Scalars['Boolean']['output'];
  /** Restart the Jupyter environment */
  restartEnvironment: Environment;
  /** Restore a previously deleted document */
  restoreDocument: Document;
  /** Add or remove environment variables */
  setEnvironmentVariables: Array<EnvironmentVariable>;
  /** Switch to a different workspace */
  switchWorkspace: Scalars['Boolean']['output'];
  /** Unfollow User */
  unfollowUser: Profile;
  /** Unpublish a document */
  unpublishDocument: Document;
  /** Update document metadata */
  updateDocument: Document;
  /** Update current user */
  updateUser: User;
  /** Update user settings */
  updateUserSettings: Scalars['Boolean']['output'];
  /** Update workspace info */
  updateWorkspace: Workspace;
};


export type MutationAcceptWorkspaceInvitationArgs = {
  hash: Scalars['String']['input'];
};


export type MutationAddFavoriteDocumentArgs = {
  input: FavoriteDocumentInput;
};


export type MutationAdvanceTutorialArgs = {
  input: AdvanceTutorialInput;
};


export type MutationCreateCommentArgs = {
  documentId: Scalars['String']['input'];
  input: CreateCommentInput;
};


export type MutationCreateDocumentArgs = {
  input: CreateDocumentInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationCreateWorkspaceArgs = {
  name: Scalars['String']['input'];
};


export type MutationDeleteCommentArgs = {
  input: DeleteCommentInput;
};


export type MutationDeleteDocumentArgs = {
  input: DeleteDocumentInput;
};


export type MutationDeleteEnvironmentVariableArgs = {
  variableId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationDeleteFileArgs = {
  input: DeleteFileInput;
};


export type MutationDismissTutorialArgs = {
  input: DismissTutorialInput;
};


export type MutationDuplicateDocumentArgs = {
  input: DuplicateDocumentInput;
};


export type MutationFollowUserArgs = {
  username: Scalars['String']['input'];
};


export type MutationInviteUserToWorkspaceArgs = {
  email: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationPublishDocumentArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationRemoveFavoriteDocumentArgs = {
  input: FavoriteDocumentInput;
};


export type MutationRemoveUserFromWorkspaceArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationRestartEnvironmentArgs = {
  input: RestartEnvironmentInput;
};


export type MutationRestoreDocumentArgs = {
  input: RestoreDocumentInput;
};


export type MutationSetEnvironmentVariablesArgs = {
  input: SetEnvironmentVariablesInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationSwitchWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type MutationUnfollowUserArgs = {
  username: Scalars['String']['input'];
};


export type MutationUnpublishDocumentArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationUpdateDocumentArgs = {
  documentId: Scalars['String']['input'];
  input: UpdateDocumentInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateUserSettingsArgs = {
  input: UpdateUserSettingInput;
};


export type MutationUpdateWorkspaceArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};

/** Steps in the onboarding tutorial */
export enum OnboardingTutorialStep {
  ConnectDataSource = 'CONNECT_DATA_SOURCE',
  CreateVisualization = 'CREATE_VISUALIZATION',
  InviteTeamMembers = 'INVITE_TEAM_MEMBERS',
  PublishDashboard = 'PUBLISH_DASHBOARD',
  RunPython = 'RUN_PYTHON',
  RunQuery = 'RUN_QUERY'
}

export type Profile = {
  __typename?: 'Profile';
  bio: Scalars['String']['output'];
  following: Scalars['Boolean']['output'];
  image: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Get a single comment by ID */
  comment: Comment;
  /** Get all comments for a document */
  comments: Array<Comment>;
  /** Get current user (from token) */
  currentUser: AuthPayload;
  /** Get environment details for a workspace */
  environment: Environment;
  /** Get current environment status */
  environmentStatus: EnvironmentStatus;
  /** Get all environment variables (values are masked) */
  environmentVariables: Array<EnvironmentVariable>;
  /** Check if a file exists */
  fileExists: Scalars['Boolean']['output'];
  /** Get all users */
  getAllUsers: Scalars['Int']['output'];
  /** Get a single document by ID */
  getDocument: Document;
  /** Get the current state of a tutorial */
  getTutorialState: TutorialState;
  /** Users who follow a given user */
  getUserFollowers: Array<User>;
  /** Users that a given user is following */
  getUserFollowing: Array<User>;
  /** Get user workspace info with role */
  getUserWorkspaceInfo: WorkspaceInfo;
  /** Get User workspaces */
  getUserWorkspaces: Array<Workspace>;
  /** Get workspace by ID */
  getWorkspace: Workspace;
  /** Get all documents in a workspace */
  getWorkspaceDocuments: Array<Document>;
  /** Get workspace members */
  getWorkspaceMembers: Array<WorkspaceMember>;
  /** List all files in a workspace */
  listFiles: Array<SandwormFile>;
  /** Get Profile */
  profile: Profile;
  tags: Array<Scalars['String']['output']>;
};


export type QueryCommentArgs = {
  commentId: Scalars['String']['input'];
};


export type QueryCommentsArgs = {
  documentId: Scalars['String']['input'];
};


export type QueryEnvironmentArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryEnvironmentStatusArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryEnvironmentVariablesArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryFileExistsArgs = {
  fileName: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type QueryGetAllUsersArgs = {
  input: GetAllUsersInput;
};


export type QueryGetDocumentArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type QueryGetTutorialStateArgs = {
  input: GetTutorialStateInput;
};


export type QueryGetUserFollowersArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetUserFollowingArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetWorkspaceDocumentsArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetWorkspaceMembersArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryListFilesArgs = {
  input: ListFilesInput;
};


export type QueryProfileArgs = {
  username: Scalars['String']['input'];
};

export type RestartEnvironmentInput = {
  workspaceId: Scalars['String']['input'];
};

export type RestoreDocumentInput = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type SandwormFile = {
  __typename?: 'SandwormFile';
  isDirectory: Scalars['Boolean']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  relCwdPath: Scalars['String']['output'];
  size: Scalars['Float']['output'];
};

export type SetEnvironmentVariablesInput = {
  add: Array<EnvironmentVariableInput>;
  remove: Array<Scalars['String']['input']>;
};

export type TutorialState = {
  __typename?: 'TutorialState';
  currentStep: OnboardingTutorialStep;
  id: Scalars['String']['output'];
  isCompleted: Scalars['Boolean']['output'];
  isDismissed: Scalars['Boolean']['output'];
  stepStates?: Maybe<Scalars['JSON']['output']>;
};

export type UpdateDocumentInput = {
  orderIndex: Scalars['Float']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  runSQLSelection?: InputMaybe<Scalars['Boolean']['input']>;
  runUnexecutedBlocks?: InputMaybe<Scalars['Boolean']['input']>;
  shareLinksWithoutSidebar?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** User update request */
export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserSettingInput = {
  socialLinks?: InputMaybe<Scalars['JSON']['input']>;
  statusText?: InputMaybe<Scalars['String']['input']>;
  wallets?: InputMaybe<Array<Scalars['JSON']['input']>>;
};

export type User = {
  __typename?: 'User';
  avater?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  followers: Array<User>;
  followersCount: Scalars['Int']['output'];
  following: Array<User>;
  followingCount: Scalars['Int']['output'];
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isOnboarded: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  settings?: Maybe<UserSetting>;
  username?: Maybe<Scalars['String']['output']>;
};

export type UserSetting = {
  __typename?: 'UserSetting';
  id: Scalars['ID']['output'];
  socialLinks?: Maybe<Scalars['JSON']['output']>;
  statusText?: Maybe<Scalars['String']['output']>;
  statusUpdatedAt?: Maybe<Scalars['DateTime']['output']>;
  userId: Scalars['ID']['output'];
  wallets: Array<Scalars['JSON']['output']>;
};

export type Workspace = {
  __typename?: 'Workspace';
  documents: Array<Document>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  owner: User;
  ownerId: Scalars['String']['output'];
  plan: WorkspacePlan;
  secrets: WorkspaceSecrets;
  source?: Maybe<Scalars['String']['output']>;
  useCases: Array<Scalars['String']['output']>;
  useContext?: Maybe<Scalars['String']['output']>;
  users: Array<User>;
};

export type WorkspaceInfo = {
  __typename?: 'WorkspaceInfo';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  ownerId: Scalars['String']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  role: Scalars['String']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

/** Price plan of the workspace */
export enum WorkspacePlan {
  Enterprise = 'ENTERPRISE',
  Free = 'FREE',
  Pro = 'PRO',
  Trial = 'TRIAL'
}

export type WorkspaceSecrets = {
  __typename?: 'WorkspaceSecrets';
  hasExternalModelApiKey: Scalars['Boolean']['output'];
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, email?: string | null, username?: string | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, isOnboarded: boolean } };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, email?: string | null, username?: string | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, avater?: string | null, isOnboarded: boolean } };

export type UpdateUserSettingsMutationVariables = Exact<{
  statusText?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<Scalars['JSON']['input']>;
  wallets?: InputMaybe<Array<Scalars['JSON']['input']> | Scalars['JSON']['input']>;
}>;


export type UpdateUserSettingsMutation = { __typename?: 'Mutation', updateUserSettings: boolean };

export type FollowUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type FollowUserMutation = { __typename?: 'Mutation', followUser: { __typename?: 'Profile', username: string, bio: string, image: string, following: boolean } };

export type UnfollowUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type UnfollowUserMutation = { __typename?: 'Mutation', unfollowUser: { __typename?: 'Profile', username: string, bio: string, image: string, following: boolean } };

export type CreateCommentMutationVariables = Exact<{
  documentId: Scalars['String']['input'];
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'Comment', id: string, body: string, authorId: string, documentId: string, createdAt: any, updatedAt: any } };

export type DeleteCommentMutationVariables = Exact<{
  input: DeleteCommentInput;
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment: boolean };

export type CreateDocumentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  input: CreateDocumentInput;
}>;


export type CreateDocumentMutation = { __typename?: 'Mutation', createDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type UpdateDocumentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  input: UpdateDocumentInput;
}>;


export type UpdateDocumentMutation = { __typename?: 'Mutation', updateDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type DeleteDocumentMutationVariables = Exact<{
  input: DeleteDocumentInput;
}>;


export type DeleteDocumentMutation = { __typename?: 'Mutation', deleteDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type RestoreDocumentMutationVariables = Exact<{
  input: RestoreDocumentInput;
}>;


export type RestoreDocumentMutation = { __typename?: 'Mutation', restoreDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type DuplicateDocumentMutationVariables = Exact<{
  input: DuplicateDocumentInput;
}>;


export type DuplicateDocumentMutation = { __typename?: 'Mutation', duplicateDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type PublishDocumentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
}>;


export type PublishDocumentMutation = { __typename?: 'Mutation', publishDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type AddFavoriteDocumentMutationVariables = Exact<{
  input: FavoriteDocumentInput;
}>;


export type AddFavoriteDocumentMutation = { __typename?: 'Mutation', addFavoriteDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type RemoveFavoriteDocumentMutationVariables = Exact<{
  input: FavoriteDocumentInput;
}>;


export type RemoveFavoriteDocumentMutation = { __typename?: 'Mutation', removeFavoriteDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type RestartEnvironmentMutationVariables = Exact<{
  input: RestartEnvironmentInput;
}>;


export type RestartEnvironmentMutation = { __typename?: 'Mutation', restartEnvironment: { __typename?: 'Environment', id: string, workspaceId: string, status: EnvironmentStatus, resourceVersion: number, lastActivityAt: any } };

export type SetEnvironmentVariablesMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  input: SetEnvironmentVariablesInput;
}>;


export type SetEnvironmentVariablesMutation = { __typename?: 'Mutation', setEnvironmentVariables: Array<{ __typename?: 'EnvironmentVariable', id: string, name: string, value: string, updatedAt: any, workspaceId: string }> };

export type DeleteEnvironmentVariableMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  variableId: Scalars['String']['input'];
}>;


export type DeleteEnvironmentVariableMutation = { __typename?: 'Mutation', deleteEnvironmentVariable: boolean };

export type DeleteFileMutationVariables = Exact<{
  input: DeleteFileInput;
}>;


export type DeleteFileMutation = { __typename?: 'Mutation', deleteFile: boolean };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace: { __typename?: 'Workspace', id: string, name: string, plan: WorkspacePlan, source?: string | null, useCases: Array<string>, useContext?: string | null, ownerId: string, owner: { __typename?: 'User', id: string, username?: string | null, email?: string | null } } };

export type UpdateWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: string, name: string, plan: WorkspacePlan, source?: string | null, useCases: Array<string>, useContext?: string | null } };

export type SwitchWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type SwitchWorkspaceMutation = { __typename?: 'Mutation', switchWorkspace: boolean };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser: { __typename: 'AuthPayload', id: string, token: string, tokenExpires: number, user: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, isOnboarded: boolean, avater?: string | null, followersCount: number, followingCount: number, settings?: { __typename?: 'UserSetting', statusText?: string | null, statusUpdatedAt?: any | null, socialLinks?: any | null, wallets: Array<any> } | null } } };

export type GetProfileQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type GetProfileQuery = { __typename?: 'Query', profile: { __typename?: 'Profile', username: string, bio: string, image: string, following: boolean } };

export type GetUserFollowersQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetUserFollowersQuery = { __typename?: 'Query', getUserFollowers: Array<{ __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null, avater?: string | null, followersCount: number, followingCount: number }> };

export type GetUserFollowingQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetUserFollowingQuery = { __typename?: 'Query', getUserFollowing: Array<{ __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null, avater?: string | null, followersCount: number, followingCount: number }> };

export type GetCommentsQueryVariables = Exact<{
  documentId: Scalars['String']['input'];
}>;


export type GetCommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: string, body: string, authorId: string, documentId: string, createdAt: any, updatedAt: any }> };

export type GetCommentQueryVariables = Exact<{
  commentId: Scalars['String']['input'];
}>;


export type GetCommentQuery = { __typename?: 'Query', comment: { __typename?: 'Comment', id: string, body: string, authorId: string, documentId: string, createdAt: any, updatedAt: any } };

export type GetDocumentQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
}>;


export type GetDocumentQuery = { __typename?: 'Query', getDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type GetEnvironmentQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetEnvironmentQuery = { __typename?: 'Query', environment: { __typename?: 'Environment', id: string, workspaceId: string, status: EnvironmentStatus, resourceVersion: number, lastActivityAt: any } };

export type GetEnvironmentStatusQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetEnvironmentStatusQuery = { __typename?: 'Query', environmentStatus: EnvironmentStatus };

export type GetEnvironmentVariablesQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetEnvironmentVariablesQuery = { __typename?: 'Query', environmentVariables: Array<{ __typename?: 'EnvironmentVariable', id: string, name: string, value: string, updatedAt: any, workspaceId: string }> };

export type ListFilesQueryVariables = Exact<{
  input: ListFilesInput;
}>;


export type ListFilesQuery = { __typename?: 'Query', listFiles: Array<{ __typename?: 'SandwormFile', name: string, path: string, relCwdPath: string, size: number, isDirectory: boolean, mimeType?: string | null }> };

export type FileExistsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
}>;


export type FileExistsQuery = { __typename?: 'Query', fileExists: boolean };

export type GetUserWorkspaceInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserWorkspaceInfoQuery = { __typename?: 'Query', getUserWorkspaceInfo: { __typename?: 'WorkspaceInfo', id: string, name: string, ownerId: string, createdAt: any, updatedAt: any, role: string } };

export type GetUserWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserWorkspacesQuery = { __typename?: 'Query', getUserWorkspaces: Array<{ __typename?: 'Workspace', id: string, name: string, plan: WorkspacePlan, source?: string | null, useCases: Array<string>, useContext?: string | null, ownerId: string, owner: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null } }> };

export type GetWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetWorkspaceQuery = { __typename?: 'Query', getWorkspace: { __typename?: 'Workspace', id: string, name: string, plan: WorkspacePlan, source?: string | null, useCases: Array<string>, useContext?: string | null, ownerId: string, owner: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null }, users: Array<{ __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null, avater?: string | null }>, documents: Array<{ __typename?: 'Document', id: string, title: string, slug: string, authorId: string, parentId?: string | null }> } };

export type GetWorkspaceDocumentsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetWorkspaceDocumentsQuery = { __typename?: 'Query', getWorkspaceDocuments: Array<{ __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean }> };


export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    username
    firstName
    lastName
    fullName
    isOnboarded
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    email
    username
    firstName
    lastName
    fullName
    avater
    isOnboarded
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateUserSettingsDocument = gql`
    mutation UpdateUserSettings($statusText: String, $socialLinks: JSON, $wallets: [JSON!]) {
  updateUserSettings(
    input: {statusText: $statusText, socialLinks: $socialLinks, wallets: $wallets}
  )
}
    `;
export type UpdateUserSettingsMutationFn = Apollo.MutationFunction<UpdateUserSettingsMutation, UpdateUserSettingsMutationVariables>;

/**
 * __useUpdateUserSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateUserSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserSettingsMutation, { data, loading, error }] = useUpdateUserSettingsMutation({
 *   variables: {
 *      statusText: // value for 'statusText'
 *      socialLinks: // value for 'socialLinks'
 *      wallets: // value for 'wallets'
 *   },
 * });
 */
export function useUpdateUserSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserSettingsMutation, UpdateUserSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserSettingsMutation, UpdateUserSettingsMutationVariables>(UpdateUserSettingsDocument, options);
      }
export type UpdateUserSettingsMutationHookResult = ReturnType<typeof useUpdateUserSettingsMutation>;
export type UpdateUserSettingsMutationResult = Apollo.MutationResult<UpdateUserSettingsMutation>;
export type UpdateUserSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateUserSettingsMutation, UpdateUserSettingsMutationVariables>;
export const FollowUserDocument = gql`
    mutation FollowUser($username: String!) {
  followUser(username: $username) {
    username
    bio
    image
    following
  }
}
    `;
export type FollowUserMutationFn = Apollo.MutationFunction<FollowUserMutation, FollowUserMutationVariables>;

/**
 * __useFollowUserMutation__
 *
 * To run a mutation, you first call `useFollowUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFollowUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [followUserMutation, { data, loading, error }] = useFollowUserMutation({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useFollowUserMutation(baseOptions?: Apollo.MutationHookOptions<FollowUserMutation, FollowUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<FollowUserMutation, FollowUserMutationVariables>(FollowUserDocument, options);
      }
export type FollowUserMutationHookResult = ReturnType<typeof useFollowUserMutation>;
export type FollowUserMutationResult = Apollo.MutationResult<FollowUserMutation>;
export type FollowUserMutationOptions = Apollo.BaseMutationOptions<FollowUserMutation, FollowUserMutationVariables>;
export const UnfollowUserDocument = gql`
    mutation UnfollowUser($username: String!) {
  unfollowUser(username: $username) {
    username
    bio
    image
    following
  }
}
    `;
export type UnfollowUserMutationFn = Apollo.MutationFunction<UnfollowUserMutation, UnfollowUserMutationVariables>;

/**
 * __useUnfollowUserMutation__
 *
 * To run a mutation, you first call `useUnfollowUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnfollowUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unfollowUserMutation, { data, loading, error }] = useUnfollowUserMutation({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useUnfollowUserMutation(baseOptions?: Apollo.MutationHookOptions<UnfollowUserMutation, UnfollowUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnfollowUserMutation, UnfollowUserMutationVariables>(UnfollowUserDocument, options);
      }
export type UnfollowUserMutationHookResult = ReturnType<typeof useUnfollowUserMutation>;
export type UnfollowUserMutationResult = Apollo.MutationResult<UnfollowUserMutation>;
export type UnfollowUserMutationOptions = Apollo.BaseMutationOptions<UnfollowUserMutation, UnfollowUserMutationVariables>;
export const CreateCommentDocument = gql`
    mutation CreateComment($documentId: String!, $input: CreateCommentInput!) {
  createComment(documentId: $documentId, input: $input) {
    id
    body
    authorId
    documentId
    createdAt
    updatedAt
  }
}
    `;
export type CreateCommentMutationFn = Apollo.MutationFunction<CreateCommentMutation, CreateCommentMutationVariables>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      documentId: // value for 'documentId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCommentMutation(baseOptions?: Apollo.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, options);
      }
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = Apollo.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<CreateCommentMutation, CreateCommentMutationVariables>;
export const DeleteCommentDocument = gql`
    mutation DeleteComment($input: DeleteCommentInput!) {
  deleteComment(input: $input)
}
    `;
export type DeleteCommentMutationFn = Apollo.MutationFunction<DeleteCommentMutation, DeleteCommentMutationVariables>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteCommentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, options);
      }
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const CreateDocumentDocument = gql`
    mutation CreateDocument($workspaceId: String!, $input: CreateDocumentInput!) {
  createDocument(workspaceId: $workspaceId, input: $input) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;
export type CreateDocumentMutationFn = Apollo.MutationFunction<CreateDocumentMutation, CreateDocumentMutationVariables>;

/**
 * __useCreateDocumentMutation__
 *
 * To run a mutation, you first call `useCreateDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDocumentMutation, { data, loading, error }] = useCreateDocumentMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateDocumentMutation(baseOptions?: Apollo.MutationHookOptions<CreateDocumentMutation, CreateDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDocumentMutation, CreateDocumentMutationVariables>(CreateDocumentDocument, options);
      }
export type CreateDocumentMutationHookResult = ReturnType<typeof useCreateDocumentMutation>;
export type CreateDocumentMutationResult = Apollo.MutationResult<CreateDocumentMutation>;
export type CreateDocumentMutationOptions = Apollo.BaseMutationOptions<CreateDocumentMutation, CreateDocumentMutationVariables>;
export const UpdateDocumentDocument = gql`
    mutation UpdateDocument($workspaceId: String!, $documentId: String!, $input: UpdateDocumentInput!) {
  updateDocument(
    workspaceId: $workspaceId
    documentId: $documentId
    input: $input
  ) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;
export type UpdateDocumentMutationFn = Apollo.MutationFunction<UpdateDocumentMutation, UpdateDocumentMutationVariables>;

/**
 * __useUpdateDocumentMutation__
 *
 * To run a mutation, you first call `useUpdateDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDocumentMutation, { data, loading, error }] = useUpdateDocumentMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      documentId: // value for 'documentId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDocumentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDocumentMutation, UpdateDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDocumentMutation, UpdateDocumentMutationVariables>(UpdateDocumentDocument, options);
      }
export type UpdateDocumentMutationHookResult = ReturnType<typeof useUpdateDocumentMutation>;
export type UpdateDocumentMutationResult = Apollo.MutationResult<UpdateDocumentMutation>;
export type UpdateDocumentMutationOptions = Apollo.BaseMutationOptions<UpdateDocumentMutation, UpdateDocumentMutationVariables>;
export const DeleteDocumentDocument = gql`
    mutation DeleteDocument($input: DeleteDocumentInput!) {
  deleteDocument(input: $input) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;
export type DeleteDocumentMutationFn = Apollo.MutationFunction<DeleteDocumentMutation, DeleteDocumentMutationVariables>;

/**
 * __useDeleteDocumentMutation__
 *
 * To run a mutation, you first call `useDeleteDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDocumentMutation, { data, loading, error }] = useDeleteDocumentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteDocumentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDocumentMutation, DeleteDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDocumentMutation, DeleteDocumentMutationVariables>(DeleteDocumentDocument, options);
      }
export type DeleteDocumentMutationHookResult = ReturnType<typeof useDeleteDocumentMutation>;
export type DeleteDocumentMutationResult = Apollo.MutationResult<DeleteDocumentMutation>;
export type DeleteDocumentMutationOptions = Apollo.BaseMutationOptions<DeleteDocumentMutation, DeleteDocumentMutationVariables>;
export const RestoreDocumentDocument = gql`
    mutation RestoreDocument($input: RestoreDocumentInput!) {
  restoreDocument(input: $input) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;
export type RestoreDocumentMutationFn = Apollo.MutationFunction<RestoreDocumentMutation, RestoreDocumentMutationVariables>;

/**
 * __useRestoreDocumentMutation__
 *
 * To run a mutation, you first call `useRestoreDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRestoreDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [restoreDocumentMutation, { data, loading, error }] = useRestoreDocumentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRestoreDocumentMutation(baseOptions?: Apollo.MutationHookOptions<RestoreDocumentMutation, RestoreDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RestoreDocumentMutation, RestoreDocumentMutationVariables>(RestoreDocumentDocument, options);
      }
export type RestoreDocumentMutationHookResult = ReturnType<typeof useRestoreDocumentMutation>;
export type RestoreDocumentMutationResult = Apollo.MutationResult<RestoreDocumentMutation>;
export type RestoreDocumentMutationOptions = Apollo.BaseMutationOptions<RestoreDocumentMutation, RestoreDocumentMutationVariables>;
export const DuplicateDocumentDocument = gql`
    mutation DuplicateDocument($input: DuplicateDocumentInput!) {
  duplicateDocument(input: $input) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;
export type DuplicateDocumentMutationFn = Apollo.MutationFunction<DuplicateDocumentMutation, DuplicateDocumentMutationVariables>;

/**
 * __useDuplicateDocumentMutation__
 *
 * To run a mutation, you first call `useDuplicateDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDuplicateDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [duplicateDocumentMutation, { data, loading, error }] = useDuplicateDocumentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDuplicateDocumentMutation(baseOptions?: Apollo.MutationHookOptions<DuplicateDocumentMutation, DuplicateDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DuplicateDocumentMutation, DuplicateDocumentMutationVariables>(DuplicateDocumentDocument, options);
      }
export type DuplicateDocumentMutationHookResult = ReturnType<typeof useDuplicateDocumentMutation>;
export type DuplicateDocumentMutationResult = Apollo.MutationResult<DuplicateDocumentMutation>;
export type DuplicateDocumentMutationOptions = Apollo.BaseMutationOptions<DuplicateDocumentMutation, DuplicateDocumentMutationVariables>;
export const PublishDocumentDocument = gql`
    mutation PublishDocument($workspaceId: String!, $documentId: String!) {
  publishDocument(workspaceId: $workspaceId, documentId: $documentId) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;
export type PublishDocumentMutationFn = Apollo.MutationFunction<PublishDocumentMutation, PublishDocumentMutationVariables>;

/**
 * __usePublishDocumentMutation__
 *
 * To run a mutation, you first call `usePublishDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishDocumentMutation, { data, loading, error }] = usePublishDocumentMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      documentId: // value for 'documentId'
 *   },
 * });
 */
export function usePublishDocumentMutation(baseOptions?: Apollo.MutationHookOptions<PublishDocumentMutation, PublishDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishDocumentMutation, PublishDocumentMutationVariables>(PublishDocumentDocument, options);
      }
export type PublishDocumentMutationHookResult = ReturnType<typeof usePublishDocumentMutation>;
export type PublishDocumentMutationResult = Apollo.MutationResult<PublishDocumentMutation>;
export type PublishDocumentMutationOptions = Apollo.BaseMutationOptions<PublishDocumentMutation, PublishDocumentMutationVariables>;
export const AddFavoriteDocumentDocument = gql`
    mutation AddFavoriteDocument($input: FavoriteDocumentInput!) {
  addFavoriteDocument(input: $input) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;
export type AddFavoriteDocumentMutationFn = Apollo.MutationFunction<AddFavoriteDocumentMutation, AddFavoriteDocumentMutationVariables>;

/**
 * __useAddFavoriteDocumentMutation__
 *
 * To run a mutation, you first call `useAddFavoriteDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddFavoriteDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addFavoriteDocumentMutation, { data, loading, error }] = useAddFavoriteDocumentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddFavoriteDocumentMutation(baseOptions?: Apollo.MutationHookOptions<AddFavoriteDocumentMutation, AddFavoriteDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddFavoriteDocumentMutation, AddFavoriteDocumentMutationVariables>(AddFavoriteDocumentDocument, options);
      }
export type AddFavoriteDocumentMutationHookResult = ReturnType<typeof useAddFavoriteDocumentMutation>;
export type AddFavoriteDocumentMutationResult = Apollo.MutationResult<AddFavoriteDocumentMutation>;
export type AddFavoriteDocumentMutationOptions = Apollo.BaseMutationOptions<AddFavoriteDocumentMutation, AddFavoriteDocumentMutationVariables>;
export const RemoveFavoriteDocumentDocument = gql`
    mutation RemoveFavoriteDocument($input: FavoriteDocumentInput!) {
  removeFavoriteDocument(input: $input) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;
export type RemoveFavoriteDocumentMutationFn = Apollo.MutationFunction<RemoveFavoriteDocumentMutation, RemoveFavoriteDocumentMutationVariables>;

/**
 * __useRemoveFavoriteDocumentMutation__
 *
 * To run a mutation, you first call `useRemoveFavoriteDocumentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFavoriteDocumentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFavoriteDocumentMutation, { data, loading, error }] = useRemoveFavoriteDocumentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRemoveFavoriteDocumentMutation(baseOptions?: Apollo.MutationHookOptions<RemoveFavoriteDocumentMutation, RemoveFavoriteDocumentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveFavoriteDocumentMutation, RemoveFavoriteDocumentMutationVariables>(RemoveFavoriteDocumentDocument, options);
      }
export type RemoveFavoriteDocumentMutationHookResult = ReturnType<typeof useRemoveFavoriteDocumentMutation>;
export type RemoveFavoriteDocumentMutationResult = Apollo.MutationResult<RemoveFavoriteDocumentMutation>;
export type RemoveFavoriteDocumentMutationOptions = Apollo.BaseMutationOptions<RemoveFavoriteDocumentMutation, RemoveFavoriteDocumentMutationVariables>;
export const RestartEnvironmentDocument = gql`
    mutation RestartEnvironment($input: RestartEnvironmentInput!) {
  restartEnvironment(input: $input) {
    id
    workspaceId
    status
    resourceVersion
    lastActivityAt
  }
}
    `;
export type RestartEnvironmentMutationFn = Apollo.MutationFunction<RestartEnvironmentMutation, RestartEnvironmentMutationVariables>;

/**
 * __useRestartEnvironmentMutation__
 *
 * To run a mutation, you first call `useRestartEnvironmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRestartEnvironmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [restartEnvironmentMutation, { data, loading, error }] = useRestartEnvironmentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRestartEnvironmentMutation(baseOptions?: Apollo.MutationHookOptions<RestartEnvironmentMutation, RestartEnvironmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RestartEnvironmentMutation, RestartEnvironmentMutationVariables>(RestartEnvironmentDocument, options);
      }
export type RestartEnvironmentMutationHookResult = ReturnType<typeof useRestartEnvironmentMutation>;
export type RestartEnvironmentMutationResult = Apollo.MutationResult<RestartEnvironmentMutation>;
export type RestartEnvironmentMutationOptions = Apollo.BaseMutationOptions<RestartEnvironmentMutation, RestartEnvironmentMutationVariables>;
export const SetEnvironmentVariablesDocument = gql`
    mutation SetEnvironmentVariables($workspaceId: String!, $input: SetEnvironmentVariablesInput!) {
  setEnvironmentVariables(workspaceId: $workspaceId, input: $input) {
    id
    name
    value
    updatedAt
    workspaceId
  }
}
    `;
export type SetEnvironmentVariablesMutationFn = Apollo.MutationFunction<SetEnvironmentVariablesMutation, SetEnvironmentVariablesMutationVariables>;

/**
 * __useSetEnvironmentVariablesMutation__
 *
 * To run a mutation, you first call `useSetEnvironmentVariablesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetEnvironmentVariablesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setEnvironmentVariablesMutation, { data, loading, error }] = useSetEnvironmentVariablesMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSetEnvironmentVariablesMutation(baseOptions?: Apollo.MutationHookOptions<SetEnvironmentVariablesMutation, SetEnvironmentVariablesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetEnvironmentVariablesMutation, SetEnvironmentVariablesMutationVariables>(SetEnvironmentVariablesDocument, options);
      }
export type SetEnvironmentVariablesMutationHookResult = ReturnType<typeof useSetEnvironmentVariablesMutation>;
export type SetEnvironmentVariablesMutationResult = Apollo.MutationResult<SetEnvironmentVariablesMutation>;
export type SetEnvironmentVariablesMutationOptions = Apollo.BaseMutationOptions<SetEnvironmentVariablesMutation, SetEnvironmentVariablesMutationVariables>;
export const DeleteEnvironmentVariableDocument = gql`
    mutation DeleteEnvironmentVariable($workspaceId: String!, $variableId: String!) {
  deleteEnvironmentVariable(workspaceId: $workspaceId, variableId: $variableId)
}
    `;
export type DeleteEnvironmentVariableMutationFn = Apollo.MutationFunction<DeleteEnvironmentVariableMutation, DeleteEnvironmentVariableMutationVariables>;

/**
 * __useDeleteEnvironmentVariableMutation__
 *
 * To run a mutation, you first call `useDeleteEnvironmentVariableMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEnvironmentVariableMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEnvironmentVariableMutation, { data, loading, error }] = useDeleteEnvironmentVariableMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      variableId: // value for 'variableId'
 *   },
 * });
 */
export function useDeleteEnvironmentVariableMutation(baseOptions?: Apollo.MutationHookOptions<DeleteEnvironmentVariableMutation, DeleteEnvironmentVariableMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteEnvironmentVariableMutation, DeleteEnvironmentVariableMutationVariables>(DeleteEnvironmentVariableDocument, options);
      }
export type DeleteEnvironmentVariableMutationHookResult = ReturnType<typeof useDeleteEnvironmentVariableMutation>;
export type DeleteEnvironmentVariableMutationResult = Apollo.MutationResult<DeleteEnvironmentVariableMutation>;
export type DeleteEnvironmentVariableMutationOptions = Apollo.BaseMutationOptions<DeleteEnvironmentVariableMutation, DeleteEnvironmentVariableMutationVariables>;
export const DeleteFileDocument = gql`
    mutation DeleteFile($input: DeleteFileInput!) {
  deleteFile(input: $input)
}
    `;
export type DeleteFileMutationFn = Apollo.MutationFunction<DeleteFileMutation, DeleteFileMutationVariables>;

/**
 * __useDeleteFileMutation__
 *
 * To run a mutation, you first call `useDeleteFileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFileMutation, { data, loading, error }] = useDeleteFileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteFileMutation(baseOptions?: Apollo.MutationHookOptions<DeleteFileMutation, DeleteFileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteFileMutation, DeleteFileMutationVariables>(DeleteFileDocument, options);
      }
export type DeleteFileMutationHookResult = ReturnType<typeof useDeleteFileMutation>;
export type DeleteFileMutationResult = Apollo.MutationResult<DeleteFileMutation>;
export type DeleteFileMutationOptions = Apollo.BaseMutationOptions<DeleteFileMutation, DeleteFileMutationVariables>;
export const CreateWorkspaceDocument = gql`
    mutation CreateWorkspace($name: String!) {
  createWorkspace(name: $name) {
    id
    name
    plan
    source
    useCases
    useContext
    ownerId
    owner {
      id
      username
      email
    }
  }
}
    `;
export type CreateWorkspaceMutationFn = Apollo.MutationFunction<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;

/**
 * __useCreateWorkspaceMutation__
 *
 * To run a mutation, you first call `useCreateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkspaceMutation, { data, loading, error }] = useCreateWorkspaceMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>(CreateWorkspaceDocument, options);
      }
export type CreateWorkspaceMutationHookResult = ReturnType<typeof useCreateWorkspaceMutation>;
export type CreateWorkspaceMutationResult = Apollo.MutationResult<CreateWorkspaceMutation>;
export type CreateWorkspaceMutationOptions = Apollo.BaseMutationOptions<CreateWorkspaceMutation, CreateWorkspaceMutationVariables>;
export const UpdateWorkspaceDocument = gql`
    mutation UpdateWorkspace($workspaceId: String!, $name: String) {
  updateWorkspace(workspaceId: $workspaceId, name: $name) {
    id
    name
    plan
    source
    useCases
    useContext
  }
}
    `;
export type UpdateWorkspaceMutationFn = Apollo.MutationFunction<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;

/**
 * __useUpdateWorkspaceMutation__
 *
 * To run a mutation, you first call `useUpdateWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkspaceMutation, { data, loading, error }] = useUpdateWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>(UpdateWorkspaceDocument, options);
      }
export type UpdateWorkspaceMutationHookResult = ReturnType<typeof useUpdateWorkspaceMutation>;
export type UpdateWorkspaceMutationResult = Apollo.MutationResult<UpdateWorkspaceMutation>;
export type UpdateWorkspaceMutationOptions = Apollo.BaseMutationOptions<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;
export const SwitchWorkspaceDocument = gql`
    mutation SwitchWorkspace($workspaceId: String!) {
  switchWorkspace(workspaceId: $workspaceId)
}
    `;
export type SwitchWorkspaceMutationFn = Apollo.MutationFunction<SwitchWorkspaceMutation, SwitchWorkspaceMutationVariables>;

/**
 * __useSwitchWorkspaceMutation__
 *
 * To run a mutation, you first call `useSwitchWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSwitchWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [switchWorkspaceMutation, { data, loading, error }] = useSwitchWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useSwitchWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<SwitchWorkspaceMutation, SwitchWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SwitchWorkspaceMutation, SwitchWorkspaceMutationVariables>(SwitchWorkspaceDocument, options);
      }
export type SwitchWorkspaceMutationHookResult = ReturnType<typeof useSwitchWorkspaceMutation>;
export type SwitchWorkspaceMutationResult = Apollo.MutationResult<SwitchWorkspaceMutation>;
export type SwitchWorkspaceMutationOptions = Apollo.BaseMutationOptions<SwitchWorkspaceMutation, SwitchWorkspaceMutationVariables>;
export const CurrentUserDocument = gql`
    query CurrentUser {
  currentUser {
    id
    token
    tokenExpires
    user {
      id
      username
      email
      firstName
      lastName
      fullName
      isOnboarded
      avater
      followersCount
      followingCount
      settings {
        statusText
        statusUpdatedAt
        socialLinks
        wallets
      }
    }
    __typename
  }
}
    `;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export const GetProfileDocument = gql`
    query GetProfile($username: String!) {
  profile(username: $username) {
    username
    bio
    image
    following
  }
}
    `;

/**
 * __useGetProfileQuery__
 *
 * To run a query within a React component, call `useGetProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProfileQuery({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useGetProfileQuery(baseOptions: Apollo.QueryHookOptions<GetProfileQuery, GetProfileQueryVariables> & ({ variables: GetProfileQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options);
      }
export function useGetProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProfileQuery, GetProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options);
        }
export function useGetProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProfileQuery, GetProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProfileQuery, GetProfileQueryVariables>(GetProfileDocument, options);
        }
export type GetProfileQueryHookResult = ReturnType<typeof useGetProfileQuery>;
export type GetProfileLazyQueryHookResult = ReturnType<typeof useGetProfileLazyQuery>;
export type GetProfileSuspenseQueryHookResult = ReturnType<typeof useGetProfileSuspenseQuery>;
export type GetProfileQueryResult = Apollo.QueryResult<GetProfileQuery, GetProfileQueryVariables>;
export const GetUserFollowersDocument = gql`
    query GetUserFollowers($userId: String!) {
  getUserFollowers(userId: $userId) {
    id
    username
    email
    firstName
    lastName
    avater
    followersCount
    followingCount
  }
}
    `;

/**
 * __useGetUserFollowersQuery__
 *
 * To run a query within a React component, call `useGetUserFollowersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserFollowersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserFollowersQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserFollowersQuery(baseOptions: Apollo.QueryHookOptions<GetUserFollowersQuery, GetUserFollowersQueryVariables> & ({ variables: GetUserFollowersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserFollowersQuery, GetUserFollowersQueryVariables>(GetUserFollowersDocument, options);
      }
export function useGetUserFollowersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserFollowersQuery, GetUserFollowersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserFollowersQuery, GetUserFollowersQueryVariables>(GetUserFollowersDocument, options);
        }
export function useGetUserFollowersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserFollowersQuery, GetUserFollowersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserFollowersQuery, GetUserFollowersQueryVariables>(GetUserFollowersDocument, options);
        }
export type GetUserFollowersQueryHookResult = ReturnType<typeof useGetUserFollowersQuery>;
export type GetUserFollowersLazyQueryHookResult = ReturnType<typeof useGetUserFollowersLazyQuery>;
export type GetUserFollowersSuspenseQueryHookResult = ReturnType<typeof useGetUserFollowersSuspenseQuery>;
export type GetUserFollowersQueryResult = Apollo.QueryResult<GetUserFollowersQuery, GetUserFollowersQueryVariables>;
export const GetUserFollowingDocument = gql`
    query GetUserFollowing($userId: String!) {
  getUserFollowing(userId: $userId) {
    id
    username
    email
    firstName
    lastName
    avater
    followersCount
    followingCount
  }
}
    `;

/**
 * __useGetUserFollowingQuery__
 *
 * To run a query within a React component, call `useGetUserFollowingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserFollowingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserFollowingQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserFollowingQuery(baseOptions: Apollo.QueryHookOptions<GetUserFollowingQuery, GetUserFollowingQueryVariables> & ({ variables: GetUserFollowingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserFollowingQuery, GetUserFollowingQueryVariables>(GetUserFollowingDocument, options);
      }
export function useGetUserFollowingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserFollowingQuery, GetUserFollowingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserFollowingQuery, GetUserFollowingQueryVariables>(GetUserFollowingDocument, options);
        }
export function useGetUserFollowingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserFollowingQuery, GetUserFollowingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserFollowingQuery, GetUserFollowingQueryVariables>(GetUserFollowingDocument, options);
        }
export type GetUserFollowingQueryHookResult = ReturnType<typeof useGetUserFollowingQuery>;
export type GetUserFollowingLazyQueryHookResult = ReturnType<typeof useGetUserFollowingLazyQuery>;
export type GetUserFollowingSuspenseQueryHookResult = ReturnType<typeof useGetUserFollowingSuspenseQuery>;
export type GetUserFollowingQueryResult = Apollo.QueryResult<GetUserFollowingQuery, GetUserFollowingQueryVariables>;
export const GetCommentsDocument = gql`
    query GetComments($documentId: String!) {
  comments(documentId: $documentId) {
    id
    body
    authorId
    documentId
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetCommentsQuery__
 *
 * To run a query within a React component, call `useGetCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentsQuery({
 *   variables: {
 *      documentId: // value for 'documentId'
 *   },
 * });
 */
export function useGetCommentsQuery(baseOptions: Apollo.QueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables> & ({ variables: GetCommentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
      }
export function useGetCommentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
        }
export function useGetCommentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
        }
export type GetCommentsQueryHookResult = ReturnType<typeof useGetCommentsQuery>;
export type GetCommentsLazyQueryHookResult = ReturnType<typeof useGetCommentsLazyQuery>;
export type GetCommentsSuspenseQueryHookResult = ReturnType<typeof useGetCommentsSuspenseQuery>;
export type GetCommentsQueryResult = Apollo.QueryResult<GetCommentsQuery, GetCommentsQueryVariables>;
export const GetCommentDocument = gql`
    query GetComment($commentId: String!) {
  comment(commentId: $commentId) {
    id
    body
    authorId
    documentId
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetCommentQuery__
 *
 * To run a query within a React component, call `useGetCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *   },
 * });
 */
export function useGetCommentQuery(baseOptions: Apollo.QueryHookOptions<GetCommentQuery, GetCommentQueryVariables> & ({ variables: GetCommentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommentQuery, GetCommentQueryVariables>(GetCommentDocument, options);
      }
export function useGetCommentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommentQuery, GetCommentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommentQuery, GetCommentQueryVariables>(GetCommentDocument, options);
        }
export function useGetCommentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommentQuery, GetCommentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCommentQuery, GetCommentQueryVariables>(GetCommentDocument, options);
        }
export type GetCommentQueryHookResult = ReturnType<typeof useGetCommentQuery>;
export type GetCommentLazyQueryHookResult = ReturnType<typeof useGetCommentLazyQuery>;
export type GetCommentSuspenseQueryHookResult = ReturnType<typeof useGetCommentSuspenseQuery>;
export type GetCommentQueryResult = Apollo.QueryResult<GetCommentQuery, GetCommentQueryVariables>;
export const GetDocumentDocument = gql`
    query GetDocument($workspaceId: String!, $documentId: String!) {
  getDocument(workspaceId: $workspaceId, documentId: $documentId) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;

/**
 * __useGetDocumentQuery__
 *
 * To run a query within a React component, call `useGetDocumentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      documentId: // value for 'documentId'
 *   },
 * });
 */
export function useGetDocumentQuery(baseOptions: Apollo.QueryHookOptions<GetDocumentQuery, GetDocumentQueryVariables> & ({ variables: GetDocumentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDocumentQuery, GetDocumentQueryVariables>(GetDocumentDocument, options);
      }
export function useGetDocumentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDocumentQuery, GetDocumentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDocumentQuery, GetDocumentQueryVariables>(GetDocumentDocument, options);
        }
export function useGetDocumentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDocumentQuery, GetDocumentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDocumentQuery, GetDocumentQueryVariables>(GetDocumentDocument, options);
        }
export type GetDocumentQueryHookResult = ReturnType<typeof useGetDocumentQuery>;
export type GetDocumentLazyQueryHookResult = ReturnType<typeof useGetDocumentLazyQuery>;
export type GetDocumentSuspenseQueryHookResult = ReturnType<typeof useGetDocumentSuspenseQuery>;
export type GetDocumentQueryResult = Apollo.QueryResult<GetDocumentQuery, GetDocumentQueryVariables>;
export const GetEnvironmentDocument = gql`
    query GetEnvironment($workspaceId: String!) {
  environment(workspaceId: $workspaceId) {
    id
    workspaceId
    status
    resourceVersion
    lastActivityAt
  }
}
    `;

/**
 * __useGetEnvironmentQuery__
 *
 * To run a query within a React component, call `useGetEnvironmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEnvironmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEnvironmentQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetEnvironmentQuery(baseOptions: Apollo.QueryHookOptions<GetEnvironmentQuery, GetEnvironmentQueryVariables> & ({ variables: GetEnvironmentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEnvironmentQuery, GetEnvironmentQueryVariables>(GetEnvironmentDocument, options);
      }
export function useGetEnvironmentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEnvironmentQuery, GetEnvironmentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEnvironmentQuery, GetEnvironmentQueryVariables>(GetEnvironmentDocument, options);
        }
export function useGetEnvironmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEnvironmentQuery, GetEnvironmentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEnvironmentQuery, GetEnvironmentQueryVariables>(GetEnvironmentDocument, options);
        }
export type GetEnvironmentQueryHookResult = ReturnType<typeof useGetEnvironmentQuery>;
export type GetEnvironmentLazyQueryHookResult = ReturnType<typeof useGetEnvironmentLazyQuery>;
export type GetEnvironmentSuspenseQueryHookResult = ReturnType<typeof useGetEnvironmentSuspenseQuery>;
export type GetEnvironmentQueryResult = Apollo.QueryResult<GetEnvironmentQuery, GetEnvironmentQueryVariables>;
export const GetEnvironmentStatusDocument = gql`
    query GetEnvironmentStatus($workspaceId: String!) {
  environmentStatus(workspaceId: $workspaceId)
}
    `;

/**
 * __useGetEnvironmentStatusQuery__
 *
 * To run a query within a React component, call `useGetEnvironmentStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEnvironmentStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEnvironmentStatusQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetEnvironmentStatusQuery(baseOptions: Apollo.QueryHookOptions<GetEnvironmentStatusQuery, GetEnvironmentStatusQueryVariables> & ({ variables: GetEnvironmentStatusQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEnvironmentStatusQuery, GetEnvironmentStatusQueryVariables>(GetEnvironmentStatusDocument, options);
      }
export function useGetEnvironmentStatusLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEnvironmentStatusQuery, GetEnvironmentStatusQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEnvironmentStatusQuery, GetEnvironmentStatusQueryVariables>(GetEnvironmentStatusDocument, options);
        }
export function useGetEnvironmentStatusSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEnvironmentStatusQuery, GetEnvironmentStatusQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEnvironmentStatusQuery, GetEnvironmentStatusQueryVariables>(GetEnvironmentStatusDocument, options);
        }
export type GetEnvironmentStatusQueryHookResult = ReturnType<typeof useGetEnvironmentStatusQuery>;
export type GetEnvironmentStatusLazyQueryHookResult = ReturnType<typeof useGetEnvironmentStatusLazyQuery>;
export type GetEnvironmentStatusSuspenseQueryHookResult = ReturnType<typeof useGetEnvironmentStatusSuspenseQuery>;
export type GetEnvironmentStatusQueryResult = Apollo.QueryResult<GetEnvironmentStatusQuery, GetEnvironmentStatusQueryVariables>;
export const GetEnvironmentVariablesDocument = gql`
    query GetEnvironmentVariables($workspaceId: String!) {
  environmentVariables(workspaceId: $workspaceId) {
    id
    name
    value
    updatedAt
    workspaceId
  }
}
    `;

/**
 * __useGetEnvironmentVariablesQuery__
 *
 * To run a query within a React component, call `useGetEnvironmentVariablesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEnvironmentVariablesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEnvironmentVariablesQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetEnvironmentVariablesQuery(baseOptions: Apollo.QueryHookOptions<GetEnvironmentVariablesQuery, GetEnvironmentVariablesQueryVariables> & ({ variables: GetEnvironmentVariablesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEnvironmentVariablesQuery, GetEnvironmentVariablesQueryVariables>(GetEnvironmentVariablesDocument, options);
      }
export function useGetEnvironmentVariablesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEnvironmentVariablesQuery, GetEnvironmentVariablesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEnvironmentVariablesQuery, GetEnvironmentVariablesQueryVariables>(GetEnvironmentVariablesDocument, options);
        }
export function useGetEnvironmentVariablesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEnvironmentVariablesQuery, GetEnvironmentVariablesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEnvironmentVariablesQuery, GetEnvironmentVariablesQueryVariables>(GetEnvironmentVariablesDocument, options);
        }
export type GetEnvironmentVariablesQueryHookResult = ReturnType<typeof useGetEnvironmentVariablesQuery>;
export type GetEnvironmentVariablesLazyQueryHookResult = ReturnType<typeof useGetEnvironmentVariablesLazyQuery>;
export type GetEnvironmentVariablesSuspenseQueryHookResult = ReturnType<typeof useGetEnvironmentVariablesSuspenseQuery>;
export type GetEnvironmentVariablesQueryResult = Apollo.QueryResult<GetEnvironmentVariablesQuery, GetEnvironmentVariablesQueryVariables>;
export const ListFilesDocument = gql`
    query ListFiles($input: ListFilesInput!) {
  listFiles(input: $input) {
    name
    path
    relCwdPath
    size
    isDirectory
    mimeType
  }
}
    `;

/**
 * __useListFilesQuery__
 *
 * To run a query within a React component, call `useListFilesQuery` and pass it any options that fit your needs.
 * When your component renders, `useListFilesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useListFilesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useListFilesQuery(baseOptions: Apollo.QueryHookOptions<ListFilesQuery, ListFilesQueryVariables> & ({ variables: ListFilesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ListFilesQuery, ListFilesQueryVariables>(ListFilesDocument, options);
      }
export function useListFilesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ListFilesQuery, ListFilesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ListFilesQuery, ListFilesQueryVariables>(ListFilesDocument, options);
        }
export function useListFilesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ListFilesQuery, ListFilesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ListFilesQuery, ListFilesQueryVariables>(ListFilesDocument, options);
        }
export type ListFilesQueryHookResult = ReturnType<typeof useListFilesQuery>;
export type ListFilesLazyQueryHookResult = ReturnType<typeof useListFilesLazyQuery>;
export type ListFilesSuspenseQueryHookResult = ReturnType<typeof useListFilesSuspenseQuery>;
export type ListFilesQueryResult = Apollo.QueryResult<ListFilesQuery, ListFilesQueryVariables>;
export const FileExistsDocument = gql`
    query FileExists($workspaceId: String!, $fileName: String!) {
  fileExists(workspaceId: $workspaceId, fileName: $fileName)
}
    `;

/**
 * __useFileExistsQuery__
 *
 * To run a query within a React component, call `useFileExistsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFileExistsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFileExistsQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      fileName: // value for 'fileName'
 *   },
 * });
 */
export function useFileExistsQuery(baseOptions: Apollo.QueryHookOptions<FileExistsQuery, FileExistsQueryVariables> & ({ variables: FileExistsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FileExistsQuery, FileExistsQueryVariables>(FileExistsDocument, options);
      }
export function useFileExistsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FileExistsQuery, FileExistsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FileExistsQuery, FileExistsQueryVariables>(FileExistsDocument, options);
        }
export function useFileExistsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FileExistsQuery, FileExistsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FileExistsQuery, FileExistsQueryVariables>(FileExistsDocument, options);
        }
export type FileExistsQueryHookResult = ReturnType<typeof useFileExistsQuery>;
export type FileExistsLazyQueryHookResult = ReturnType<typeof useFileExistsLazyQuery>;
export type FileExistsSuspenseQueryHookResult = ReturnType<typeof useFileExistsSuspenseQuery>;
export type FileExistsQueryResult = Apollo.QueryResult<FileExistsQuery, FileExistsQueryVariables>;
export const GetUserWorkspaceInfoDocument = gql`
    query GetUserWorkspaceInfo {
  getUserWorkspaceInfo {
    id
    name
    ownerId
    createdAt
    updatedAt
    role
  }
}
    `;

/**
 * __useGetUserWorkspaceInfoQuery__
 *
 * To run a query within a React component, call `useGetUserWorkspaceInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserWorkspaceInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserWorkspaceInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserWorkspaceInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetUserWorkspaceInfoQuery, GetUserWorkspaceInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserWorkspaceInfoQuery, GetUserWorkspaceInfoQueryVariables>(GetUserWorkspaceInfoDocument, options);
      }
export function useGetUserWorkspaceInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserWorkspaceInfoQuery, GetUserWorkspaceInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserWorkspaceInfoQuery, GetUserWorkspaceInfoQueryVariables>(GetUserWorkspaceInfoDocument, options);
        }
export function useGetUserWorkspaceInfoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserWorkspaceInfoQuery, GetUserWorkspaceInfoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserWorkspaceInfoQuery, GetUserWorkspaceInfoQueryVariables>(GetUserWorkspaceInfoDocument, options);
        }
export type GetUserWorkspaceInfoQueryHookResult = ReturnType<typeof useGetUserWorkspaceInfoQuery>;
export type GetUserWorkspaceInfoLazyQueryHookResult = ReturnType<typeof useGetUserWorkspaceInfoLazyQuery>;
export type GetUserWorkspaceInfoSuspenseQueryHookResult = ReturnType<typeof useGetUserWorkspaceInfoSuspenseQuery>;
export type GetUserWorkspaceInfoQueryResult = Apollo.QueryResult<GetUserWorkspaceInfoQuery, GetUserWorkspaceInfoQueryVariables>;
export const GetUserWorkspacesDocument = gql`
    query GetUserWorkspaces {
  getUserWorkspaces {
    id
    name
    plan
    source
    useCases
    useContext
    ownerId
    owner {
      id
      username
      email
      firstName
      lastName
    }
  }
}
    `;

/**
 * __useGetUserWorkspacesQuery__
 *
 * To run a query within a React component, call `useGetUserWorkspacesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserWorkspacesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserWorkspacesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserWorkspacesQuery(baseOptions?: Apollo.QueryHookOptions<GetUserWorkspacesQuery, GetUserWorkspacesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserWorkspacesQuery, GetUserWorkspacesQueryVariables>(GetUserWorkspacesDocument, options);
      }
export function useGetUserWorkspacesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserWorkspacesQuery, GetUserWorkspacesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserWorkspacesQuery, GetUserWorkspacesQueryVariables>(GetUserWorkspacesDocument, options);
        }
export function useGetUserWorkspacesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserWorkspacesQuery, GetUserWorkspacesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserWorkspacesQuery, GetUserWorkspacesQueryVariables>(GetUserWorkspacesDocument, options);
        }
export type GetUserWorkspacesQueryHookResult = ReturnType<typeof useGetUserWorkspacesQuery>;
export type GetUserWorkspacesLazyQueryHookResult = ReturnType<typeof useGetUserWorkspacesLazyQuery>;
export type GetUserWorkspacesSuspenseQueryHookResult = ReturnType<typeof useGetUserWorkspacesSuspenseQuery>;
export type GetUserWorkspacesQueryResult = Apollo.QueryResult<GetUserWorkspacesQuery, GetUserWorkspacesQueryVariables>;
export const GetWorkspaceDocument = gql`
    query GetWorkspace($workspaceId: String!) {
  getWorkspace(workspaceId: $workspaceId) {
    id
    name
    plan
    source
    useCases
    useContext
    ownerId
    owner {
      id
      username
      email
      firstName
      lastName
    }
    users {
      id
      firstName
      lastName
      email
      avater
    }
    documents {
      id
      title
      slug
      authorId
      parentId
    }
  }
}
    `;

/**
 * __useGetWorkspaceQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetWorkspaceQuery(baseOptions: Apollo.QueryHookOptions<GetWorkspaceQuery, GetWorkspaceQueryVariables> & ({ variables: GetWorkspaceQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceQuery, GetWorkspaceQueryVariables>(GetWorkspaceDocument, options);
      }
export function useGetWorkspaceLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceQuery, GetWorkspaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceQuery, GetWorkspaceQueryVariables>(GetWorkspaceDocument, options);
        }
export function useGetWorkspaceSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWorkspaceQuery, GetWorkspaceQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWorkspaceQuery, GetWorkspaceQueryVariables>(GetWorkspaceDocument, options);
        }
export type GetWorkspaceQueryHookResult = ReturnType<typeof useGetWorkspaceQuery>;
export type GetWorkspaceLazyQueryHookResult = ReturnType<typeof useGetWorkspaceLazyQuery>;
export type GetWorkspaceSuspenseQueryHookResult = ReturnType<typeof useGetWorkspaceSuspenseQuery>;
export type GetWorkspaceQueryResult = Apollo.QueryResult<GetWorkspaceQuery, GetWorkspaceQueryVariables>;
export const GetWorkspaceDocumentsDocument = gql`
    query GetWorkspaceDocuments($workspaceId: String!) {
  getWorkspaceDocuments(workspaceId: $workspaceId) {
    id
    title
    slug
    icon
    parentId
    orderIndex
    authorId
    workspaceId
    createdAt
    updatedAt
    deletedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    runSQLSelection
    runUnexecutedBlocks
    shareLinksWithoutSidebar
  }
}
    `;

/**
 * __useGetWorkspaceDocumentsQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceDocumentsQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetWorkspaceDocumentsQuery(baseOptions: Apollo.QueryHookOptions<GetWorkspaceDocumentsQuery, GetWorkspaceDocumentsQueryVariables> & ({ variables: GetWorkspaceDocumentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceDocumentsQuery, GetWorkspaceDocumentsQueryVariables>(GetWorkspaceDocumentsDocument, options);
      }
export function useGetWorkspaceDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceDocumentsQuery, GetWorkspaceDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceDocumentsQuery, GetWorkspaceDocumentsQueryVariables>(GetWorkspaceDocumentsDocument, options);
        }
export function useGetWorkspaceDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWorkspaceDocumentsQuery, GetWorkspaceDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWorkspaceDocumentsQuery, GetWorkspaceDocumentsQueryVariables>(GetWorkspaceDocumentsDocument, options);
        }
export type GetWorkspaceDocumentsQueryHookResult = ReturnType<typeof useGetWorkspaceDocumentsQuery>;
export type GetWorkspaceDocumentsLazyQueryHookResult = ReturnType<typeof useGetWorkspaceDocumentsLazyQuery>;
export type GetWorkspaceDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetWorkspaceDocumentsSuspenseQuery>;
export type GetWorkspaceDocumentsQueryResult = Apollo.QueryResult<GetWorkspaceDocumentsQuery, GetWorkspaceDocumentsQueryVariables>;