"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import type { ApiUser, UserWorkspaceRole } from "@/types";
import { useCurrentUserQuery } from "@/generated/graphql";

import { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_PUBLIC_URL } from "../utils/env";

export type UseAuthError = "unexpected" | "invalid-creds" | "network-error";

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
    lastName: string,
    username: string
  ) => void;
};

type UseSignup = [AuthState, SignupApi];

interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  email: string;
  roles?: Record<string, UserWorkspaceRole>;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isOnboarded: boolean;
    avatar?: string;
    role: Array<Record<string, UserWorkspaceRole>>;
  };
}

type ForgotPasswordAPI = {
  sendResetEmail: (email: string) => void;
};

type UseForgotPassword = [AuthState, ForgotPasswordAPI];

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const TOKEN_EXPIRES_KEY = "auth_token_expires";
const USER_ROLES_KEY = "auth_user_roles";

const tokenStorage = {
  setTokens: (
    token: string,
    refreshToken: string,
    expiresIn: number,
    roles?: Record<string, UserWorkspaceRole>
  ) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresIn.toString());
    if (roles) {
      localStorage.setItem(USER_ROLES_KEY, JSON.stringify(roles));
    }
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

  getRoles: (): Record<string, UserWorkspaceRole> | null => {
    if (typeof window === "undefined") return null;
    const roles = localStorage.getItem(USER_ROLES_KEY);
    return roles ? JSON.parse(roles) : null;
  },

  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(USER_ROLES_KEY);
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
    (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      username: string
    ) => {
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
          username,
          callback: NEXT_PUBLIC_PUBLIC_URL(),
        }),
      })
        .then(async res => {
          if (res.ok) {
            setState({
              loading: false,
              data: { email },
              error: undefined,
            });
            return;
          }

          if (res.status === 422) {
            const errorData = await res.json().catch(() => ({}));
            console.error("Signup validation error:", errorData);
          }

          throw new Error(`Unexpected status ${res.status}`);
        })
        .catch(err => {
          console.error("Signup error:", err);
          setState(s => ({ ...s, loading: false, error: "unexpected" }));
        });
    },
    []
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
              data.tokenExpires,
              data.roles
            );

            setState({
              loading: false,
              data,
              error: undefined,
            });

            window.location.href = callback || "/workspace";

            return;
          }

          if (res.status === 400 || res.status === 401 || res.status === 422) {
            const errorData = await res.json();

            if (
              errorData.trace?.response?.errors?.password ===
              "incorrectPassword"
            ) {
              setState({
                loading: false,
                error: "invalid-creds",
              });
              return;
            }

            if (errorData.trace?.response?.errors?.email) {
              setState({
                loading: false,
                error: "invalid-creds",
              });
              return;
            }

            setState({
              loading: false,
              error: "invalid-creds",
            });
            return;
          }

          throw new Error(`Unexpected status ${res.status}`);
        })
        .catch(error => {
          console.log(error);
          setState(s => ({ ...s, loading: false, error: "network-error" }));
        });
    },
    []
  );

  return useMemo(
    () => [state, { loginWithPassword }],
    [state, loginWithPassword]
  );
};

type ConfirmEmailState = {
  loading: boolean;
  success: boolean;
  error?: "expired" | "invalid" | "unexpected";
};

type ConfirmEmailAPI = {
  confirmEmail: (hash: string) => void;
};

type UseConfirmEmail = [ConfirmEmailState, ConfirmEmailAPI];

