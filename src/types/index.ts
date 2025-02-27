import type { NextPage } from "next";
import type { AppProps } from "next/app";
import type { ReactNode } from "react";

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
    createdAt: string;
    updatedAt: string;
    emailVerified: string | null;
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    password: string | null;
    isAdmin: boolean;
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

export type Query = {
  id: string;
  name: string;
  description: string;
  query: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  visibility: "public" | "private" | "shared";
  tags: string[];
  parameters: Parameter[];
  saves: number;
};

export type APIResponse<T = object> =
  | { success: true; data: T }
  | { success: false; error: string };
