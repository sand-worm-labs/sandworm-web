import { useEffect, useState } from "react";

// =====================================
// ⬢ Types
// =====================================
export interface MousePosition {
  x?: number;
  y?: number;
}

// =====================================
// ⬢ Utils
// =====================================
const calcPosition = (value: number, total: number) => value - total / 2;

const throttle = <T, F extends (...args: any[]) => any>(
  func: (this: T, ...args: Parameters<F>) => ReturnType<F>,
  limit: number
): ((this: T, ...args: Parameters<F>) => void) => {
  let inThrottle: boolean;

  return function throttled(this: T, ...args: Parameters<F>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// =====================================
// ⬢ use Mouse Position
// =====================================
/**
 * Custom hook to track the position of the cursor or touch input.
 */
export const useMousePosition = (): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: undefined,
    y: undefined,
  });

  useEffect(() => {
    const { innerHeight, innerWidth } = window;

    const updateMousePosition = throttle((event: MouseEvent | TouchEvent) => {
      let x: number;
      let y: number;

      if ("touches" in event) {
        const touch = (event as TouchEvent).touches[0];
        if (!touch) return;
        x = calcPosition(touch.clientX, innerWidth);
        y = calcPosition(touch.clientY, innerHeight);
      } else {
        x = calcPosition(event.clientX, innerWidth);
        y = calcPosition(event.clientY, innerHeight);
      }

      setMousePosition({ x, y });
    }, 120);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("touchmove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("touchmove", updateMousePosition);
    };
  }, []);

  return mousePosition;
};
