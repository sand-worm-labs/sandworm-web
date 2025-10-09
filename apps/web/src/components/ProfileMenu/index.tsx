"use client";

import { useState } from "react";
import type { FC } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUserProps } from "@/types";

import { ThemeTogggle } from "../Theme/ThemeToggle";

export const ProfileMenu: FC<CurrentUserProps> = ({ currentUser }) => {
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex space-x-2 items-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button type="button" className=" hover:bg-customgray rounded-full">
            {currentUser?.image ? (
              <Image
                src={currentUser.image}
                width={30}
                height={30}
                className="rounded-full"
                alt={`${currentUser.name} image`}
              />
            ) : (
              <Avatar className="h-64 w-64">
                <AvatarFallback>
                  {currentUser?.name?.split(" ")[0]?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 ">
          <span className="text-xs text-text-gray px-2 font-medium ">
            {currentUser?.name}
          </span>
          <DropdownMenuItem asChild>
            <Link href={`/creators/${currentUser?.id}`}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
            Sign Out
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <ThemeTogggle />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
