import { Star, GitFork } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import Image from "next/image";
import Link from "next/link";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";


import type { ApiDocument } from "@/types";

type ViewMode = "compact" | "detailed";

interface ExploreCardProps {
  query: ApiDocument;
  viewMode: ViewMode;
}

// =====================================
// ⬢ Explore Card
// =====================================
export const ExploreCard = ({ query, viewMode }: ExploreCardProps) => {
  const workspaceId = useStringQuery("workspace");

  return (
    <div
      className={`${
        viewMode === "detailed"
          ? " "
          : "border-b border-[#E9ECEF] pb-3  transition-shadow mb-1 dark:border-border-tertiary "
      }`}
    >
      <div className="p-2 px-5">
        <div className="flex items-end justify-between gap-4">
          {/* ✦ Profile Info ✦ */}
          <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
            <div className="flex space-x-3 items-center">
              <Avatar className="h-8 w-8 flex-shrink-0">
                {" "}
                {query.authorId ? (
                  <AvatarImage src="/img/avatar.svg" />
                ) : (
                  <AvatarFallback>
                    <Image
                      src="/img/avatar.svg"
                      alt="fallback avatar"
                      width={32}
                      height={32}
                    />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <Link
                   href={`/workspace/${workspaceId}/profile/${query.authorId}`}
                  className="text-[0.8rem] mb-1 text-ink-400 hover:underline"
                >
                  @{query.author?.username}
                </Link>
                <h3 className="text-[0.95rem] font-medium truncate cursor-pointer hover:underline">
                  {query.title}
                </h3>

                <p className="text-xs  text-ink-400 ">
                  Created{" "}
                  {query.createdAt
                    ? new Date(query.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* ✦ Actions + tags ✦ */}
          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                {query.favoriteCount}
                <Star
                  className="h-4 w-4 font-light text-ink-300 dark:text-ink-300 "
                  strokeWidth={1.2}
                />
              </span>
              <span className="flex items-center gap-1">
                {query.forkCount}
                <GitFork
                  className="h-4 w-4 font-light text-ink-300 dark:text-ink-300 "
                  strokeWidth={1.2}
                />
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/*     {query.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs dark:bg-[#262A30] bg-[#E0EAF1] text-muted-foreground dark:text-ink-300 py-0"
                >
                  #{tag}
                </Badge>
              ))} */}
            </div>
          </div>
        </div>
      </div>

      {viewMode === "detailed" && <div className="px-5 pb-4 text-sm" />}
    </div>
  );
};
