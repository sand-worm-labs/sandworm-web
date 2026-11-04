export const env = {
  webAppUrl: process.env.NEXT_PUBLIC_WEB_APP_URL ?? "http://localhost:8081",
  terminalUrl: process.env.NEXT_PUBLIC_TERMINAL_URL ?? "http://localhost:8082",
  // Server only: the API's own address, skipping the Caddy front door.
  internalApiUrl: process.env.INTERNAL_API_URL ?? "http://localhost:8003",
} as const;
