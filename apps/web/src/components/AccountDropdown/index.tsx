"use client";

import React, { useState } from "react";
import { PiDotsThreeVertical, PiSignOut } from "react-icons/pi";
import Link from "next/link";
import Image from "next/image";
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

import { useStringQuery } from "../Editor/hooks/useQueryArgs";
import { useSession, useSignout } from "../Editor/hooks/useAuth";
import { TooltipV2 } from "../Editor/blocks/ToolTips";
import { BookIcon } from "../Assets/BookIcon";
import { GearIcon } from "../Assets/GearIcon";
import { QuestionIcon } from "../Assets/QuestionIcon";
import { ThumbsUpIcon } from "../Assets/ThumbsUpIcon";

// =====================================
// ⬢ useShareProfile
// =====================================

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

// =====================================
// ⬢ NavItem
// =====================================

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
    "flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-sm " +
    "text-ink-500 dark:text-white hover:bg-[#F8F9FA] dark:hover:bg-[#ffffff08] " +
    "transition-colors cursor-pointer font-body font-medium text-start";

  const inner = (
    <>
      <span className="text-[#1C3B5A] dark:text-ink-400 flex items-center justify-center">
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

// =====================================
// ⬢ UserAvatar
// =====================================

const UserAvatar = ({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md";
}) => {
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <Avatar className={dim}>
      <AvatarImage src={src ?? undefined} alt={name ?? "Sandworm User"} />
      <AvatarFallback className="relative overflow-hidden">
        <Image
          src="/img/avatar/avatar6.svg"
          alt=""
          fill
          className="object-cover"
        />
        <span className="relative z-10 font-bold font-body text-white text-xl">
          {name?.split(" ")[0]?.[0] ?? "U"}
        </span>
      </AvatarFallback>
    </Avatar>
  );
};

// =====================================
// ⬢ Dropdown Content
// =====================================

const DropdownBody = ({
  user,
  workspaceId,
  shareProfile,
  copied,
  onToggleFeedback,
  signout,
}: {
  user: any;
  workspaceId: string;
  shareProfile: () => void;
  copied: boolean;
  onToggleFeedback: () => void;
  signout: () => void;
}) => (
  <>
    <div
      className="flex items-center justify-between px-2 py-2 mb-1
      border-b border-border-secondary dark:border-border-tertiary"
    >
      <div className="flex items-center gap-3">
        <UserAvatar src={user.avater} name={user.firstName} size="sm" />
        <span className="font-medium text-sm text-ink-100">
          {user.firstName ?? "Sandworm User"} {user.lastName}
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={shareProfile}
        className="bg-[#E2ECFF] dark:bg-[#A308F020] dark:text-primary
          text-accent hover:bg-[#E2ECFF]/90 text-xs rounded-md
          font-semibold h-[22px] gap-1 font-tertiary"
      >
        {copied ? "Copied!" : "Share"}
      </Button>
    </div>

    <NavItem icon={<BookIcon size={18} />} label="Docs" href="#" external />
    <NavItem icon={<QuestionIcon size={18} />} label="Get Help" href="#" />
    <NavItem
      icon={<ThumbsUpIcon size={18} />}
      label="Give Feedback"
      onClick={onToggleFeedback}
    />
    <NavItem
      icon={<GearIcon size={18} />}
      label="Settings"
      href={`/workspace/${workspaceId}/settings`}
    />

    <DropdownMenuSeparator className="my-1 dark:bg-[#262A30]" />

    <button
      type="button"
      onClick={signout}
      className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg
        text-sm font-medium font-body
        text-white bg-[#ff0000]
        transition-colors"
    >
      <PiSignOut size={18} />
      Sign Out
    </button>
  </>
);

// =====================================
// ⬢ AccountDropdown
// =====================================

interface AccountDropdownProps {
  onToggleFeedback: () => void;
  collapsed?: boolean;
}

export const AccountDropdown = ({
  onToggleFeedback,
  collapsed = false,
}: AccountDropdownProps) => {
  const session = useSession({ redirectToLogin: true });
  const openSignIn = useModalStore(state => state.openSignIn);
  const signout = useSignout();
  const workspaceId = useStringQuery("workspace");
  const user = session?.user;

  const { shareProfile, copied } = useShareProfile(user?.firstName ?? "user");

  if (!user) {
    if (collapsed) return null;
    return (
      <div className="w-[95%] mx-auto mb-5 flex justify-center">
        <Button
          onClick={() => openSignIn()}
          className="px-5 h-11 border border-border-secondary dark:border-border-tertiary
            bg-base-100 text-ink-100 font-semibold inline-block w-full"
        >
          Sign up Today!
        </Button>
      </div>
    );
  }

  const dropdownBody = (
    <DropdownBody
      user={user}
      workspaceId={workspaceId}
      shareProfile={shareProfile}
      copied={copied}
      onToggleFeedback={onToggleFeedback}
      signout={signout}
    />
  );

  if (collapsed) {
    return (
      <DropdownMenu>
        <TooltipV2<HTMLButtonElement>
          title={user.firstName ?? "Account"}
          active
          position="right"
        >
          {ref => (
            <DropdownMenuTrigger asChild>
              <button
                ref={ref}
                type="button"
                aria-label="Account menu"
                className="flex items-center justify-center rounded-md p-1
                  hover:bg-[#E8E8E6] dark:hover:bg-[#2A2A28] transition-all duration-100"
              >
                <UserAvatar src={user.avater} name={user.firstName} size="sm" />
              </button>
            </DropdownMenuTrigger>
          )}
        </TooltipV2>
        <DropdownMenuContent
          className="w-64 rounded-2xl border border-border-tertiary dark:border-border-tertiary
            dark:bg-base-400 shadow-md p-2 ml-2"
          align="start"
          side="right"
        >
          {dropdownBody}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="w-full mx-auto mb-1 font-body">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="px-2 flex items-center gap-3 h-12 w-full justify-between hover:bg-[#E8E8E6] dark:hover:bg-[#2A2A28] transition-all duration-100"
          >
            <div className="flex items-center gap-3">
              <UserAvatar src={user.avater} name={user.firstName} />
              <div className="flex flex-col items-start text-left">
                <span className="text-[0.9rem]">
                  {user.firstName ?? "Sandworm User"}
                </span>
                <span className="text-[0.75rem] font-medium text-ink-300">
                  Free Plan
                </span>
              </div>
            </div>
            <PiDotsThreeVertical size={16} className="text-ink-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 rounded-2xl border border-border-tertiary dark:border-border-tertiary
            dark:bg-base-400 shadow-md border p-2 ml-6"
          align="start"
        >
          {dropdownBody}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
