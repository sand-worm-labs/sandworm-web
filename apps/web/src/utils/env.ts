function currentUrl() {
  return `${window.location.protocol}//${window.location.host}`;
}

export const NEXT_PUBLIC_API_URL = () =>
  process.env.NEXT_PUBLIC_API_URL || `${currentUrl()}/api`;

export const NEXT_PUBLIC_API_WS_URL = () =>
  process.env.NEXT_PUBLIC_API_WS_URL || currentUrl();

export const NEXT_PUBLIC_PUBLIC_URL = () =>
  process.env.NEXT_PUBLIC_PUBLIC_URL || currentUrl();

export const NEXT_PUBLIC_GATEWAY_IP = () =>
  process.env.NEXT_PUBLIC_GATEWAY_IP || "";

export const GOOGLE_CLIENT_ID = () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const GITHUB_CLIENT_ID = () => process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

export const REDIRECT_URI = () => process.env.NEXT_PUBLIC_REDIRECT_URI;
