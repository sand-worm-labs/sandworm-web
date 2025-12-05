"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import type { ApiUser, UserWorkspaceRole } from "@/types";

import fetcher, { AuthenticationError } from "../utils/fetcher";
import { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_PUBLIC_URL } from "../utils/env";

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
      setState(s => ({ ...s, loading: true }));
      fetch(`${NEXT_PUBLIC_API_URL()}/auth/sign-in/password`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, callback }),
      })
        .then(async res => {
          if (res.ok) {
            setState({
              loading: false,
              data: await res.json(),
              error: undefined,
            });
            return;
          }

          if (res.status === 400) {
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
};

export const useSession = ({
  redirectToLogin,
}: {
  redirectToLogin: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const session = useSWR<SessionUser>(`${NEXT_PUBLIC_API_URL()}/auth/session`, {
    fetcher,
    refreshInterval: redirectToLogin ? 1000 * 30 : undefined,
    dedupingInterval: redirectToLogin ? 1000 * 2 : undefined,
  });

  useEffect(() => {
    if (
      session.error &&
      session.error instanceof AuthenticationError &&
      redirectToLogin
    ) {
      const search = searchParams.toString();
      const callback = encodeURIComponent(
        `${pathname}${search ? `?${search}` : ""}`
      );
      router.replace(`/auth/signin?callback=${callback}`);
      router.replace(`/auth/signin?callback=${callback}`);
    }
  }, [session.error, redirectToLogin, router]);

  return session;
};

export const useSignout = () => {
  const router = useRouter();
  return useCallback(() => {
    const url = `${NEXT_PUBLIC_API_URL()}/auth/logout`;
    router.push(url);
  }, [router]);
};