export const useConfirmEmail = (): UseConfirmEmail => {
  const [state, setState] = useState<ConfirmEmailState>({
    loading: false,
    success: false,
    error: undefined,
  });

  const confirmEmail = useCallback((hash: string) => {
    setState({ loading: true, success: false, error: undefined });

    fetch(`${NEXT_PUBLIC_API_URL()}/auth/email/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash }),
    })
      .then(async res => {
        if (res.ok) {
          setState({ loading: false, success: true, error: undefined });
          return;
        }

        if (res.status === 404 || res.status === 422) {
          const errorData = await res.json().catch(() => ({}));
          const isExpired = errorData?.message
            ?.toLowerCase()
            .includes("expired");
          setState({
            loading: false,
            success: false,
            error: isExpired ? "expired" : "invalid",
          });
          return;
        }

        throw new Error(`Unexpected status ${res.status}`);
      })
      .catch(err => {
        console.error("Confirm email error:", err);
        setState({ loading: false, success: false, error: "unexpected" });
      });
  }, []);

  return useMemo(() => [state, { confirmEmail }], [state, confirmEmail]);
};

export type SessionUser = ApiUser & {
  userHash: string;
  role?: Array<Record<string, UserWorkspaceRole>>;
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
  const storedRoles = tokenStorage.getRoles();
  const { data, loading, error, refetch } = useCurrentUserQuery({
    skip: !token,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token, refetch]);

  useEffect(() => {
    if (!loading && !token && redirectToLogin) {
      const back = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
      router.replace(`/signin?callback=${encodeURIComponent(back)}`);
    }
  }, [loading, token, redirectToLogin, router, pathname, searchParams]);

  return useMemo(
    () => ({
      user: data?.currentUser?.user
        ? {
            ...data.currentUser.user,
            role: storedRoles || {},
            name:
              data.currentUser.user.fullName ||
              `${data.currentUser.user.firstName || ""} ${data.currentUser.user.lastName || ""}`.trim() ||
              data.currentUser.user.username ||
              "Unknown User",
          }
        : null,
      loading,
      error: error?.message ?? null,
      isAuthenticated: !!data?.currentUser,
    }),
    [data, loading, error, storedRoles]
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

export const useForgotPassword = (): UseForgotPassword => {
  const [state, setState] = useState<AuthState>({
    loading: false,
    data: undefined,
    error: undefined,
  });

  const sendResetEmail = useCallback((email: string) => {
    setState(s => ({ ...s, loading: true }));
    fetch(`${NEXT_PUBLIC_API_URL()}/auth/forgot/password`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(async res => {
        if (res.ok) {
          setState({
            loading: false,
            data: { email },
            error: undefined,
          });
          return;
        }

        if (res.status === 404) {
          setState({
            loading: false,
            error: "invalid-creds",
          });
          return;
        }

        throw new Error(`Unexpected status ${res.status}`);
      })
      .catch(() => {
        setState(s => ({ ...s, loading: false, error: "unexpected" }));
      });
  }, []);

  return useMemo(() => [state, { sendResetEmail }], [state, sendResetEmail]);
};

type ResetPasswordState = AuthState<{ success: boolean }>;

type ResetPasswordCallbacks = {
  resetPassword: (password: string, hash: string) => void;
};

type UseResetPassword = [ResetPasswordState, ResetPasswordCallbacks];

export const useResetPassword = (): UseResetPassword => {
  const [state, setState] = useState<ResetPasswordState>({
    loading: false,
    data: undefined,
    error: undefined,
  });

  const resetPassword = useCallback((password: string, hash: string) => {
    setState(s => ({ ...s, loading: true, error: undefined }));
    fetch(`${NEXT_PUBLIC_API_URL()}/auth/reset/password`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, hash }),
    })
      .then(async res => {
        if (res.ok) {
          setState({
            loading: false,
            data: { success: true },
            error: undefined,
          });
          return;
        }

        if (res.status === 400) {
          setState({
            loading: false,
            data: undefined,
            error: "invalid-token",
          });
          return;
        }

        if (res.status === 410) {
          setState({
            loading: false,
            data: undefined,
            error: "expired-token",
          });
          return;
        }

        throw new Error(`Unexpected status ${res.status}`);
      })
      .catch(() => {
        setState({ loading: false, data: undefined, error: "unexpected" });
      });
  }, []);

  return useMemo(() => [state, { resetPassword }], [state, resetPassword]);
};

export { tokenStorage };
