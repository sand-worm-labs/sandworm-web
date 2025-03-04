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
  currentUser?: Partial<{
    createdAt: string;
    updatedAt: string;
    displayName: string;
    uid: string;
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

export interface IFeatures {
  id: number;
  name: string;
  desc: string;
  bgText: string;
}

export type APIResponse<T = object> =
  | { success: true; data: T }
  | { success: false; error: string };
