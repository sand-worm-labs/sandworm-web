"use client";

import { useEffect, useState } from "react";

import { readUtm } from "@/lib/utm";
import type { UtmParams } from "@/types";

// =====================================
// ⬢  Constants
// =====================================
const STORAGE_KEY = "sandworm:utm";

// =====================================
// ⬢  Storage
// =====================================
function readStored(): UtmParams {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as UtmParams;
  } catch {
    return {};
  }
}

function store(utm: UtmParams): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // Private windows can refuse storage; the page works without it.
  }
}

// =====================================
// ⬢  useUtm
// =====================================
// Where this visitor came from. Read from the URL they landed on and kept for
// the rest of the visit, so an event three pages later still carries it.
export function useUtm(): UtmParams {
  const [utm, setUtm] = useState<UtmParams>({});

  useEffect(() => {
    const landed = readUtm(window.location.search);
    const known = Object.keys(landed).length > 0 ? landed : readStored();
    if (Object.keys(landed).length > 0) store(landed);
    setUtm(known);
  }, []);

  return utm;
}
