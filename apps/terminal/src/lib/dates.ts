import { differenceInCalendarDays, format } from "date-fns";

// How the terminal writes dates: relative to today, short, in the server's
// time zone. "Today", "Yesterday", "Mon" within the week, then "27 Oct".

const daysAgo = (iso: string, now: Date) =>
  differenceInCalendarDays(now, new Date(iso));
const at = (iso: string, pattern: string) => format(new Date(iso), pattern);

// "Today", "Yesterday", "Mon", "27 Oct"
export function shortDay(iso: string, now = new Date()): string {
  const ago = daysAgo(iso, now);
  if (ago <= 0) return "Today";
  if (ago === 1) return "Yesterday";
  return at(iso, ago < 7 ? "EEE" : "d MMM");
}

// "06:02", "Mon 14:10", "Thu", "27 Oct": a list's time column
export function listTime(iso: string, now = new Date()): string {
  const ago = daysAgo(iso, now);
  if (ago <= 0) return at(iso, "HH:mm");
  return ago < 3 ? at(iso, "EEE HH:mm") : shortDay(iso, now);
}

// "Today at 06:02", "Mon 2 Nov at 06:00"
export function fullWhen(iso: string, now = new Date()): string {
  return at(
    iso,
    daysAgo(iso, now) <= 0 ? "'Today at' HH:mm" : "EEE d MMM 'at' HH:mm"
  );
}

// "Today at 06:00", "Tomorrow at 06:00", "Mon 9 Nov at 06:00": a time to come
export function upcomingWhen(iso: string, now = new Date()): string {
  const ahead = -daysAgo(iso, now);
  const day = ahead <= 0 ? "'Today'" : ahead === 1 ? "'Tomorrow'" : "EEE d MMM";
  return at(iso, `${day} 'at' HH:mm`);
}

// "Tue 28 Oct", "Fri 20 Nov"
export const longDay = (iso: string) => at(iso, "EEE d MMM");

// "Today", "Yesterday", "Earlier this week", "Last week", "Earlier": a feed's group headings
export function feedGroup(iso: string, now = new Date()): string {
  const ago = daysAgo(iso, now);
  if (ago <= 0) return "Today";
  if (ago === 1) return "Yesterday";
  if (ago < 7) return "Earlier this week";
  return ago < 14 ? "Last week" : "Earlier";
}
