"use client";

import { PiCalendarBlank, PiCaretRight } from "react-icons/pi";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@sandworm/ui/components/dialog";
import { buttonClassName } from "@sandworm/ui/kit/button";
import { MODAL_CLASSNAME } from "@sandworm/ui/kit/modal";
import { UserAvatar } from "@sandworm/ui/kit/user-avatar";
import clsx from "clsx";

import { AppLink } from "@/components/AppLink";
import type { Analyst } from "@/features/session/types";

import type { WelcomeData, WelcomeLead } from "./types";

const countToneClassNames = {
  brand:
    "bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200",
  navy: "bg-info-tint text-ink-navy dark:bg-base-600",
} as const;

function LeadTile({ lead }: { lead: WelcomeLead }) {
  switch (lead._tag) {
    case "count":
      return (
        <span
          aria-hidden="true"
          className={clsx(
            "flex size-9 items-center justify-center rounded-[10px] text-[15px] font-medium",
            countToneClassNames[lead.tone]
          )}
        >
          {lead.value}
        </span>
      );
    case "calendar":
      return (
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-[10px] bg-sidebar-hover text-ink-navy"
        >
          <PiCalendarBlank size={16} />
        </span>
      );
    default:
      return null;
  }
}

type WelcomeDialogProps = {
  welcome: WelcomeData;
  viewer: { clientName: string; firstName: string; analyst: Analyst };
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCustomize: () => void;
};

export function WelcomeDialog({
  welcome,
  viewer,
  isOpen,
  onOpenChange,
  onCustomize,
}: WelcomeDialogProps) {
  const { analyst } = viewer;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={clsx(MODAL_CLASSNAME, "rounded-3xl sm:max-w-[560px]")}
      >
        <div className="flex flex-col gap-4 px-8 pt-7">
          <span className="flex items-center gap-2.5">
            <UserAvatar name={analyst.name} size="md" />
            <span className="flex flex-col leading-snug">
              <span className="font-medium text-ink-100">
                {analyst.fullName}
              </span>
              <span className="text-xs text-ink-400">
                Your analyst at Sandworm
              </span>
            </span>
          </span>
          <DialogTitle className="text-[26px] font-medium leading-tight text-ink-100">
            Welcome to your Terminal, {viewer.firstName}
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-[1.55] text-ink-500">
            We&apos;ve set everything up for {viewer.clientName}. Your numbers
            are in, and there&apos;s already research waiting for you.
          </DialogDescription>
        </div>
        <div className="flex flex-col gap-2 px-8 pb-1 pt-5">
          {welcome.items.map(item => (
            <AppLink
              key={item.id}
              route={item.route}
              className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[14px] border border-hover-border bg-block-surface px-3.5 py-3 transition-colors hover:bg-hover-bg dark:hover:bg-sidebar-hover"
            >
              <LeadTile lead={item.lead} />
              <span className="flex flex-col">
                <span className="font-medium text-ink-100">{item.title}</span>
                <span className="text-xs text-ink-400">{item.detail}</span>
              </span>
              <PiCaretRight
                size={12}
                aria-hidden="true"
                className="text-ink-400"
              />
            </AppLink>
          ))}
        </div>
        <p className="mx-8 mt-3 text-xs text-ink-400">
          {welcome.trackingSummary}
        </p>
        <div className="mt-[22px] flex items-center justify-between gap-3 border-t border-border-secondary px-8 py-4">
          <button
            type="button"
            onClick={onCustomize}
            className={buttonClassName({
              variant: "link",
              className: "text-[13px] font-medium",
            })}
          >
            See what&apos;s on your Overview
          </button>
          <DialogClose className={buttonClassName({ className: "h-[38px]" })}>
            Open my Terminal
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
