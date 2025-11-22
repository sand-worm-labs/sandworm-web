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
  liked: boolean;
}

export const ExploreCard = ({ query, viewMode }: ExploreCardProps) => {
  return (
    <div
      className={`${
        viewMode === "detailed"
          ? "bg-background "
          : "border border-[#D4DCDF] rounded-lg bg-card  transition-shadow mb-1 dark:border-[#262A30] "
      }`}
    >
      <div className="p-2 px-5">
        <div className="flex items-end justify-between gap-4">
          {/* ✦ Profile Info ✦ */}
          <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
            <div className="flex space-x-3 items-center">
              <Avatar className="h-7 w-7 flex-shrink-0">
                {" "}
                {query.creator ? (
                  <AvatarImage src="/img/avatar.svg" />
                ) : (
                  <AvatarFallback>
                    <img src="/img/avatar.svg" alt="fallback avatar" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <UserProfileHover>
                  <h3 className="text-[0.9rem] font-medium truncate cursor-pointer hover:underline">
                    @ {query.creator} - {query.title}
                  </h3>
                </UserProfileHover>
              </div>
            </div>
            <p className="text-xs  text-[#6C757D] ">
              Created {query.createdAt.toLocaleDateString("en-US")}
            </p>
          </div>

          {/* ✦ Actions + tags ✦ */}
          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                {query.stared_by.length || 0}
                <Star
                  className="h-4 w-4 font-light text-[#1C3B5A] dark:text-[#868E96]"
                  strokeWidth={1.2}
                />
              </span>
              <span className="flex items-center gap-1">
                {query.forked_by.length || 0}
                <GitFork
                  className="h-4 w-4 font-light text-[#1C3B5A] dark:text-[#868E96]"
                  strokeWidth={1.2}
                />
              </span>
            </div>

            <div className="flex items-center gap-2">
              {query.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs dark:bg-[#262A30] bg-[#E0EAF1] text-muted-foreground dark:text-[#8696A6]"
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
