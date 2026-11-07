export type {
  ClientStatusId,
  InviteTimingId,
  PlanId,
  TeamClientDraft,
  TeamClientSummary,
} from "@sandworm/types/terminal";

export type StarterResearch = {
  id: string;
  title: string;
  fits: string;
  data: "public" | "shared";
};
