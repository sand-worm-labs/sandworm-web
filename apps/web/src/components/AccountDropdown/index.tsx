"use client";

import React, { useState } from "react";
import { Check, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@sandworm/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@sandworm/ui/components/dropdown-menu";
import { Button } from "@sandworm/ui/components/button";

import { useModalStore } from "@/store/auth";

import { useStringQuery } from "../Visualization/hooks/useQueryArgs";
import { useSession, useSignout } from "../Visualization/hooks/useAuth";

const useShareProfile = (username: string) => {
  const [copied, setCopied] = useState(false);

  // Handle Copy to Clipboard
  // =====================================
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Handle Share Profile
  // =====================================
  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    const shareData = {
      title: `${username}'s Profile`,
      text: `Check out ${username}'s profile on Sandworm Labs`,
      url: profileUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await copyToClipboard(profileUrl);
        }
      }
    } else {
      await copyToClipboard(profileUrl);
    }
  };

  return { shareProfile, copied };
};

export const AccountDropdown = () => {
  const session = useSession({ redirectToLogin: true });
  const openSignIn = useModalStore(state => state.openSignIn);
  const signout = useSignout();
  const workspaceId = useStringQuery("workspace");
  const user = session?.user;

  const { shareProfile, copied } = useShareProfile(user?.firstName ?? "user");

  if (!user) {
    return (
      <div className="w-[95%] mx-auto mb-5 flex justify-center">
        <Button
          onClick={() => openSignIn()}
          className="px-5 h-11 border-[#E9ECEF] bg-white  dark:bg-[#0D1014] text-black dark:text-white font-semibold inline-block w-full dark:border-[#262A30] border"
        >
          Sign up Today!
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mb-5 ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="px-2 flex items-center gap-3 bg-white rounded-xl h-12 border border-[#E9ECEF] dark:bg-[#0D1014] w-full justify-between dark:border-[#262A30] hover:bg-white"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user.avater ?? undefined}
                  alt={user.firstName ?? "User"}
                />
                <AvatarFallback>
                  {user.firstName?.split(" ")[0]?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left leading-tight text-[0.9rem] font-primary">
                <span>@{user.firstName ?? "User"}</span>
              </div>
            </div>
            <MoreVertical className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[17rem] rounded-2xl border-[#E9ECEF]  shadow-md border p-3 py-4 ml-6"
          align="start"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.avater ?? undefined}
                  alt={user.firstName ?? "Sandworm User"}
                />
                <AvatarFallback>
                  {user.firstName?.split(" ")[0]?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {user.firstName ?? "Guest"}
                </p>
                <p className="font-medium text-xs text-ink-400">
                  @{user.email ?? ""}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={shareProfile}
              className="bg-[#E2ECFF] dark:bg-[#A308F020] dark:text-primary text-accent hover:bg-[#E2ECFF]/90 text-xs rounded-md font-medium h-6 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>Share</>
              )}
            </Button>
          </div>

          <Link
            href={`/workspace/${workspaceId}/profile/me`}
            className="block mt-3 text-xs underline text-primary hover:text-primary mb-4"
          >
            Go to profile page
          </Link>

          <p className="text-[0.75rem] leading-relaxed border-t border-b border-[#E9ECEF] py-3 text-ink-500 dark:text-white dark:border-[#262A30]">
            {user.settings?.statusText ?? "No bio available."}
          </p>

          <DropdownMenuSeparator className="my-3" />

          <div className="flex flex-col gap-2">
            <Link href={`/workspace/${workspaceId}/settings`}>
              <Button
                variant="outline"
                className="w-full bg-[#F8F9FA] dark:bg-[#0C1015] border border-[#DEE2E6] dark:border-[#262A30] text-[0.8rem] py-5 rounded-lg hover:bg-white"
              >
                Settings
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="w-full text-[0.8rem] py-5 bg-[#FF0000]"
              onClick={signout}
            >
              Sign Out
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
