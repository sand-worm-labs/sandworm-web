import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactNode } from "react";
import type { Typesaurus } from "typesaurus";
import type { Message } from "ai";

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
  username: string;
  email: string;
  socialLinks?: SocialLinks;
  status?: Status;
  wallets?: Wallet[];
  stars: number;
  forks: number;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  emailVerified?: Date;
  image?: string;
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
  messages: Message[];
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
  icon: string;
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
};

export type ApiDocument = Document & {
  publishedAt: string | null;
  clock: number;
  appClock: number;
  appId: string;
  userAppClock: Record<string, number>;
  hasDashboard: boolean;
};

export type UserWorkspaceRole = {
  editor: "editor";
  viewer: "viewer";
  admin: "admin";
};

type Workspace = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  source: string | null;
  useCases: string[];
  useContext: string | null;
  plan: $Enums.Plan;
  ownerId: string;
  secretsId: string | null;
  assistantModel: string;
};

export type ApiUser = Omit<User, "passwordDigest" | "confirmedAt">;

export type WorkspaceUser = ApiUser & {
  workspaceId: string;
  role: UserWorkspaceRole;
};

export type ApiWorkspace = Workspace & {
  secrets: {
    hasOpenAiApiKey: boolean;
  };
};

/* ───────────────────────────────
  Schedule
─────────────────────────────── */

export type HourlySchedule = {
  type: "hourly";
  documentId: string;
  minute: number;
  timezone: string;
};

export type DailySchedule = {
  type: "daily";
  documentId: string;
  hour: number;
  minute: number;
  timezone: string;
};

export type WeeklySchedule = {
  type: "weekly";
  documentId: string;
  hour: number;
  minute: number;
  weekdays: number[];
  timezone: string;
};

export type MonthlySchedule = {
  type: "monthly";
  documentId: string;
  hour: number;
  minute: number;
  days: number[];
  timezone: string;
};

export type CronSchedule = {
  type: "cron";
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
