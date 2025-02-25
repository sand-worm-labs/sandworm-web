"use client";

import Head from "next/head";

import QueryList from "@/components/QueryList";

const page = () => {
  return (
    <div>
      <Head>
        <title>Explore</title>
      </Head>
      <div className="container mx-auto">
        <h1>Dashboard</h1>
        <QueryList />
      </div>
    </div>
  );
};

export default page;
