"use client";

import Link from "next/link";
import { Button } from "@sandworm/ui/components/button";

import { useSession } from "@/components/Editor/hooks/useAuth";
import { useModalStore } from "@/store/auth";

import { BountiesBoard } from "./BountiesBoard";
import type { Bounty } from "./bounties";

// Bounties for anyone: visitors are asked to sign in, members are sent to
// their workspace, where entries are started and submitted.
export const PublicBounties = () => {
  const { user } = useSession({ redirectToLogin: false });
  const openSignIn = useModalStore(state => state.openSignIn);

  const workspaceId =
    user?.lastVisitedWorkspaceId ?? Object.keys(user?.role?.[0] ?? {})[0];

  const renderActions = (bounty: Bounty) => {
    if (bounty.status !== "open") return null;

    if (!user) {
      return (
        <Button size="sm" onClick={() => openSignIn()}>
          Start bounty
        </Button>
      );
    }

    return (
      <Button asChild size="sm">
        <Link
          href={
            workspaceId ? `/workspace/${workspaceId}/bounties` : "/workspace"
          }
        >
          Open in workspace
        </Link>
      </Button>
    );
  };

  return <BountiesBoard renderActions={renderActions} />;
};
