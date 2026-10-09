// Pure helpers for UTM parameters: reading them off a URL and putting them
// on a link. Storing them between pages is the job of hooks/useUtm.
import type { UtmParams } from "@/types";

// =====================================
// ⬢  Constants
// =====================================
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
];

// What a link shared from a Showcase page carries when nothing else is set.
export const SHARE_UTM: UtmParams = {
  utm_source: "sandworm",
  utm_medium: "share",
  utm_campaign: "showcase",
};

// =====================================
// ⬢  Helpers
// =====================================
export function readUtm(search: string): UtmParams {
  const params = new URLSearchParams(search);
  const utm: UtmParams = {};
  UTM_KEYS.forEach(key => {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 200);
  });
  return utm;
}

export function withUtm(url: string, utm: UtmParams = SHARE_UTM): string {
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);
  Object.entries(utm).forEach(([key, value]) => params.set(key, value));
  const next = params.toString();
  return next ? `${path}?${next}` : (path ?? url);
}
