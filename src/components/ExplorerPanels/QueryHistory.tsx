import React, { useState, useEffect } from "react";
import { Database } from "lucide-react";
import { useSession } from "next-auth/react";

import { fetchQueryUpdate } from "@/services/axios/queryService";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

import { QueryCard } from "./QueryHistory/QueryCard";

interface VersionEntry {
  id: number;
  timestamp: string;
  query: string;
}

interface QueryHistoryProps {
  queryId?: string;
  isOwner?: boolean;
}

export const LoadingState = () => {
  return <div>Loading...</div>;
};

export const QueryError = () => {
  return <div>Error loading query history.</div>;
};

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  queryId,
  isOwner = true,
}) => {
  const { data: session } = useSession();
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQueries = async () => {
      if (!session?.user?.id || !queryId) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchQueryUpdate(queryId);
        console.log("hmmm", data);
        setVersions(data);
      } catch (err) {
        console.error("Error fetching query versions:", err);
        setVersions([]);
      } finally {
        setLoading(false);
      }
    };

    loadQueries();
  }, [session?.user?.id, queryId]);

  if (!isOwner) return <QueryError />;

  return (
    <Card className="h-full overflow-hidden border-none dark">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center gap-2 py-2">
          <Database className="h-5 w-5" />
          <CardTitle className="font-semibold">Version History</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-y-auto max-h-[400px]">
          {loading && <LoadingState />}
          {!loading && versions.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">
              No version history found.
            </div>
          )}
          {!loading &&
            versions.length > 0 &&
            versions.map(version => (
              <QueryCard key={version.query} version={version} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
