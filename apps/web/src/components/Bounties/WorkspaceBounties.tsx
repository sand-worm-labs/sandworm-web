"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PiPlus } from "react-icons/pi";

import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { useGetBountyDraftsQuery } from "@/generated/graphql";
import {
  FundEscrowModal,
  type FundableBounty,
} from "@/web3/components/FundEscrowModal";

import { BountiesBoard } from "./BountiesBoard";
import { BountyDrafts } from "./BountyDrafts";
import CreateBountyModal from "./CreateBountyModal";
import { useWorkspaceBountyActions } from "./useWorkspaceBountyActions";

const createButtonClassName =
  "py-2 px-6 bg-primary-tint-75 dark:bg-base-700 hover:bg-primary/5 dark:hover:bg-base-600 rounded-xl hover:cursor-pointer text-sm border flex items-center shrink-0 border-accent-fuchsia dark:border-white/15 text-accent-fuchsia dark:text-white font-body font-medium gap-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.04),0px_4px_4px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]";

export const WorkspaceBounties = () => {
  const workspaceId = useStringQuery("workspace");
  const router = useRouter();
  const renderActions = useWorkspaceBountyActions();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [funding, setFunding] = useState<FundableBounty | null>(null);
  const { data, refetch: refetchDrafts } = useGetBountyDraftsQuery({
    variables: { workspaceId },
    skip: !workspaceId,
  });
  const drafts = data?.getBountyDrafts ?? [];

  const detailHref = (slug: string) =>
    `/workspace/${workspaceId}/bounties/${slug}`;

  const onCreated = (slug: string) => {
    refetchDrafts();
    router.push(detailHref(slug));
  };

  return (
    <>
      <BountiesBoard
        compact
        renderActions={renderActions}
        detailHref={detailHref}
        headerAction={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className={createButtonClassName}
          >
            <PiPlus className="h-4 w-4" />
            Create Bounty
          </button>
        }
      >
        <BountyDrafts
          drafts={drafts}
          detailHref={detailHref}
          onFund={setFunding}
        />
      </BountiesBoard>

      {funding && (
        <FundEscrowModal
          isOpen
          onClose={() => setFunding(null)}
          bounty={funding}
          onFunded={() => refetchDrafts()}
        />
      )}

      <CreateBountyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        workspaceId={workspaceId}
        onCreated={onCreated}
      />
    </>
  );
};
