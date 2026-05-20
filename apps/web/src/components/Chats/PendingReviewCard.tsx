"use client";

import React from "react";

import ChangesPanelCompact from "./ChangesPanel";
import type { PendingReviewPart } from "./parts.types";

// =====================================
// ⬢ PendingReviewCard
// =====================================

interface PendingReviewCardProps {
  part: PendingReviewPart;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

export function PendingReviewCard({
  part,
  onAcceptAll,
  onRejectAll,
}: PendingReviewCardProps) {
  const changes = part.blocks.map(b => ({
    id: b.blockId,
    type: b.action === "created" ? "added" : "modified",
    label: b.blockTitle,
    description: `${b.blockType} · ${b.action}`,
  }));

  return (
    <ChangesPanelCompact
      changes={changes}
      onConfirm={onAcceptAll}
      onUndo={onRejectAll}
    />
  );
}
