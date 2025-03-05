"use client";

import { useState } from "react";
import type { FC } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/services/firebase/auth";
import type { CurrentUserProps } from "@/types";

import { DicebearAvatar } from "../DicebearAvatar";

export const ProfileMenu: FC<CurrentUserProps> = ({ currentUser }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    const isOk = await signOut();
    if (isOk) router.push("/");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center space-x-2 px-3 py-2 hover:bg-customgray rounded"
        >
          <DicebearAvatar
            size={30}
            seed={currentUser?.displayName || "sandworm"}
          />
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 dark">
        <DropdownMenuItem asChild>
          <Link href="/creators/hello">Profile</Link>
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
