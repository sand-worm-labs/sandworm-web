import { NextResponse, type NextRequest } from "next/server";

import {
  isAccessPreviewMode,
  isAllowancePreviewMode,
  isClientKind,
  isContentPreviewMode,
  PREVIEW_ACCESS_COOKIE,
  PREVIEW_ALLOWANCE_COOKIE,
  PREVIEW_BRIEFING_COOKIE,
  PREVIEW_CLIENT_COOKIE,
  PREVIEW_SIGNALS_COOKIE,
  PREVIEW_STATUS_COOKIE,
} from "@/lib/preview/cookies";
import { isOverviewStatus } from "@/lib/overview/types";

export function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const client = searchParams.get("client");
  const status = searchParams.get("status");
  const briefing = searchParams.get("briefing");
  const signals = searchParams.get("signals");
  const allowance = searchParams.get("allowance");
  const access = searchParams.get("access");
  const response = NextResponse.redirect(new URL("/", request.url));

  if (client && isClientKind(client)) {
    response.cookies.set(PREVIEW_CLIENT_COOKIE, client, { path: "/" });
  }
  if (status && isOverviewStatus(status)) {
    response.cookies.set(PREVIEW_STATUS_COOKIE, status, { path: "/" });
  }
  if (briefing && isContentPreviewMode(briefing)) {
    response.cookies.set(PREVIEW_BRIEFING_COOKIE, briefing, { path: "/" });
  }
  if (signals && isContentPreviewMode(signals)) {
    response.cookies.set(PREVIEW_SIGNALS_COOKIE, signals, {
      path: "/",
    });
  }
  if (allowance && isAllowancePreviewMode(allowance)) {
    response.cookies.set(PREVIEW_ALLOWANCE_COOKIE, allowance, { path: "/" });
  }

  if (access && isAccessPreviewMode(access)) {
    response.cookies.set(PREVIEW_ACCESS_COOKIE, access, { path: "/" });
  }

  return response;
}
