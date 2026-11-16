import { OrganisationTypeId } from "@sandworm/types/terminal";
import { cookies } from "next/headers";

import { env } from "@/config/env";
import type { ClientKind } from "@/types";
import { OverviewStatus, isOverviewStatus } from "@/lib/overview/status";
import { ORGANISATION_TYPES } from "@/data/setup/organisation-types";

import type { AccessPreviewMode } from "./modes";
import {
  AllowancePreviewMode,
  ContentPreviewMode,
  isAccessPreviewMode,
  isAllowancePreviewMode,
  isContentPreviewMode,
} from "./modes";

export const PREVIEW_CLIENT_COOKIE = "preview-client";
export const PREVIEW_STATUS_COOKIE = "preview-status";
export const PREVIEW_BRIEFING_COOKIE = "preview-briefing";
export const PREVIEW_SIGNALS_COOKIE = "preview-signals";

export const PREVIEW_ALLOWANCE_COOKIE = "preview-allowance";
export const PREVIEW_ACCESS_COOKIE = "preview-access";

export const MOCK_CLIENT_IDS: readonly ClientKind[] = [
  ...ORGANISATION_TYPES.map(type => type.id),
  "paycrest",
];

export function isClientKind(value: string): value is ClientKind {
  return MOCK_CLIENT_IDS.some(id => id === value);
}

export async function getPreviewClientKind(): Promise<ClientKind> {
  const value = (await cookies()).get(PREVIEW_CLIENT_COOKIE)?.value;
  return value && isClientKind(value) ? value : OrganisationTypeId.EXCHANGE;
}

export async function getPreviewStatus(): Promise<OverviewStatus> {
  const value = (await cookies()).get(PREVIEW_STATUS_COOKIE)?.value;
  return value && isOverviewStatus(value) ? value : OverviewStatus.READY;
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
  readPreviewMode(
    PREVIEW_BRIEFING_COOKIE,
    isContentPreviewMode,
    ContentPreviewMode.ITEMS
  );

export const getPreviewSignals = () =>
  readPreviewMode(
    PREVIEW_SIGNALS_COOKIE,
    isContentPreviewMode,
    ContentPreviewMode.ITEMS
  );

export const getPreviewAllowance = () =>
  readPreviewMode(
    PREVIEW_ALLOWANCE_COOKIE,
    isAllowancePreviewMode,
    AllowancePreviewMode.AVAILABLE
  );

export async function getPreviewAccess(): Promise<
  AccessPreviewMode | undefined
> {
  const value = (await cookies()).get(PREVIEW_ACCESS_COOKIE)?.value;
  return value && isAccessPreviewMode(value) ? value : undefined;
}

// What the browser needs to choose between live data and the preview fixtures
export type Preview = {
  isForced: boolean;
  clientKind: ClientKind;
  status: OverviewStatus;
  briefing: ContentPreviewMode;
  signals: ContentPreviewMode;
  allowance: AllowancePreviewMode;
};

export async function getPreview(): Promise<Preview> {
  const [isForced, clientKind, status, briefing, signals, allowance] =
    await Promise.all([
      cookies().then(
        store => store.has(PREVIEW_CLIENT_COOKIE) || env.devBypassAuth
      ),
      getPreviewClientKind(),
      getPreviewStatus(),
      getPreviewBriefing(),
      getPreviewSignals(),
      getPreviewAllowance(),
    ]);
  return { isForced, clientKind, status, briefing, signals, allowance };
}
