// What a section tab shows beside its name: the count, or nothing when there
// is nothing to count (a briefing with everything read is just "Briefing").
export function tabCount(count: string | undefined): string | undefined {
  return count && Number(count) !== 0 ? count : undefined;
}
