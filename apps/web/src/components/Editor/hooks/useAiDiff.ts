import { useCallback, useState } from "react";

export type AiBlockStatus = "pending" | "accepted" | "rejected";

// useAiDiff
// =====================================
// Manages accept/reject/undo state for a set of AI-generated blocks.
// Feed blockIds in when the AI finishes generating.
// =====================================
export function useAiDiff(blockIds: string[]) {
  const [statuses, setStatuses] = useState<Record<string, AiBlockStatus>>(() =>
    Object.fromEntries(blockIds.map(id => [id, "pending"]))
  );

  const setStatus = useCallback((id: string, status: AiBlockStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  }, []);

  const acceptAll = useCallback(() => {
    setStatuses(prev =>
      Object.fromEntries(
        Object.entries(prev).map(([id, s]) => [
          id,
          s === "pending" ? "accepted" : s,
        ])
      )
    );
  }, []);

  const rejectAll = useCallback(() => {
    setStatuses(prev =>
      Object.fromEntries(
        Object.entries(prev).map(([id, s]) => [
          id,
          s === "pending" ? "rejected" : s,
        ])
      )
    );
  }, []);

  const undoAll = useCallback(() => {
    setStatuses(prev =>
      Object.fromEntries(Object.keys(prev).map(id => [id, "pending"]))
    );
  }, []);

  const counts = Object.values(statuses).reduce(
    (acc, s) => {
      acc[s]++;
      return acc;
    },
    { pending: 0, accepted: 0, rejected: 0 }
  );

  const blockProps = (id: string) => ({
    visible: id in statuses,
    status: statuses[id] ?? "pending",
    onAccept: () => setStatus(id, "accepted"),
    onReject: () => setStatus(id, "rejected"),
    onUndo: () => setStatus(id, "pending"),
  });

  return {
    statuses,
    counts,
    totalAi: blockIds.length,
    acceptAll,
    rejectAll,
    undoAll,
    blockProps,
  };
}
