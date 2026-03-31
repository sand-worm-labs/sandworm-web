import type { DependencyList } from "react";
import { useCallback, useRef, useEffect } from "react";

function debounce(func: (...args: any[]) => any, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export const useDebounce = (
  callback: (...args: any[]) => any,
  delay: number,
  deps?: DependencyList
) => {
  const functionRef = useRef<(...args: any[]) => any>(callback);
  const debounceRef = useRef<(...args: any[]) => void>();

  // Update callback in ref on change
  useEffect(() => {
    functionRef.current = callback;
  }, [callback]);

  useEffect(() => {
    debounceRef.current = debounce(
      (...args: any) => functionRef.current(...args),
      delay
    );
  }, [delay]);

  return useCallback(
    (...args: any[]) => {
      debounceRef.current!(...args);
    },
    deps ? [...deps] : []
  );
};
