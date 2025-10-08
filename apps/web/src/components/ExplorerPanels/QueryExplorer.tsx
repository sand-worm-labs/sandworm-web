"use client";

import React, { useEffect } from "react";
import { SquareTerminal, Plus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

import type { Query } from "@/types";
import { useModalStore } from "@/store/auth";
import { useQueryStore } from "@/store/queries";

import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";

import { QueryExplorerCardList } from "./QueryExplorerCardList";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center text-muted-foreground">
    <Loader2 className="animate-spin h-6 w-6" />
    <p>Loading your queries…</p>
  </div>
);

const UnauthenticatedState = ({
  handleSignIn,
}: {
  handleSignIn: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center text-muted-foreground">
    <SquareTerminal className="h-8 w-8" />
    <p className="text-sm px-4 max-w-sm">
      Sign in to access your saved queries and keep your work synced
    </p>
    <Button variant="outline" onClick={handleSignIn}>
      Sign In
    </Button>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
    <div className="flex flex-col items-center gap-2">
      <SquareTerminal className="h-8 w-8 text-muted-foreground" />
      <p className="text-muted-foreground text-sm px-4">
        You haven't saved any queries yet. Create a query to get started
      </p>
    </div>
    <Button variant="outline" className="gap-2">
      <Plus className="h-4 w-4" />
      Create Query
    </Button>
  </div>
);

const QueryExplorerContent = ({
  session,
  loading,
  queries,
}: {
  session: any;
  loading: boolean;
  queries: Query[];
}) => {
  const openSignIn = useModalStore((state) => state.openSignIn);

  if (!session?.user?.id)
    return <UnauthenticatedState handleSignIn={openSignIn} />;

  if (loading) return <LoadingState />;

  if (queries.length === 0) return <EmptyState />;

  return <QueryExplorerCardList query={queries} />;
};

export const QueryExplorer = () => {
  const { data: session } = useSession();
  const { queries, loadQueries, loading } = useQueryStore();

  useEffect(() => {
    if (session?.user?.id) {
      loadQueries(session.user.id);
    }
  }, [session?.user?.id]);

  return (
    <Card className="h-full overflow-hidden border-none ">
      <CardHeader className="p-4 border-b ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-2">
            <SquareTerminal className="h-5 w-5" />
            <CardTitle className=" font-medium">Query Explorer</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-60px)] overflow-y-auto">
        <QueryExplorerContent
          session={session}
          loading={loading}
          queries={queries}
        />
      </CardContent>
    </Card>
  );
};
