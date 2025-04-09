"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserQueries } from "@/store/queries";

export const UserQueryFetcher = () => {
  const { data: session } = useSession();
  const fetchUserQueries = useUserQueries(s => s.fetchUserQueries);

  useEffect(() => {
    if (session?.user?.id) {
      console.log(
        "Fetching user queries for user ID:",
        session.user.id,
        session
      );
      fetchUserQueries(session.user.id);
    }
  }, [session?.user?.id]);

  return null;
};
