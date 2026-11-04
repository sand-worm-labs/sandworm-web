import { cookies } from "next/headers";

import {
  isOverviewStatus,
  type OverviewStatus,
} from "@/features/overview/types";
import {
  ORGANISATION_TYPES,
  type OrganisationTypeId,
} from "@/features/setup/options/organisation-types";

export const PREVIEW_CLIENT_COOKIE = "preview-client";
export const PREVIEW_STATUS_COOKIE = "preview-status";
export const PREVIEW_BRIEFING_COOKIE = "preview-briefing";
export const PREVIEW_OPPORTUNITIES_COOKIE = "preview-opportunities";

export const CONTENT_PREVIEW_MODES = ["items", "empty"] as const;

export type ContentPreviewMode = (typeof CONTENT_PREVIEW_MODES)[number];

export function isContentPreviewMode(
  value: string
): value is ContentPreviewMode {
  return CONTENT_PREVIEW_MODES.some(mode => mode === value);
}

export function isClientKind(value: string): value is OrganisationTypeId {
  return ORGANISATION_TYPES.some(type => type.id === value);
}

export async function getPreviewClientKind(): Promise<OrganisationTypeId> {
  const value = (await cookies()).get(PREVIEW_CLIENT_COOKIE)?.value;
  return value && isClientKind(value) ? value : "exchange";
}

export async function getPreviewStatus(): Promise<OverviewStatus> {
  const value = (await cookies()).get(PREVIEW_STATUS_COOKIE)?.value;
  return value && isOverviewStatus(value) ? value : "ready";
}

async function getContentPreviewMode(
  cookieName: string
): Promise<ContentPreviewMode> {
  const value = (await cookies()).get(cookieName)?.value;
  return value && isContentPreviewMode(value) ? value : "items";
}

export const getPreviewBriefing = () =>
  getContentPreviewMode(PREVIEW_BRIEFING_COOKIE);

export const getPreviewOpportunities = () =>
  getContentPreviewMode(PREVIEW_OPPORTUNITIES_COOKIE);
