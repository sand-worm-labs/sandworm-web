"use client";

import React, { useState } from "react";
import Head from "next/head";

import type { User, QueryResponse } from "@/types";

import { CreatorInfo } from "./CreatorInfo";
import { CreatorTabs } from "./CreatorTabs";

interface CreatorsProps {
  queries: QueryResponse;
  user: User;
}

export const Creators: React.FC<CreatorsProps> = ({ queries, user }) => {
  const [tab, setTab] = useState("all");

  return (
    <div>
      <Head>
        <title>Creators</title>
      </Head>
      <div className="grid lg:grid-cols-[27%,73%] p-5 border-t">
        <CreatorInfo user={user} />
        <CreatorTabs tab={tab} setTab={setTab} queries={queries} />
      </div>
    </div>
  );
};
