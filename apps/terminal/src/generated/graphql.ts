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
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AiResult = {
  __typename?: 'AiResult';
  chatId?: Maybe<Scalars['String']['output']>;
  result: Scalars['String']['output'];
};

export type AuditLog = {
  __typename?: 'AuditLog';
  action: Scalars['String']['output'];
  actorId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  ip?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  requestId?: Maybe<Scalars['String']['output']>;
  resourceId?: Maybe<Scalars['String']['output']>;
  resourceType?: Maybe<Scalars['String']['output']>;
  result: AuditResult;
  workspaceId?: Maybe<Scalars['String']['output']>;
};

export enum AuditResult {
  Denied = 'DENIED',
  Failure = 'FAILURE',
  Success = 'SUCCESS'
}

export type AuthPayload = {
  __typename?: 'AuthPayload';
  id: Scalars['String']['output'];
  roles?: Maybe<Scalars['JSON']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  user: User;
};

export type Bounty = {
  __typename?: 'Bounty';
  background?: Maybe<Scalars['String']['output']>;
  chainId?: Maybe<Scalars['Int']['output']>;
  dataHints: Array<Scalars['String']['output']>;
  deadline?: Maybe<Scalars['DateTime']['output']>;
  deliverables: Array<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  featured: Scalars['Boolean']['output'];
  fundTxHash?: Maybe<Scalars['String']['output']>;
  isMine: Scalars['Boolean']['output'];
  judging: Array<Scalars['String']['output']>;
  onchainId?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  postedOn?: Maybe<Scalars['String']['output']>;
  prizeTiers: Array<BountyPrizeTier>;
  prizes: Array<Scalars['String']['output']>;
  requirements: Array<Scalars['String']['output']>;
  reward?: Maybe<Scalars['String']['output']>;
  rewardAmount?: Maybe<Scalars['String']['output']>;
  rewardToken?: Maybe<Scalars['String']['output']>;
  sample: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  sponsor: Scalars['String']['output'];
  sponsorAddress?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  winners: Array<BountyWinner>;
};

export type BountyEntry = {
  __typename?: 'BountyEntry';
  attestation?: Maybe<NotebookAttestation>;
  author: Scalars['String']['output'];
  bountySlug: Scalars['String']['output'];
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isMine: Scalars['Boolean']['output'];
  notebookSlug?: Maybe<Scalars['String']['output']>;
  notebookTitle: Scalars['String']['output'];
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  trusted: Scalars['Boolean']['output'];
  wallet?: Maybe<Scalars['String']['output']>;
};

export type BountyPrizeTier = {
  __typename?: 'BountyPrizeTier';
  amount: Scalars['String']['output'];
  place: Scalars['Int']['output'];
};

export type BountyWinner = {
  __typename?: 'BountyWinner';
  address?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['String']['output']>;
  author: Scalars['String']['output'];
  notebookSlug: Scalars['String']['output'];
  notes?: Maybe<Array<Scalars['String']['output']>>;
  place: Scalars['String']['output'];
};

export type Chat = {
  __typename?: 'Chat';
  createdAt: Scalars['DateTime']['output'];
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isPrivate: Scalars['Boolean']['output'];
  lastContext?: Maybe<Scalars['JSON']['output']>;
  messages?: Maybe<Array<Message>>;
  pin: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
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

export type ContractAbi = {
  __typename?: 'ContractAbi';
  events: Array<ContractEvent>;
  functions: Array<ContractFunction>;
};

export type ContractEvent = {
  __typename?: 'ContractEvent';
  name: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  topic0: Scalars['String']['output'];
};

export type ContractFunction = {
  __typename?: 'ContractFunction';
  name: Scalars['String']['output'];
  selector: Scalars['String']['output'];
  signature: Scalars['String']['output'];
};

export type CreateBountyInput = {
  background?: InputMaybe<Scalars['String']['input']>;
  deadline: Scalars['DateTime']['input'];
  deliverables?: InputMaybe<Array<Scalars['String']['input']>>;
  details: Scalars['String']['input'];
  prizes: Array<Scalars['String']['input']>;
  requirements?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardToken: Scalars['String']['input'];
  sponsor: Scalars['String']['input'];
  summary: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};

export type CreateChatInput = {
  documentId: Scalars['String']['input'];
  focusedBlocks?: InputMaybe<Array<FocusedBlockInput>>;
  message: Scalars['String']['input'];
  model: Scalars['String']['input'];
  /** Optional custom title. Auto-generated from message if not provided. */
  title?: InputMaybe<Scalars['String']['input']>;
  /** Whether to update the document title from the chat message. Defaults to false. */
  updateDocumentTitle?: InputMaybe<Scalars['Boolean']['input']>;
  workspaceId: Scalars['String']['input'];
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
  runtime?: InputMaybe<DocumentRuntime>;
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
  description?: Maybe<Scalars['String']['output']>;
  favoriteCount: Scalars['Int']['output'];
  forkCount: Scalars['Int']['output'];
  hasDashboard: Scalars['Boolean']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isDashboardPublic: Scalars['Boolean']['output'];
  isDataApp: Scalars['Boolean']['output'];
  isFavorite: Scalars['Boolean']['output'];
  isSyncedWithYjs: Scalars['Boolean']['output'];
  orderIndex: Scalars['Float']['output'];
  parent?: Maybe<Document>;
  parentId?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  runSQLSelection: Scalars['Boolean']['output'];
  runUnexecutedBlocks: Scalars['Boolean']['output'];
  runtime: DocumentRuntime;
  shareLinksWithoutSidebar: Scalars['Boolean']['output'];
  /** Showcase metadata, when the notebook is part of the Showcase */
  showcase?: Maybe<Scalars['JSON']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userAppClock: Scalars['JSON']['output'];
  version: Scalars['Float']['output'];
  visibility: DocumentVisibility;
  workspaceId: Scalars['String']['output'];
};

export enum DocumentRuntime {
  BrowserAnalysis = 'BROWSER_ANALYSIS',
  BrowserDashboard = 'BROWSER_DASHBOARD',
  Cloud = 'CLOUD'
}

export enum DocumentVisibility {
  Link = 'LINK',
  Public = 'PUBLIC',
  Unlisted = 'UNLISTED',
  Workspace = 'WORKSPACE'
}

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
  workspaceId?: InputMaybe<Scalars['String']['input']>;
};

export type FavoritePublicDocumentInput = {
  documentId: Scalars['String']['input'];
};

