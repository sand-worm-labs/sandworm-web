import { set, subDays } from "date-fns";

// A fixture's moment: `days` back from now at "HH:MM", so "Today" stays today
export function ago(days: number, time = "09:00"): string {
  const [hours, minutes] = time.split(":").map(Number);
  return set(subDays(new Date(), days), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  }).toISOString();
}
