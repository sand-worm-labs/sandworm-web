import { Star, GitFork } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import { Badge } from "@sandworm/ui/components/badge";

import { CodePreview } from "./CodePreview";
import { UserProfileHover } from "./UserProfileHover";
import type { Query } from "@/types";
import type { ViewMode } from "./QueriesList";

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
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
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
                <h3 className="text-sm font-medium truncate cursor-pointer hover:underline">
                  {query.creator} - {query.title}
                </h3>
              </UserProfileHover>
              <p className="text-xs text-muted-foreground mt-1">
                Created {query.createdAt.toDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                {query.stared_by.length || 0}
                <Star className="h-4 w-4 font-light text-[#1C3B5A]" />
              </span>
              <span className="flex items-center gap-1">
                {query.forked_by.length || 0}
                <GitFork className="h-4 w-4 font-light text-[#1C3B5A]" />
              </span>
            </div>

            <div className="flex items-center gap-2">
              {query.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-[#E0EAF1] text-muted-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {viewMode === "detailed" && (
        <CodePreview code={query.query} language={"sql"} />
      )}
    </div>
  );
};
