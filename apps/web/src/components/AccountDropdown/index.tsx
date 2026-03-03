"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
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
import Image from "next/image";

import { useModalStore } from "@/store/auth";

import { useStringQuery } from "../Visualization/hooks/useQueryArgs";
import { useSession, useSignout } from "../Visualization/hooks/useAuth";
import { BookIcon } from "../Assets/BookIcon";
import { GearIcon } from "../Assets/GearIcon";
import { QuestionIcon } from "../Assets/QuestionIcon";
import { ThumbsUpIcon } from "../Assets/ThumbsUpIcon";

const useShareProfile = (username: string) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  suffix?: React.ReactNode;
}

const NavItem = ({
  icon,
  label,
  href,
  onClick,
  external,
  suffix,
}: NavItemProps) => {
  const cls =
    "flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-sm text-ink-500 dark:text-white hover:bg-[#F8F9FA] dark:hover:bg-[#ffffff08] transition-colors cursor-pointer font-body font-medium";

  const inner = (
    <>
      <span className="text-ink-300 dark:text-ink-400 flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 text-ink-100">{label}</span>
      {suffix}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
};

// ─── Main component ──────────────────────────────────────────────
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
          className="px-5 h-11 border-[#E9ECEF] bg-base-100 text-ink-100 font-semibold inline-block w-full dark:border-[#262A30] border"
        >
          Sign up Today!
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mb-5 font-body">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="px-2 flex items-center gap-3 bg-base-100 rounded-xl h-12 border border-[#E9ECEF]  w-full justify-between dark:border-[#262A30] hover:bg-base-100 "
          >
            <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avater ?? undefined}
                  alt={user.firstName ?? "User"}
                />
                <AvatarFallback className="relative overflow-hidden">
                  <Image
                    src="/img/avatar/avatar6.svg"
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <span className="relative z-10 font-bold font-body text-white text-xl">
                    {user.firstName?.split(" ")[0]?.[0] ?? "U"}
                  </span>
                </AvatarFallback>
              </Avatar>
              <span className="text-[0.9rem] ">
                @{user.firstName ?? "User"}
              </span>
            </div>
            <MoreVertical className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 rounded-2xl border-[#E9ECEF] dark:border-[#262A30] shadow-md border p-2 ml-6"
          align="start"
        >
          {/* ── User header ── */}
          <div className="flex items-center justify-between px-2 py-2 mb-1 border-b border-[#E9ECEF] ">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.avater ?? undefined}
                  alt={user.firstName ?? "User"}
                />
                <AvatarFallback className="relative overflow-hidden">
                  <Image
                    src="/img/avatar/avatar6.svg"
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <span className="relative z-10 font-bold font-body text-white text-xl">
                    {user.firstName?.split(" ")[0]?.[0] ?? "U"}
                  </span>
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm text-ink-100 ">
                {user.firstName ?? "User"} {user.lastName}
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={shareProfile}
              className="bg-[#E2ECFF] dark:bg-[#A308F020] dark:text-primary text-accent hover:bg-[#E2ECFF]/90 text-xs rounded-md font-medium h-[22px] gap-1 font-tertiary"
            >
              {copied ? <>Copied!</> : <>Share</>}
            </Button>
          </div>

          <DropdownMenuSeparator className="my-1 dark:bg-[#262A30]" />

          {/* ── Nav list ── */}
          <NavItem
            icon={<BookIcon size={18} />}
            label="Docs"
            href="#"
            external
          />
          <NavItem
            icon={<QuestionIcon size={18} />}
            label="Get Help"
            href="#"
          />
          <NavItem
            icon={<ThumbsUpIcon size={18} />}
            label="Give Feedback"
            href="#"
          />
          <NavItem
            icon={<GearIcon size={18} />}
            label="Settings"
            href={`/workspace/${workspaceId}/settings`}
          />

          <DropdownMenuSeparator className="my-1 dark:bg-[#262A30]" />

          {/* ── Sign out ── */}
          <Button
            variant="destructive"
            onClick={signout}
            className="w-full text-[0.8rem] py-2 bg-[#FF0000] font-body"
          >
            <span>Sign Out</span>
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
