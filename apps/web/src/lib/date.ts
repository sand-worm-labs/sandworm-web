import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInYears,
} from "date-fns";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";

export const getDateCompare = (after: Date) => {
  const currDate = new Date();
  const compareInMinutes = differenceInMinutes(currDate, after);
  if (compareInMinutes < 1) {
    return `${differenceInSeconds(currDate, after)} seconds ago`;
  }
  if (compareInMinutes < 60) {
    return `${compareInMinutes} minutes ago`;
  }
  if (compareInMinutes < 60 * 24) {
    return `${differenceInHours(currDate, after)} hour(s) ago`;
  }
  if (compareInMinutes < 60 * 30 * 24) {
    return `${differenceInDays(currDate, after)} day(s) ago`;
  }
  if (compareInMinutes < 60 * 30 * 24 * 12) {
    return `${differenceInMonths(currDate, after)} month(s) ago`;
  }
  return `${differenceInYears(currDate, after)} year(s) ago`;
};

dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

/**
 * Returns how long ago something happened, like '3 hours ago' or '2 months ago'
 * @param date ISO string or Date
 */
export const timeAgo = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

export const formatFullDate = (date: string | Date): string =>
  dayjs(date).format("MMMM Do, YYYY, h:mm A");

const RELATIVE_THRESHOLD_DAYS = 30;

export const formatDate = (date: string | Date): string => {
  const d = dayjs(date);
  const diffDays = dayjs().diff(d, "day");

  if (diffDays < RELATIVE_THRESHOLD_DAYS) {
    return d.fromNow();
  }

  return d.format("MMM D, YYYY");
};

/**
 * Coarse age for invites/requests: "Today", "N day(s) ago", or "N month(s)
 * ago" — deliberately no hour-level granularity (unlike formatDate/timeAgo).
 */
export const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

  if (diffInMonths >= 1) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays >= 1) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return "Today";
};

/**
 * Compact "5m ago"/"2h ago"/"3d ago" style relative time for space-tight
 * UIs (e.g. chat timestamps) — deliberately abbreviated, unlike
 * formatDate/timeAgo's verbose dayjs phrasing.
 */
export const getRelativeTime = (dateInput: Date | string): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
