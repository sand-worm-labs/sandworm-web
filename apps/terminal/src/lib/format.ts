export function pluralise(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}
