import { Star, GitFork } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import { Badge } from "@sandworm/ui/components/badge";
import { CodePreview } from "./CodePreview";
import { UserProfileHover } from "./UserProfileHover";
import type { Query } from "./DummyData";
import type { ViewMode } from "./QueriesList";

interface QueryCardProps {
  query: Query;
  viewMode: ViewMode;
}

export function QueryCard({ query, viewMode }: QueryCardProps) {

  return (
    <div className={`${viewMode === "detailed"    ? "bg-background my-2"
      : "border rounded-lg bg-card hover:shadow-md transition-shadow my-2"}`}>
      <div className="p-2">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={query.author.avatar || "/placeholder.svg"} />
              <AvatarFallback>{query.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <UserProfileHover author={query.author}>
                <h3 className="text-sm font-medium truncate cursor-pointer hover:underline">
                  {query.author.username} - {query.title}
                </h3>
              </UserProfileHover>
              <p className="text-xs text-muted-foreground mt-1">
                Created {query.createdAt}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                {query.stars}
                <Star className="h-4 w-4" />
              </span>
              <span className="flex items-center gap-1">
                {query.forks}
                <GitFork className="h-4 w-4" />
              </span>
            </div>

            <div className="flex items-center gap-2">
              {query.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-secondary text-muted-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {viewMode === "detailed" && (
        <CodePreview code={query.code} language={query.language} />
      )}
    </div>
  );
}
