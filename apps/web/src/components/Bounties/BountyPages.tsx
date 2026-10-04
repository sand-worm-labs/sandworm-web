"use client";

import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";

import { BountyDetail } from "./BountyDetail";
import { usePublicBountyActions } from "./PublicBounties";
import { useWorkspaceBountyActions } from "./WorkspaceBounties";

export const PublicBountyDetail = () => {
  const slug = useStringQuery("slug");
  const renderActions = usePublicBountyActions();

  return (
    <BountyDetail
      slug={slug}
      backHref="/bounties"
      renderActions={renderActions}
    />
  );
};

export const WorkspaceBountyDetail = () => {
  const slug = useStringQuery("slug");
  const workspaceId = useStringQuery("workspace");
  const renderActions = useWorkspaceBountyActions();

  return (
    <BountyDetail
      slug={slug}
      backHref={`/workspace/${workspaceId}/bounties`}
      renderActions={renderActions}
    />
  );
};
