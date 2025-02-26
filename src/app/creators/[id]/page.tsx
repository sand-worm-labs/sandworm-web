"use client";

import Head from "next/head";

import { DicebearAvatar } from "@/components/DicebearAvatar";
import QueryList from "@/components/QueryList";

const page = () => {
  return (
    <div>
      <Head>
        <title>Creators</title>
      </Head>
      <div
        className="h-[15rem] py-10 w-full flex items-center justify-center"
        style={{
          backgroundImage: `url("./img/bg.png")`,
        }}
      >
        <div className="bg-[#ffffff20] rounded-lg text-white px-4 py-4 flex items-center space-x-6 pr-12">
          <DicebearAvatar size={80} seed="creator" />
          <div>
            <h3 className="font-bold text-lg">Bruno Mars</h3>
            <p className="mt-1 text-xs">Joined 2023</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-12 py-6">
        <QueryList />
      </div>
    </div>
  );
};

export default page;