export type FocusedBlockInput = {
  id: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type ForkDocumentInput = {
  documentId: Scalars['String']['input'];
  targetWorkspaceId: Scalars['String']['input'];
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
  finishReason?: Maybe<Scalars['String']['output']>;
  focusedBlocks?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  model?: Maybe<Scalars['String']['output']>;
  parts?: Maybe<Scalars['JSON']['output']>;
  role: Scalars['String']['output'];
  usage?: Maybe<Scalars['JSON']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Accept workspace invitation with hash from email */
  acceptWorkspaceInvitation: Scalars['Boolean']['output'];
  /** Mark a public document as a favorite */
  addPublicFavoriteDocument: Document;
  /** Mark a document as a favorite in workspace */
  addWorkspaceFavoriteDocument: Document;
  /** Approve a pending role request */
  approveRoleRequest: Scalars['Boolean']['output'];
  /** Approve a claim lead: marks the case study it names as claimed by the protocol's team. Needs the studio password, or a staff account. */
  approveShowcaseClaim: Scalars['Boolean']['output'];
  /** Approves the scope of a research request: the work starts and it counts toward the allowance. */
  approveTerminalRequestScope: TerminalRequest;
  /** Puts briefing items away for this member, or back. Archiving reads them too. */
  archiveTerminalBriefing: Scalars['Boolean']['output'];
  /** Start committing a cloud notebook's inputs (its code, data sources, parameters and when it ran) onchain, with a validator re-checking them. Returns at once with pending set: follow it with getNotebookTrust. Run the notebook first. Bounties accept only attested notebooks. */
  attestNotebook: NotebookTrust;
  /** Remove multiple users from workspaces */
  batchRemoveUsersFromWorkspace: Scalars['Boolean']['output'];
  /** Check a funding transaction onchain and open the bounty. Everything is read from the chain. */
  confirmBountyFunding: Bounty;
  /** Create a bounty as a draft. It is listed once its reward is funded in escrow. */
  createBounty: Bounty;
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
  /** Set a client up: its details, plan, what to track and an invite for its admin. Staff only. */
  createTerminalClient: TerminalTeamClient;
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
  /** Delete a Showcase category that has no notebooks filed under it. Needs the studio password, or a staff account. */
  deleteShowcaseCategory: Scalars['Boolean']['output'];
  /** Remove an uploaded protocol logo, so the protocol shows DefiLlama's icon again. Needs the studio password, or a staff account. */
  deleteShowcaseLogo: Scalars['Boolean']['output'];
  /** Remove a key number and its readings. Staff only. */
  deleteTerminalKpi: Scalars['Boolean']['output'];
  /** Delete a workspace */
  deleteWorkspace: Scalars['Boolean']['output'];
  /** Create a duplicate of a document in the same workspace */
  duplicateDocument: Document;
  editPythonWithAi: AiResult;
  editSqlWithAi: AiResult;
  editTextWithAi: AiResult;
  editTitleWithAi: Scalars['String']['output'];
  /** Permanently delete all trashed documents in a workspace */
  emptyTrash: Scalars['Boolean']['output'];
  fixPythonWithAi: AiResult;
  fixSqlWithAi: AiResult;
  /** Follow User */
  followUser: Profile;
  /** Fork a documents */
  forkDocument: Document;
  /** Invite a user to workspace by email */
  inviteUserToWorkspace: Scalars['Boolean']['output'];
  /** Sign in */
  login: AuthPayload;
  markTerminalBriefingRead: Scalars['Boolean']['output'];
  /** Records that the user opened Briefing now: the start of their next "since your last visit". */
  markTerminalBriefingSeen: Scalars['Boolean']['output'];
  /** Puts briefing items back to unread, and out of the archive. */
  markTerminalBriefingUnread: Scalars['Boolean']['output'];
  /** The current member has seen the welcome; it is not shown again. */
  markTerminalWelcomed: Scalars['Boolean']['output'];
  /** Pin or unpin a chat */
  pinChat: Chat;
  /** Publish a document */
  publishDocument: Document;
  /** Record a reading by hand; one for the same date is replaced. Staff only. */
  recordTerminalKpiValue: TerminalKpiDefinition;
  /** Reject a pending role request */
  rejectRoleRequest: Scalars['Boolean']['output'];
  /** Unmark a document as a favorite */
  removePublicFavoriteDocument: Document;
  /** Remove a user from workspace */
  removeUserFromWorkspace: Scalars['Boolean']['output'];
  /** Retract a vote on a message */
  removeVote: Scalars['Boolean']['output'];
  /** Unmark a document as a favorite */
  removeWorkspaceFavoriteDocument: Document;
  /** Request a role upgrade in a workspace */
  requestRoleUpgrade: Scalars['Boolean']['output'];
  /** Restart the Jupyter environment */
  restartEnvironment: Environment;
  /** Restore a previously deleted document */
  restoreDocument: Document;
  /** Run one of a client's notebooks on their behalf, as the staff member (who needs edit access to it). Staff only. */
  runTerminalSource: TerminalSourceRun;
  /** Create a Showcase category, or change the one with the same slug. Needs the studio password, or a staff account. */
  saveShowcaseCategory: Scalars['Boolean']['output'];
  /** Set a chain's color and its place among the Showcase chain filters. Needs the studio password, or a staff account. */
  saveShowcaseChain: Scalars['Boolean']['output'];
  /** Set a protocol's logo: a base64 PNG, JPEG or WebP of up to 256 KB, served at /api/showcase/logos/:slug. Needs the studio password, or a staff account. */
  saveShowcaseLogo: Scalars['Boolean']['output'];
  /** Set an official notebook's Showcase metadata, or pass null to take it off the Showcase. Needs the studio password, or a staff account. */
  saveShowcaseNotebook: Scalars['Boolean']['output'];
  /** Set a protocol's links (website, twitter, github, discord, telegram), as URLs or handles. Empty ones are removed. Needs the studio password, or a staff account. */
  saveShowcaseProtocolLinks: Scalars['Boolean']['output'];
  /** Create a key number, or change the one with this key. What is not sent stays. Staff only. */
  saveTerminalKpi: TerminalKpiDefinition;
  /** Save the current user's terminal setup, as far as they have filled it in. */
  saveTerminalSetup: TerminalSetup;
  /** Send a user message */
  sendMessage: Message;
  /** Mark a client's admin invite as sent (the admin joins by signing in with the invited email). Staff only. */
  sendTerminalInvite: TerminalTeamClient;
  /** Let any authenticated user with the link view this document read-only, without publishing it to the community */
  setDocumentLinkVisibility: Document;
  /** Set a notebook's Showcase metadata, or pass null to take it off the Showcase. */
  setDocumentShowcase: Scalars['Boolean']['output'];
  /** Share a document by an unguessable link that anyone can open without signing in. It is never listed or searched. Run again with rotate to replace the link; the old one stops working */
  setDocumentUnlisted: Document;
  /** Add or remove environment variables */
  setEnvironmentVariables: Array<EnvironmentVariable>;
  setTerminalSignalFeedback: TerminalSignal;
  setTerminalSignalStatus: TerminalSignal;
  setWorkspaceDefaultAiModel: Scalars['Boolean']['output'];
  /** Dev only: simulate a payment and set the workspace plan */
  simulateWorkspaceUpgrade: Workspace;
  /** Record the notebook the current user is writing for a bounty. */
  startBountyEntry: BountyEntry;
  /** Move a free workspace onto the trial plan */
  startWorkspaceTrial: Workspace;
  /** Submit a published notebook as the current user's entry. A bounty funded in escrow needs the wallet the reward should be paid to. */
  submitBountyEntry: BountyEntry;
  /** Ask for a protocol to be covered, ask for a report, or claim the case study about your protocol. Saved for the sales team. */
  submitShowcaseLead: Scalars['Boolean']['output'];
  submitTerminalRequest: TerminalRequest;
  /** Switch to a different workspace */
  switchWorkspace: Scalars['Boolean']['output'];
  /** Read a funded bounty's escrow and record who was paid and whether it is closed. Everything is read from the chain. */
  syncBountyEscrow: Bounty;
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
  /** Upvote or downvote a message */
  voteMessage: Vote;
};


export type MutationAcceptWorkspaceInvitationArgs = {
  hash: Scalars['String']['input'];
};


export type MutationAddPublicFavoriteDocumentArgs = {
  input: FavoritePublicDocumentInput;
};


export type MutationAddWorkspaceFavoriteDocumentArgs = {
  input: FavoriteDocumentInput;
};


export type MutationApproveRoleRequestArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationApproveShowcaseClaimArgs = {
  leadId: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};


export type MutationApproveTerminalRequestScopeArgs = {
  requestId: Scalars['ID']['input'];
};


export type MutationArchiveTerminalBriefingArgs = {
  isArchived: Scalars['Boolean']['input'];
  itemIds: Array<Scalars['ID']['input']>;
};


export type MutationAttestNotebookArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationBatchRemoveUsersFromWorkspaceArgs = {
  removals: Array<RemoveUserFromWorkspaceInput>;
};


export type MutationConfirmBountyFundingArgs = {
  chainId: Scalars['Int']['input'];
  slug: Scalars['String']['input'];
  txHash: Scalars['String']['input'];
};


export type MutationCreateBountyArgs = {
  input: CreateBountyInput;
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


export type MutationCreateTerminalClientArgs = {
  input: TerminalTeamClientDraftInput;
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


export type MutationDeleteShowcaseCategoryArgs = {
  password?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
};


export type MutationDeleteShowcaseLogoArgs = {
  password?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
};


export type MutationDeleteTerminalKpiArgs = {
  kpiId: Scalars['String']['input'];
};


export type MutationDeleteWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type MutationDuplicateDocumentArgs = {
  input: DuplicateDocumentInput;
};


export type MutationEditPythonWithAiArgs = {
  blockId: Scalars['String']['input'];
  chatId?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationEditSqlWithAiArgs = {
  blockId: Scalars['String']['input'];
  chatId?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationEditTextWithAiArgs = {
  blockId: Scalars['String']['input'];
  chatId?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationEditTitleWithAiArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationEmptyTrashArgs = {
  workspaceId: Scalars['String']['input'];
};


export type MutationFixPythonWithAiArgs = {
  blockId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationFixSqlWithAiArgs = {
  blockId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationFollowUserArgs = {
  username: Scalars['String']['input'];
};


export type MutationForkDocumentArgs = {
  input: ForkDocumentInput;
};


export type MutationInviteUserToWorkspaceArgs = {
  email: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkTerminalBriefingReadArgs = {
  itemIds: Array<Scalars['ID']['input']>;
};


export type MutationMarkTerminalBriefingUnreadArgs = {
  itemIds: Array<Scalars['ID']['input']>;
};


export type MutationPinChatArgs = {
  chatId: Scalars['String']['input'];
};


export type MutationPublishDocumentArgs = {
  documentId: Scalars['String']['input'];
  meta?: InputMaybe<PublishDocumentMetaInput>;
  workspaceId: Scalars['String']['input'];
};


export type MutationRecordTerminalKpiValueArgs = {
  input: TerminalKpiValueInput;
  kpiId: Scalars['String']['input'];
};


export type MutationRejectRoleRequestArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationRemovePublicFavoriteDocumentArgs = {
  input: FavoritePublicDocumentInput;
};


export type MutationRemoveUserFromWorkspaceArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationRemoveVoteArgs = {
  messageId: Scalars['String']['input'];
};


export type MutationRemoveWorkspaceFavoriteDocumentArgs = {
  input: FavoriteDocumentInput;
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


export type MutationRunTerminalSourceArgs = {
  clientId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
};


export type MutationSaveShowcaseCategoryArgs = {
  input: Scalars['JSON']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSaveShowcaseChainArgs = {
  input: Scalars['JSON']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSaveShowcaseLogoArgs = {
  imageBase64: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
};


export type MutationSaveShowcaseNotebookArgs = {
  documentId: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  showcase?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationSaveShowcaseProtocolLinksArgs = {
  input: Scalars['JSON']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSaveTerminalKpiArgs = {
  clientId: Scalars['String']['input'];
  input: TerminalKpiInput;
};


export type MutationSaveTerminalSetupArgs = {
  input: TerminalSetupInput;
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationSendTerminalInviteArgs = {
  clientId: Scalars['String']['input'];
};


export type MutationSetDocumentLinkVisibilityArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationSetDocumentShowcaseArgs = {
  documentId: Scalars['String']['input'];
  showcase?: InputMaybe<Scalars['JSON']['input']>;
  workspaceId: Scalars['String']['input'];
};


export type MutationSetDocumentUnlistedArgs = {
  documentId: Scalars['String']['input'];
  meta?: InputMaybe<PublishDocumentMetaInput>;
  rotate?: InputMaybe<Scalars['Boolean']['input']>;
  workspaceId: Scalars['String']['input'];
};


export type MutationSetEnvironmentVariablesArgs = {
  input: SetEnvironmentVariablesInput;
  workspaceId: Scalars['String']['input'];
};


export type MutationSetTerminalSignalFeedbackArgs = {
  feedback: Scalars['String']['input'];
  signalId: Scalars['ID']['input'];
};


export type MutationSetTerminalSignalStatusArgs = {
  signalId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};


export type MutationSetWorkspaceDefaultAiModelArgs = {
  model: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationSimulateWorkspaceUpgradeArgs = {
  plan: WorkspacePlan;
  workspaceId: Scalars['String']['input'];
};


export type MutationStartBountyEntryArgs = {
  documentId: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};


export type MutationStartWorkspaceTrialArgs = {
  workspaceId: Scalars['String']['input'];
};


export type MutationSubmitBountyEntryArgs = {
  documentId: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  wallet?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSubmitShowcaseLeadArgs = {
  input: Scalars['JSON']['input'];
};


export type MutationSubmitTerminalRequestArgs = {
  input: TerminalRequestInput;
};


export type MutationSwitchWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type MutationSyncBountyEscrowArgs = {
  slug: Scalars['String']['input'];
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


export type MutationVoteMessageArgs = {
  input: VoteMessageInput;
};

export type NotebookAttestation = {
  __typename?: 'NotebookAttestation';
  agentId: Scalars['String']['output'];
  agentUrl: Scalars['String']['output'];
  codeHash: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  documentId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  inputHash: Scalars['String']['output'];
  ranAt: Scalars['DateTime']['output'];
  receiptUri: Scalars['String']['output'];
  receiptUrl?: Maybe<Scalars['String']['output']>;
  requestHash: Scalars['String']['output'];
  requestTx: Scalars['String']['output'];
  requestTxUrl: Scalars['String']['output'];
  response?: Maybe<Scalars['Int']['output']>;
  responseTx?: Maybe<Scalars['String']['output']>;
  responseTxUrl?: Maybe<Scalars['String']['output']>;
  validator: Scalars['String']['output'];
};

export type NotebookTrust = {
  __typename?: 'NotebookTrust';
  attestation?: Maybe<NotebookAttestation>;
  pending: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  trusted: Scalars['Boolean']['output'];
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

export type PublishDocumentMetaInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Query = {
  __typename?: 'Query';
  /** Workspace audit trail (admins only), newest first */
  auditLogs: Array<AuditLog>;
  /** Get a chat with its messages */
  chat: Chat;
  /** Get messages for a chat */
  chatMessages: Array<Message>;
  /** List chats for workspace/document */
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
  /** Get all environment variables. Values are masked for viewers; editors and admins, who can change them, see them in full */
  environmentVariables: Array<EnvironmentVariable>;
  /** Get User favorite public documents */
  favoritePublicDocuments: Array<Document>;
  /** Check if a file exists */
  fileExists: Scalars['Boolean']['output'];
  /** Get all workspaces the current user is an admin of, with their members */
  getAdminWorkspacesWithMembers: Array<WorkspaceMember>;
  /** Get the listed bounties, in display order. Pass featured to get only the ones shown on the home page. */
  getBounties: Array<Bounty>;
  /** Get one bounty by its slug. A draft is returned only to its creator. */
  getBounty?: Maybe<Bounty>;
  /** Get the bounties the current user drafted in a workspace and has not funded yet. */
  getBountyDrafts: Array<Bounty>;
  /** Get the entries submitted to a bounty, oldest first. Wallets are returned only to the bounty's creator and to each entry's author. */
  getBountyEntries: Array<BountyEntry>;
  /** Get a reusable component by ID */
  getComponent: ReusableComponent;
  /** Fetch a verified contract's real function and event signatures from its block explorer ABI, for tool params that let a user pick one instead of guessing (e.g. calldata_decoder). */
  getContractAbi: ContractAbi;
  /** Get a single document by ID */
  getDocument: Document;
  /** Get the base64-encoded Yjs state of a document by ID (authenticated snapshot, used to render optimistically before the live collaboration socket syncs). With isApp, returns the caller's published view-mode copy instead of the editable doc, so view mode can load without the socket. */
  getDocumentState: Scalars['String']['output'];
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
  /** Get the entries the current user has started or submitted, across all bounties. */
  getMyBountyEntries: Array<BountyEntry>;
  /** The latest attestation of a notebook, or null if it has none. */
  getNotebookAttestation?: Maybe<NotebookAttestation>;
  /** Whether a notebook is trusted right now (attested, and unchanged since), and if not, why. */
  getNotebookTrust: NotebookTrust;
  /** Get all pending invites for a workspace */
  getPendingInvites: Array<WorkspaceMember>;
  /** Get pending role requests for a workspace */
  getPendingRoleRequests: Array<WorkspaceMember>;
  /** Get a published document by its public slug (unauthenticated) */
  getPublishedDocumentBySlug: Document;
  /** Get the base64-encoded Yjs state of a published document by its public slug (unauthenticated) */
  getPublishedDocumentState: Scalars['String']['output'];
  /** For the studio: every notebook in the official workspaces with its Showcase metadata (drafts too), and the leads that came in. Needs the studio password, or a staff account. */
  getShowcaseAdmin: Scalars['JSON']['output'];
  /** Notebooks the community published about a category (a chain or a sector), most forked first. Not on the Showcase itself: found by tag, title or description. */
  getShowcaseCommunity: Array<ShowcaseCommunityItem>;
  /** What the Showcase is laid out from: its taxonomy (groups, categories, chain order), chain colors and template sections. */
  getShowcaseConfig: Scalars['JSON']['output'];
  /** For the studio: the protocol logos that have been uploaded (slug, name and version, not the image). Needs the studio password, or a staff account. */
  getShowcaseLogos: Scalars['JSON']['output'];
  /** The official notebooks on the Showcase, newest first. Filter by category slug and by kind (category, case_study, working). */
  getShowcaseNotebooks: Array<ShowcaseNotebook>;
  /** Get the power tool category taxonomy */
  getToolCategories: Array<ToolCategory>;
  /** Get the full power tool catalog (SQL/Python analytics tools available to the notebook) */
  getTools: Array<Tool>;
  /** Get trending published documents across all workspaces */
  getTrendingPublishedDocuments: Array<Document>;
  /** Get user by id or username */
  getUser: User;
  /** Users who follow a given user */
  getUserFollowers: Array<User>;
  /** Users that a given user is following */
  getUserFollowing: Array<User>;
  /** Get public documents by a specific user */
  getUserPublicDocuments: Array<Document>;
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
  /** Auth user is following a userid  */
  isFollowing: Scalars['Boolean']['output'];
  /** List all files in a workspace */
  listFiles: Array<SandwormFile>;
  messageVote?: Maybe<Scalars['Boolean']['output']>;
  /** Get OpenRouter account credit usage */
  openRouterAccountCredits: OpenRouterAccountCredits;
  /** Get a specific OpenRouter model by ID */
  openRouterModel?: Maybe<OpenRouterModel>;
  /** List all available OpenRouter models */
  openRouterModels: Array<OpenRouterModel>;
  /** Get Profile */
  profile: Profile;
  /** Render a power tool's generated source for the given inputs. Returns the code the block would run, never the raw template. */
  renderToolSource: Scalars['String']['output'];
  /** Get a single schedule by ID */
  schedule: Schedule;
  /** Get all schedules for a document */
  schedules: Array<Schedule>;
  /** Semantic search over the power tool catalog. Returns the best matches first. */
  searchTools: Array<Tool>;
  tags: Array<Scalars['String']['output']>;
  /** The Analysis catalog of the user's terminal client: projects, regions and sectors with their reports. */
  terminalAnalysis: TerminalAnalysis;
  /** The user's briefing: recent items for their client and for them, with what they have read. */
  terminalBriefing: TerminalBriefing;
  /** One client with who reads it, what is open and the notebooks its terminal is built from. Staff only. */
  terminalClient: TerminalClientDetail;
  /** Every key number of a client, hidden ones too, with how each reads now. Staff only. */
  terminalClientKpis: Array<TerminalKpiDefinition>;
  /** Every terminal client, newest first. Staff only. */
  terminalClients: Array<TerminalTeamClient>;
  /** The numbers on the terminal section tabs: unread briefing, reports, open signals and open requests. */
  terminalCounts: TerminalCounts;
  /** Whether the current user is on the Sandworm team, for showing the terminal team tools. */
  terminalIsStaff: Scalars['Boolean']['output'];
  /** The key numbers on the Overview of the user's client, null before they belong to one. */
  terminalOverviewKpis?: Maybe<TerminalOverviewKpis>;
  /** The client's research requests and questions, with this year's research allowance. */
  terminalRequests: TerminalRequests;
  /** The signed-in user and the terminal client they belong to (null before their first setup save). */
  terminalSession: TerminalSession;
  /** The current user's terminal setup, or null before they first save it. */
  terminalSetup?: Maybe<TerminalSetup>;
  /** Patterns Sandworm saw in the client data and what they could mean, with the client triage. */
  terminalSignals: TerminalSignals;
};


export type QueryAuditLogsArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  actorId?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  result?: InputMaybe<AuditResult>;
  workspaceId: Scalars['String']['input'];
};


export type QueryChatArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryChatMessagesArgs = {
  chatId: Scalars['String']['input'];
};


export type QueryChatsArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
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


export type QueryGetBountiesArgs = {
  featured?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetBountyArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetBountyDraftsArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetBountyEntriesArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetComponentArgs = {
  componentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type QueryGetContractAbiArgs = {
  address: Scalars['String']['input'];
  chain: Scalars['String']['input'];
};


export type QueryGetDocumentArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type QueryGetDocumentStateArgs = {
  documentId: Scalars['String']['input'];
  isApp?: InputMaybe<Scalars['Boolean']['input']>;
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


export type QueryGetNotebookAttestationArgs = {
  documentId: Scalars['String']['input'];
};


export type QueryGetNotebookTrustArgs = {
  documentId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type QueryGetPendingInvitesArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetPendingRoleRequestsArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetPublishedDocumentBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetPublishedDocumentStateArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetShowcaseAdminArgs = {
  password?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetShowcaseCommunityArgs = {
  category: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetShowcaseLogosArgs = {
  password?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetShowcaseNotebooksArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  kind?: InputMaybe<Scalars['String']['input']>;
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


export type QueryGetUserPublicDocumentsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
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


export type QueryIsFollowingArgs = {
  followerId: Scalars['String']['input'];
};


export type QueryListFilesArgs = {
  input: ListFilesInput;
};


export type QueryMessageVoteArgs = {
  messageId: Scalars['String']['input'];
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


export type QueryRenderToolSourceArgs = {
  inputs: Scalars['JSON']['input'];
  toolId: Scalars['String']['input'];
};


export type QueryScheduleArgs = {
  scheduleId: Scalars['String']['input'];
};


export type QuerySchedulesArgs = {
  input: ListSchedulesInput;
};


export type QuerySearchToolsArgs = {
  limit?: Scalars['Int']['input'];
  query: Scalars['String']['input'];
};


export type QueryTerminalClientArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryTerminalClientKpisArgs = {
  clientId: Scalars['String']['input'];
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
  focusedBlocks?: InputMaybe<Array<FocusedBlockInput>>;
  model: Scalars['String']['input'];
};

export type SetEnvironmentVariablesInput = {
  add: Array<EnvironmentVariableInput>;
  remove: Array<Scalars['String']['input']>;
};

export type ShowcaseCommunityItem = {
  __typename?: 'ShowcaseCommunityItem';
  authorName?: Maybe<Scalars['String']['output']>;
  authorUsername?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  forks: Scalars['Int']['output'];
  /** It also has a public dashboard, at /notebooks/:slug/dashboard */
  hasDashboard: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  publishedAt: Scalars['DateTime']['output'];
  slug: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type ShowcaseNotebook = {
  __typename?: 'ShowcaseNotebook';
  /** official or community */
  author: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  /** The notebook has a dashboard its author left public */
  hasDashboard: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  publishedAt: Scalars['DateTime']['output'];
  showcase: Scalars['JSON']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type SocialLinksInput = {
  discord?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  github?: InputMaybe<Scalars['String']['input']>;
  telegram?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  warpcast?: InputMaybe<Scalars['String']['input']>;
};

export type TerminalAllowance = {
  __typename?: 'TerminalAllowance';
  resetsAt: Scalars['String']['output'];
  total: Scalars['Int']['output'];
  used: Scalars['Int']['output'];
};

export type TerminalAnalysis = {
  __typename?: 'TerminalAnalysis';
  subjects: Array<TerminalAnalysisSubject>;
};

export type TerminalAnalysisReport = {
  __typename?: 'TerminalAnalysisReport';
  id: Scalars['String']['output'];
  isNew: Scalars['Boolean']['output'];
  line: Scalars['String']['output'];
  path: Scalars['String']['output'];
  publishedAt: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type TerminalAnalysisSubject = {
  __typename?: 'TerminalAnalysisSubject';
  icon?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['String']['output'];
  impact: Scalars['String']['output'];
  impactSize: Scalars['Int']['output'];
  kind: Scalars['String']['output'];
  name: Scalars['String']['output'];
  reports: Array<TerminalAnalysisReport>;
  view: Scalars['String']['output'];
};

export type TerminalBriefing = {
  __typename?: 'TerminalBriefing';
  archivedCount: Scalars['Int']['output'];
  items: Array<TerminalBriefingItem>;
  lastSeenAt?: Maybe<Scalars['String']['output']>;
};

export type TerminalBriefingItem = {
  __typename?: 'TerminalBriefingItem';
  detail: Scalars['JSON']['output'];
  id: Scalars['String']['output'];
  isArchived: Scalars['Boolean']['output'];
  isRead: Scalars['Boolean']['output'];
  kind: Scalars['String']['output'];
  publishedAt: Scalars['String']['output'];
  sourcePath?: Maybe<Scalars['String']['output']>;
  subject: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type TerminalClientDetail = {
  __typename?: 'TerminalClientDetail';
  adminEmail?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastReadAt?: Maybe<Scalars['String']['output']>;
  members: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  newSignals: Scalars['Int']['output'];
  openRequests: Scalars['Int']['output'];
  plan: Scalars['String']['output'];
  researchAllowance: Scalars['Int']['output'];
  sources: Array<TerminalClientSource>;
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
  website: Scalars['String']['output'];
};

export type TerminalClientSource = {
  __typename?: 'TerminalClientSource';
  cells: Scalars['Int']['output'];
  documentId: Scalars['String']['output'];
  items: Scalars['Int']['output'];
  lastRanAt?: Maybe<Scalars['String']['output']>;
  path: Scalars['String']['output'];
  schedule?: Maybe<TerminalSourceSchedule>;
  title: Scalars['String']['output'];
};

export type TerminalCounts = {
  __typename?: 'TerminalCounts';
  analysis: Scalars['Int']['output'];
  briefing: Scalars['Int']['output'];
  requests: Scalars['Int']['output'];
  signals: Scalars['Int']['output'];
};

export type TerminalGoals = {
  __typename?: 'TerminalGoals';
  selected: Array<Scalars['String']['output']>;
};

export type TerminalGoalsInput = {
  selected: Array<Scalars['String']['input']>;
};

export type TerminalInvite = {
  __typename?: 'TerminalInvite';
  access: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type TerminalInviteInput = {
  access: Scalars['String']['input'];
  email: Scalars['String']['input'];
  id: Scalars['String']['input'];
};

export type TerminalKpi = {
  __typename?: 'TerminalKpi';
  comparison?: Maybe<Scalars['String']['output']>;
  delta?: Maybe<TerminalKpiDelta>;
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type TerminalKpiDefinition = {
  __typename?: 'TerminalKpiDefinition';
  comparison: Scalars['JSON']['output'];
  description: Scalars['String']['output'];
  direction: Scalars['String']['output'];
  display: TerminalKpi;
  format: Scalars['JSON']['output'];
  id: Scalars['String']['output'];
  isVisible: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  lastReadingAt?: Maybe<Scalars['String']['output']>;
  position: Scalars['Int']['output'];
  settings: Scalars['JSON']['output'];
  source: Scalars['JSON']['output'];
  subjectId?: Maybe<Scalars['String']['output']>;
};

export type TerminalKpiDelta = {
  __typename?: 'TerminalKpiDelta';
  text: Scalars['String']['output'];
  tone: Scalars['String']['output'];
};

export type TerminalKpiInput = {
  comparison?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  direction?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<Scalars['JSON']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  key: Scalars['String']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  source?: InputMaybe<Scalars['JSON']['input']>;
  subjectId?: InputMaybe<Scalars['String']['input']>;
};

export type TerminalKpiValueInput = {
  asOf?: InputMaybe<Scalars['String']['input']>;
  previous?: InputMaybe<Scalars['Float']['input']>;
  textValue?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['Float']['input']>;
};

export type TerminalOrganisation = {
  __typename?: 'TerminalOrganisation';
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
  website: Scalars['String']['output'];
};

export type TerminalOrganisationInput = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
  website: Scalars['String']['input'];
};

export type TerminalOverviewKpis = {
  __typename?: 'TerminalOverviewKpis';
  clientStatus: Scalars['String']['output'];
  clientType: Scalars['String']['output'];
  kpis: Array<TerminalKpi>;
};

export type TerminalRequest = {
  __typename?: 'TerminalRequest';
  about: Array<Scalars['String']['output']>;
  approvedAt?: Maybe<Scalars['String']['output']>;
  closedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  outcome?: Maybe<Scalars['String']['output']>;
  progressNote?: Maybe<Scalars['String']['output']>;
  question: Scalars['String']['output'];
  reportPath?: Maybe<Scalars['String']['output']>;
  requestedBy?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['JSON']['output']>;
  scopedAt?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  submittedAt: Scalars['String']['output'];
  timing?: Maybe<Scalars['String']['output']>;
  useCase?: Maybe<Scalars['String']['output']>;
};

export type TerminalRequestInput = {
  about: Array<Scalars['String']['input']>;
  files: Array<Scalars['String']['input']>;
  kind: Scalars['String']['input'];
  question: Scalars['String']['input'];
  timing?: InputMaybe<Scalars['String']['input']>;
  useCase?: InputMaybe<Scalars['String']['input']>;
};

export type TerminalRequests = {
  __typename?: 'TerminalRequests';
  allowance: TerminalAllowance;
  requests: Array<TerminalRequest>;
};

export type TerminalSession = {
  __typename?: 'TerminalSession';
  client?: Maybe<TerminalSessionClient>;
  firstBriefingDays: Scalars['Int']['output'];
  needsWelcome: Scalars['Boolean']['output'];
  user: TerminalSessionUser;
};

export type TerminalSessionClient = {
  __typename?: 'TerminalSessionClient';
  access: Scalars['String']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type TerminalSessionUser = {
  __typename?: 'TerminalSessionUser';
  name: Scalars['String']['output'];
};

export type TerminalSetup = {
  __typename?: 'TerminalSetup';
  goals: TerminalGoals;
  organisation: TerminalOrganisation;
  team: TerminalTeam;
  tracking: TerminalTracking;
};

export type TerminalSetupInput = {
  goals: TerminalGoalsInput;
  organisation: TerminalOrganisationInput;
  team: TerminalTeamInput;
  tracking: TerminalTrackingInput;
};

export type TerminalSignal = {
  __typename?: 'TerminalSignal';
  couldMean: Scalars['String']['output'];
  evidence: Scalars['String']['output'];
  feedback: Scalars['String']['output'];
  id: Scalars['String']['output'];
  kind: Scalars['String']['output'];
  observed: Scalars['String']['output'];
  publishedAt: Scalars['String']['output'];
  reportPath?: Maybe<Scalars['String']['output']>;
  size: Scalars['String']['output'];
  sizeLabel: Scalars['String']['output'];
  status: Scalars['String']['output'];
  subject: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type TerminalSignals = {
  __typename?: 'TerminalSignals';
  items: Array<TerminalSignal>;
};

export type TerminalSourceRun = {
  __typename?: 'TerminalSourceRun';
  cells: Scalars['Int']['output'];
  failed: Array<TerminalSourceRunFailure>;
  status: Scalars['String']['output'];
};

export type TerminalSourceRunFailure = {
  __typename?: 'TerminalSourceRunFailure';
  message: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type TerminalSourceSchedule = {
  __typename?: 'TerminalSourceSchedule';
  isActive: Scalars['Boolean']['output'];
  lastRunAt?: Maybe<Scalars['String']['output']>;
  nextRunAt?: Maybe<Scalars['String']['output']>;
};

export type TerminalTeam = {
  __typename?: 'TerminalTeam';
  invites: Array<TerminalInvite>;
};

export type TerminalTeamClient = {
  __typename?: 'TerminalTeamClient';
  adminEmail?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  plan: Scalars['String']['output'];
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type TerminalTeamClientDraftInput = {
  details: TerminalTeamDetailsInput;
  inviteTiming: Scalars['String']['input'];
  starterIds: Array<Scalars['String']['input']>;
  tracking: TerminalTrackingInput;
};

export type TerminalTeamDetails = {
  __typename?: 'TerminalTeamDetails';
  adminEmail: Scalars['String']['output'];
  adminName: Scalars['String']['output'];
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
  plan: Scalars['String']['output'];
  type: Scalars['String']['output'];
  website: Scalars['String']['output'];
};

export type TerminalTeamDetailsInput = {
  adminEmail: Scalars['String']['input'];
  adminName: Scalars['String']['input'];
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  plan: Scalars['String']['input'];
  type: Scalars['String']['input'];
  website: Scalars['String']['input'];
};

export type TerminalTeamInput = {
  invites: Array<TerminalInviteInput>;
};

export type TerminalTracking = {
  __typename?: 'TerminalTracking';
  addresses: Scalars['String']['output'];
  autoDiscover: Scalars['Boolean']['output'];
  competitors: Array<Scalars['String']['output']>;
  regions: Array<Scalars['String']['output']>;
  shareInternalData: Scalars['Boolean']['output'];
};

export type TerminalTrackingInput = {
  addresses: Scalars['String']['input'];
  autoDiscover: Scalars['Boolean']['input'];
  competitors: Array<Scalars['String']['input']>;
  regions: Array<Scalars['String']['input']>;
  shareInternalData: Scalars['Boolean']['input'];
};

export type Tool = {
  __typename?: 'Tool';
  categoryId: Scalars['String']['output'];
  description: Scalars['String']['output'];
  g1?: Maybe<Scalars['String']['output']>;
  g2?: Maybe<Scalars['String']['output']>;
  g3?: Maybe<Scalars['String']['output']>;
  g4?: Maybe<Scalars['String']['output']>;
  g5?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  params: Scalars['JSON']['output'];
  /** Workspace environment variables the tool needs, by name: [{ name, description }] */
  requiredEnv: Scalars['JSON']['output'];
  returns: Scalars['JSON']['output'];
  scope?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
  toolId: Scalars['String']['output'];
};

export type ToolCategory = {
  __typename?: 'ToolCategory';
  categoryId: Scalars['String']['output'];
  description: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type UpdateChatInput = {
  chatId: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDocumentInput = {
  isDashboardPublic?: InputMaybe<Scalars['Boolean']['input']>;
  orderIndex: Scalars['Float']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  runSQLSelection?: InputMaybe<Scalars['Boolean']['input']>;
  runUnexecutedBlocks?: InputMaybe<Scalars['Boolean']['input']>;
  runtime?: InputMaybe<DocumentRuntime>;
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
  firstName?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
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

export type Vote = {
  __typename?: 'Vote';
  createdAt: Scalars['DateTime']['output'];
  isUpvoted: Scalars['Boolean']['output'];
  messageId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type VoteMessageInput = {
  isUpvoted: Scalars['Boolean']['input'];
  messageId: Scalars['String']['input'];
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
  joinedAt?: Maybe<Scalars['DateTime']['output']>;
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

export type TerminalRequestFieldsFragment = { __typename?: 'TerminalRequest', id: string, kind: string, question: string, status: string, useCase?: string | null, about: Array<string>, timing?: string | null, requestedBy?: string | null, scope?: any | null, progressNote?: string | null, outcome?: string | null, reportPath?: string | null, submittedAt: string, scopedAt?: string | null, approvedAt?: string | null, closedAt?: string | null };

export type MarkTerminalBriefingReadMutationVariables = Exact<{
  itemIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type MarkTerminalBriefingReadMutation = { __typename?: 'Mutation', markTerminalBriefingRead: boolean };

export type MarkTerminalBriefingSeenMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkTerminalBriefingSeenMutation = { __typename?: 'Mutation', markTerminalBriefingSeen: boolean };

export type MarkTerminalBriefingUnreadMutationVariables = Exact<{
  itemIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type MarkTerminalBriefingUnreadMutation = { __typename?: 'Mutation', markTerminalBriefingUnread: boolean };

export type ArchiveTerminalBriefingMutationVariables = Exact<{
  itemIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
  isArchived: Scalars['Boolean']['input'];
}>;


export type ArchiveTerminalBriefingMutation = { __typename?: 'Mutation', archiveTerminalBriefing: boolean };

export type SubmitTerminalRequestMutationVariables = Exact<{
  input: TerminalRequestInput;
}>;


export type SubmitTerminalRequestMutation = { __typename?: 'Mutation', submitTerminalRequest: { __typename?: 'TerminalRequest', id: string } };

export type ApproveTerminalRequestScopeMutationVariables = Exact<{
  requestId: Scalars['ID']['input'];
}>;


export type ApproveTerminalRequestScopeMutation = { __typename?: 'Mutation', approveTerminalRequestScope: { __typename?: 'TerminalRequest', id: string } };

export type SetTerminalSignalStatusMutationVariables = Exact<{
  signalId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
}>;


export type SetTerminalSignalStatusMutation = { __typename?: 'Mutation', setTerminalSignalStatus: { __typename?: 'TerminalSignal', id: string, status: string } };

export type SetTerminalSignalFeedbackMutationVariables = Exact<{
  signalId: Scalars['ID']['input'];
  feedback: Scalars['String']['input'];
}>;


export type SetTerminalSignalFeedbackMutation = { __typename?: 'Mutation', setTerminalSignalFeedback: { __typename?: 'TerminalSignal', id: string, feedback: string } };

export type TerminalAnalysisQueryVariables = Exact<{ [key: string]: never; }>;


export type TerminalAnalysisQuery = { __typename?: 'Query', terminalAnalysis: { __typename?: 'TerminalAnalysis', subjects: Array<{ __typename?: 'TerminalAnalysisSubject', id: string, view: string, name: string, icon?: any | null, kind: string, impact: string, impactSize: number, reports: Array<{ __typename?: 'TerminalAnalysisReport', id: string, title: string, line: string, publishedAt: string, isNew: boolean, path: string }> }> } };

export type TerminalBriefingQueryVariables = Exact<{ [key: string]: never; }>;


export type TerminalBriefingQuery = { __typename?: 'Query', terminalBriefing: { __typename?: 'TerminalBriefing', lastSeenAt?: string | null, archivedCount: number, items: Array<{ __typename?: 'TerminalBriefingItem', id: string, kind: string, title: string, summary: string, subject: string, detail: any, publishedAt: string, isRead: boolean, isArchived: boolean, sourcePath?: string | null }> } };

export type TerminalOverviewKpisQueryVariables = Exact<{ [key: string]: never; }>;


export type TerminalOverviewKpisQuery = { __typename?: 'Query', terminalOverviewKpis?: { __typename?: 'TerminalOverviewKpis', clientType: string, clientStatus: string, kpis: Array<{ __typename?: 'TerminalKpi', id: string, label: string, value: string, comparison?: string | null, delta?: { __typename?: 'TerminalKpiDelta', text: string, tone: string } | null }> } | null };

export type TerminalRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type TerminalRequestsQuery = { __typename?: 'Query', terminalRequests: { __typename?: 'TerminalRequests', allowance: { __typename?: 'TerminalAllowance', used: number, total: number, resetsAt: string }, requests: Array<{ __typename?: 'TerminalRequest', id: string, kind: string, question: string, status: string, useCase?: string | null, about: Array<string>, timing?: string | null, requestedBy?: string | null, scope?: any | null, progressNote?: string | null, outcome?: string | null, reportPath?: string | null, submittedAt: string, scopedAt?: string | null, approvedAt?: string | null, closedAt?: string | null }> } };

export type TerminalCountsQueryVariables = Exact<{ [key: string]: never; }>;


export type TerminalCountsQuery = { __typename?: 'Query', terminalCounts: { __typename?: 'TerminalCounts', briefing: number, analysis: number, signals: number, requests: number } };

export type TerminalSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type TerminalSessionQuery = { __typename?: 'Query', terminalSession: { __typename?: 'TerminalSession', firstBriefingDays: number, user: { __typename?: 'TerminalSessionUser', name: string }, client?: { __typename?: 'TerminalSessionClient', name: string, type: string, access: string } | null } };

export type TerminalSignalsQueryVariables = Exact<{ [key: string]: never; }>;


export type TerminalSignalsQuery = { __typename?: 'Query', terminalSignals: { __typename?: 'TerminalSignals', items: Array<{ __typename?: 'TerminalSignal', id: string, status: string, title: string, observed: string, couldMean: string, kind: string, size: string, sizeLabel: string, evidence: string, feedback: string, subject: string, publishedAt: string, reportPath?: string | null }> } };

export const TerminalRequestFieldsFragmentDoc = gql`
    fragment TerminalRequestFields on TerminalRequest {
  id
  kind
  question
  status
  useCase
  about
  timing
  requestedBy
  scope
  progressNote
  outcome
  reportPath
  submittedAt
  scopedAt
  approvedAt
  closedAt
}
    `;
export const MarkTerminalBriefingReadDocument = gql`
    mutation MarkTerminalBriefingRead($itemIds: [ID!]!) {
  markTerminalBriefingRead(itemIds: $itemIds)
}
    `;
export type MarkTerminalBriefingReadMutationFn = Apollo.MutationFunction<MarkTerminalBriefingReadMutation, MarkTerminalBriefingReadMutationVariables>;

/**
 * __useMarkTerminalBriefingReadMutation__
 *
 * To run a mutation, you first call `useMarkTerminalBriefingReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkTerminalBriefingReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markTerminalBriefingReadMutation, { data, loading, error }] = useMarkTerminalBriefingReadMutation({
 *   variables: {
 *      itemIds: // value for 'itemIds'
 *   },
 * });
 */
export function useMarkTerminalBriefingReadMutation(baseOptions?: Apollo.MutationHookOptions<MarkTerminalBriefingReadMutation, MarkTerminalBriefingReadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkTerminalBriefingReadMutation, MarkTerminalBriefingReadMutationVariables>(MarkTerminalBriefingReadDocument, options);
      }
export type MarkTerminalBriefingReadMutationHookResult = ReturnType<typeof useMarkTerminalBriefingReadMutation>;
export type MarkTerminalBriefingReadMutationResult = Apollo.MutationResult<MarkTerminalBriefingReadMutation>;
export type MarkTerminalBriefingReadMutationOptions = Apollo.BaseMutationOptions<MarkTerminalBriefingReadMutation, MarkTerminalBriefingReadMutationVariables>;
export const MarkTerminalBriefingSeenDocument = gql`
    mutation MarkTerminalBriefingSeen {
  markTerminalBriefingSeen
}
    `;
export type MarkTerminalBriefingSeenMutationFn = Apollo.MutationFunction<MarkTerminalBriefingSeenMutation, MarkTerminalBriefingSeenMutationVariables>;

/**
 * __useMarkTerminalBriefingSeenMutation__
 *
 * To run a mutation, you first call `useMarkTerminalBriefingSeenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkTerminalBriefingSeenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markTerminalBriefingSeenMutation, { data, loading, error }] = useMarkTerminalBriefingSeenMutation({
 *   variables: {
 *   },
 * });
 */
export function useMarkTerminalBriefingSeenMutation(baseOptions?: Apollo.MutationHookOptions<MarkTerminalBriefingSeenMutation, MarkTerminalBriefingSeenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkTerminalBriefingSeenMutation, MarkTerminalBriefingSeenMutationVariables>(MarkTerminalBriefingSeenDocument, options);
      }
export type MarkTerminalBriefingSeenMutationHookResult = ReturnType<typeof useMarkTerminalBriefingSeenMutation>;
export type MarkTerminalBriefingSeenMutationResult = Apollo.MutationResult<MarkTerminalBriefingSeenMutation>;
export type MarkTerminalBriefingSeenMutationOptions = Apollo.BaseMutationOptions<MarkTerminalBriefingSeenMutation, MarkTerminalBriefingSeenMutationVariables>;
export const MarkTerminalBriefingUnreadDocument = gql`
    mutation MarkTerminalBriefingUnread($itemIds: [ID!]!) {
  markTerminalBriefingUnread(itemIds: $itemIds)
}
    `;
export type MarkTerminalBriefingUnreadMutationFn = Apollo.MutationFunction<MarkTerminalBriefingUnreadMutation, MarkTerminalBriefingUnreadMutationVariables>;

/**
 * __useMarkTerminalBriefingUnreadMutation__
 *
 * To run a mutation, you first call `useMarkTerminalBriefingUnreadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkTerminalBriefingUnreadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markTerminalBriefingUnreadMutation, { data, loading, error }] = useMarkTerminalBriefingUnreadMutation({
 *   variables: {
 *      itemIds: // value for 'itemIds'
 *   },
 * });
 */
export function useMarkTerminalBriefingUnreadMutation(baseOptions?: Apollo.MutationHookOptions<MarkTerminalBriefingUnreadMutation, MarkTerminalBriefingUnreadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkTerminalBriefingUnreadMutation, MarkTerminalBriefingUnreadMutationVariables>(MarkTerminalBriefingUnreadDocument, options);
      }
export type MarkTerminalBriefingUnreadMutationHookResult = ReturnType<typeof useMarkTerminalBriefingUnreadMutation>;
export type MarkTerminalBriefingUnreadMutationResult = Apollo.MutationResult<MarkTerminalBriefingUnreadMutation>;
export type MarkTerminalBriefingUnreadMutationOptions = Apollo.BaseMutationOptions<MarkTerminalBriefingUnreadMutation, MarkTerminalBriefingUnreadMutationVariables>;
export const ArchiveTerminalBriefingDocument = gql`
    mutation ArchiveTerminalBriefing($itemIds: [ID!]!, $isArchived: Boolean!) {
  archiveTerminalBriefing(itemIds: $itemIds, isArchived: $isArchived)
}
    `;
export type ArchiveTerminalBriefingMutationFn = Apollo.MutationFunction<ArchiveTerminalBriefingMutation, ArchiveTerminalBriefingMutationVariables>;

/**
 * __useArchiveTerminalBriefingMutation__
 *
 * To run a mutation, you first call `useArchiveTerminalBriefingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveTerminalBriefingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveTerminalBriefingMutation, { data, loading, error }] = useArchiveTerminalBriefingMutation({
 *   variables: {
 *      itemIds: // value for 'itemIds'
 *      isArchived: // value for 'isArchived'
 *   },
 * });
 */
export function useArchiveTerminalBriefingMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveTerminalBriefingMutation, ArchiveTerminalBriefingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ArchiveTerminalBriefingMutation, ArchiveTerminalBriefingMutationVariables>(ArchiveTerminalBriefingDocument, options);
      }
export type ArchiveTerminalBriefingMutationHookResult = ReturnType<typeof useArchiveTerminalBriefingMutation>;
export type ArchiveTerminalBriefingMutationResult = Apollo.MutationResult<ArchiveTerminalBriefingMutation>;
export type ArchiveTerminalBriefingMutationOptions = Apollo.BaseMutationOptions<ArchiveTerminalBriefingMutation, ArchiveTerminalBriefingMutationVariables>;
export const SubmitTerminalRequestDocument = gql`
    mutation SubmitTerminalRequest($input: TerminalRequestInput!) {
  submitTerminalRequest(input: $input) {
    id
  }
}
    `;
export type SubmitTerminalRequestMutationFn = Apollo.MutationFunction<SubmitTerminalRequestMutation, SubmitTerminalRequestMutationVariables>;

/**
 * __useSubmitTerminalRequestMutation__
 *
 * To run a mutation, you first call `useSubmitTerminalRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitTerminalRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitTerminalRequestMutation, { data, loading, error }] = useSubmitTerminalRequestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitTerminalRequestMutation(baseOptions?: Apollo.MutationHookOptions<SubmitTerminalRequestMutation, SubmitTerminalRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitTerminalRequestMutation, SubmitTerminalRequestMutationVariables>(SubmitTerminalRequestDocument, options);
      }
export type SubmitTerminalRequestMutationHookResult = ReturnType<typeof useSubmitTerminalRequestMutation>;
export type SubmitTerminalRequestMutationResult = Apollo.MutationResult<SubmitTerminalRequestMutation>;
export type SubmitTerminalRequestMutationOptions = Apollo.BaseMutationOptions<SubmitTerminalRequestMutation, SubmitTerminalRequestMutationVariables>;
export const ApproveTerminalRequestScopeDocument = gql`
    mutation ApproveTerminalRequestScope($requestId: ID!) {
  approveTerminalRequestScope(requestId: $requestId) {
    id
  }
}
    `;
export type ApproveTerminalRequestScopeMutationFn = Apollo.MutationFunction<ApproveTerminalRequestScopeMutation, ApproveTerminalRequestScopeMutationVariables>;

/**
 * __useApproveTerminalRequestScopeMutation__
 *
 * To run a mutation, you first call `useApproveTerminalRequestScopeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveTerminalRequestScopeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveTerminalRequestScopeMutation, { data, loading, error }] = useApproveTerminalRequestScopeMutation({
 *   variables: {
 *      requestId: // value for 'requestId'
 *   },
 * });
 */
export function useApproveTerminalRequestScopeMutation(baseOptions?: Apollo.MutationHookOptions<ApproveTerminalRequestScopeMutation, ApproveTerminalRequestScopeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ApproveTerminalRequestScopeMutation, ApproveTerminalRequestScopeMutationVariables>(ApproveTerminalRequestScopeDocument, options);
      }
export type ApproveTerminalRequestScopeMutationHookResult = ReturnType<typeof useApproveTerminalRequestScopeMutation>;
export type ApproveTerminalRequestScopeMutationResult = Apollo.MutationResult<ApproveTerminalRequestScopeMutation>;
export type ApproveTerminalRequestScopeMutationOptions = Apollo.BaseMutationOptions<ApproveTerminalRequestScopeMutation, ApproveTerminalRequestScopeMutationVariables>;
export const SetTerminalSignalStatusDocument = gql`
    mutation SetTerminalSignalStatus($signalId: ID!, $status: String!) {
  setTerminalSignalStatus(signalId: $signalId, status: $status) {
    id
    status
  }
}
    `;
export type SetTerminalSignalStatusMutationFn = Apollo.MutationFunction<SetTerminalSignalStatusMutation, SetTerminalSignalStatusMutationVariables>;

/**
 * __useSetTerminalSignalStatusMutation__
 *
 * To run a mutation, you first call `useSetTerminalSignalStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetTerminalSignalStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setTerminalSignalStatusMutation, { data, loading, error }] = useSetTerminalSignalStatusMutation({
 *   variables: {
 *      signalId: // value for 'signalId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useSetTerminalSignalStatusMutation(baseOptions?: Apollo.MutationHookOptions<SetTerminalSignalStatusMutation, SetTerminalSignalStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetTerminalSignalStatusMutation, SetTerminalSignalStatusMutationVariables>(SetTerminalSignalStatusDocument, options);
      }
export type SetTerminalSignalStatusMutationHookResult = ReturnType<typeof useSetTerminalSignalStatusMutation>;
export type SetTerminalSignalStatusMutationResult = Apollo.MutationResult<SetTerminalSignalStatusMutation>;
export type SetTerminalSignalStatusMutationOptions = Apollo.BaseMutationOptions<SetTerminalSignalStatusMutation, SetTerminalSignalStatusMutationVariables>;
export const SetTerminalSignalFeedbackDocument = gql`
    mutation SetTerminalSignalFeedback($signalId: ID!, $feedback: String!) {
  setTerminalSignalFeedback(signalId: $signalId, feedback: $feedback) {
    id
    feedback
  }
}
    `;
export type SetTerminalSignalFeedbackMutationFn = Apollo.MutationFunction<SetTerminalSignalFeedbackMutation, SetTerminalSignalFeedbackMutationVariables>;

/**
 * __useSetTerminalSignalFeedbackMutation__
 *
 * To run a mutation, you first call `useSetTerminalSignalFeedbackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetTerminalSignalFeedbackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setTerminalSignalFeedbackMutation, { data, loading, error }] = useSetTerminalSignalFeedbackMutation({
 *   variables: {
 *      signalId: // value for 'signalId'
 *      feedback: // value for 'feedback'
 *   },
 * });
 */
export function useSetTerminalSignalFeedbackMutation(baseOptions?: Apollo.MutationHookOptions<SetTerminalSignalFeedbackMutation, SetTerminalSignalFeedbackMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetTerminalSignalFeedbackMutation, SetTerminalSignalFeedbackMutationVariables>(SetTerminalSignalFeedbackDocument, options);
      }
export type SetTerminalSignalFeedbackMutationHookResult = ReturnType<typeof useSetTerminalSignalFeedbackMutation>;
export type SetTerminalSignalFeedbackMutationResult = Apollo.MutationResult<SetTerminalSignalFeedbackMutation>;
export type SetTerminalSignalFeedbackMutationOptions = Apollo.BaseMutationOptions<SetTerminalSignalFeedbackMutation, SetTerminalSignalFeedbackMutationVariables>;
export const TerminalAnalysisDocument = gql`
    query TerminalAnalysis {
  terminalAnalysis {
    subjects {
      id
      view
      name
      icon
      kind
      impact
      impactSize
      reports {
        id
        title
        line
        publishedAt
        isNew
        path
      }
    }
  }
}
    `;

/**
 * __useTerminalAnalysisQuery__
 *
 * To run a query within a React component, call `useTerminalAnalysisQuery` and pass it any options that fit your needs.
 * When your component renders, `useTerminalAnalysisQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTerminalAnalysisQuery({
 *   variables: {
 *   },
 * });
 */
export function useTerminalAnalysisQuery(baseOptions?: Apollo.QueryHookOptions<TerminalAnalysisQuery, TerminalAnalysisQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TerminalAnalysisQuery, TerminalAnalysisQueryVariables>(TerminalAnalysisDocument, options);
      }
export function useTerminalAnalysisLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TerminalAnalysisQuery, TerminalAnalysisQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TerminalAnalysisQuery, TerminalAnalysisQueryVariables>(TerminalAnalysisDocument, options);
        }
export function useTerminalAnalysisSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TerminalAnalysisQuery, TerminalAnalysisQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TerminalAnalysisQuery, TerminalAnalysisQueryVariables>(TerminalAnalysisDocument, options);
        }
export type TerminalAnalysisQueryHookResult = ReturnType<typeof useTerminalAnalysisQuery>;
export type TerminalAnalysisLazyQueryHookResult = ReturnType<typeof useTerminalAnalysisLazyQuery>;
export type TerminalAnalysisSuspenseQueryHookResult = ReturnType<typeof useTerminalAnalysisSuspenseQuery>;
export type TerminalAnalysisQueryResult = Apollo.QueryResult<TerminalAnalysisQuery, TerminalAnalysisQueryVariables>;
export const TerminalBriefingDocument = gql`
    query TerminalBriefing {
  terminalBriefing {
    lastSeenAt
    archivedCount
    items {
      id
      kind
      title
      summary
      subject
      detail
      publishedAt
      isRead
      isArchived
      sourcePath
    }
  }
}
    `;

/**
 * __useTerminalBriefingQuery__
 *
 * To run a query within a React component, call `useTerminalBriefingQuery` and pass it any options that fit your needs.
 * When your component renders, `useTerminalBriefingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTerminalBriefingQuery({
 *   variables: {
 *   },
 * });
 */
export function useTerminalBriefingQuery(baseOptions?: Apollo.QueryHookOptions<TerminalBriefingQuery, TerminalBriefingQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TerminalBriefingQuery, TerminalBriefingQueryVariables>(TerminalBriefingDocument, options);
      }
export function useTerminalBriefingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TerminalBriefingQuery, TerminalBriefingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TerminalBriefingQuery, TerminalBriefingQueryVariables>(TerminalBriefingDocument, options);
        }
export function useTerminalBriefingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TerminalBriefingQuery, TerminalBriefingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TerminalBriefingQuery, TerminalBriefingQueryVariables>(TerminalBriefingDocument, options);
        }
export type TerminalBriefingQueryHookResult = ReturnType<typeof useTerminalBriefingQuery>;
export type TerminalBriefingLazyQueryHookResult = ReturnType<typeof useTerminalBriefingLazyQuery>;
export type TerminalBriefingSuspenseQueryHookResult = ReturnType<typeof useTerminalBriefingSuspenseQuery>;
export type TerminalBriefingQueryResult = Apollo.QueryResult<TerminalBriefingQuery, TerminalBriefingQueryVariables>;
export const TerminalOverviewKpisDocument = gql`
    query TerminalOverviewKpis {
  terminalOverviewKpis {
    clientType
    clientStatus
    kpis {
      id
      label
      value
      delta {
        text
        tone
      }
      comparison
    }
  }
}
    `;

/**
 * __useTerminalOverviewKpisQuery__
 *
 * To run a query within a React component, call `useTerminalOverviewKpisQuery` and pass it any options that fit your needs.
 * When your component renders, `useTerminalOverviewKpisQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTerminalOverviewKpisQuery({
 *   variables: {
 *   },
 * });
 */
export function useTerminalOverviewKpisQuery(baseOptions?: Apollo.QueryHookOptions<TerminalOverviewKpisQuery, TerminalOverviewKpisQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TerminalOverviewKpisQuery, TerminalOverviewKpisQueryVariables>(TerminalOverviewKpisDocument, options);
      }
export function useTerminalOverviewKpisLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TerminalOverviewKpisQuery, TerminalOverviewKpisQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TerminalOverviewKpisQuery, TerminalOverviewKpisQueryVariables>(TerminalOverviewKpisDocument, options);
        }
export function useTerminalOverviewKpisSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TerminalOverviewKpisQuery, TerminalOverviewKpisQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TerminalOverviewKpisQuery, TerminalOverviewKpisQueryVariables>(TerminalOverviewKpisDocument, options);
        }
export type TerminalOverviewKpisQueryHookResult = ReturnType<typeof useTerminalOverviewKpisQuery>;
export type TerminalOverviewKpisLazyQueryHookResult = ReturnType<typeof useTerminalOverviewKpisLazyQuery>;
export type TerminalOverviewKpisSuspenseQueryHookResult = ReturnType<typeof useTerminalOverviewKpisSuspenseQuery>;
export type TerminalOverviewKpisQueryResult = Apollo.QueryResult<TerminalOverviewKpisQuery, TerminalOverviewKpisQueryVariables>;
export const TerminalRequestsDocument = gql`
    query TerminalRequests {
  terminalRequests {
    allowance {
      used
      total
      resetsAt
    }
    requests {
      ...TerminalRequestFields
    }
  }
}
    ${TerminalRequestFieldsFragmentDoc}`;

/**
 * __useTerminalRequestsQuery__
 *
 * To run a query within a React component, call `useTerminalRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTerminalRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTerminalRequestsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTerminalRequestsQuery(baseOptions?: Apollo.QueryHookOptions<TerminalRequestsQuery, TerminalRequestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TerminalRequestsQuery, TerminalRequestsQueryVariables>(TerminalRequestsDocument, options);
      }
export function useTerminalRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TerminalRequestsQuery, TerminalRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TerminalRequestsQuery, TerminalRequestsQueryVariables>(TerminalRequestsDocument, options);
        }
export function useTerminalRequestsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TerminalRequestsQuery, TerminalRequestsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TerminalRequestsQuery, TerminalRequestsQueryVariables>(TerminalRequestsDocument, options);
        }
export type TerminalRequestsQueryHookResult = ReturnType<typeof useTerminalRequestsQuery>;
export type TerminalRequestsLazyQueryHookResult = ReturnType<typeof useTerminalRequestsLazyQuery>;
export type TerminalRequestsSuspenseQueryHookResult = ReturnType<typeof useTerminalRequestsSuspenseQuery>;
export type TerminalRequestsQueryResult = Apollo.QueryResult<TerminalRequestsQuery, TerminalRequestsQueryVariables>;
export const TerminalCountsDocument = gql`
    query TerminalCounts {
  terminalCounts {
    briefing
    analysis
    signals
    requests
  }
}
    `;

/**
 * __useTerminalCountsQuery__
 *
 * To run a query within a React component, call `useTerminalCountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTerminalCountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTerminalCountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTerminalCountsQuery(baseOptions?: Apollo.QueryHookOptions<TerminalCountsQuery, TerminalCountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TerminalCountsQuery, TerminalCountsQueryVariables>(TerminalCountsDocument, options);
      }
export function useTerminalCountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TerminalCountsQuery, TerminalCountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TerminalCountsQuery, TerminalCountsQueryVariables>(TerminalCountsDocument, options);
        }
export function useTerminalCountsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TerminalCountsQuery, TerminalCountsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TerminalCountsQuery, TerminalCountsQueryVariables>(TerminalCountsDocument, options);
        }
export type TerminalCountsQueryHookResult = ReturnType<typeof useTerminalCountsQuery>;
export type TerminalCountsLazyQueryHookResult = ReturnType<typeof useTerminalCountsLazyQuery>;
export type TerminalCountsSuspenseQueryHookResult = ReturnType<typeof useTerminalCountsSuspenseQuery>;
export type TerminalCountsQueryResult = Apollo.QueryResult<TerminalCountsQuery, TerminalCountsQueryVariables>;
export const TerminalSessionDocument = gql`
    query TerminalSession {
  terminalSession {
    user {
      name
    }
    client {
      name
      type
      access
    }
    firstBriefingDays
  }
}
    `;

/**
 * __useTerminalSessionQuery__
 *
 * To run a query within a React component, call `useTerminalSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useTerminalSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTerminalSessionQuery({
 *   variables: {
 *   },
 * });
 */
export function useTerminalSessionQuery(baseOptions?: Apollo.QueryHookOptions<TerminalSessionQuery, TerminalSessionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TerminalSessionQuery, TerminalSessionQueryVariables>(TerminalSessionDocument, options);
      }
export function useTerminalSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TerminalSessionQuery, TerminalSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TerminalSessionQuery, TerminalSessionQueryVariables>(TerminalSessionDocument, options);
        }
export function useTerminalSessionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TerminalSessionQuery, TerminalSessionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TerminalSessionQuery, TerminalSessionQueryVariables>(TerminalSessionDocument, options);
        }
export type TerminalSessionQueryHookResult = ReturnType<typeof useTerminalSessionQuery>;
export type TerminalSessionLazyQueryHookResult = ReturnType<typeof useTerminalSessionLazyQuery>;
export type TerminalSessionSuspenseQueryHookResult = ReturnType<typeof useTerminalSessionSuspenseQuery>;
export type TerminalSessionQueryResult = Apollo.QueryResult<TerminalSessionQuery, TerminalSessionQueryVariables>;
export const TerminalSignalsDocument = gql`
    query TerminalSignals {
  terminalSignals {
    items {
      id
      status
      title
      observed
      couldMean
      kind
      size
      sizeLabel
      evidence
      feedback
      subject
      publishedAt
      reportPath
    }
  }
}
    `;

/**
 * __useTerminalSignalsQuery__
 *
 * To run a query within a React component, call `useTerminalSignalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTerminalSignalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTerminalSignalsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTerminalSignalsQuery(baseOptions?: Apollo.QueryHookOptions<TerminalSignalsQuery, TerminalSignalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TerminalSignalsQuery, TerminalSignalsQueryVariables>(TerminalSignalsDocument, options);
      }
export function useTerminalSignalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TerminalSignalsQuery, TerminalSignalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TerminalSignalsQuery, TerminalSignalsQueryVariables>(TerminalSignalsDocument, options);
        }
export function useTerminalSignalsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TerminalSignalsQuery, TerminalSignalsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TerminalSignalsQuery, TerminalSignalsQueryVariables>(TerminalSignalsDocument, options);
        }
export type TerminalSignalsQueryHookResult = ReturnType<typeof useTerminalSignalsQuery>;
export type TerminalSignalsLazyQueryHookResult = ReturnType<typeof useTerminalSignalsLazyQuery>;
export type TerminalSignalsSuspenseQueryHookResult = ReturnType<typeof useTerminalSignalsSuspenseQuery>;
export type TerminalSignalsQueryResult = Apollo.QueryResult<TerminalSignalsQuery, TerminalSignalsQueryVariables>;