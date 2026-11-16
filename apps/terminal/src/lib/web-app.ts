import { env } from "@/config/env";

// A page of the web app, from a path the API sends (e.g. a report's notebook)
export function webAppUrl(path: string): string {
  return `${env.webAppUrl}${path}`;
}
