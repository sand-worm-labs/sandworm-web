import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactNode } from "react";
import type { Typesaurus } from "typesaurus";
import type { UIMessage } from "ai";
import type { DataSourceStructureStateV3 } from "@sandworm/types";

import { type UserSetting } from "@/generated/graphql";

export type NextPageWithLayout = NextPage & {
  getLayout?: () => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type ChildrenProps = {
  children: ReactNode;
};

export type IToken = {
  accessToken: string;
  refreshToken?: string;
};

export interface CurrentUserProps {
  currentUser?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    [key: string]: any;
  } | null;
}

export type Author = {
  id: string;
  username: string;
};

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Query {
  id: string;
  title: string;
  description: string;
  creator: string;
  private: boolean;
  query: string;
  tags: string[];
  stared_by: string[];
  forked_from: string;
  forked_by: string[];
  forked: boolean;
  createdAt: Typesaurus.ServerDate;
  updatedAt: Typesaurus.ServerDate;
  username?: string;
  image?: string;
}

export interface QueryPagination {
  total_records: number;
  current_page: number;
  total_pages: number;
  next_page: number | null;
  prev_page?: number | null;
}

export interface QueryResponse {
  page_items: Query[];
  pagination: QueryPagination;
}

export interface IFeatures {
  id: number;
  name: string;
  desc: string;
  bgText: string;
}

export type APIResponse<T = object> =
  | { success: true; data: T }
  | { success: false; error: string };

/* @user -- */
export interface SocialLinks {
  telegram: string;
  twitter: string;
  github: string;
  discord: string;
  email: string;
  instagram: string;
}

export interface Status {
  text: string;
  timestamp: number;
}

export interface Wallet {
  chain: string;
  address: string;
}

export interface User {
  id: string;
  email?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  name?: string | null;
  avater?: string | null;
  isOnboarded?: boolean;
  followersCount?: number;
  followingCount?: number;
  __typename?: string;
  settings?: UserSetting | null;
}

export type FieldType = "string" | "integer" | "bigint";

export interface IChainEntity {
  name: string;
  description: string;
  live_preview: string;
  fields: Record<string, FieldType>;
}

export interface IChainEntitySet {
  raw: IChainEntity[];
  decoded: IChainEntity[];
  project: IChainEntity[];
}

export interface ChartProps {
  result: {
    columns: string[];
    data: Record<string, any>[];
  };
  title: string | undefined;
  chartType: string;
}

export type ExportFormat = "csv" | "json" | "parquet" | "clipboard";

export interface Chat {
  id: string;
  userId: string;
  createdAt: Date;
  messages: UIMessage[];
}

export interface IconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

/* ╔════════════════════════════════════════════╗
   ║                Api Section                 ║
   ╚════════════════════════════════════════════╝ */

export type Document = {
  id: string;
  title: string;
  icon?: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version: number;
  isSyncedWithYjs: boolean;
  workspaceId: string;
  parentId: string | null;
  runUnexecutedBlocks: boolean;
  runSQLSelection: boolean;
  shareLinksWithoutSidebar: boolean;
  createdBy?: string;
};

export type ApiDocument = Document & {
  publishedAt: string | null;
  clock: number;
  appClock: number;
  appId: string;
  userAppClock: Record<string, number>;
  hasDashboard: boolean;
};

export type UserWorkspaceRole = "editor" | "viewer" | "admin";

export type Plan = "free" | "pro";

type Workspace = {
  id: string;
  name: string;
  source: string | null;
  useCases: string[];
  useContext: string | null;
  plan: Plan;
  ownerId: string;
  assistantModel: string;
  createdAt?: Date;
  updatedAt?: Date;
  secretsId?: string | null;
};

export type EnvironmentStatus =
  | "Running"
  | "Stopped"
  | "Failing"
  | "Starting"
  | "Stopping";

export type ApiUser = Omit<User, "passwordDigest" | "confirmedAt">;

export type WorkspaceUser = ApiUser & {
  workspaceId: string;
  role: UserWorkspaceRole;
};

export type ApiWorkspace = Workspace & {
  secrets: {
    hasAiModelApiKey: boolean;
  };
  users: any;
};

/* ───────────────────────────────
  Schedule
─────────────────────────────── */

export type HourlySchedule = {
  type: "HOURLY";
  documentId: string;
  minute: number;
  timezone: string;
};

export type DailySchedule = {
  type: "DAILY";
  documentId: string;
  hour: number;
  minute: number;
  timezone: string;
};

export type WeeklySchedule = {
  type: "WEEKLY";
  documentId: string;
  hour: number;
  minute: number;
  weekdays: number[];
  timezone: string;
};

export type MonthlySchedule = {
  type: "MONTHLY";
  documentId: string;
  hour: number;
  minute: number;
  days: number[];
  timezone: string;
};

export type CronSchedule = {
  type: "CRON";
  documentId: string;
  cron: string;
  timezone: string;
};

export type ScheduleParams =
  | HourlySchedule
  | DailySchedule
  | WeeklySchedule
  | MonthlySchedule
  | CronSchedule;

export type ExecutionSchedule = {
  id: string;
} & ScheduleParams;

export type ApiDeletedDocument = ApiDocument & {
  deletedAt: Date;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  lastVisitedWorkspaceId: string;
  createdAt: string;
  updatedAt: string;
  roles: Record<string, UserWorkspaceRole>;
};

export type CreateSchedulePayload = {
  scheduleParams: ScheduleParams;
};

export type TrinoDataSource = {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  catalog: string;
  schema: string;
  createdAt: string;
  updatedAt: string;
  lastConnection: string | null;
};

export type PostgreSQLDataSource = {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  database: string;
  ssl: boolean;
  createdAt: string;
  updatedAt: string;
  lastConnection: string | null;
};

export type DataSource =
  | { type: "psql"; data: PostgreSQLDataSource }
  | { type: "trino"; data: TrinoDataSource };

export type DataSourceType = DataSource["type"];

export const DataSourceType = z.enum(["psql", "trino"] as const);

export type APIDataSource = DataSource & {
  structure: DataSourceStructureStateV3;
};
