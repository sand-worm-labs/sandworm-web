import clsx from "clsx";
import { ROW_HOVER_CLASSNAME } from "@sandworm/ui/kit/interactive";

import type { Signal } from "@/types";

import { EvidenceMeter } from "./EvidenceMeter";
import { SignalStatusIcon } from "./SignalStatusIcon";

type SignalRowProps = { item: Signal; onSelect: (item: Signal) => void };

export function SignalRow({ item, onSelect }: SignalRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={clsx(
        ROW_HOVER_CLASSNAME,
        "flex w-full flex-wrap text-left items-start gap-x-4 gap-y-2 px-3 py-3.5 md:grid md:grid-cols-[14px_minmax(0,1fr)_120px_140px_84px_60px]",
        item.status === "Not for us" && "opacity-75"
      )}
    >
      <SignalStatusIcon status={item.status} />
      <span className="flex min-w-0 basis-[calc(100%-30px)] flex-col gap-0.5 md:basis-auto">
        <span className="text-sm font-medium text-ink-100">{item.title}</span>
        <span className="text-[13px] text-ink-400">{item.observed}</span>
        {item.couldMean && (
          <span className="text-[13px] italic text-ink-500">
            Could mean: {item.couldMean}
          </span>
        )}
      </span>
      <span className="inline-flex h-[22px] items-center justify-self-start whitespace-nowrap rounded-md bg-hover-bg px-2 text-xs text-ink-400">
        {item.kind}
      </span>
      <span className="flex flex-col md:items-end">
        <span className="text-[15px] font-medium text-ink-100">
          {item.size}
        </span>
        <span className="text-xs text-ink-400">{item.sizeLabel}</span>
      </span>
      <EvidenceMeter evidence={item.evidence} />
      <span className="text-xs text-ink-400 md:text-right">{item.when}</span>
    </button>
  );
}
