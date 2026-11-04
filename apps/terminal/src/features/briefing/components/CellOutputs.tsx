"use client";

import type { Output } from "@sandworm/types";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/Skeleton";
import { env } from "@/config/env";

// A notebook cell's saved outputs, drawn by the main app exactly as its public
// notebook page draws them (apps/web/src/app/embed/cell-outputs). The outputs
// are posted to the frame, which never loads anything about the briefing.

const WEB_ORIGIN = new URL(env.webAppUrl).origin;

type CellOutputsProps = {
  outputs: readonly Output[];
  title: string;
};

export function CellOutputs({ outputs, title }: CellOutputsProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const theme = useTheme().resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current?.contentWindow;
      if (!frame || event.origin !== WEB_ORIGIN || event.source !== frame) {
        return;
      }
      if (event.data?.type === "sandworm-cell-ready") {
        frame.postMessage(
          { type: "sandworm-cell-outputs", outputs },
          WEB_ORIGIN
        );
      } else if (
        event.data?.type === "sandworm-cell-height" &&
        typeof event.data.height === "number"
      ) {
        setHeight(event.data.height);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [outputs]);

  // A new theme reloads the frame, which reports its height again.
  useEffect(() => setHeight(null), [theme]);

  return (
    <div className="relative">
      {height === null && <Skeleton className="h-[280px] w-full" />}
      <iframe
        ref={frameRef}
        key={theme}
        title={title}
        src={`${env.webAppUrl}/embed/cell-outputs/${theme}`}
        className="block w-full border-0"
        style={
          height === null
            ? { position: "absolute", inset: 0, visibility: "hidden" }
            : { height }
        }
      />
    </div>
  );
}
