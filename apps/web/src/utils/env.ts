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

export const TERMS_URL = () => `${NEXT_PUBLIC_LANDING_URL()}/terms`;
export const PRIVACY_URL = () => `${NEXT_PUBLIC_LANDING_URL()}/privacy`;

export const NEXT_PUBLIC_GATEWAY_IP = () =>
  process.env.NEXT_PUBLIC_GATEWAY_IP || "";

export const GOOGLE_CLIENT_ID = () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const GITHUB_CLIENT_ID = () => process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

export const REDIRECT_URI = () => process.env.NEXT_PUBLIC_REDIRECT_URI;
