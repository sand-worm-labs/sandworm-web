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
import type { Query } from "./DummyData";

interface UserProfileHoverProps {
  author: Query["author"];
  children: React.ReactNode;
}

export function UserProfileHover({ author, children }: UserProfileHoverProps) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={author.avatar || "/placeholder.svg"} />
                <AvatarFallback>{author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{author.name}</p>
                <p className="text-sm text-muted-foreground">
                  {author.username}
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
              <span className="font-semibold">{author.queriesCount}</span>{" "}
              <span className="text-muted-foreground">Queries</span>
            </div>
            <div>
              <span className="font-semibold">{author.dashboardsCount}</span>{" "}
              <span className="text-muted-foreground">Dashboards</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {author.bio}
          </p>

          <Button variant="outline" className="w-full bg-transparent">
            Visit profile
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
