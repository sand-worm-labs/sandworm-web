"use client";

import { useState } from "react";
import type { FC } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrentUserProps } from "@/types";

import { DicebearAvatar } from "../DicebearAvatar";

export const ProfileMenu: FC<CurrentUserProps> = ({ currentUser }) => {
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center space-x-2 px-3 py-2 hover:bg-customgray rounded"
        >
          <span className="text-sm font-medium pr-2">{currentUser?.name}</span>
          {currentUser?.image ? (
            <Image
              src={currentUser.image}
              width={20}
              height={20}
              alt={`${currentUser.name} image`}
            />
          ) : (
            <DicebearAvatar
              size={30}
              seed={currentUser?.displayName || "sandworm"}
            />
          )}

          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 dark">
        <DropdownMenuItem asChild>
          <Link href={`/creators/${currentUser?.id}`}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
