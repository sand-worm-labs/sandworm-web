import React from "react";
import Head from "next/head";

import { DicebearAvatar } from "../DicebearAvatar";
import QueryList from "../QueryList";

export const Creators = () => {
  return (
    <div>
      <Head>
        <title>Creators</title>
      </Head>
      <div className="grid lg:grid-cols-[27%,73%] p-5">
        <div className="h-[15rem] py-10 w-full flex items-center justify-center mt-28">
          <div>
            <DicebearAvatar size={200} seed="creator" />
            <div className="mt-8 text-center">
              <h3 className="font-bold text-3xl">Bruno Mars</h3>
              <p className="mt-1 text-xs">Joined 2023</p>
            </div>
            <div className="grid grid-cols-2 w-full text-center mt-6">
              <div className="border border-[#ffffff40] p-4 py-3">
                <span className="text-sm">Forks</span>
                <p className="font-medium text-lg">0</p>
              </div>
              <div className="border border-[#ffffff40] p-4 py-3">
                <span className="text-sm">Stars</span>
                <p className="font-medium text-lg">0</p>
              </div>
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
