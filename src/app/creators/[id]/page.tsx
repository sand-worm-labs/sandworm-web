"use client";

import Head from "next/head";

import { DicebearAvatar } from "@/components/DicebearAvatar";
import QueryList from "@/components/QueryList";
import Header from "@/components/Header";

const page = () => {
  return (
    <div>
      <Head>
        <title>Creators</title>
      </Head>
      <Header />
      <div className="grid lg:grid-cols-[35%,65%]">
        <div className="h-[15rem] py-10 w-full flex items-center justify-center mt-16">
          <div>
            <DicebearAvatar size={200} seed="creator" />
            <div className="mt-8 text-center">
              <h3 className="font-bold text-3xl">Bruno Mars</h3>
              <p className="mt-1 text-xs">Joined 2023</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-12 py-6">
          <QueryList />
        </div>
      </div>
    </div>
  );
};

export default page;
