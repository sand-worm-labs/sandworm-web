function getFromWindow(key: string, or?: string): string {
  try {
    // @ts-ignore
    return window.env[key];
  } catch (e) {
    if (or !== undefined) {
      return or;
    }

    throw e;
  }
}

function currentUrl() {
  return `${window.location.protocol}//${window.location.host}`;
}

export const NEXT_PUBLIC_API_URL = () =>
  process.env.NEXT_PUBLIC_API_URL ||
  getFromWindow("NEXT_PUBLIC_API_URL") ||
  `${currentUrl()}/api`;

export const NEXT_PUBLIC_API_WS_URL = () =>
  process.env.NEXT_PUBLIC_API_WS_URL ||
  getFromWindow("NEXT_PUBLIC_API_WS_URL") ||
  `${currentUrl()}`;

export const NEXT_PUBLIC_PUBLIC_URL = () =>
  process.env.NEXT_PUBLIC_PUBLIC_URL ||
  getFromWindow("NEXT_PUBLIC_PUBLIC_URL") ||
  currentUrl();

export const NEXT_PUBLIC_GATEWAY_IP = () =>
  process.env.NEXT_PUBLIC_GATEWAY_IP ||
  getFromWindow("NEXT_PUBLIC_GATEWAY_IP", "");

export const GOOGLE_CLIENT_ID = () =>
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  getFromWindow(
    "GOOGLE_CLIENT_ID",
    "826443297313-bh9mp34f408b3urpili8knr4pap819hh.apps.googleusercontent.com"
  );

export const GITHUB_CLIENT_ID = () =>
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ||
  getFromWindow("GITHUB_CLIENT_ID", "Ov23lisbzsoM7RX7aRDV");

export const REDIRECT_URI = () =>
  process.env.NEXT_PUBLIC_REDIRECT_URI ||
  getFromWindow("REDIRECT_URI", "http://localhost:8081/auth/callback/github");
