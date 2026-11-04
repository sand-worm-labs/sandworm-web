import { NextResponse, type NextRequest } from "next/server";

import {
  isAllowancePreviewMode,
  isClientKind,
  isContentPreviewMode,
  PREVIEW_ALLOWANCE_COOKIE,
  PREVIEW_BRIEFING_COOKIE,
  PREVIEW_CLIENT_COOKIE,
  PREVIEW_OPPORTUNITIES_COOKIE,
  PREVIEW_STATUS_COOKIE,
} from "@/features/preview/cookies";
import { isOverviewStatus } from "@/features/overview/types";

export function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const client = searchParams.get("client");
  const status = searchParams.get("status");
  const briefing = searchParams.get("briefing");
  const opportunities = searchParams.get("opportunities");
  const allowance = searchParams.get("allowance");
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
  if (opportunities && isContentPreviewMode(opportunities)) {
    response.cookies.set(PREVIEW_OPPORTUNITIES_COOKIE, opportunities, {
      path: "/",
    });
  }
  if (allowance && isAllowancePreviewMode(allowance)) {
    response.cookies.set(PREVIEW_ALLOWANCE_COOKIE, allowance, { path: "/" });
  }

  return response;
}
