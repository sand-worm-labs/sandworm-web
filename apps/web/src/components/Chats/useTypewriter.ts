import { useEffect, useRef, useState } from "react";

// Reveals `text` a few characters at a time at a fixed rate, independent of
// how large the underlying network chunks are, so LLM-generated text reads
// like it's being typed rather than snapping in block by block.
export function useTypewriter(
  text: string,
  isStreaming: boolean,
  charsPerSecond = 55
): string {
  const everStreamedRef = useRef(isStreaming);
  if (isStreaming) everStreamedRef.current = true;

  const [displayed, setDisplayed] = useState(() =>
    everStreamedRef.current ? "" : text
  );
  const shownRef = useRef(displayed);
  const targetRef = useRef(text);
  const streamingRef = useRef(isStreaming);
  targetRef.current = text;
  streamingRef.current = isStreaming;

  useEffect(() => {
    if (!everStreamedRef.current) {
      shownRef.current = text;
      setDisplayed(text);
    }
  }, [text]);

  useEffect(() => {
    if (!everStreamedRef.current) return undefined;

    let rafId: number;
    let last = performance.now();
    let acc = 0;

    const step = (now: number) => {
      const dt = now - last;
      last = now;
      const target = targetRef.current;
      const shown = shownRef.current;

      if (shown.length >= target.length && !streamingRef.current) return;

      acc += (dt / 1000) * charsPerSecond;
      const n = Math.floor(acc);
      if (n > 0 && shown.length < target.length) {
        acc -= n;
        const next = target.slice(0, Math.min(target.length, shown.length + n));
        shownRef.current = next;
        setDisplayed(next);
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return displayed;
}
