import type { DependencyList, SetStateAction, Dispatch } from "react";
import { useState, useEffect, useRef, useMemo } from "react";

// =====================================
// ⬢ Use Resettable State
// =====================================
export default function useResettableState<T>(
  initialValue: () => T,
  deps: DependencyList
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const valueRef = useRef<() => T>(initialValue);

  useEffect(() => {
    valueRef.current = initialValue;
  }, [initialValue]);

  useEffect(() => {
    setStoredValue(valueRef.current());
  }, deps);

  return useMemo(
    () => [storedValue, setStoredValue],
    [storedValue, setStoredValue]
  );
}
