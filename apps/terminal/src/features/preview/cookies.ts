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
export const PREVIEW_SIGNALS_COOKIE = "preview-signals";

export const PREVIEW_ALLOWANCE_COOKIE = "preview-allowance";
export const PREVIEW_ACCESS_COOKIE = "preview-access";

export const ACCESS_PREVIEW_MODES = ["allowed", "noClient"] as const;

export type AccessPreviewMode = (typeof ACCESS_PREVIEW_MODES)[number];

export function isAccessPreviewMode(value: string): value is AccessPreviewMode {
  return ACCESS_PREVIEW_MODES.some(mode => mode === value);
}

export const CONTENT_PREVIEW_MODES = ["items", "empty"] as const;

export type ContentPreviewMode = (typeof CONTENT_PREVIEW_MODES)[number];

export function isContentPreviewMode(
  value: string
): value is ContentPreviewMode {
  return CONTENT_PREVIEW_MODES.some(mode => mode === value);
}

export const ALLOWANCE_PREVIEW_MODES = ["available", "used"] as const;

export type AllowancePreviewMode = (typeof ALLOWANCE_PREVIEW_MODES)[number];

export function isAllowancePreviewMode(
  value: string
): value is AllowancePreviewMode {
  return ALLOWANCE_PREVIEW_MODES.some(mode => mode === value);
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

async function readPreviewMode<Mode extends string>(
  cookieName: string,
  isMode: (value: string) => value is Mode,
  fallback: Mode
): Promise<Mode> {
  const value = (await cookies()).get(cookieName)?.value;
  return value && isMode(value) ? value : fallback;
}

export const getPreviewBriefing = () =>
  readPreviewMode(PREVIEW_BRIEFING_COOKIE, isContentPreviewMode, "items");

export const getPreviewSignals = () =>
  readPreviewMode(PREVIEW_SIGNALS_COOKIE, isContentPreviewMode, "items");

export const getPreviewAllowance = () =>
  readPreviewMode(
    PREVIEW_ALLOWANCE_COOKIE,
    isAllowancePreviewMode,
    "available"
  );

export async function getPreviewAccess(): Promise<
  AccessPreviewMode | undefined
> {
  const value = (await cookies()).get(PREVIEW_ACCESS_COOKIE)?.value;
  return value && isAccessPreviewMode(value) ? value : undefined;
}
