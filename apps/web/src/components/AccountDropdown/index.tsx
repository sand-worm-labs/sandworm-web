"use client";

import React from "react";
import { ChevronDown, Share2 } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const AccountDropdown = () => {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="w-[90%] mx-auto mb-5 flex justify-center">
        <Button
          onClick={() => signIn()}
          className="px-5 h-11 border-[#E9ECEF] bg-white  dark:bg-neutral-900 text-black dark:text-white font-semibold inline-block w-full"
        >
          Sign up Today!
        </Button>
      </div>
    );
  }

  return (
    <div className="w-[90%] mx-auto mb-5 dark:bg-black">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="px-3 flex items-center gap-3 bg-white rounded-xl h-12 border border-[#E9ECEF] dark:bg-neutral-900 w-full justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user.image ?? undefined}
                  alt={user.name ?? "User"}
                />
                <AvatarFallback>
                  {user.name?.split(" ")[0]?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left leading-tight text-base">
                <span>{user.name ?? "User"}</span>
              </div>
            </div>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 rounded-xl shadow-lg p-3 ml-6"
          align="start"
        >
          {/* Avatar + Name + Share */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.image ?? undefined}
                  alt={user.name ?? "User"}
                />
                <AvatarFallback>
                  {user.name?.split(" ")[0]?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">@{user.name ?? "Guest"}</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Profile Link */}
          <Link
            href="/profile"
            className="block mt-3 text-xs underline text-[#C7665C] hover:text-[#C7665C]"
          >
            Go to profile page
          </Link>

          <p className="mt-2 text-xs text-muted-foreground">
            Deep dive into EVM chain data with a focus on trends, adoption, and
            the growth of the Base blockchain.
          </p>

          <DropdownMenuSeparator className="my-3" />

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Link href="/settings">
              <Button variant="outline" className="w-full text-xs">
                Settings
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="w-full text-xs"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
