"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { FaRegStar, FaTelegramPlane } from "react-icons/fa";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import Link from "next/link";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import QueryList from "../QueryList";
import { DicebearAvatar } from "../DicebearAvatar";
import { AxiosService } from "@/services/axios";

interface CreatorsProps {
  queries: any;
}

interface User {
  // Define your user type here based on the expected response
  id: string;
  // Add other properties as needed
  name?: string;
  email?: string;
  // ...other user properties
}

export const Creators: React.FC<CreatorsProps> = ({ queries }) => {
  const [tab, setTab] = useState("all");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create an instance of your AxiosService
    // Adjust baseURL if needed - I'm assuming your API is at the root
    const axiosService = new AxiosService("http://localhost:3000", true);

    const fetchUser = async () => {
      try {
        console.log("Fetching user data...");
        const userData = await axiosService.get<User>(
          "/api/query/user?uid=lmjGhhMChrzjHfILYtD7"
        );

        console.log("User data received:", userData);
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUser();

    // No dependency array needed if you just want to fetch once on mount
  }, []);

  return (
    <div>
      <Head>
        <title>Creators</title>
      </Head>
      <div className="grid lg:grid-cols-[27%,73%] p-5 border-t">
        <div className="h-[15rem] py-10 w-full flex items-center justify-center mt-32">
          <div>
            <DicebearAvatar size={250} seed="creator" className="border-2" />
            <div className="mt-8 text-center">
              <h3 className="font-bold text-3xl">Bruno Mars</h3>
              <p className="mt-1 text-xs">Joined 2023</p>
            </div>
            <div className="flex space-x-5 items-center my-4 justify-center text-[#ffffffaa]">
              <Link href="/">
                <FaXTwitter size={20} />
              </Link>
              <Link href="/">
                <FaTelegramPlane size={20} />
              </Link>
              <Link href="/">
                <FaDiscord size={20} />
              </Link>
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

        <div className="container mx-auto px-12 dark mt-5">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="flex border-b border-borderLight">
              <TabsTrigger
                value="all"
                className={`px-4 py-2 flex items-center space-x-2 ${tab === "all" ? "border-b-2 border-primary" : ""}`}
              >
                <HiOutlineCommandLine size={18} />
                <span>All Queries</span>
              </TabsTrigger>
              <TabsTrigger
                value="starred"
                className={`px-4 py-2 flex items-center space-x-2 ${tab === "starred" ? "border-b-2 border-primary" : ""}`}
              >
                <FaRegStar size={16} /> <span>Starred</span>
              </TabsTrigger>
            </TabsList>
            <div className="container mx-auto pt-2">
              <TabsContent value="all">
                <QueryList queries={queries.page_items} />
              </TabsContent>
              <TabsContent value="starred">
                <QueryList queries={queries.page_items} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
