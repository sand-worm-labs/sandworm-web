// How the terminal writes dates: relative to today, short, in the server's
// time zone. "Today", "Yesterday", "Mon" within the week, then "27 Oct".

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

function daysAgo(date: Date, now: Date): number {
  return Math.round((startOfDay(now) - startOfDay(date)) / DAY);
}

const weekday = (date: Date) =>
  date.toLocaleDateString("en-GB", { weekday: "short" });
const dayMonth = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const fullDay = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export function clockTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "Today", "Yesterday", "Mon", "27 Oct"
export function shortDay(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const ago = daysAgo(date, now);
  if (ago <= 0) return "Today";
  if (ago === 1) return "Yesterday";
  if (ago < 7) return weekday(date);
  return dayMonth(date);
}

// "06:02", "Mon 14:10", "Thu", "27 Oct": a list's time column
export function listTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const ago = daysAgo(date, now);
  if (ago <= 0) return clockTime(date);
  if (ago < 3) return `${weekday(date)} ${clockTime(date)}`;
  if (ago < 7) return weekday(date);
  return dayMonth(date);
}

// "Today at 06:02", "Mon 2 Nov at 06:00"
export function fullWhen(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const day = daysAgo(date, now) <= 0 ? "Today" : fullDay(date);
  return `${day} at ${clockTime(date)}`;
}

// "Today at 06:00", "Tomorrow at 06:00", "Mon 9 Nov at 06:00": a time to come
export function upcomingWhen(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const ahead = -daysAgo(date, now);
  if (ahead <= 0) return `Today at ${clockTime(date)}`;
  if (ahead === 1) return `Tomorrow at ${clockTime(date)}`;
  return `${fullDay(date)} at ${clockTime(date)}`;
}

// "Tue 28 Oct", "Fri 20 Nov"
export function longDay(iso: string): string {
  return fullDay(new Date(iso));
}

// "Today", "Yesterday", "Last week", "Earlier": a feed's group headings
export function feedGroup(iso: string, now = new Date()): string {
  const ago = daysAgo(new Date(iso), now);
  if (ago <= 0) return "Today";
  if (ago === 1) return "Yesterday";
  if (ago < 8) return "Last week";
  return "Earlier";
}
