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

interface UserProfileHoverProps {
  children: React.ReactNode;
}

export function UserProfileHover({ children }: UserProfileHoverProps) {
  // Dummy data
  const dummyUser = {
    name: "Si",
    username: "si_username",
    queriesCount: 42,
    dashboardsCount: 7,
    bio: "Just a dummy bio for this user. Loves coding and blockchain stuff.",
    avatarUrl: "/placeholder.svg",
  };

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        className="w-80 font-primary border-[#E9ECEF] rounded-2xl"
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
                <p className="text-sm text-muted-foreground">
                  {dummyUser.username}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20"
            >
              Share
            </Button>
          </div>

          <a
            href="#"
            className="text-sm text-red-500 hover:text-red-600 font-medium inline-block"
            onClick={e => e.preventDefault()}
          >
            Go to Profile Page
          </a>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold">{dummyUser.queriesCount}</span>{" "}
              <span className="text-muted-foreground">Queries</span>
            </div>
            <div>
              <span className="font-semibold">{dummyUser.dashboardsCount}</span>{" "}
              <span className="text-muted-foreground">Dashboards</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {dummyUser.bio}
          </p>

          <Button
            variant="outline"
            className="w-full bg-[#F8F9FA] border border-[#DEE2E6] py-5 rounded-lg"
          >
            Visit profile
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
