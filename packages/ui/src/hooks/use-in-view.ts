import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element has come within `margin` of the viewport, and it stays
 * true: something that has loaded is not unloaded when it scrolls away. Where
 * IntersectionObserver is missing it is true at once, so nothing waits forever.
 */
export function useInView(
  ref: RefObject<Element | null>,
  margin = "200px"
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (isInView || !element) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) setIsInView(true);
      },
      { rootMargin: margin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin, isInView]);

  return isInView;
}
