"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";

import type { User, QueryResponse } from "@/types";

import { CreatorInfo } from "./CreatorInfo";
import { CreatorTabs } from "./CreatorTabs";

interface ICreatorProps {
  queries: QueryResponse;
  user: User;
  starredQueries: QueryResponse;
  defaultTab?: string;
}

export const Creator: React.FC<ICreatorProps> = ({
  queries,
  user,
  defaultTab,
  starredQueries,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(defaultTab || "all");

  useEffect(() => {
    const current = searchParams?.get("tab");
    if (current !== tab) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("tab", tab);
      router.replace(`?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [tab]);

  return (
    <div>
      <Head>
        <title>Creators</title>
      </Head>
      <div className="grid lg:grid-cols-[27%,73%] p-5 border-t min-h-[85vh]">
        <CreatorInfo user={user} />
        <CreatorTabs
          tab={tab}
          setTab={setTab}
          queries={queries}
          starredQueries={starredQueries}
        />
      </div>
    </div>
  );
};
