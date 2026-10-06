import { useCallback, useState } from "react";

import { planBlockMessage } from "@/utils/paid-sources";
import { useGetUserWorkspacesQuery } from "@/generated/graphql";

// Stops a run before it is enqueued when the workspace's plan doesn't include
// a data source used by the blocks about to run. `check` returns true when
// the run may go ahead; otherwise it sets `message`, which opens the modal.
export default function useUpgradeGate(workspaceId: string) {
  const { data } = useGetUserWorkspacesQuery({ fetchPolicy: "cache-first" });
  const plan = data?.getUserWorkspaces?.find(w => w.id === workspaceId)?.plan;
  const [message, setMessage] = useState<string | null>(null);

  const check = useCallback(
    (dataSourceIds: ReadonlyArray<string | null | undefined>): boolean => {
      const blocked = dataSourceIds
        .map(id => planBlockMessage(plan, id))
        .find(Boolean);
      setMessage(blocked ?? null);
      return !blocked;
    },
    [plan]
  );

  return {
    check,
    message,
    onHide: () => setMessage(null),
  };
}
