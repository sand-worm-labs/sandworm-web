"use client";

import { useCallback } from "react";

import type { ShowcaseEventName, UtmParams } from "@/types";

import { useUtm } from "./useUtm";

// =====================================
// ⬢  Types
// =====================================
type EventProps = Record<string, string | number | boolean | undefined>;

type Gtag = (command: "event", name: string, props: EventProps) => void;

// =====================================
// ⬢  useShowcaseTrack
// =====================================
// Fires a funnel event with the visitor's UTM values attached. Events go to
// the site's analytics (gtag, set up in app/layout.tsx).
export function useShowcaseTrack(): {
  track: (name: ShowcaseEventName, props?: EventProps) => void;
  utm: UtmParams;
} {
  const utm = useUtm();

  const track = useCallback(
    (name: ShowcaseEventName, props: EventProps = {}) => {
      const { gtag } = window as unknown as { gtag?: Gtag };
      gtag?.("event", name, { ...props, ...utm });
    },
    [utm]
  );

  return { track, utm };
}
