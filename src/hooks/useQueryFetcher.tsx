"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserQueries } from "@/store/queries";

export const UserQueryFetcher = () => {
  const { data: session } = useSession();
  const fetchUserQueries = useUserQueries(s => s.fetchUserQueries);

  useEffect(() => {
    if (session.userId) {
      console.log(
        "Fetching user queries for user ID:",
        session.userId,
        session
      );
      fetchUserQueries(session.userId);
    }
  }, [session?.userId]);

  return null;
};
