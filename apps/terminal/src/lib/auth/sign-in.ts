import { env } from "@/config/env";

// Sign-in lives on the main app, which sends people back to `returnTo` (a
// path on the terminal) once they are in.
export function signInUrl(returnTo: string): string {
  const callback = new URL(returnTo, env.terminalUrl).toString();
  return `${env.webAppUrl}/signin?callback=${encodeURIComponent(callback)}`;
}
