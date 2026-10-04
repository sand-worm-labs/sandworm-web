"use client";

import Link from "next/link";
import { Button } from "@sandworm/ui/components/button";

import { useSession } from "@/components/Editor/hooks/useAuth";
import { useModalStore } from "@/store/auth";

import { BountiesBoard } from "./BountiesBoard";
import { bountyPrimaryButtonClass } from "./BountyCard";
import type { BountyRef } from "./bounties";

// =====================================
// ⬢ Use Public Bounty Actions
// =====================================
export const usePublicBountyActions = () => {
  const { user } = useSession({ redirectToLogin: false });
  const openSignIn = useModalStore(state => state.openSignIn);

  const workspaceId =
    user?.lastVisitedWorkspaceId ?? Object.keys(user?.role?.[0] ?? {})[0];

  return (bounty: BountyRef) => {
    if (bounty.status !== "open") return null;

    if (!user) {
      return (
        <Button
          size="sm"
          className={bountyPrimaryButtonClass}
          onClick={() => openSignIn()}
        >
          Start bounty
        </Button>
      );
    }

    return (
      <Button asChild size="sm" className={bountyPrimaryButtonClass}>
        <Link
          href={
            workspaceId
              ? `/workspace/${workspaceId}/bounties/${bounty.slug}`
              : "/workspace"
          }
        >
          Open in workspace
        </Link>
      </Button>
    );
  };
};

// =====================================
// ⬢ Public Bounties
// =====================================
export const PublicBounties = () => {
  const renderActions = usePublicBountyActions();

  return (
    <BountiesBoard
      renderActions={renderActions}
      detailHref={slug => `/bounties/${slug}`}
    />
  );
};
