import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactNode } from "react";
import type { Typesaurus } from "typesaurus";

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
  currentUser?: Partial<{
    createdAt: string;
    updatedAt: string;
    displayName: string;
    id: string;
    name: string;
    email: string;
    image: string;
    password: string;
    isAdmin: boolean;
  }> | null;
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
  id?: string;
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
