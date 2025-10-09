"use client";

import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import { SiFarcaster } from "react-icons/si";
import Link from "next/link";
import { FaTelegramPlane } from "react-icons/fa";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import type { User } from "@/types";
import { timeAgo } from "@/lib/date";

interface CreatorInfoProps {
  user: User;
}

export const CreatorInfo = ({ user }: CreatorInfoProps) => {
  return (
    <div className="min-h-[15rem] py-10 w-full flex  justify-center md:mt-16 mt-4">
      <div className="flex flex-col items-center">
        {user.image ? (
          <Image
            alt="user avatar"
            src={user.image}
            width={250}
            height={250}
            unoptimized
            className="rounded-full border-2"
          />
        ) : (
          <Avatar className="h-64 w-64">
            <AvatarFallback>
              {user.id?.split(" ")[0]?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="mt-8 text-center">
          <h3 className="font-bold md:text-3xl text-2xl">{user.username}</h3>
          <p className="mt-1 text-xs">Joined {timeAgo(user.createdAt)}</p>
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
          <Link href="/">
            <SiFarcaster size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-2 w-full text-center mt-6">
          <div className="border border-[#ffffff40] p-4 py-3">
            <span className="text-sm">Forks</span>
            <p className="font-medium text-lg">{user.forks}</p>
          </div>
          <div className="border border-[#ffffff40] p-4 py-3">
            <span className="text-sm">Stars</span>
            <p className="font-medium text-lg">{user.stars}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
