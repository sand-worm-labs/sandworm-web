export function toggleId(
  ids: readonly string[],
  id: string
): readonly string[] {
  return ids.includes(id)
    ? ids.filter(current => current !== id)
    : [...ids, id];
}
