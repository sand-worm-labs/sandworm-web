"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import type { ApiUser, UserWorkspaceRole } from "@/types";

import { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_PUBLIC_URL } from "../utils/env";
import { useCurrentUserQuery } from "@/generated/graphql";

type UseAuthError = "unexpected" | "invalid-creds";

type AuthState = {
  loading: boolean;
  data?: { email: string; loginLink?: string };
  error?: UseAuthError;
};

type SignupApi = {
  signupWithEmail: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => void;
};

type UseSignup = [AuthState, SignupApi];

interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  email: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isOnboarded: boolean;
    avatar?: string;
  };
}

interface SignupResponse extends LoginResponse {}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const TOKEN_EXPIRES_KEY = "auth_token_expires";

const tokenStorage = {
  setTokens: (token: string, refreshToken: string, expiresIn: number) => {
    // test: These tokens are stored in plain text in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresIn.toString());
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getTokenExpiry: (): number | null => {
    if (typeof window === "undefined") return null;
    const expiry = localStorage.getItem(TOKEN_EXPIRES_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  },

  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
  },

  isTokenExpired: (): boolean => {
    const expiry = tokenStorage.getTokenExpiry();
    if (!expiry) return true;
    return Date.now() >= expiry - 60000;
  },
};

export const useSignup = (): UseSignup => {
  const [state, setState] = useState<{
    loading: boolean;
    data?: { email: string };
    error?: "unexpected";
  }>({
    loading: false,
    data: undefined,
    error: undefined,
  });

  const signupWithEmail = useCallback(
    (email: string, password: string, firstName: string, lastName: string) => {
      setState(s => ({ ...s, loading: true }));
      fetch(`${NEXT_PUBLIC_API_URL()}/auth/email/register`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          callback: NEXT_PUBLIC_PUBLIC_URL(),
        }),
      })
        .then(async res => {
          if (res.ok) {
            const data: SignupResponse = await res.json();

            tokenStorage.setTokens(
              data.token,
              data.refreshToken,
              data.tokenExpires
            );

            setState({
              loading: false,
              data: await res.json(),
              error: undefined,
            });
            return;
          }

          throw new Error(`Unexpected status ${res.status}`);
        })
        .catch(() => {
          setState(s => ({ ...s, loading: false, error: "unexpected" }));
        });
    },
    [setState]
  );

  return useMemo(() => [state, { signupWithEmail }], [state, signupWithEmail]);
};

type LoginAPI = {
  loginWithPassword: (
    email: string,
    password: string,
    callback?: string
  ) => void;
};

type UseLogin = [AuthState, LoginAPI];

export const useLogin = (): UseLogin => {
  const [state, setState] = useState<AuthState>({
    loading: false,
    data: undefined,
    error: undefined,
  });

  const loginWithPassword = useCallback(
    (email: string, password: string, callback?: string) => {
      console.log(" Login initiated for:", email);
      setState(s => ({ ...s, loading: true }));
      fetch(`${NEXT_PUBLIC_API_URL()}/auth/email/login`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, callback }),
      })
        .then(async res => {
          if (res.ok) {
            const data: LoginResponse = await res.json();

            tokenStorage.setTokens(
              data.token,
              data.refreshToken,
              data.tokenExpires
            );

            setState({
              loading: false,
              data,
              error: undefined,
            });
            return;
          }

          if (res.status === 400 || res.status === 401) {
            setState({
              loading: false,
              error: "invalid-creds",
            });
            return;
          }

          throw new Error(`Unexpected status ${res.status}`);
        })
        .catch(error => {
          console.error("Login error:", error);
          setState(s => ({ ...s, loading: false, error: "unexpected" }));
        });
    },
    [setState]
  );

  return useMemo(
    () => [state, { loginWithPassword }],
    [state, loginWithPassword]
  );
};

export type SessionUser = ApiUser & {
  userHash: string;
  roles: Record<string, UserWorkspaceRole>;
  picture?: string | null;
  lastVisitedWorkspaceId?: string | null;
};

type UseSessionReturn = {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};

export const useSession = ({
  redirectToLogin = false,
}: {
  redirectToLogin?: boolean;
}): UseSessionReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const token = tokenStorage.getToken();

  const { data, loading, error, refetch } = useCurrentUserQuery({
    skip: !token,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!loading && !token && redirectToLogin) {
      const back = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
      router.replace(`/signin?callback=${encodeURIComponent(back)}`);
    }
  }, [loading, token, redirectToLogin, router, pathname, searchParams]);

  return useMemo(
    () => ({
      user: data?.currentUser ?? null,
      loading,
      error: error?.message ?? null,
      isAuthenticated: !!data?.currentUser,
    }),
    [data, loading, error]
  );
};
export const useSignout = () => {
  const router = useRouter();

  return useCallback(async () => {
    const token = tokenStorage.getToken();
    tokenStorage.clearTokens();

    if (token) {
      try {
        await fetch(`${NEXT_PUBLIC_API_URL()}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

    router.push("/signin");
  }, [router]);
};

export { tokenStorage };
