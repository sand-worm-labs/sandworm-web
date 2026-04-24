"use client";

import type React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import { Button } from "@sandworm/ui/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sandworm/ui/components/hover-card";
import Link from "next/link";

// 🎨 Interfaces and Constants
// =====================================
interface UserProfileHoverProps {
  children: React.ReactNode;
}

const dummyUser = {
  name: "Si",
  username: "si_username",
  queriesCount: 42,
  dashboardsCount: 7,
  bio: "Just a dummy bio for this user. Loves coding and blockchain stuff.",
  avatarUrl: "/placeholder.svg",
};

// =====================================
// ⬢ UserProfileHover Component
// =====================================
export function UserProfileHover({ children }: UserProfileHoverProps) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-80 font-body  border-border-secondary  rounded-2xl dark:bg-base-100  dark:border-border-tertiary"
        align="start"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={dummyUser.avatarUrl} />
                <AvatarFallback>{dummyUser.name}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{dummyUser.name}</p>
                <p className="text-sm text-ink-400 font-body ">
                  @{dummyUser.username}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="bg-[#E2ECFF] dark:bg-[#A308F020] dark:text-primary text-accent hover:bg-[#E2ECFF]/90 text-sm rounded-md font-medium h-6"
            >
              Share
            </Button>
          </div>

          <Link
            href="/"
            className="text-sm text-primary hover:text-red-600 underline font-medium inline-block"
          >
            Go to Profile Page
          </Link>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-medium">{dummyUser.queriesCount}</span>{" "}
              <span className="text-ink-400 font-medium">Queries</span>
            </div>
            <div>
              <span className="font-medium">{dummyUser.dashboardsCount}</span>{" "}
              <span className="text-ink-400 font-medium">Dashboards</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed border-t border-b border-border-secondary  py-3 text-ink-500 dark:text-white dark:border-border-tertiary">
            {dummyUser.bio}
          </p>

          <Button
            variant="outline"
            className="w-full bg-[#F8F9FA] dark:bg-[#0C1015] border border-[#DEE2E6] dark:border-border-tertiary py-5 rounded-lg"
          >
            Visit profile
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
