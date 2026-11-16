"use client";

import {
  AccountMenu as SharedAccountMenu,
  SignInButton,
} from "@sandworm/ui/kit/app-header";

import type { ApiUser } from "@/types";
import { useModalStore } from "@/store/auth";

import { useSignout } from "../hooks/useAuth";

interface AccountMenuProps {
  user: ApiUser | null;
  loading: boolean;
  // The name beside the avatar. Off, the avatar alone opens the menu.
  showName?: boolean;
}

export default function AccountMenu({
  user,
  loading,
  showName = true,
}: AccountMenuProps) {
  const signout = useSignout();
  const openSignIn = useModalStore(state => state.openSignIn);

  const name = user?.firstName ?? user?.username ?? "Account";

  return (
    <SharedAccountMenu
      user={
        user && {
          name,
          fullName: `${name} ${user.lastName ?? ""}`.trim(),
          email: user.email,
          avatarUrl: user.avater,
        }
      }
      loading={loading}
      showName={showName}
      signIn={<SignInButton onClick={() => openSignIn()} />}
      onSignOut={signout}
      workspaceHref="/workspace"
    />
  );
}
