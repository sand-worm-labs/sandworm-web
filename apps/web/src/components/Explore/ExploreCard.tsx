import { Star, GitFork } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import { Badge } from "@sandworm/ui/components/badge";

import type { Query } from "@/types";

import { UserProfileHover } from "./UserProfileHover";

type ViewMode = "compact" | "detailed";

interface ExploreCardProps {
  query: Query;
  viewMode: ViewMode;
}

export const ExploreCard = ({ query, viewMode }: ExploreCardProps) => {
  return (
    <div
      className={`${
        viewMode === "detailed"
          ? " "
          : "border-b border-[#E9ECEF] pb-3  transition-shadow mb-1 dark:border-[#262A30] "
      }`}
    >
      <div className="p-2 px-5">
        <div className="flex items-end justify-between gap-4">
          {/* ✦ Profile Info ✦ */}
          <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
            <div className="flex space-x-3 items-center">
              <Avatar className="h-8 w-8 flex-shrink-0">
                {" "}
                {query.creator ? (
                  <AvatarImage src={query.image} />
                ) : (
                  <AvatarFallback>
                    <img src="/img/avatar.svg" alt="fallback avatar" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[0.8rem] mb-1 text-ink-400">
                  @{query.creator}
                </p>
                <UserProfileHover>
                  <h3 className="text-[0.95rem] font-medium truncate cursor-pointer hover:underline">
                    {query.title}
                  </h3>
                </UserProfileHover>
                <p className="text-xs  text-ink-400 ">
                  Created {query.createdAt.toLocaleDateString("en-US")}
                </p>
              </div>
            </div>
          </div>

          {/* ✦ Actions + tags ✦ */}
          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                {query.stared_by.length || 0}
                <Star
                  className="h-4 w-4 font-light text-[#1C3B5A] dark:text-ink-300 "
                  strokeWidth={1.2}
                />
              </span>
              <span className="flex items-center gap-1">
                {query.forked_by.length || 0}
                <GitFork
                  className="h-4 w-4 font-light text-[#1C3B5A] dark:text-ink-300 "
                  strokeWidth={1.2}
                />
              </span>
            </div>

            <div className="flex items-center gap-2">
              {query.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs dark:bg-[#262A30] bg-[#E0EAF1] text-muted-foreground dark:text-[#8696A6] py-0"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {viewMode === "detailed" && (
        <div className="px-5 pb-4 text-sm text-[#495057]" />
      )}
    </div>
  );
};
