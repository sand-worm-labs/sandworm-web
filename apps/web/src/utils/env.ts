// The page's origin in the browser; "" on the server (prerender), which has none.
const currentUrl = () => globalThis.location?.origin ?? "";

export const NEXT_PUBLIC_API_URL = () =>
  process.env.NEXT_PUBLIC_API_URL || `${currentUrl()}/api`;

export const NEXT_PUBLIC_API_WS_URL = () =>
  process.env.NEXT_PUBLIC_API_WS_URL || currentUrl();

export const NEXT_PUBLIC_PUBLIC_URL = () =>
  process.env.NEXT_PUBLIC_PUBLIC_URL || currentUrl();

export const NEXT_PUBLIC_LANDING_URL = () =>
  process.env.NEXT_PUBLIC_LANDING_URL || currentUrl();

// Where to go after sign-in: a path on this app, or a page on our domain or any
// of its subdomains, the sub-apps that share the login cookie (app.x.xyz allows
// x.xyz and *.x.xyz). Anything else would be an open redirect, so it falls back.
export const safeCallback = (
  raw: string | null | undefined,
  fallback = "/workspace"
) => {
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const { protocol, hostname } = new URL(raw);
    const domain = window.location.hostname.split(".").slice(1).join(".");
    const ours = hostname === domain || hostname.endsWith(`.${domain}`);
    return domain && ours && protocol === window.location.protocol
      ? raw
      : fallback;
  } catch {
    return fallback;
  }
};

export const TERMS_URL = () => `${NEXT_PUBLIC_LANDING_URL()}/terms`;
export const PRIVACY_URL = () => `${NEXT_PUBLIC_LANDING_URL()}/privacy`;

export const NEXT_PUBLIC_GATEWAY_IP = () =>
  process.env.NEXT_PUBLIC_GATEWAY_IP || "";

export const GOOGLE_CLIENT_ID = () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const GITHUB_CLIENT_ID = () => process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

export const REDIRECT_URI = () => process.env.NEXT_PUBLIC_REDIRECT_URI;

export const DYNAMIC_ENVIRONMENT_ID = () =>
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;
