import { PiX } from "react-icons/pi";
import { DialogClose } from "@sandworm/ui/components/dialog";

import { AppLink } from "@/components/AppLink";

export function CommissionTabs() {
  return (
    <div className="flex items-center justify-between gap-3 px-6 pt-[18px]">
      <div className="flex gap-0.5 rounded-[10px] bg-hover-bg p-[3px]">
        <AppLink
          route="bookCall"
          className="inline-flex h-7 items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-medium text-ink-400"
        >
          Ask an analyst
        </AppLink>
        <span
          aria-current="page"
          className="inline-flex h-7 items-center whitespace-nowrap rounded-lg bg-block-surface px-3 text-[13px] font-medium text-ink-100 shadow-sm"
        >
          Commission research
        </span>
      </div>
      <DialogClose
        aria-label="Close"
        className="flex size-[30px] items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-hover-bg"
      >
        <PiX size={14} aria-hidden="true" />
      </DialogClose>
    </div>
  );
}
