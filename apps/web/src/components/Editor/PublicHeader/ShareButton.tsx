"use client";

import { useCallback, useEffect, useState } from "react";
import { PiShareNetwork } from "react-icons/pi";
import { toast } from "sonner";

import { TooltipV2 } from "../blocks/ToolTips";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return () => {};
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const onShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }, []);

  return (
    <TooltipV2<HTMLButtonElement>
      title={copied ? "Copied!" : "Copy link"}
      active
      position="bottom"
    >
      {ref => (
        <button
          ref={ref}
          type="button"
          onClick={onShare}
          aria-label="Copy link to this notebook"
          className="flex items-center justify-center h-8 w-8 rounded-lg text-ink-400 hover:text-ink-100 dark:hover:text-white hover:bg-hover-bg dark:hover:bg-base-600 transition-colors"
        >
          <PiShareNetwork size={18} />
        </button>
      )}
    </TooltipV2>
  );
}
