import { ClientStatusId } from "@sandworm/types/terminal";

import { shortDay, upcomingWhen } from "@/lib/dates";
import type { TeamClientDetail, TeamClientSource } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
// A notebook nobody schedules goes stale; a week is when it starts to matter
const STALE_AFTER_DAYS = 7;
// A client that has not opened its briefing in this long needs a nudge
const UNREAD_AFTER_DAYS = 14;

const daysSince = (iso: string, now: Date) =>
  Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);

// When a notebook runs next, in the terminal's own words
export function describeSchedule(
  schedule: TeamClientSource["schedule"],
  now = new Date()
): string {
  if (!schedule) return "Not scheduled";
  if (!schedule.isActive) return "Paused";
  if (!schedule.nextRunAt) return "Scheduled";

  const when = upcomingWhen(schedule.nextRunAt, now);
  // "Runs today at 06:00", "Runs Thu 12 Nov at 06:00"
  return `Runs ${/^(Today|Tomorrow)/.test(when) ? when.toLowerCase() : when}`;
}

// When it last ran, or that it never has
export function describeLastRun(
  source: TeamClientSource,
  now = new Date()
): string {
  return source.lastRanAt ? shortDay(source.lastRanAt, now) : "Never";
}

export type Attention = { id: string; text: string };

// What the team should look at first for a client: a setup that stalled, a
// client that is not reading, a notebook that has gone stale.
export function attentionFor(
  client: TeamClientDetail,
  now = new Date()
): Attention[] {
  const items: Attention[] = [];

  if (client.status === ClientStatusId.SETTING_UP) {
    items.push({ id: "setup", text: "Setup is not finished." });
  }
  if (client.status === ClientStatusId.INVITE_SENT) {
    items.push({
      id: "invite",
      text: `Waiting for ${client.adminEmail ?? "the admin"} to sign in.`,
    });
  }

  if (client.status === ClientStatusId.LIVE && client.members > 0) {
    if (!client.lastReadAt) {
      items.push({ id: "unread", text: "Nobody has opened the briefing yet." });
    } else if (daysSince(client.lastReadAt, now) >= UNREAD_AFTER_DAYS) {
      items.push({
        id: "unread",
        text: `Nobody has opened the briefing in ${daysSince(client.lastReadAt, now)} days.`,
      });
    }
  }

  const staleSources = client.sources
    .filter(source => !source.schedule?.isActive)
    .flatMap((source): Attention[] => {
      if (!source.lastRanAt) {
        return [
          {
            id: `stale-${source.documentId}`,
            text: `${source.title} has never been run and is not scheduled.`,
          },
        ];
      }
      const days = daysSince(source.lastRanAt, now);
      return days >= STALE_AFTER_DAYS
        ? [
            {
              id: `stale-${source.documentId}`,
              text: `${source.title} has not run in ${days} days and is not scheduled.`,
            },
          ]
        : [];
    });

  return [...items, ...staleSources];
}
