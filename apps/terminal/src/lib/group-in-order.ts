export type Group<T> = { key: string; items: T[] };

export function groupInOrder<T>(
  items: readonly T[],
  keyOf: (item: T) => string
): Group<T>[] {
  return items.reduce<Group<T>[]>((groups, item) => {
    const key = keyOf(item);
    const existing = groups.find(group => group.key === key);
    if (existing) existing.items.push(item);
    else groups.push({ key, items: [item] });
    return groups;
  }, []);
}
