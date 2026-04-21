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

export type AuthPayload = {
  __typename?: 'AuthPayload';
  id: Scalars['String']['output'];
  roles?: Maybe<Scalars['JSON']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  user: User;
};

export type Chat = {
  __typename?: 'Chat';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  lastContext?: Maybe<Scalars['JSON']['output']>;
  messages?: Maybe<Array<Message>>;
  private: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
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

export type CreateChatInput = {
  title: Scalars['String']['input'];
};

export type CreateCommentInput = {
  body: Scalars['String']['input'];
  id: Scalars['String']['input'];
};

export type CreateComponentInstanceInput = {
  blockId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
};

export type CreateDocumentInput = {
  orderIndex?: Scalars['Float']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  version: Scalars['Float']['input'];
};

export type CreateReusableComponentInput = {
  blockId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  state: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: ReusableComponentType;
};

export type CreateScheduleInput = {
  cron?: InputMaybe<Scalars['String']['input']>;
  days?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['String']['input'];
  hour?: InputMaybe<Scalars['Float']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  minute?: InputMaybe<Scalars['Float']['input']>;
  timezone: Scalars['String']['input'];
  type: ExecutionScheduleType;
  weekdays?: InputMaybe<Scalars['String']['input']>;
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

export type DeleteScheduleInput = {
  documentId: Scalars['String']['input'];
  scheduleId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type Document = {
  __typename?: 'Document';
  appClock: Scalars['Float']['output'];
  appId: Scalars['String']['output'];
  author?: Maybe<User>;
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

/** The type of execution schedule */
export enum ExecutionScheduleType {
  Cron = 'CRON',
  Daily = 'DAILY',
  Hourly = 'HOURLY',
  Monthly = 'MONTHLY',
  Weekly = 'WEEKLY'
}

export type FavoriteDocumentInput = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type ListFilesInput = {
  path?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};

export type ListSchedulesInput = {
  documentId: Scalars['String']['input'];
};

/** Login input */
export type LoginInput = {
  /** Email address */
  email: Scalars['String']['input'];
  /** Password */
  password: Scalars['String']['input'];
};

export type Message = {
  __typename?: 'Message';
  attachments?: Maybe<Scalars['JSON']['output']>;
  chatId: Scalars['String']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  parts?: Maybe<Scalars['JSON']['output']>;
  role: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Accept workspace invitation with hash from email */
  acceptWorkspaceInvitation: Scalars['Boolean']['output'];
  /** Mark a document as a favorite */
  addFavoriteDocument: Document;
  /** Approve a pending role request */
  approveRoleRequest: Scalars['Boolean']['output'];
  /** Remove multiple users from workspaces */
  batchRemoveUsersFromWorkspace: Scalars['Boolean']['output'];
  /** Create a new chat */
  createChat: Chat;
  /** Create a new comment on a document */
  createComment: Comment;
  /** Create a new reusable component */
  createComponent: ReusableComponent;
  /** Create a component instance */
  createComponentInstance: ReusableComponentInstance;
  /** Create a new document in a workspace */
  createDocument: Document;
  /** Create a new execution schedule for a document */
  createSchedule: Schedule;
  /** Register new user */
  createUser: User;
  /** Create a new workspace */
  createWorkspace: Workspace;
  /** Delete a chat and its messages */
  deleteChat: Scalars['Boolean']['output'];
  /** Delete a comment (only by comment author) */
  deleteComment: Scalars['Boolean']['output'];
  /** Delete a reusable component */
  deleteComponent: Scalars['Boolean']['output'];
  /** Delete a component instance */
  deleteComponentInstance: Scalars['Boolean']['output'];
  /** Soft delete or permanently delete a document */
  deleteDocument: Scalars['Boolean']['output'];
  /** Delete a single environment variable */
  deleteEnvironmentVariable: Scalars['Boolean']['output'];
  /** Delete a file from the workspace */
  deleteFile: Scalars['Boolean']['output'];
  /** Delete a schedule */
  deleteSchedule: Scalars['Boolean']['output'];
  /** Delete a workspace */
  deleteWorkspace: Scalars['Boolean']['output'];
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
  /** Reject a pending role request */
  rejectRoleRequest: Scalars['Boolean']['output'];
  /** Unmark a document as a favorite */
  removeFavoriteDocument: Document;
  /** Remove a user from workspace */
  removeUserFromWorkspace: Scalars['Boolean']['output'];
  /** Request a role upgrade in a workspace */
  requestRoleUpgrade: Scalars['Boolean']['output'];
  /** Restart the Jupyter environment */
  restartEnvironment: Environment;
  /** Restore a previously deleted document */
  restoreDocument: Document;
  /** Add a user message to a chat */
  sendMessage: Message;
  /** Add or remove environment variables */
  setEnvironmentVariables: Array<EnvironmentVariable>;
  setWorkspaceDefaultAiModel: Scalars['Boolean']['output'];
  /** Switch to a different workspace */
  switchWorkspace: Scalars['Boolean']['output'];
  /** Unfollow User */
  unfollowUser: Profile;
  /** Unpublish a document */
  unpublishDocument: Document;
  /** Update chat title or visibility */
  updateChat: Chat;
  /** Update a reusable component */
  updateComponent: ReusableComponent;
  /** Update document metadata */
  updateDocument: Document;
  /** Update an existing schedule */
  updateSchedule: Schedule;
  /** Update social links for the current user */
  updateSocialLinks: Scalars['Boolean']['output'];
  /** Update status text for the current user */
  updateStatusText: Scalars['Boolean']['output'];
  /** Update current user */
  updateUser: User;
  /** Update wallets for the current user */
  updateWallets: Scalars['Boolean']['output'];
  /** Update workspace info */
  updateWorkspace: Workspace;
  /** Update a user role in a workspace */
  updateWorkspaceMemberRole: Scalars['Boolean']['output'];
};


export type MutationAcceptWorkspaceInvitationArgs = {
  hash: Scalars['String']['input'];
};


export type MutationAddFavoriteDocumentArgs = {
  input: FavoriteDocumentInput;
};


export type MutationApproveRoleRequestArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationBatchRemoveUsersFromWorkspaceArgs = {
  removals: Array<RemoveUserFromWorkspaceInput>;
};


export type MutationCreateChatArgs = {
  input: CreateChatInput;
};


export type MutationCreateCommentArgs = {
  documentId: Scalars['String']['input'];
  input: CreateCommentInput;
};


export type MutationCreateComponentArgs = {
  input: CreateReusableComponentInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationCreateComponentInstanceArgs = {
  componentId: Scalars['String']['input'];
  input: CreateComponentInstanceInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationCreateDocumentArgs = {
  input: CreateDocumentInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationCreateScheduleArgs = {
  input: CreateScheduleInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationCreateWorkspaceArgs = {
  name: Scalars['String']['input'];
};


export type MutationDeleteChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationDeleteCommentArgs = {
  input: DeleteCommentInput;
};


export type MutationDeleteComponentArgs = {
  componentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationDeleteComponentInstanceArgs = {
  blockId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
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


export type MutationDeleteScheduleArgs = {
  input: DeleteScheduleInput;
};


export type MutationDeleteWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
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


export type MutationRejectRoleRequestArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationRemoveFavoriteDocumentArgs = {
  input: FavoriteDocumentInput;
};


export type MutationRemoveUserFromWorkspaceArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationRequestRoleUpgradeArgs = {
  role: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationRestartEnvironmentArgs = {
  input: RestartEnvironmentInput;
};


export type MutationRestoreDocumentArgs = {
  input: RestoreDocumentInput;
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationSetEnvironmentVariablesArgs = {
  input: SetEnvironmentVariablesInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationSetWorkspaceDefaultAiModelArgs = {
  model: Scalars['String']['input'];
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


export type MutationUpdateChatArgs = {
  input: UpdateChatInput;
};


export type MutationUpdateComponentArgs = {
  componentId: Scalars['String']['input'];
  input: UpdateReusableComponentInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationUpdateDocumentArgs = {
  documentId: Scalars['String']['input'];
  input: UpdateDocumentInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationUpdateScheduleArgs = {
  input: UpdateScheduleInput;
  scheduleId: Scalars['String']['input'];
};


export type MutationUpdateSocialLinksArgs = {
  input: SocialLinksInput;
};


export type MutationUpdateStatusTextArgs = {
  statusText: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateWalletsArgs = {
  wallets: Array<WalletInput>;
};


export type MutationUpdateWorkspaceArgs = {
  icon?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};


export type MutationUpdateWorkspaceMemberRoleArgs = {
  role: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type OpenRouterAccountCredits = {
  __typename?: 'OpenRouterAccountCredits';
  availableCredits: Scalars['Float']['output'];
  totalCredits: Scalars['Float']['output'];
  usedCredits: Scalars['Float']['output'];
};

export type OpenRouterModel = {
  __typename?: 'OpenRouterModel';
  details: Scalars['JSON']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Profile = {
  __typename?: 'Profile';
  bio: Scalars['String']['output'];
  following: Scalars['Boolean']['output'];
  image: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Get a chat with its messages */
  chat: Chat;
  /** Get messages for a chat */
  chatMessages: Array<Message>;
  /** List all chats for the current user */
  chats: Array<Chat>;
  /** Get a single comment by ID */
  comment: Comment;
  /** Get all comments for a document */
  comments: Array<Comment>;
  /** Get current system info */
  currentSysInfo: Scalars['JSON']['output'];
  /** Get current user (from token) */
  currentUser: AuthPayload;
  /** Get environment details for a workspace */
  environment: Environment;
  /** Get current environment status */
  environmentStatus: EnvironmentStatus;
  /** Get all environment variables (values are masked) */
  environmentVariables: Array<EnvironmentVariable>;
  /** Get User favorite public documents */
  favoritePublicDocuments: Array<Document>;
  /** Check if a file exists */
  fileExists: Scalars['Boolean']['output'];
  /** Get all workspaces the current user is an admin of, with their members */
  getAdminWorkspacesWithMembers: Array<WorkspaceMember>;
  /** Get a reusable component by ID */
  getComponent: ReusableComponent;
  /** Get a single document by ID */
  getDocument: Document;
  /** Get documents in a workspace organized as a tree for explorer view */
  getExplorerDocuments: Array<Document>;
  /** Get User favorite documents */
  getFavoriteDocuments: Array<Document>;
  /** Get featured documents for explore page */
  getFeaturedDocuments: Array<Document>;
  /** Get User forked documents */
  getForkedDocuments: Array<Document>;
  /** Get invitation details from hash without accepting it */
  getInvitationInfo: WorkspaceInvitationInfo;
  /** Get all pending invites for a workspace */
  getPendingInvites: Array<WorkspaceMember>;
  /** Get pending role requests for a workspace */
  getPendingRoleRequests: Array<WorkspaceMember>;
  /** Get trending published documents across all workspaces */
  getTrendingPublishedDocuments: Array<Document>;
  /** Get user by id */
  getUser: User;
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
  /** Get all reusable components in a workspace */
  getWorkspaceComponents: Array<ReusableComponent>;
  /** Get all documents in a workspace */
  getWorkspaceDocuments: Array<Document>;
  /** Get workspace members */
  getWorkspaceMembers: Array<WorkspaceMember>;
  /** List all files in a workspace */
  listFiles: Array<SandwormFile>;
  /** Get OpenRouter account credit usage */
  openRouterAccountCredits: OpenRouterAccountCredits;
  /** Get a specific OpenRouter model by ID */
  openRouterModel?: Maybe<OpenRouterModel>;
  /** List all available OpenRouter models */
  openRouterModels: Array<OpenRouterModel>;
  /** Get Profile */
  profile: Profile;
  /** Get a single schedule by ID */
  schedule: Schedule;
  /** Get all schedules for a document */
  schedules: Array<Schedule>;
  tags: Array<Scalars['String']['output']>;
};


export type QueryChatArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryChatMessagesArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryCommentArgs = {
  commentId: Scalars['String']['input'];
};


export type QueryCommentsArgs = {
  documentId: Scalars['String']['input'];
};


export type QueryCurrentSysInfoArgs = {
  sessionId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
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


export type QueryGetComponentArgs = {
  componentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type QueryGetDocumentArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type QueryGetExplorerDocumentsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryGetFavoriteDocumentsArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetFeaturedDocumentsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryGetInvitationInfoArgs = {
  hash: Scalars['String']['input'];
};


export type QueryGetPendingInvitesArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetPendingRoleRequestsArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetTrendingPublishedDocumentsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryGetUserArgs = {
  userId: Scalars['String']['input'];
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


export type QueryGetWorkspaceComponentsArgs = {
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


export type QueryOpenRouterAccountCreditsArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryOpenRouterModelArgs = {
  modelId: Scalars['String']['input'];
};


export type QueryProfileArgs = {
  username: Scalars['String']['input'];
};


export type QueryScheduleArgs = {
  scheduleId: Scalars['String']['input'];
};


export type QuerySchedulesArgs = {
  input: ListSchedulesInput;
};

export type RemoveUserFromWorkspaceInput = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type RestartEnvironmentInput = {
  workspaceId: Scalars['String']['input'];
};

export type RestoreDocumentInput = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type ReusableComponent = {
  __typename?: 'ReusableComponent';
  blockId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  instances: Array<ReusableComponentInstance>;
  instancesCreated: Scalars['Boolean']['output'];
  state: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: ReusableComponentType;
  updatedAt: Scalars['DateTime']['output'];
};

export type ReusableComponentInstance = {
  __typename?: 'ReusableComponentInstance';
  blockId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  reusableComponentId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum ReusableComponentType {
  Python = 'PYTHON',
  Sql = 'SQL'
}

export type SandwormFile = {
  __typename?: 'SandwormFile';
  createdAt: Scalars['Float']['output'];
  isDirectory: Scalars['Boolean']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  relCwdPath: Scalars['String']['output'];
  size: Scalars['Float']['output'];
};

export type Schedule = {
  __typename?: 'Schedule';
  cron?: Maybe<Scalars['String']['output']>;
  days?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['String']['output'];
  hour?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  lastExecutedAt?: Maybe<Scalars['DateTime']['output']>;
  minute?: Maybe<Scalars['Float']['output']>;
  nextExecutionAt?: Maybe<Scalars['DateTime']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  type: ExecutionScheduleType;
  weekdays?: Maybe<Scalars['String']['output']>;
};

export type SendMessageInput = {
  chatId: Scalars['String']['input'];
  content: Scalars['String']['input'];
};

export type SetEnvironmentVariablesInput = {
  add: Array<EnvironmentVariableInput>;
  remove: Array<Scalars['String']['input']>;
};

export type SocialLinksInput = {
  discord?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  github?: InputMaybe<Scalars['String']['input']>;
  telegram?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  warpcast?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateChatInput = {
  chatId: Scalars['String']['input'];
  private?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDocumentInput = {
  orderIndex: Scalars['Float']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  runSQLSelection?: InputMaybe<Scalars['Boolean']['input']>;
  runUnexecutedBlocks?: InputMaybe<Scalars['Boolean']['input']>;
  shareLinksWithoutSidebar?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateReusableComponentInput = {
  state?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateScheduleInput = {
  cron?: InputMaybe<Scalars['String']['input']>;
  days?: InputMaybe<Scalars['String']['input']>;
  hour?: InputMaybe<Scalars['Float']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  minute?: InputMaybe<Scalars['Float']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<ExecutionScheduleType>;
  weekdays?: InputMaybe<Scalars['String']['input']>;
};

/** User update request */
export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  avater?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
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

export type WalletInput = {
  address: Scalars['String']['input'];
  chain: Scalars['String']['input'];
};

export type Workspace = {
  __typename?: 'Workspace';
  assistantModel: Scalars['String']['output'];
  documents: Array<Document>;
  icon?: Maybe<Scalars['String']['output']>;
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
  icon: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  ownerId: Scalars['String']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type WorkspaceInvitationInfo = {
  __typename?: 'WorkspaceInvitationInfo';
  /** The user being invited */
  invitedUser: User;
  /** The user who sent the invitation */
  inviter: User;
  /** The role the user will have in the workspace */
  role: Scalars['String']['output'];
  /** The workspace being invited to */
  workspace: Workspace;
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  requestedRole?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
  workspaceId?: Maybe<Scalars['String']['output']>;
  workspaceName?: Maybe<Scalars['String']['output']>;
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
  hasAiModelApiKey: Scalars['Boolean']['output'];
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, email?: string | null, username?: string | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, isOnboarded: boolean } };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, email?: string | null, username?: string | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, avater?: string | null, isOnboarded: boolean } };

export type UpdateSocialLinksMutationVariables = Exact<{
  input: SocialLinksInput;
}>;


export type UpdateSocialLinksMutation = { __typename?: 'Mutation', updateSocialLinks: boolean };

export type UpdateWalletsMutationVariables = Exact<{
  wallets: Array<WalletInput> | WalletInput;
}>;


export type UpdateWalletsMutation = { __typename?: 'Mutation', updateWallets: boolean };

export type UpdateStatusTextMutationVariables = Exact<{
  statusText: Scalars['String']['input'];
}>;


export type UpdateStatusTextMutation = { __typename?: 'Mutation', updateStatusText: boolean };

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


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'Comment', id: string, documentId: string, authorId: string, body: string, createdAt: any, updatedAt: any } };

export type DeleteCommentMutationVariables = Exact<{
  input: DeleteCommentInput;
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment: boolean };

export type CreateComponentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  input: CreateReusableComponentInput;
}>;


export type CreateComponentMutation = { __typename?: 'Mutation', createComponent: { __typename?: 'ReusableComponent', id: string, blockId: string, documentId: string, title: string, type: ReusableComponentType, state: string, instancesCreated: boolean, createdAt: any, updatedAt: any, instances: Array<{ __typename?: 'ReusableComponentInstance', id: string, blockId: string, documentId: string, reusableComponentId: string, createdAt: any, updatedAt: any }> } };

export type UpdateComponentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  input: UpdateReusableComponentInput;
}>;


export type UpdateComponentMutation = { __typename?: 'Mutation', updateComponent: { __typename?: 'ReusableComponent', id: string, blockId: string, documentId: string, title: string, type: ReusableComponentType, state: string, instancesCreated: boolean, createdAt: any, updatedAt: any, instances: Array<{ __typename?: 'ReusableComponentInstance', id: string, blockId: string, documentId: string, reusableComponentId: string, createdAt: any, updatedAt: any }> } };

export type DeleteComponentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type DeleteComponentMutation = { __typename?: 'Mutation', deleteComponent: boolean };

export type CreateComponentInstanceMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  input: CreateComponentInstanceInput;
}>;


export type CreateComponentInstanceMutation = { __typename?: 'Mutation', createComponentInstance: { __typename?: 'ReusableComponentInstance', id: string, blockId: string, documentId: string, reusableComponentId: string, createdAt: any, updatedAt: any } };

export type DeleteComponentInstanceMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
  blockId: Scalars['String']['input'];
}>;


export type DeleteComponentInstanceMutation = { __typename?: 'Mutation', deleteComponentInstance: boolean };

export type CreateDocumentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  input: CreateDocumentInput;
}>;


export type CreateDocumentMutation = { __typename?: 'Mutation', createDocument: { __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type UpdateDocumentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  input: UpdateDocumentInput;
}>;


export type UpdateDocumentMutation = { __typename?: 'Mutation', updateDocument: { __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type DeleteDocumentMutationVariables = Exact<{
  input: DeleteDocumentInput;
}>;


export type DeleteDocumentMutation = { __typename?: 'Mutation', deleteDocument: boolean };

export type RestoreDocumentMutationVariables = Exact<{
  input: RestoreDocumentInput;
}>;


export type RestoreDocumentMutation = { __typename?: 'Mutation', restoreDocument: { __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type DuplicateDocumentMutationVariables = Exact<{
  input: DuplicateDocumentInput;
}>;


export type DuplicateDocumentMutation = { __typename?: 'Mutation', duplicateDocument: { __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type PublishDocumentMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
}>;


export type PublishDocumentMutation = { __typename?: 'Mutation', publishDocument: { __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type AddFavoriteDocumentMutationVariables = Exact<{
  input: FavoriteDocumentInput;
}>;


export type AddFavoriteDocumentMutation = { __typename?: 'Mutation', addFavoriteDocument: { __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type RemoveFavoriteDocumentMutationVariables = Exact<{
  input: FavoriteDocumentInput;
}>;


export type RemoveFavoriteDocumentMutation = { __typename?: 'Mutation', removeFavoriteDocument: { __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type GetExplorerDocumentsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetExplorerDocumentsQuery = { __typename?: 'Query', getExplorerDocuments: Array<{ __typename?: 'Document', id: string, slug: string, title: string, authorId: string, workspaceId: string, parentId?: string | null, runUnexecutedBlocks: boolean, runSQLSelection: boolean, shareLinksWithoutSidebar: boolean, orderIndex: number, deletedAt?: any | null, createdAt: any, updatedAt: any, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, children: Array<{ __typename?: 'Document', id: string, slug: string, title: string, icon: string, orderIndex: number }>, parent?: { __typename?: 'Document', id: string, slug: string, title: string, icon: string } | null, author?: { __typename?: 'User', username?: string | null, firstName?: string | null, lastName?: string | null, avater?: string | null } | null }> };

export type GetFeaturedDocumentsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetFeaturedDocumentsQuery = { __typename?: 'Query', getFeaturedDocuments: Array<{ __typename?: 'Document', id: string, slug: string, title: string, authorId: string, workspaceId: string, parentId?: string | null, runUnexecutedBlocks: boolean, runSQLSelection: boolean, shareLinksWithoutSidebar: boolean, orderIndex: number, deletedAt?: any | null, createdAt: any, updatedAt: any, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, children: Array<{ __typename?: 'Document', id: string, slug: string, title: string, icon: string, orderIndex: number, createdAt: any, updatedAt: any }>, author?: { __typename?: 'User', username?: string | null, firstName?: string | null, lastName?: string | null, avater?: string | null } | null, parent?: { __typename?: 'Document', id: string, slug: string, title: string, icon: string } | null }> };

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

export type SetWorkspaceDefaultAiModelMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  model: Scalars['String']['input'];
}>;


export type SetWorkspaceDefaultAiModelMutation = { __typename?: 'Mutation', setWorkspaceDefaultAiModel: boolean };

export type CreateScheduleMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  input: CreateScheduleInput;
}>;


export type CreateScheduleMutation = { __typename?: 'Mutation', createSchedule: { __typename?: 'Schedule', id: string, type: ExecutionScheduleType, hour?: number | null, minute?: number | null, cron?: string | null, weekdays?: string | null, days?: string | null, timezone?: string | null, isActive: boolean, lastExecutedAt?: any | null, nextExecutionAt?: any | null, documentId: string } };

export type DeleteScheduleMutationVariables = Exact<{
  input: DeleteScheduleInput;
}>;


export type DeleteScheduleMutation = { __typename?: 'Mutation', deleteSchedule: boolean };

export type CreateWorkspaceMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateWorkspaceMutation = { __typename?: 'Mutation', createWorkspace: { __typename?: 'Workspace', id: string, name: string, plan: WorkspacePlan, source?: string | null, useCases: Array<string>, useContext?: string | null, ownerId: string, owner: { __typename?: 'User', id: string, username?: string | null, email?: string | null } } };

export type UpdateWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateWorkspaceMutation = { __typename?: 'Mutation', updateWorkspace: { __typename?: 'Workspace', id: string, name: string, icon?: string | null, plan: WorkspacePlan, source?: string | null, useCases: Array<string>, useContext?: string | null } };

export type DeleteWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type DeleteWorkspaceMutation = { __typename?: 'Mutation', deleteWorkspace: boolean };

export type SwitchWorkspaceMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type SwitchWorkspaceMutation = { __typename?: 'Mutation', switchWorkspace: boolean };

export type InviteUserToWorkspaceMutationVariables = Exact<{
  email: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
}>;


export type InviteUserToWorkspaceMutation = { __typename?: 'Mutation', inviteUserToWorkspace: boolean };

export type AcceptWorkspaceInvitationMutationVariables = Exact<{
  hash: Scalars['String']['input'];
}>;


export type AcceptWorkspaceInvitationMutation = { __typename?: 'Mutation', acceptWorkspaceInvitation: boolean };

export type UpdateWorkspaceMemberRoleMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  role: Scalars['String']['input'];
}>;


export type UpdateWorkspaceMemberRoleMutation = { __typename?: 'Mutation', updateWorkspaceMemberRole: boolean };

export type RemoveUserFromWorkspaceMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
}>;


export type RemoveUserFromWorkspaceMutation = { __typename?: 'Mutation', removeUserFromWorkspace: boolean };

export type BatchRemoveUsersFromWorkspaceMutationVariables = Exact<{
  removals: Array<RemoveUserFromWorkspaceInput> | RemoveUserFromWorkspaceInput;
}>;


export type BatchRemoveUsersFromWorkspaceMutation = { __typename?: 'Mutation', batchRemoveUsersFromWorkspace: boolean };

export type RequestRoleUpgradeMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  role: Scalars['String']['input'];
}>;


export type RequestRoleUpgradeMutation = { __typename?: 'Mutation', requestRoleUpgrade: boolean };

export type ApproveRoleRequestMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type ApproveRoleRequestMutation = { __typename?: 'Mutation', approveRoleRequest: boolean };

export type RejectRoleRequestMutationVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
}>;


export type RejectRoleRequestMutation = { __typename?: 'Mutation', rejectRoleRequest: boolean };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser: { __typename: 'AuthPayload', id: string, token?: string | null, roles?: any | null, user: { __typename?: 'User', id: string, username?: string | null, email?: string | null, createdAt?: any | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, isOnboarded: boolean, avater?: string | null, followersCount: number, followingCount: number, settings?: { __typename?: 'UserSetting', id: string, userId: string, statusText?: string | null, statusUpdatedAt?: any | null, socialLinks?: any | null, wallets: Array<any> } | null } } };

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

export type GetCommentQueryVariables = Exact<{
  commentId: Scalars['String']['input'];
}>;


export type GetCommentQuery = { __typename?: 'Query', comment: { __typename?: 'Comment', id: string, documentId: string, authorId: string, body: string, createdAt: any, updatedAt: any } };

export type GetDocumentCommentsQueryVariables = Exact<{
  documentId: Scalars['String']['input'];
}>;


export type GetDocumentCommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: string, documentId: string, authorId: string, body: string, createdAt: any, updatedAt: any }> };

export type GetComponentQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  componentId: Scalars['String']['input'];
}>;


export type GetComponentQuery = { __typename?: 'Query', getComponent: { __typename?: 'ReusableComponent', id: string, blockId: string, documentId: string, title: string, type: ReusableComponentType, state: string, instancesCreated: boolean, createdAt: any, updatedAt: any, instances: Array<{ __typename?: 'ReusableComponentInstance', id: string, blockId: string, documentId: string, reusableComponentId: string, createdAt: any, updatedAt: any }> } };

export type GetWorkspaceComponentsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetWorkspaceComponentsQuery = { __typename?: 'Query', getWorkspaceComponents: Array<{ __typename?: 'ReusableComponent', id: string, blockId: string, documentId: string, title: string, type: ReusableComponentType, state: string, instancesCreated: boolean, createdAt: any, updatedAt: any, instances: Array<{ __typename?: 'ReusableComponentInstance', id: string, blockId: string, documentId: string, reusableComponentId: string, createdAt: any, updatedAt: any }> }> };

export type GetDocumentQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
}>;


export type GetDocumentQuery = { __typename?: 'Query', getDocument: { __typename?: 'Document', id: string, title: string, slug: string, icon: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean } };

export type GetFavoriteDocumentsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetFavoriteDocumentsQuery = { __typename?: 'Query', getFavoriteDocuments: Array<{ __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean }> };

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


export type ListFilesQuery = { __typename?: 'Query', listFiles: Array<{ __typename?: 'SandwormFile', name: string, path: string, relCwdPath: string, size: number, isDirectory: boolean, mimeType?: string | null, createdAt: number }> };

export type FileExistsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
}>;


export type FileExistsQuery = { __typename?: 'Query', fileExists: boolean };

export type GetOpenRouterModelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOpenRouterModelsQuery = { __typename?: 'Query', openRouterModels: Array<{ __typename?: 'OpenRouterModel', id: string, name: string, details: any }> };

export type GetOpenRouterModelQueryVariables = Exact<{
  modelId: Scalars['String']['input'];
}>;


export type GetOpenRouterModelQuery = { __typename?: 'Query', openRouterModel?: { __typename?: 'OpenRouterModel', id: string, name: string, details: any } | null };

export type GetOpenRouterAccountCreditsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetOpenRouterAccountCreditsQuery = { __typename?: 'Query', openRouterAccountCredits: { __typename?: 'OpenRouterAccountCredits', totalCredits: number, usedCredits: number, availableCredits: number } };

export type GetSchedulesQueryVariables = Exact<{
  input: ListSchedulesInput;
}>;


export type GetSchedulesQuery = { __typename?: 'Query', schedules: Array<{ __typename?: 'Schedule', id: string, type: ExecutionScheduleType, hour?: number | null, minute?: number | null, cron?: string | null, weekdays?: string | null, days?: string | null, timezone?: string | null, isActive: boolean, lastExecutedAt?: any | null, nextExecutionAt?: any | null, documentId: string }> };

export type GetScheduleQueryVariables = Exact<{
  scheduleId: Scalars['String']['input'];
}>;


export type GetScheduleQuery = { __typename?: 'Query', schedule: { __typename?: 'Schedule', id: string, documentId: string, cron?: string | null, type: ExecutionScheduleType, isActive: boolean, hour?: number | null, minute?: number | null, timezone?: string | null, days?: string | null, weekdays?: string | null, lastExecutedAt?: any | null, nextExecutionAt?: any | null } };

export type GetUserQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', getUser: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, isOnboarded: boolean, avater?: string | null, createdAt?: any | null, followersCount: number, followingCount: number, settings?: { __typename?: 'UserSetting', id: string, userId: string, socialLinks?: any | null, statusText?: string | null, statusUpdatedAt?: any | null, wallets: Array<any> } | null, followers: Array<{ __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, avater?: string | null }>, following: Array<{ __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null, fullName?: string | null, avater?: string | null }> } };

export type GetUserFavoritePublicDocumentsQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetUserFavoritePublicDocumentsQuery = { __typename?: 'Query', favoritePublicDocuments: Array<{ __typename?: 'Document', id: string, slug: string, title: string, authorId: string, workspaceId: string, parentId?: string | null, runUnexecutedBlocks: boolean, runSQLSelection: boolean, shareLinksWithoutSidebar: boolean, icon: string, orderIndex: number, deletedAt?: any | null, createdAt: any, updatedAt: any, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, children: Array<{ __typename?: 'Document', id: string, slug: string, title: string, authorId: string, icon: string, orderIndex: number, createdAt: any, updatedAt: any }>, parent?: { __typename?: 'Document', id: string, slug: string, title: string, authorId: string, icon: string } | null }> };

export type GetForkedDocumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetForkedDocumentsQuery = { __typename?: 'Query', getForkedDocuments: Array<{ __typename?: 'Document', id: string, slug: string, title: string, authorId: string, workspaceId: string, parentId?: string | null, runUnexecutedBlocks: boolean, runSQLSelection: boolean, shareLinksWithoutSidebar: boolean, icon: string, orderIndex: number, deletedAt?: any | null, createdAt: any, updatedAt: any, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, children: Array<{ __typename?: 'Document', id: string, slug: string, title: string, icon: string, orderIndex: number, createdAt: any, updatedAt: any }>, parent?: { __typename?: 'Document', id: string, slug: string, title: string, icon: string } | null }> };

export type GetTrendingPublishedDocumentsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetTrendingPublishedDocumentsQuery = { __typename?: 'Query', getTrendingPublishedDocuments: Array<{ __typename?: 'Document', id: string, slug: string, title: string, authorId: string, workspaceId: string, parentId?: string | null, runUnexecutedBlocks: boolean, runSQLSelection: boolean, shareLinksWithoutSidebar: boolean, icon: string, orderIndex: number, deletedAt?: any | null, createdAt: any, updatedAt: any, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, children: Array<{ __typename?: 'Document', id: string, slug: string, title: string, icon: string, orderIndex: number }>, parent?: { __typename?: 'Document', id: string, slug: string, title: string, icon: string } | null }> };

export type GetUserWorkspaceInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserWorkspaceInfoQuery = { __typename?: 'Query', getUserWorkspaceInfo: { __typename?: 'WorkspaceInfo', id: string, name: string, ownerId: string, createdAt: any, updatedAt: any, role: string, icon: string } };

export type GetUserWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserWorkspacesQuery = { __typename?: 'Query', getUserWorkspaces: Array<{ __typename?: 'Workspace', id: string, name: string, plan: WorkspacePlan, icon?: string | null, source?: string | null, useCases: Array<string>, useContext?: string | null, ownerId: string, assistantModel: string, owner: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null }, users: Array<{ __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null }>, secrets: { __typename?: 'WorkspaceSecrets', hasAiModelApiKey: boolean } }> };

export type GetWorkspaceWithMembersQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetWorkspaceWithMembersQuery = { __typename?: 'Query', getWorkspace: { __typename?: 'Workspace', id: string, name: string, plan: WorkspacePlan, icon?: string | null, source?: string | null, ownerId: string }, getWorkspaceMembers: Array<{ __typename?: 'WorkspaceMember', role: string, userId: string, user?: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null } | null }> };

export type GetAdminWorkspacesWithMembersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAdminWorkspacesWithMembersQuery = { __typename?: 'Query', getAdminWorkspacesWithMembers: Array<{ __typename?: 'WorkspaceMember', userId: string, role: string, requestedRole?: string | null, workspaceName?: string | null, workspaceId?: string | null, user?: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null } | null }> };

export type GetWorkspaceQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetWorkspaceQuery = { __typename?: 'Query', getWorkspace: { __typename?: 'Workspace', id: string, name: string, plan: WorkspacePlan, source?: string | null, useCases: Array<string>, useContext?: string | null, ownerId: string, icon?: string | null, assistantModel: string, owner: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null }, users: Array<{ __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null, avater?: string | null }>, documents: Array<{ __typename?: 'Document', id: string, title: string, slug: string, authorId: string, parentId?: string | null }> } };

export type GetWorkspaceDocumentsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetWorkspaceDocumentsQuery = { __typename?: 'Query', getWorkspaceDocuments: Array<{ __typename?: 'Document', id: string, title: string, slug: string, parentId?: string | null, orderIndex: number, authorId: string, workspaceId: string, createdAt: any, updatedAt: any, deletedAt?: any | null, version: number, publishedAt?: any | null, isDataApp: boolean, isSyncedWithYjs: boolean, hasDashboard: boolean, appId: string, clock: number, appClock: number, userAppClock: any, runSQLSelection: boolean, runUnexecutedBlocks: boolean, shareLinksWithoutSidebar: boolean }> };

export type GetInvitationInfoQueryVariables = Exact<{
  hash: Scalars['String']['input'];
}>;


export type GetInvitationInfoQuery = { __typename?: 'Query', getInvitationInfo: { __typename?: 'WorkspaceInvitationInfo', role: string, invitedUser: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, inviter: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null, email?: string | null }, workspace: { __typename?: 'Workspace', id: string, name: string, owner: { __typename?: 'User', id: string, firstName?: string | null, lastName?: string | null } } } };

export type GetPendingRoleRequestsQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetPendingRoleRequestsQuery = { __typename?: 'Query', getPendingRoleRequests: Array<{ __typename?: 'WorkspaceMember', userId: string, role: string, requestedRole?: string | null, user?: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null } | null }> };

export type GetPendingInvitesQueryVariables = Exact<{
  workspaceId: Scalars['String']['input'];
}>;


export type GetPendingInvitesQuery = { __typename?: 'Query', getPendingInvites: Array<{ __typename?: 'WorkspaceMember', userId: string, role: string, requestedRole?: string | null, user?: { __typename?: 'User', id: string, username?: string | null, email?: string | null, firstName?: string | null, lastName?: string | null } | null }> };


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
export const UpdateSocialLinksDocument = gql`
    mutation UpdateSocialLinks($input: SocialLinksInput!) {
  updateSocialLinks(input: $input)
}
    `;
export type UpdateSocialLinksMutationFn = Apollo.MutationFunction<UpdateSocialLinksMutation, UpdateSocialLinksMutationVariables>;

/**
 * __useUpdateSocialLinksMutation__
 *
 * To run a mutation, you first call `useUpdateSocialLinksMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSocialLinksMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSocialLinksMutation, { data, loading, error }] = useUpdateSocialLinksMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSocialLinksMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSocialLinksMutation, UpdateSocialLinksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSocialLinksMutation, UpdateSocialLinksMutationVariables>(UpdateSocialLinksDocument, options);
      }
export type UpdateSocialLinksMutationHookResult = ReturnType<typeof useUpdateSocialLinksMutation>;
export type UpdateSocialLinksMutationResult = Apollo.MutationResult<UpdateSocialLinksMutation>;
export type UpdateSocialLinksMutationOptions = Apollo.BaseMutationOptions<UpdateSocialLinksMutation, UpdateSocialLinksMutationVariables>;
export const UpdateWalletsDocument = gql`
    mutation UpdateWallets($wallets: [WalletInput!]!) {
  updateWallets(wallets: $wallets)
}
    `;
export type UpdateWalletsMutationFn = Apollo.MutationFunction<UpdateWalletsMutation, UpdateWalletsMutationVariables>;

/**
 * __useUpdateWalletsMutation__
 *
 * To run a mutation, you first call `useUpdateWalletsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWalletsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWalletsMutation, { data, loading, error }] = useUpdateWalletsMutation({
 *   variables: {
 *      wallets: // value for 'wallets'
 *   },
 * });
 */
export function useUpdateWalletsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWalletsMutation, UpdateWalletsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWalletsMutation, UpdateWalletsMutationVariables>(UpdateWalletsDocument, options);
      }
export type UpdateWalletsMutationHookResult = ReturnType<typeof useUpdateWalletsMutation>;
export type UpdateWalletsMutationResult = Apollo.MutationResult<UpdateWalletsMutation>;
export type UpdateWalletsMutationOptions = Apollo.BaseMutationOptions<UpdateWalletsMutation, UpdateWalletsMutationVariables>;
export const UpdateStatusTextDocument = gql`
    mutation UpdateStatusText($statusText: String!) {
  updateStatusText(statusText: $statusText)
}
    `;
export type UpdateStatusTextMutationFn = Apollo.MutationFunction<UpdateStatusTextMutation, UpdateStatusTextMutationVariables>;

/**
 * __useUpdateStatusTextMutation__
 *
 * To run a mutation, you first call `useUpdateStatusTextMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateStatusTextMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateStatusTextMutation, { data, loading, error }] = useUpdateStatusTextMutation({
 *   variables: {
 *      statusText: // value for 'statusText'
 *   },
 * });
 */
export function useUpdateStatusTextMutation(baseOptions?: Apollo.MutationHookOptions<UpdateStatusTextMutation, UpdateStatusTextMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateStatusTextMutation, UpdateStatusTextMutationVariables>(UpdateStatusTextDocument, options);
      }
export type UpdateStatusTextMutationHookResult = ReturnType<typeof useUpdateStatusTextMutation>;
export type UpdateStatusTextMutationResult = Apollo.MutationResult<UpdateStatusTextMutation>;
export type UpdateStatusTextMutationOptions = Apollo.BaseMutationOptions<UpdateStatusTextMutation, UpdateStatusTextMutationVariables>;
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
    documentId
    authorId
    body
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
export const CreateComponentDocument = gql`
    mutation CreateComponent($workspaceId: String!, $input: CreateReusableComponentInput!) {
  createComponent(workspaceId: $workspaceId, input: $input) {
    id
    blockId
    documentId
    title
    type
    state
    instancesCreated
    instances {
      id
      blockId
      documentId
      reusableComponentId
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
    `;
export type CreateComponentMutationFn = Apollo.MutationFunction<CreateComponentMutation, CreateComponentMutationVariables>;

/**
 * __useCreateComponentMutation__
 *
 * To run a mutation, you first call `useCreateComponentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateComponentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createComponentMutation, { data, loading, error }] = useCreateComponentMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateComponentMutation(baseOptions?: Apollo.MutationHookOptions<CreateComponentMutation, CreateComponentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateComponentMutation, CreateComponentMutationVariables>(CreateComponentDocument, options);
      }
export type CreateComponentMutationHookResult = ReturnType<typeof useCreateComponentMutation>;
export type CreateComponentMutationResult = Apollo.MutationResult<CreateComponentMutation>;
export type CreateComponentMutationOptions = Apollo.BaseMutationOptions<CreateComponentMutation, CreateComponentMutationVariables>;
export const UpdateComponentDocument = gql`
    mutation UpdateComponent($workspaceId: String!, $componentId: String!, $input: UpdateReusableComponentInput!) {
  updateComponent(
    workspaceId: $workspaceId
    componentId: $componentId
    input: $input
  ) {
    id
    blockId
    documentId
    title
    type
    state
    instancesCreated
    instances {
      id
      blockId
      documentId
      reusableComponentId
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
    `;
export type UpdateComponentMutationFn = Apollo.MutationFunction<UpdateComponentMutation, UpdateComponentMutationVariables>;

/**
 * __useUpdateComponentMutation__
 *
 * To run a mutation, you first call `useUpdateComponentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateComponentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateComponentMutation, { data, loading, error }] = useUpdateComponentMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      componentId: // value for 'componentId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateComponentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateComponentMutation, UpdateComponentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateComponentMutation, UpdateComponentMutationVariables>(UpdateComponentDocument, options);
      }
export type UpdateComponentMutationHookResult = ReturnType<typeof useUpdateComponentMutation>;
export type UpdateComponentMutationResult = Apollo.MutationResult<UpdateComponentMutation>;
export type UpdateComponentMutationOptions = Apollo.BaseMutationOptions<UpdateComponentMutation, UpdateComponentMutationVariables>;
export const DeleteComponentDocument = gql`
    mutation DeleteComponent($workspaceId: String!, $componentId: String!) {
  deleteComponent(workspaceId: $workspaceId, componentId: $componentId)
}
    `;
export type DeleteComponentMutationFn = Apollo.MutationFunction<DeleteComponentMutation, DeleteComponentMutationVariables>;

/**
 * __useDeleteComponentMutation__
 *
 * To run a mutation, you first call `useDeleteComponentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteComponentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteComponentMutation, { data, loading, error }] = useDeleteComponentMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      componentId: // value for 'componentId'
 *   },
 * });
 */
export function useDeleteComponentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteComponentMutation, DeleteComponentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteComponentMutation, DeleteComponentMutationVariables>(DeleteComponentDocument, options);
      }
export type DeleteComponentMutationHookResult = ReturnType<typeof useDeleteComponentMutation>;
export type DeleteComponentMutationResult = Apollo.MutationResult<DeleteComponentMutation>;
export type DeleteComponentMutationOptions = Apollo.BaseMutationOptions<DeleteComponentMutation, DeleteComponentMutationVariables>;
export const CreateComponentInstanceDocument = gql`
    mutation CreateComponentInstance($workspaceId: String!, $componentId: String!, $input: CreateComponentInstanceInput!) {
  createComponentInstance(
    workspaceId: $workspaceId
    componentId: $componentId
    input: $input
  ) {
    id
    blockId
    documentId
    reusableComponentId
    createdAt
    updatedAt
  }
}
    `;
export type CreateComponentInstanceMutationFn = Apollo.MutationFunction<CreateComponentInstanceMutation, CreateComponentInstanceMutationVariables>;

/**
 * __useCreateComponentInstanceMutation__
 *
 * To run a mutation, you first call `useCreateComponentInstanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateComponentInstanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createComponentInstanceMutation, { data, loading, error }] = useCreateComponentInstanceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      componentId: // value for 'componentId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateComponentInstanceMutation(baseOptions?: Apollo.MutationHookOptions<CreateComponentInstanceMutation, CreateComponentInstanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateComponentInstanceMutation, CreateComponentInstanceMutationVariables>(CreateComponentInstanceDocument, options);
      }
export type CreateComponentInstanceMutationHookResult = ReturnType<typeof useCreateComponentInstanceMutation>;
export type CreateComponentInstanceMutationResult = Apollo.MutationResult<CreateComponentInstanceMutation>;
export type CreateComponentInstanceMutationOptions = Apollo.BaseMutationOptions<CreateComponentInstanceMutation, CreateComponentInstanceMutationVariables>;
export const DeleteComponentInstanceDocument = gql`
    mutation DeleteComponentInstance($workspaceId: String!, $componentId: String!, $blockId: String!) {
  deleteComponentInstance(
    workspaceId: $workspaceId
    componentId: $componentId
    blockId: $blockId
  )
}
    `;
export type DeleteComponentInstanceMutationFn = Apollo.MutationFunction<DeleteComponentInstanceMutation, DeleteComponentInstanceMutationVariables>;

/**
 * __useDeleteComponentInstanceMutation__
 *
 * To run a mutation, you first call `useDeleteComponentInstanceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteComponentInstanceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteComponentInstanceMutation, { data, loading, error }] = useDeleteComponentInstanceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      componentId: // value for 'componentId'
 *      blockId: // value for 'blockId'
 *   },
 * });
 */
export function useDeleteComponentInstanceMutation(baseOptions?: Apollo.MutationHookOptions<DeleteComponentInstanceMutation, DeleteComponentInstanceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteComponentInstanceMutation, DeleteComponentInstanceMutationVariables>(DeleteComponentInstanceDocument, options);
      }
export type DeleteComponentInstanceMutationHookResult = ReturnType<typeof useDeleteComponentInstanceMutation>;
export type DeleteComponentInstanceMutationResult = Apollo.MutationResult<DeleteComponentInstanceMutation>;
export type DeleteComponentInstanceMutationOptions = Apollo.BaseMutationOptions<DeleteComponentInstanceMutation, DeleteComponentInstanceMutationVariables>;
export const CreateDocumentDocument = gql`
    mutation CreateDocument($workspaceId: String!, $input: CreateDocumentInput!) {
  createDocument(workspaceId: $workspaceId, input: $input) {
    id
    title
    slug
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
  deleteDocument(input: $input)
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
export const GetExplorerDocumentsDocument = gql`
    query GetExplorerDocuments($limit: Float = 20, $offset: Float = 0) {
  getExplorerDocuments(limit: $limit, offset: $offset) {
    id
    slug
    title
    authorId
    workspaceId
    parentId
    runUnexecutedBlocks
    runSQLSelection
    shareLinksWithoutSidebar
    orderIndex
    deletedAt
    createdAt
    updatedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    children {
      id
      slug
      title
      icon
      orderIndex
    }
    parent {
      id
      slug
      title
      icon
    }
    author {
      username
      firstName
      lastName
      avater
    }
  }
}
    `;

/**
 * __useGetExplorerDocumentsQuery__
 *
 * To run a query within a React component, call `useGetExplorerDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExplorerDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExplorerDocumentsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetExplorerDocumentsQuery(baseOptions?: Apollo.QueryHookOptions<GetExplorerDocumentsQuery, GetExplorerDocumentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExplorerDocumentsQuery, GetExplorerDocumentsQueryVariables>(GetExplorerDocumentsDocument, options);
      }
export function useGetExplorerDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExplorerDocumentsQuery, GetExplorerDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExplorerDocumentsQuery, GetExplorerDocumentsQueryVariables>(GetExplorerDocumentsDocument, options);
        }
export function useGetExplorerDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExplorerDocumentsQuery, GetExplorerDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExplorerDocumentsQuery, GetExplorerDocumentsQueryVariables>(GetExplorerDocumentsDocument, options);
        }
export type GetExplorerDocumentsQueryHookResult = ReturnType<typeof useGetExplorerDocumentsQuery>;
export type GetExplorerDocumentsLazyQueryHookResult = ReturnType<typeof useGetExplorerDocumentsLazyQuery>;
export type GetExplorerDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetExplorerDocumentsSuspenseQuery>;
export type GetExplorerDocumentsQueryResult = Apollo.QueryResult<GetExplorerDocumentsQuery, GetExplorerDocumentsQueryVariables>;
export const GetFeaturedDocumentsDocument = gql`
    query GetFeaturedDocuments($limit: Float = 4) {
  getFeaturedDocuments(limit: $limit) {
    id
    slug
    title
    authorId
    workspaceId
    parentId
    runUnexecutedBlocks
    runSQLSelection
    shareLinksWithoutSidebar
    orderIndex
    deletedAt
    createdAt
    updatedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    children {
      id
      slug
      title
      icon
      orderIndex
      createdAt
      updatedAt
    }
    author {
      username
      firstName
      lastName
      avater
    }
    parent {
      id
      slug
      title
      icon
    }
  }
}
    `;

/**
 * __useGetFeaturedDocumentsQuery__
 *
 * To run a query within a React component, call `useGetFeaturedDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFeaturedDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFeaturedDocumentsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetFeaturedDocumentsQuery(baseOptions?: Apollo.QueryHookOptions<GetFeaturedDocumentsQuery, GetFeaturedDocumentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFeaturedDocumentsQuery, GetFeaturedDocumentsQueryVariables>(GetFeaturedDocumentsDocument, options);
      }
export function useGetFeaturedDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFeaturedDocumentsQuery, GetFeaturedDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFeaturedDocumentsQuery, GetFeaturedDocumentsQueryVariables>(GetFeaturedDocumentsDocument, options);
        }
export function useGetFeaturedDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFeaturedDocumentsQuery, GetFeaturedDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFeaturedDocumentsQuery, GetFeaturedDocumentsQueryVariables>(GetFeaturedDocumentsDocument, options);
        }
export type GetFeaturedDocumentsQueryHookResult = ReturnType<typeof useGetFeaturedDocumentsQuery>;
export type GetFeaturedDocumentsLazyQueryHookResult = ReturnType<typeof useGetFeaturedDocumentsLazyQuery>;
export type GetFeaturedDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetFeaturedDocumentsSuspenseQuery>;
export type GetFeaturedDocumentsQueryResult = Apollo.QueryResult<GetFeaturedDocumentsQuery, GetFeaturedDocumentsQueryVariables>;
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
export const SetWorkspaceDefaultAiModelDocument = gql`
    mutation SetWorkspaceDefaultAiModel($workspaceId: String!, $model: String!) {
  setWorkspaceDefaultAiModel(workspaceId: $workspaceId, model: $model)
}
    `;
export type SetWorkspaceDefaultAiModelMutationFn = Apollo.MutationFunction<SetWorkspaceDefaultAiModelMutation, SetWorkspaceDefaultAiModelMutationVariables>;

/**
 * __useSetWorkspaceDefaultAiModelMutation__
 *
 * To run a mutation, you first call `useSetWorkspaceDefaultAiModelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetWorkspaceDefaultAiModelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setWorkspaceDefaultAiModelMutation, { data, loading, error }] = useSetWorkspaceDefaultAiModelMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      model: // value for 'model'
 *   },
 * });
 */
export function useSetWorkspaceDefaultAiModelMutation(baseOptions?: Apollo.MutationHookOptions<SetWorkspaceDefaultAiModelMutation, SetWorkspaceDefaultAiModelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetWorkspaceDefaultAiModelMutation, SetWorkspaceDefaultAiModelMutationVariables>(SetWorkspaceDefaultAiModelDocument, options);
      }
export type SetWorkspaceDefaultAiModelMutationHookResult = ReturnType<typeof useSetWorkspaceDefaultAiModelMutation>;
export type SetWorkspaceDefaultAiModelMutationResult = Apollo.MutationResult<SetWorkspaceDefaultAiModelMutation>;
export type SetWorkspaceDefaultAiModelMutationOptions = Apollo.BaseMutationOptions<SetWorkspaceDefaultAiModelMutation, SetWorkspaceDefaultAiModelMutationVariables>;
export const CreateScheduleDocument = gql`
    mutation CreateSchedule($workspaceId: String!, $input: CreateScheduleInput!) {
  createSchedule(workspaceId: $workspaceId, input: $input) {
    id
    type
    hour
    minute
    cron
    weekdays
    days
    timezone
    isActive
    lastExecutedAt
    nextExecutionAt
    documentId
  }
}
    `;
export type CreateScheduleMutationFn = Apollo.MutationFunction<CreateScheduleMutation, CreateScheduleMutationVariables>;

/**
 * __useCreateScheduleMutation__
 *
 * To run a mutation, you first call `useCreateScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createScheduleMutation, { data, loading, error }] = useCreateScheduleMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateScheduleMutation(baseOptions?: Apollo.MutationHookOptions<CreateScheduleMutation, CreateScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateScheduleMutation, CreateScheduleMutationVariables>(CreateScheduleDocument, options);
      }
export type CreateScheduleMutationHookResult = ReturnType<typeof useCreateScheduleMutation>;
export type CreateScheduleMutationResult = Apollo.MutationResult<CreateScheduleMutation>;
export type CreateScheduleMutationOptions = Apollo.BaseMutationOptions<CreateScheduleMutation, CreateScheduleMutationVariables>;
export const DeleteScheduleDocument = gql`
    mutation DeleteSchedule($input: DeleteScheduleInput!) {
  deleteSchedule(input: $input)
}
    `;
export type DeleteScheduleMutationFn = Apollo.MutationFunction<DeleteScheduleMutation, DeleteScheduleMutationVariables>;

/**
 * __useDeleteScheduleMutation__
 *
 * To run a mutation, you first call `useDeleteScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteScheduleMutation, { data, loading, error }] = useDeleteScheduleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteScheduleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteScheduleMutation, DeleteScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteScheduleMutation, DeleteScheduleMutationVariables>(DeleteScheduleDocument, options);
      }
export type DeleteScheduleMutationHookResult = ReturnType<typeof useDeleteScheduleMutation>;
export type DeleteScheduleMutationResult = Apollo.MutationResult<DeleteScheduleMutation>;
export type DeleteScheduleMutationOptions = Apollo.BaseMutationOptions<DeleteScheduleMutation, DeleteScheduleMutationVariables>;
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
    mutation UpdateWorkspace($workspaceId: String!, $name: String, $icon: String) {
  updateWorkspace(workspaceId: $workspaceId, name: $name, icon: $icon) {
    id
    name
    icon
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
 *      icon: // value for 'icon'
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
export const DeleteWorkspaceDocument = gql`
    mutation DeleteWorkspace($workspaceId: String!) {
  deleteWorkspace(workspaceId: $workspaceId)
}
    `;
export type DeleteWorkspaceMutationFn = Apollo.MutationFunction<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>;

/**
 * __useDeleteWorkspaceMutation__
 *
 * To run a mutation, you first call `useDeleteWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWorkspaceMutation, { data, loading, error }] = useDeleteWorkspaceMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useDeleteWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>(DeleteWorkspaceDocument, options);
      }
export type DeleteWorkspaceMutationHookResult = ReturnType<typeof useDeleteWorkspaceMutation>;
export type DeleteWorkspaceMutationResult = Apollo.MutationResult<DeleteWorkspaceMutation>;
export type DeleteWorkspaceMutationOptions = Apollo.BaseMutationOptions<DeleteWorkspaceMutation, DeleteWorkspaceMutationVariables>;
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
export const InviteUserToWorkspaceDocument = gql`
    mutation InviteUserToWorkspace($email: String!, $workspaceId: String!, $role: String) {
  inviteUserToWorkspace(email: $email, workspaceId: $workspaceId, role: $role)
}
    `;
export type InviteUserToWorkspaceMutationFn = Apollo.MutationFunction<InviteUserToWorkspaceMutation, InviteUserToWorkspaceMutationVariables>;

/**
 * __useInviteUserToWorkspaceMutation__
 *
 * To run a mutation, you first call `useInviteUserToWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteUserToWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteUserToWorkspaceMutation, { data, loading, error }] = useInviteUserToWorkspaceMutation({
 *   variables: {
 *      email: // value for 'email'
 *      workspaceId: // value for 'workspaceId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useInviteUserToWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<InviteUserToWorkspaceMutation, InviteUserToWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InviteUserToWorkspaceMutation, InviteUserToWorkspaceMutationVariables>(InviteUserToWorkspaceDocument, options);
      }
export type InviteUserToWorkspaceMutationHookResult = ReturnType<typeof useInviteUserToWorkspaceMutation>;
export type InviteUserToWorkspaceMutationResult = Apollo.MutationResult<InviteUserToWorkspaceMutation>;
export type InviteUserToWorkspaceMutationOptions = Apollo.BaseMutationOptions<InviteUserToWorkspaceMutation, InviteUserToWorkspaceMutationVariables>;
export const AcceptWorkspaceInvitationDocument = gql`
    mutation AcceptWorkspaceInvitation($hash: String!) {
  acceptWorkspaceInvitation(hash: $hash)
}
    `;
export type AcceptWorkspaceInvitationMutationFn = Apollo.MutationFunction<AcceptWorkspaceInvitationMutation, AcceptWorkspaceInvitationMutationVariables>;

/**
 * __useAcceptWorkspaceInvitationMutation__
 *
 * To run a mutation, you first call `useAcceptWorkspaceInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcceptWorkspaceInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acceptWorkspaceInvitationMutation, { data, loading, error }] = useAcceptWorkspaceInvitationMutation({
 *   variables: {
 *      hash: // value for 'hash'
 *   },
 * });
 */
export function useAcceptWorkspaceInvitationMutation(baseOptions?: Apollo.MutationHookOptions<AcceptWorkspaceInvitationMutation, AcceptWorkspaceInvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcceptWorkspaceInvitationMutation, AcceptWorkspaceInvitationMutationVariables>(AcceptWorkspaceInvitationDocument, options);
      }
export type AcceptWorkspaceInvitationMutationHookResult = ReturnType<typeof useAcceptWorkspaceInvitationMutation>;
export type AcceptWorkspaceInvitationMutationResult = Apollo.MutationResult<AcceptWorkspaceInvitationMutation>;
export type AcceptWorkspaceInvitationMutationOptions = Apollo.BaseMutationOptions<AcceptWorkspaceInvitationMutation, AcceptWorkspaceInvitationMutationVariables>;
export const UpdateWorkspaceMemberRoleDocument = gql`
    mutation UpdateWorkspaceMemberRole($workspaceId: String!, $userId: String!, $role: String!) {
  updateWorkspaceMemberRole(
    workspaceId: $workspaceId
    userId: $userId
    role: $role
  )
}
    `;
export type UpdateWorkspaceMemberRoleMutationFn = Apollo.MutationFunction<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>;

/**
 * __useUpdateWorkspaceMemberRoleMutation__
 *
 * To run a mutation, you first call `useUpdateWorkspaceMemberRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkspaceMemberRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkspaceMemberRoleMutation, { data, loading, error }] = useUpdateWorkspaceMemberRoleMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useUpdateWorkspaceMemberRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>(UpdateWorkspaceMemberRoleDocument, options);
      }
export type UpdateWorkspaceMemberRoleMutationHookResult = ReturnType<typeof useUpdateWorkspaceMemberRoleMutation>;
export type UpdateWorkspaceMemberRoleMutationResult = Apollo.MutationResult<UpdateWorkspaceMemberRoleMutation>;
export type UpdateWorkspaceMemberRoleMutationOptions = Apollo.BaseMutationOptions<UpdateWorkspaceMemberRoleMutation, UpdateWorkspaceMemberRoleMutationVariables>;
export const RemoveUserFromWorkspaceDocument = gql`
    mutation RemoveUserFromWorkspace($userId: String!, $workspaceId: String!) {
  removeUserFromWorkspace(userId: $userId, workspaceId: $workspaceId)
}
    `;
export type RemoveUserFromWorkspaceMutationFn = Apollo.MutationFunction<RemoveUserFromWorkspaceMutation, RemoveUserFromWorkspaceMutationVariables>;

/**
 * __useRemoveUserFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useRemoveUserFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserFromWorkspaceMutation, { data, loading, error }] = useRemoveUserFromWorkspaceMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useRemoveUserFromWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<RemoveUserFromWorkspaceMutation, RemoveUserFromWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveUserFromWorkspaceMutation, RemoveUserFromWorkspaceMutationVariables>(RemoveUserFromWorkspaceDocument, options);
      }
export type RemoveUserFromWorkspaceMutationHookResult = ReturnType<typeof useRemoveUserFromWorkspaceMutation>;
export type RemoveUserFromWorkspaceMutationResult = Apollo.MutationResult<RemoveUserFromWorkspaceMutation>;
export type RemoveUserFromWorkspaceMutationOptions = Apollo.BaseMutationOptions<RemoveUserFromWorkspaceMutation, RemoveUserFromWorkspaceMutationVariables>;
export const BatchRemoveUsersFromWorkspaceDocument = gql`
    mutation BatchRemoveUsersFromWorkspace($removals: [RemoveUserFromWorkspaceInput!]!) {
  batchRemoveUsersFromWorkspace(removals: $removals)
}
    `;
export type BatchRemoveUsersFromWorkspaceMutationFn = Apollo.MutationFunction<BatchRemoveUsersFromWorkspaceMutation, BatchRemoveUsersFromWorkspaceMutationVariables>;

/**
 * __useBatchRemoveUsersFromWorkspaceMutation__
 *
 * To run a mutation, you first call `useBatchRemoveUsersFromWorkspaceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBatchRemoveUsersFromWorkspaceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [batchRemoveUsersFromWorkspaceMutation, { data, loading, error }] = useBatchRemoveUsersFromWorkspaceMutation({
 *   variables: {
 *      removals: // value for 'removals'
 *   },
 * });
 */
export function useBatchRemoveUsersFromWorkspaceMutation(baseOptions?: Apollo.MutationHookOptions<BatchRemoveUsersFromWorkspaceMutation, BatchRemoveUsersFromWorkspaceMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BatchRemoveUsersFromWorkspaceMutation, BatchRemoveUsersFromWorkspaceMutationVariables>(BatchRemoveUsersFromWorkspaceDocument, options);
      }
export type BatchRemoveUsersFromWorkspaceMutationHookResult = ReturnType<typeof useBatchRemoveUsersFromWorkspaceMutation>;
export type BatchRemoveUsersFromWorkspaceMutationResult = Apollo.MutationResult<BatchRemoveUsersFromWorkspaceMutation>;
export type BatchRemoveUsersFromWorkspaceMutationOptions = Apollo.BaseMutationOptions<BatchRemoveUsersFromWorkspaceMutation, BatchRemoveUsersFromWorkspaceMutationVariables>;
export const RequestRoleUpgradeDocument = gql`
    mutation RequestRoleUpgrade($workspaceId: String!, $role: String!) {
  requestRoleUpgrade(workspaceId: $workspaceId, role: $role)
}
    `;
export type RequestRoleUpgradeMutationFn = Apollo.MutationFunction<RequestRoleUpgradeMutation, RequestRoleUpgradeMutationVariables>;

/**
 * __useRequestRoleUpgradeMutation__
 *
 * To run a mutation, you first call `useRequestRoleUpgradeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestRoleUpgradeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestRoleUpgradeMutation, { data, loading, error }] = useRequestRoleUpgradeMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      role: // value for 'role'
 *   },
 * });
 */
export function useRequestRoleUpgradeMutation(baseOptions?: Apollo.MutationHookOptions<RequestRoleUpgradeMutation, RequestRoleUpgradeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestRoleUpgradeMutation, RequestRoleUpgradeMutationVariables>(RequestRoleUpgradeDocument, options);
      }
export type RequestRoleUpgradeMutationHookResult = ReturnType<typeof useRequestRoleUpgradeMutation>;
export type RequestRoleUpgradeMutationResult = Apollo.MutationResult<RequestRoleUpgradeMutation>;
export type RequestRoleUpgradeMutationOptions = Apollo.BaseMutationOptions<RequestRoleUpgradeMutation, RequestRoleUpgradeMutationVariables>;
export const ApproveRoleRequestDocument = gql`
    mutation ApproveRoleRequest($workspaceId: String!, $userId: String!) {
  approveRoleRequest(workspaceId: $workspaceId, userId: $userId)
}
    `;
export type ApproveRoleRequestMutationFn = Apollo.MutationFunction<ApproveRoleRequestMutation, ApproveRoleRequestMutationVariables>;

/**
 * __useApproveRoleRequestMutation__
 *
 * To run a mutation, you first call `useApproveRoleRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveRoleRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveRoleRequestMutation, { data, loading, error }] = useApproveRoleRequestMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useApproveRoleRequestMutation(baseOptions?: Apollo.MutationHookOptions<ApproveRoleRequestMutation, ApproveRoleRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ApproveRoleRequestMutation, ApproveRoleRequestMutationVariables>(ApproveRoleRequestDocument, options);
      }
export type ApproveRoleRequestMutationHookResult = ReturnType<typeof useApproveRoleRequestMutation>;
export type ApproveRoleRequestMutationResult = Apollo.MutationResult<ApproveRoleRequestMutation>;
export type ApproveRoleRequestMutationOptions = Apollo.BaseMutationOptions<ApproveRoleRequestMutation, ApproveRoleRequestMutationVariables>;
export const RejectRoleRequestDocument = gql`
    mutation RejectRoleRequest($workspaceId: String!, $userId: String!) {
  rejectRoleRequest(workspaceId: $workspaceId, userId: $userId)
}
    `;
export type RejectRoleRequestMutationFn = Apollo.MutationFunction<RejectRoleRequestMutation, RejectRoleRequestMutationVariables>;

/**
 * __useRejectRoleRequestMutation__
 *
 * To run a mutation, you first call `useRejectRoleRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRejectRoleRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rejectRoleRequestMutation, { data, loading, error }] = useRejectRoleRequestMutation({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRejectRoleRequestMutation(baseOptions?: Apollo.MutationHookOptions<RejectRoleRequestMutation, RejectRoleRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RejectRoleRequestMutation, RejectRoleRequestMutationVariables>(RejectRoleRequestDocument, options);
      }
export type RejectRoleRequestMutationHookResult = ReturnType<typeof useRejectRoleRequestMutation>;
export type RejectRoleRequestMutationResult = Apollo.MutationResult<RejectRoleRequestMutation>;
export type RejectRoleRequestMutationOptions = Apollo.BaseMutationOptions<RejectRoleRequestMutation, RejectRoleRequestMutationVariables>;
export const CurrentUserDocument = gql`
    query CurrentUser {
  currentUser {
    id
    token
    roles
    user {
      id
      username
      email
      createdAt
      firstName
      lastName
      fullName
      isOnboarded
      avater
      followersCount
      followingCount
      settings {
        id
        userId
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
export const GetCommentDocument = gql`
    query GetComment($commentId: String!) {
  comment(commentId: $commentId) {
    id
    documentId
    authorId
    body
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
export const GetDocumentCommentsDocument = gql`
    query GetDocumentComments($documentId: String!) {
  comments(documentId: $documentId) {
    id
    documentId
    authorId
    body
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetDocumentCommentsQuery__
 *
 * To run a query within a React component, call `useGetDocumentCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDocumentCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDocumentCommentsQuery({
 *   variables: {
 *      documentId: // value for 'documentId'
 *   },
 * });
 */
export function useGetDocumentCommentsQuery(baseOptions: Apollo.QueryHookOptions<GetDocumentCommentsQuery, GetDocumentCommentsQueryVariables> & ({ variables: GetDocumentCommentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDocumentCommentsQuery, GetDocumentCommentsQueryVariables>(GetDocumentCommentsDocument, options);
      }
export function useGetDocumentCommentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDocumentCommentsQuery, GetDocumentCommentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDocumentCommentsQuery, GetDocumentCommentsQueryVariables>(GetDocumentCommentsDocument, options);
        }
export function useGetDocumentCommentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDocumentCommentsQuery, GetDocumentCommentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDocumentCommentsQuery, GetDocumentCommentsQueryVariables>(GetDocumentCommentsDocument, options);
        }
export type GetDocumentCommentsQueryHookResult = ReturnType<typeof useGetDocumentCommentsQuery>;
export type GetDocumentCommentsLazyQueryHookResult = ReturnType<typeof useGetDocumentCommentsLazyQuery>;
export type GetDocumentCommentsSuspenseQueryHookResult = ReturnType<typeof useGetDocumentCommentsSuspenseQuery>;
export type GetDocumentCommentsQueryResult = Apollo.QueryResult<GetDocumentCommentsQuery, GetDocumentCommentsQueryVariables>;
export const GetComponentDocument = gql`
    query GetComponent($workspaceId: String!, $componentId: String!) {
  getComponent(workspaceId: $workspaceId, componentId: $componentId) {
    id
    blockId
    documentId
    title
    type
    state
    instancesCreated
    instances {
      id
      blockId
      documentId
      reusableComponentId
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetComponentQuery__
 *
 * To run a query within a React component, call `useGetComponentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetComponentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetComponentQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *      componentId: // value for 'componentId'
 *   },
 * });
 */
export function useGetComponentQuery(baseOptions: Apollo.QueryHookOptions<GetComponentQuery, GetComponentQueryVariables> & ({ variables: GetComponentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetComponentQuery, GetComponentQueryVariables>(GetComponentDocument, options);
      }
export function useGetComponentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetComponentQuery, GetComponentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetComponentQuery, GetComponentQueryVariables>(GetComponentDocument, options);
        }
export function useGetComponentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetComponentQuery, GetComponentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetComponentQuery, GetComponentQueryVariables>(GetComponentDocument, options);
        }
export type GetComponentQueryHookResult = ReturnType<typeof useGetComponentQuery>;
export type GetComponentLazyQueryHookResult = ReturnType<typeof useGetComponentLazyQuery>;
export type GetComponentSuspenseQueryHookResult = ReturnType<typeof useGetComponentSuspenseQuery>;
export type GetComponentQueryResult = Apollo.QueryResult<GetComponentQuery, GetComponentQueryVariables>;
export const GetWorkspaceComponentsDocument = gql`
    query GetWorkspaceComponents($workspaceId: String!) {
  getWorkspaceComponents(workspaceId: $workspaceId) {
    id
    blockId
    documentId
    title
    type
    state
    instancesCreated
    instances {
      id
      blockId
      documentId
      reusableComponentId
      createdAt
      updatedAt
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetWorkspaceComponentsQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceComponentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceComponentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceComponentsQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetWorkspaceComponentsQuery(baseOptions: Apollo.QueryHookOptions<GetWorkspaceComponentsQuery, GetWorkspaceComponentsQueryVariables> & ({ variables: GetWorkspaceComponentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceComponentsQuery, GetWorkspaceComponentsQueryVariables>(GetWorkspaceComponentsDocument, options);
      }
export function useGetWorkspaceComponentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceComponentsQuery, GetWorkspaceComponentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceComponentsQuery, GetWorkspaceComponentsQueryVariables>(GetWorkspaceComponentsDocument, options);
        }
export function useGetWorkspaceComponentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWorkspaceComponentsQuery, GetWorkspaceComponentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWorkspaceComponentsQuery, GetWorkspaceComponentsQueryVariables>(GetWorkspaceComponentsDocument, options);
        }
export type GetWorkspaceComponentsQueryHookResult = ReturnType<typeof useGetWorkspaceComponentsQuery>;
export type GetWorkspaceComponentsLazyQueryHookResult = ReturnType<typeof useGetWorkspaceComponentsLazyQuery>;
export type GetWorkspaceComponentsSuspenseQueryHookResult = ReturnType<typeof useGetWorkspaceComponentsSuspenseQuery>;
export type GetWorkspaceComponentsQueryResult = Apollo.QueryResult<GetWorkspaceComponentsQuery, GetWorkspaceComponentsQueryVariables>;
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
export const GetFavoriteDocumentsDocument = gql`
    query GetFavoriteDocuments($workspaceId: String!) {
  getFavoriteDocuments(workspaceId: $workspaceId) {
    id
    title
    slug
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
 * __useGetFavoriteDocumentsQuery__
 *
 * To run a query within a React component, call `useGetFavoriteDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFavoriteDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFavoriteDocumentsQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetFavoriteDocumentsQuery(baseOptions: Apollo.QueryHookOptions<GetFavoriteDocumentsQuery, GetFavoriteDocumentsQueryVariables> & ({ variables: GetFavoriteDocumentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFavoriteDocumentsQuery, GetFavoriteDocumentsQueryVariables>(GetFavoriteDocumentsDocument, options);
      }
export function useGetFavoriteDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFavoriteDocumentsQuery, GetFavoriteDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFavoriteDocumentsQuery, GetFavoriteDocumentsQueryVariables>(GetFavoriteDocumentsDocument, options);
        }
export function useGetFavoriteDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFavoriteDocumentsQuery, GetFavoriteDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFavoriteDocumentsQuery, GetFavoriteDocumentsQueryVariables>(GetFavoriteDocumentsDocument, options);
        }
export type GetFavoriteDocumentsQueryHookResult = ReturnType<typeof useGetFavoriteDocumentsQuery>;
export type GetFavoriteDocumentsLazyQueryHookResult = ReturnType<typeof useGetFavoriteDocumentsLazyQuery>;
export type GetFavoriteDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetFavoriteDocumentsSuspenseQuery>;
export type GetFavoriteDocumentsQueryResult = Apollo.QueryResult<GetFavoriteDocumentsQuery, GetFavoriteDocumentsQueryVariables>;
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
    createdAt
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
export const GetOpenRouterModelsDocument = gql`
    query GetOpenRouterModels {
  openRouterModels {
    id
    name
    details
  }
}
    `;

/**
 * __useGetOpenRouterModelsQuery__
 *
 * To run a query within a React component, call `useGetOpenRouterModelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpenRouterModelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpenRouterModelsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOpenRouterModelsQuery(baseOptions?: Apollo.QueryHookOptions<GetOpenRouterModelsQuery, GetOpenRouterModelsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOpenRouterModelsQuery, GetOpenRouterModelsQueryVariables>(GetOpenRouterModelsDocument, options);
      }
export function useGetOpenRouterModelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOpenRouterModelsQuery, GetOpenRouterModelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOpenRouterModelsQuery, GetOpenRouterModelsQueryVariables>(GetOpenRouterModelsDocument, options);
        }
export function useGetOpenRouterModelsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOpenRouterModelsQuery, GetOpenRouterModelsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOpenRouterModelsQuery, GetOpenRouterModelsQueryVariables>(GetOpenRouterModelsDocument, options);
        }
export type GetOpenRouterModelsQueryHookResult = ReturnType<typeof useGetOpenRouterModelsQuery>;
export type GetOpenRouterModelsLazyQueryHookResult = ReturnType<typeof useGetOpenRouterModelsLazyQuery>;
export type GetOpenRouterModelsSuspenseQueryHookResult = ReturnType<typeof useGetOpenRouterModelsSuspenseQuery>;
export type GetOpenRouterModelsQueryResult = Apollo.QueryResult<GetOpenRouterModelsQuery, GetOpenRouterModelsQueryVariables>;
export const GetOpenRouterModelDocument = gql`
    query GetOpenRouterModel($modelId: String!) {
  openRouterModel(modelId: $modelId) {
    id
    name
    details
  }
}
    `;

/**
 * __useGetOpenRouterModelQuery__
 *
 * To run a query within a React component, call `useGetOpenRouterModelQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpenRouterModelQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpenRouterModelQuery({
 *   variables: {
 *      modelId: // value for 'modelId'
 *   },
 * });
 */
export function useGetOpenRouterModelQuery(baseOptions: Apollo.QueryHookOptions<GetOpenRouterModelQuery, GetOpenRouterModelQueryVariables> & ({ variables: GetOpenRouterModelQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOpenRouterModelQuery, GetOpenRouterModelQueryVariables>(GetOpenRouterModelDocument, options);
      }
export function useGetOpenRouterModelLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOpenRouterModelQuery, GetOpenRouterModelQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOpenRouterModelQuery, GetOpenRouterModelQueryVariables>(GetOpenRouterModelDocument, options);
        }
export function useGetOpenRouterModelSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOpenRouterModelQuery, GetOpenRouterModelQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOpenRouterModelQuery, GetOpenRouterModelQueryVariables>(GetOpenRouterModelDocument, options);
        }
export type GetOpenRouterModelQueryHookResult = ReturnType<typeof useGetOpenRouterModelQuery>;
export type GetOpenRouterModelLazyQueryHookResult = ReturnType<typeof useGetOpenRouterModelLazyQuery>;
export type GetOpenRouterModelSuspenseQueryHookResult = ReturnType<typeof useGetOpenRouterModelSuspenseQuery>;
export type GetOpenRouterModelQueryResult = Apollo.QueryResult<GetOpenRouterModelQuery, GetOpenRouterModelQueryVariables>;
export const GetOpenRouterAccountCreditsDocument = gql`
    query GetOpenRouterAccountCredits($workspaceId: String!) {
  openRouterAccountCredits(workspaceId: $workspaceId) {
    totalCredits
    usedCredits
    availableCredits
  }
}
    `;

/**
 * __useGetOpenRouterAccountCreditsQuery__
 *
 * To run a query within a React component, call `useGetOpenRouterAccountCreditsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpenRouterAccountCreditsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpenRouterAccountCreditsQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetOpenRouterAccountCreditsQuery(baseOptions: Apollo.QueryHookOptions<GetOpenRouterAccountCreditsQuery, GetOpenRouterAccountCreditsQueryVariables> & ({ variables: GetOpenRouterAccountCreditsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOpenRouterAccountCreditsQuery, GetOpenRouterAccountCreditsQueryVariables>(GetOpenRouterAccountCreditsDocument, options);
      }
export function useGetOpenRouterAccountCreditsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOpenRouterAccountCreditsQuery, GetOpenRouterAccountCreditsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOpenRouterAccountCreditsQuery, GetOpenRouterAccountCreditsQueryVariables>(GetOpenRouterAccountCreditsDocument, options);
        }
export function useGetOpenRouterAccountCreditsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOpenRouterAccountCreditsQuery, GetOpenRouterAccountCreditsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOpenRouterAccountCreditsQuery, GetOpenRouterAccountCreditsQueryVariables>(GetOpenRouterAccountCreditsDocument, options);
        }
export type GetOpenRouterAccountCreditsQueryHookResult = ReturnType<typeof useGetOpenRouterAccountCreditsQuery>;
export type GetOpenRouterAccountCreditsLazyQueryHookResult = ReturnType<typeof useGetOpenRouterAccountCreditsLazyQuery>;
export type GetOpenRouterAccountCreditsSuspenseQueryHookResult = ReturnType<typeof useGetOpenRouterAccountCreditsSuspenseQuery>;
export type GetOpenRouterAccountCreditsQueryResult = Apollo.QueryResult<GetOpenRouterAccountCreditsQuery, GetOpenRouterAccountCreditsQueryVariables>;
export const GetSchedulesDocument = gql`
    query GetSchedules($input: ListSchedulesInput!) {
  schedules(input: $input) {
    id
    type
    hour
    minute
    cron
    weekdays
    days
    timezone
    isActive
    lastExecutedAt
    nextExecutionAt
    documentId
  }
}
    `;

/**
 * __useGetSchedulesQuery__
 *
 * To run a query within a React component, call `useGetSchedulesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSchedulesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSchedulesQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGetSchedulesQuery(baseOptions: Apollo.QueryHookOptions<GetSchedulesQuery, GetSchedulesQueryVariables> & ({ variables: GetSchedulesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSchedulesQuery, GetSchedulesQueryVariables>(GetSchedulesDocument, options);
      }
export function useGetSchedulesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSchedulesQuery, GetSchedulesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSchedulesQuery, GetSchedulesQueryVariables>(GetSchedulesDocument, options);
        }
export function useGetSchedulesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSchedulesQuery, GetSchedulesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSchedulesQuery, GetSchedulesQueryVariables>(GetSchedulesDocument, options);
        }
export type GetSchedulesQueryHookResult = ReturnType<typeof useGetSchedulesQuery>;
export type GetSchedulesLazyQueryHookResult = ReturnType<typeof useGetSchedulesLazyQuery>;
export type GetSchedulesSuspenseQueryHookResult = ReturnType<typeof useGetSchedulesSuspenseQuery>;
export type GetSchedulesQueryResult = Apollo.QueryResult<GetSchedulesQuery, GetSchedulesQueryVariables>;
export const GetScheduleDocument = gql`
    query GetSchedule($scheduleId: String!) {
  schedule(scheduleId: $scheduleId) {
    id
    documentId
    cron
    type
    isActive
    hour
    minute
    timezone
    days
    weekdays
    lastExecutedAt
    nextExecutionAt
  }
}
    `;

/**
 * __useGetScheduleQuery__
 *
 * To run a query within a React component, call `useGetScheduleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScheduleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScheduleQuery({
 *   variables: {
 *      scheduleId: // value for 'scheduleId'
 *   },
 * });
 */
export function useGetScheduleQuery(baseOptions: Apollo.QueryHookOptions<GetScheduleQuery, GetScheduleQueryVariables> & ({ variables: GetScheduleQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetScheduleQuery, GetScheduleQueryVariables>(GetScheduleDocument, options);
      }
export function useGetScheduleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScheduleQuery, GetScheduleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetScheduleQuery, GetScheduleQueryVariables>(GetScheduleDocument, options);
        }
export function useGetScheduleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetScheduleQuery, GetScheduleQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetScheduleQuery, GetScheduleQueryVariables>(GetScheduleDocument, options);
        }
export type GetScheduleQueryHookResult = ReturnType<typeof useGetScheduleQuery>;
export type GetScheduleLazyQueryHookResult = ReturnType<typeof useGetScheduleLazyQuery>;
export type GetScheduleSuspenseQueryHookResult = ReturnType<typeof useGetScheduleSuspenseQuery>;
export type GetScheduleQueryResult = Apollo.QueryResult<GetScheduleQuery, GetScheduleQueryVariables>;
export const GetUserDocument = gql`
    query GetUser($userId: String!) {
  getUser(userId: $userId) {
    id
    username
    email
    firstName
    lastName
    fullName
    isOnboarded
    avater
    createdAt
    settings {
      id
      userId
      socialLinks
      statusText
      statusUpdatedAt
      wallets
    }
    followers {
      id
      username
      email
      firstName
      lastName
      fullName
      avater
    }
    following {
      id
      username
      email
      firstName
      lastName
      fullName
      avater
    }
    followersCount
    followingCount
  }
}
    `;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserQuery(baseOptions: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables> & ({ variables: GetUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
      }
export function useGetUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
export function useGetUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(GetUserDocument, options);
        }
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<typeof useGetUserSuspenseQuery>;
export type GetUserQueryResult = Apollo.QueryResult<GetUserQuery, GetUserQueryVariables>;
export const GetUserFavoritePublicDocumentsDocument = gql`
    query GetUserFavoritePublicDocuments($userId: String!) {
  favoritePublicDocuments {
    id
    slug
    title
    authorId
    workspaceId
    parentId
    runUnexecutedBlocks
    runSQLSelection
    shareLinksWithoutSidebar
    icon
    orderIndex
    deletedAt
    createdAt
    updatedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    children {
      id
      slug
      title
      authorId
      icon
      orderIndex
      createdAt
      updatedAt
    }
    parent {
      id
      slug
      title
      authorId
      icon
    }
  }
}
    `;

/**
 * __useGetUserFavoritePublicDocumentsQuery__
 *
 * To run a query within a React component, call `useGetUserFavoritePublicDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserFavoritePublicDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserFavoritePublicDocumentsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserFavoritePublicDocumentsQuery(baseOptions: Apollo.QueryHookOptions<GetUserFavoritePublicDocumentsQuery, GetUserFavoritePublicDocumentsQueryVariables> & ({ variables: GetUserFavoritePublicDocumentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserFavoritePublicDocumentsQuery, GetUserFavoritePublicDocumentsQueryVariables>(GetUserFavoritePublicDocumentsDocument, options);
      }
export function useGetUserFavoritePublicDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserFavoritePublicDocumentsQuery, GetUserFavoritePublicDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserFavoritePublicDocumentsQuery, GetUserFavoritePublicDocumentsQueryVariables>(GetUserFavoritePublicDocumentsDocument, options);
        }
export function useGetUserFavoritePublicDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserFavoritePublicDocumentsQuery, GetUserFavoritePublicDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserFavoritePublicDocumentsQuery, GetUserFavoritePublicDocumentsQueryVariables>(GetUserFavoritePublicDocumentsDocument, options);
        }
export type GetUserFavoritePublicDocumentsQueryHookResult = ReturnType<typeof useGetUserFavoritePublicDocumentsQuery>;
export type GetUserFavoritePublicDocumentsLazyQueryHookResult = ReturnType<typeof useGetUserFavoritePublicDocumentsLazyQuery>;
export type GetUserFavoritePublicDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetUserFavoritePublicDocumentsSuspenseQuery>;
export type GetUserFavoritePublicDocumentsQueryResult = Apollo.QueryResult<GetUserFavoritePublicDocumentsQuery, GetUserFavoritePublicDocumentsQueryVariables>;
export const GetForkedDocumentsDocument = gql`
    query GetForkedDocuments {
  getForkedDocuments {
    id
    slug
    title
    authorId
    workspaceId
    parentId
    runUnexecutedBlocks
    runSQLSelection
    shareLinksWithoutSidebar
    icon
    orderIndex
    deletedAt
    createdAt
    updatedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    children {
      id
      slug
      title
      icon
      orderIndex
      createdAt
      updatedAt
    }
    parent {
      id
      slug
      title
      icon
    }
  }
}
    `;

/**
 * __useGetForkedDocumentsQuery__
 *
 * To run a query within a React component, call `useGetForkedDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetForkedDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetForkedDocumentsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetForkedDocumentsQuery(baseOptions?: Apollo.QueryHookOptions<GetForkedDocumentsQuery, GetForkedDocumentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetForkedDocumentsQuery, GetForkedDocumentsQueryVariables>(GetForkedDocumentsDocument, options);
      }
export function useGetForkedDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetForkedDocumentsQuery, GetForkedDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetForkedDocumentsQuery, GetForkedDocumentsQueryVariables>(GetForkedDocumentsDocument, options);
        }
export function useGetForkedDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetForkedDocumentsQuery, GetForkedDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetForkedDocumentsQuery, GetForkedDocumentsQueryVariables>(GetForkedDocumentsDocument, options);
        }
export type GetForkedDocumentsQueryHookResult = ReturnType<typeof useGetForkedDocumentsQuery>;
export type GetForkedDocumentsLazyQueryHookResult = ReturnType<typeof useGetForkedDocumentsLazyQuery>;
export type GetForkedDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetForkedDocumentsSuspenseQuery>;
export type GetForkedDocumentsQueryResult = Apollo.QueryResult<GetForkedDocumentsQuery, GetForkedDocumentsQueryVariables>;
export const GetTrendingPublishedDocumentsDocument = gql`
    query GetTrendingPublishedDocuments($limit: Float = 20, $offset: Float = 0) {
  getTrendingPublishedDocuments(limit: $limit, offset: $offset) {
    id
    slug
    title
    authorId
    workspaceId
    parentId
    runUnexecutedBlocks
    runSQLSelection
    shareLinksWithoutSidebar
    icon
    orderIndex
    deletedAt
    createdAt
    updatedAt
    version
    publishedAt
    isDataApp
    isSyncedWithYjs
    hasDashboard
    appId
    clock
    appClock
    userAppClock
    children {
      id
      slug
      title
      icon
      orderIndex
    }
    parent {
      id
      slug
      title
      icon
    }
  }
}
    `;

/**
 * __useGetTrendingPublishedDocumentsQuery__
 *
 * To run a query within a React component, call `useGetTrendingPublishedDocumentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTrendingPublishedDocumentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTrendingPublishedDocumentsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useGetTrendingPublishedDocumentsQuery(baseOptions?: Apollo.QueryHookOptions<GetTrendingPublishedDocumentsQuery, GetTrendingPublishedDocumentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTrendingPublishedDocumentsQuery, GetTrendingPublishedDocumentsQueryVariables>(GetTrendingPublishedDocumentsDocument, options);
      }
export function useGetTrendingPublishedDocumentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTrendingPublishedDocumentsQuery, GetTrendingPublishedDocumentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTrendingPublishedDocumentsQuery, GetTrendingPublishedDocumentsQueryVariables>(GetTrendingPublishedDocumentsDocument, options);
        }
export function useGetTrendingPublishedDocumentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTrendingPublishedDocumentsQuery, GetTrendingPublishedDocumentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTrendingPublishedDocumentsQuery, GetTrendingPublishedDocumentsQueryVariables>(GetTrendingPublishedDocumentsDocument, options);
        }
export type GetTrendingPublishedDocumentsQueryHookResult = ReturnType<typeof useGetTrendingPublishedDocumentsQuery>;
export type GetTrendingPublishedDocumentsLazyQueryHookResult = ReturnType<typeof useGetTrendingPublishedDocumentsLazyQuery>;
export type GetTrendingPublishedDocumentsSuspenseQueryHookResult = ReturnType<typeof useGetTrendingPublishedDocumentsSuspenseQuery>;
export type GetTrendingPublishedDocumentsQueryResult = Apollo.QueryResult<GetTrendingPublishedDocumentsQuery, GetTrendingPublishedDocumentsQueryVariables>;
export const GetUserWorkspaceInfoDocument = gql`
    query GetUserWorkspaceInfo {
  getUserWorkspaceInfo {
    id
    name
    ownerId
    createdAt
    updatedAt
    role
    icon
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
    icon
    source
    useCases
    useContext
    ownerId
    assistantModel
    owner {
      id
      username
      email
      firstName
      lastName
    }
    users {
      id
      username
      email
      firstName
      lastName
    }
    secrets {
      hasAiModelApiKey
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
export const GetWorkspaceWithMembersDocument = gql`
    query GetWorkspaceWithMembers($workspaceId: String!) {
  getWorkspace(workspaceId: $workspaceId) {
    id
    name
    plan
    icon
    source
    ownerId
  }
  getWorkspaceMembers(workspaceId: $workspaceId) {
    role
    userId
    user {
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
 * __useGetWorkspaceWithMembersQuery__
 *
 * To run a query within a React component, call `useGetWorkspaceWithMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkspaceWithMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkspaceWithMembersQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetWorkspaceWithMembersQuery(baseOptions: Apollo.QueryHookOptions<GetWorkspaceWithMembersQuery, GetWorkspaceWithMembersQueryVariables> & ({ variables: GetWorkspaceWithMembersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkspaceWithMembersQuery, GetWorkspaceWithMembersQueryVariables>(GetWorkspaceWithMembersDocument, options);
      }
export function useGetWorkspaceWithMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkspaceWithMembersQuery, GetWorkspaceWithMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkspaceWithMembersQuery, GetWorkspaceWithMembersQueryVariables>(GetWorkspaceWithMembersDocument, options);
        }
export function useGetWorkspaceWithMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWorkspaceWithMembersQuery, GetWorkspaceWithMembersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWorkspaceWithMembersQuery, GetWorkspaceWithMembersQueryVariables>(GetWorkspaceWithMembersDocument, options);
        }
export type GetWorkspaceWithMembersQueryHookResult = ReturnType<typeof useGetWorkspaceWithMembersQuery>;
export type GetWorkspaceWithMembersLazyQueryHookResult = ReturnType<typeof useGetWorkspaceWithMembersLazyQuery>;
export type GetWorkspaceWithMembersSuspenseQueryHookResult = ReturnType<typeof useGetWorkspaceWithMembersSuspenseQuery>;
export type GetWorkspaceWithMembersQueryResult = Apollo.QueryResult<GetWorkspaceWithMembersQuery, GetWorkspaceWithMembersQueryVariables>;
export const GetAdminWorkspacesWithMembersDocument = gql`
    query GetAdminWorkspacesWithMembers {
  getAdminWorkspacesWithMembers {
    userId
    role
    requestedRole
    workspaceName
    workspaceId
    user {
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
 * __useGetAdminWorkspacesWithMembersQuery__
 *
 * To run a query within a React component, call `useGetAdminWorkspacesWithMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminWorkspacesWithMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminWorkspacesWithMembersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAdminWorkspacesWithMembersQuery(baseOptions?: Apollo.QueryHookOptions<GetAdminWorkspacesWithMembersQuery, GetAdminWorkspacesWithMembersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAdminWorkspacesWithMembersQuery, GetAdminWorkspacesWithMembersQueryVariables>(GetAdminWorkspacesWithMembersDocument, options);
      }
export function useGetAdminWorkspacesWithMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAdminWorkspacesWithMembersQuery, GetAdminWorkspacesWithMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAdminWorkspacesWithMembersQuery, GetAdminWorkspacesWithMembersQueryVariables>(GetAdminWorkspacesWithMembersDocument, options);
        }
export function useGetAdminWorkspacesWithMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAdminWorkspacesWithMembersQuery, GetAdminWorkspacesWithMembersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAdminWorkspacesWithMembersQuery, GetAdminWorkspacesWithMembersQueryVariables>(GetAdminWorkspacesWithMembersDocument, options);
        }
export type GetAdminWorkspacesWithMembersQueryHookResult = ReturnType<typeof useGetAdminWorkspacesWithMembersQuery>;
export type GetAdminWorkspacesWithMembersLazyQueryHookResult = ReturnType<typeof useGetAdminWorkspacesWithMembersLazyQuery>;
export type GetAdminWorkspacesWithMembersSuspenseQueryHookResult = ReturnType<typeof useGetAdminWorkspacesWithMembersSuspenseQuery>;
export type GetAdminWorkspacesWithMembersQueryResult = Apollo.QueryResult<GetAdminWorkspacesWithMembersQuery, GetAdminWorkspacesWithMembersQueryVariables>;
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
    icon
    assistantModel
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
export const GetInvitationInfoDocument = gql`
    query GetInvitationInfo($hash: String!) {
  getInvitationInfo(hash: $hash) {
    invitedUser {
      id
      firstName
      lastName
      email
    }
    inviter {
      id
      firstName
      lastName
      email
    }
    role
    workspace {
      id
      name
      owner {
        id
        firstName
        lastName
      }
    }
  }
}
    `;

/**
 * __useGetInvitationInfoQuery__
 *
 * To run a query within a React component, call `useGetInvitationInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationInfoQuery({
 *   variables: {
 *      hash: // value for 'hash'
 *   },
 * });
 */
export function useGetInvitationInfoQuery(baseOptions: Apollo.QueryHookOptions<GetInvitationInfoQuery, GetInvitationInfoQueryVariables> & ({ variables: GetInvitationInfoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInvitationInfoQuery, GetInvitationInfoQueryVariables>(GetInvitationInfoDocument, options);
      }
export function useGetInvitationInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInvitationInfoQuery, GetInvitationInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInvitationInfoQuery, GetInvitationInfoQueryVariables>(GetInvitationInfoDocument, options);
        }
export function useGetInvitationInfoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInvitationInfoQuery, GetInvitationInfoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetInvitationInfoQuery, GetInvitationInfoQueryVariables>(GetInvitationInfoDocument, options);
        }
export type GetInvitationInfoQueryHookResult = ReturnType<typeof useGetInvitationInfoQuery>;
export type GetInvitationInfoLazyQueryHookResult = ReturnType<typeof useGetInvitationInfoLazyQuery>;
export type GetInvitationInfoSuspenseQueryHookResult = ReturnType<typeof useGetInvitationInfoSuspenseQuery>;
export type GetInvitationInfoQueryResult = Apollo.QueryResult<GetInvitationInfoQuery, GetInvitationInfoQueryVariables>;
export const GetPendingRoleRequestsDocument = gql`
    query GetPendingRoleRequests($workspaceId: String!) {
  getPendingRoleRequests(workspaceId: $workspaceId) {
    userId
    role
    requestedRole
    user {
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
 * __useGetPendingRoleRequestsQuery__
 *
 * To run a query within a React component, call `useGetPendingRoleRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPendingRoleRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPendingRoleRequestsQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetPendingRoleRequestsQuery(baseOptions: Apollo.QueryHookOptions<GetPendingRoleRequestsQuery, GetPendingRoleRequestsQueryVariables> & ({ variables: GetPendingRoleRequestsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPendingRoleRequestsQuery, GetPendingRoleRequestsQueryVariables>(GetPendingRoleRequestsDocument, options);
      }
export function useGetPendingRoleRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPendingRoleRequestsQuery, GetPendingRoleRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPendingRoleRequestsQuery, GetPendingRoleRequestsQueryVariables>(GetPendingRoleRequestsDocument, options);
        }
export function useGetPendingRoleRequestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPendingRoleRequestsQuery, GetPendingRoleRequestsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPendingRoleRequestsQuery, GetPendingRoleRequestsQueryVariables>(GetPendingRoleRequestsDocument, options);
        }
export type GetPendingRoleRequestsQueryHookResult = ReturnType<typeof useGetPendingRoleRequestsQuery>;
export type GetPendingRoleRequestsLazyQueryHookResult = ReturnType<typeof useGetPendingRoleRequestsLazyQuery>;
export type GetPendingRoleRequestsSuspenseQueryHookResult = ReturnType<typeof useGetPendingRoleRequestsSuspenseQuery>;
export type GetPendingRoleRequestsQueryResult = Apollo.QueryResult<GetPendingRoleRequestsQuery, GetPendingRoleRequestsQueryVariables>;
export const GetPendingInvitesDocument = gql`
    query GetPendingInvites($workspaceId: String!) {
  getPendingInvites(workspaceId: $workspaceId) {
    userId
    role
    requestedRole
    user {
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
 * __useGetPendingInvitesQuery__
 *
 * To run a query within a React component, call `useGetPendingInvitesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPendingInvitesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPendingInvitesQuery({
 *   variables: {
 *      workspaceId: // value for 'workspaceId'
 *   },
 * });
 */
export function useGetPendingInvitesQuery(baseOptions: Apollo.QueryHookOptions<GetPendingInvitesQuery, GetPendingInvitesQueryVariables> & ({ variables: GetPendingInvitesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPendingInvitesQuery, GetPendingInvitesQueryVariables>(GetPendingInvitesDocument, options);
      }
export function useGetPendingInvitesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPendingInvitesQuery, GetPendingInvitesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPendingInvitesQuery, GetPendingInvitesQueryVariables>(GetPendingInvitesDocument, options);
        }
export function useGetPendingInvitesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPendingInvitesQuery, GetPendingInvitesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPendingInvitesQuery, GetPendingInvitesQueryVariables>(GetPendingInvitesDocument, options);
        }
export type GetPendingInvitesQueryHookResult = ReturnType<typeof useGetPendingInvitesQuery>;
export type GetPendingInvitesLazyQueryHookResult = ReturnType<typeof useGetPendingInvitesLazyQuery>;
export type GetPendingInvitesSuspenseQueryHookResult = ReturnType<typeof useGetPendingInvitesSuspenseQuery>;
export type GetPendingInvitesQueryResult = Apollo.QueryResult<GetPendingInvitesQuery, GetPendingInvitesQueryVariables>;