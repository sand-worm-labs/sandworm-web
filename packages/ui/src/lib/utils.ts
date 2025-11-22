import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRef } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hook to generate stable keys for arrays of objects that don't have an ID.
 * Returns a function that gives a stable key per object.
 */
export function useStableKeys<T extends object>() {
  const keyMap = useRef<WeakMap<T, string>>(new WeakMap());

  const getKey = (item: T) => {
    if (!keyMap.current.has(item)) {
      keyMap.current.set(item, crypto.randomUUID());
    }
    return keyMap.current.get(item)!;
  };

  return getKey;
}
