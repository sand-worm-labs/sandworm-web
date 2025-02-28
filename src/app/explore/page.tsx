"use client";

import Head from "next/head";

import QueryList from "@/components/QueryList";
import Header from "@/components/Header";

const page = () => {
  return (
    <div>
      <Head>
        <title>Explore</title>
      </Head>
      <Header />
      <div className="container mx-auto pt-10">
        <QueryList />
      </div>
    </div>
  );
};

export default page;
