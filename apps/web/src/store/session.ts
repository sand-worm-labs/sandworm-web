"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  username: string | null;
  intent: "signin" | "signup" | null;
  setIntent: (intent: "signin" | "signup" | null) => void;
  signIn: () => void;
  signUp: () => void;
  signOut: () => void;
  claimUsername: (name: string) => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    set => ({
      isAuthenticated: false,
      isOnboarded: false,
      username: null,
      intent: null,

      setIntent: intent => set({ intent }),
      signIn: () => set({ isAuthenticated: true }),
      signUp: () => set({ isAuthenticated: true, isOnboarded: false }),
      signOut: () =>
        set({ isAuthenticated: false, isOnboarded: false, username: null }),
      claimUsername: name => set({ username: name, isOnboarded: true }),
      reset: () =>
        set({
          isAuthenticated: false,
          isOnboarded: false,
          username: null,
          intent: null,
        }),
    }),
    { name: "sandworm-session" }
  )
);
