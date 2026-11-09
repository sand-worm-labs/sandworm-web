// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useInView } from "@sandworm/ui/hooks/use-in-view";

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let callback: Callback | undefined;
let disconnect = vi.fn();

class FakeObserver {
  constructor(cb: Callback) {
    callback = cb;
  }

  observe = vi.fn();

  disconnect = disconnect;
}

afterEach(() => {
  vi.unstubAllGlobals();
  callback = undefined;
  disconnect = vi.fn();
});

const ref = () => ({ current: document.createElement("div") });

describe("useInView", () => {
  it("is false until the element comes near the viewport, then stays true", () => {
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    const { result } = renderHook(() => useInView(ref()));
    expect(result.current).toBe(false);

    act(() => callback?.([{ isIntersecting: false }]));
    expect(result.current).toBe(false);

    act(() => callback?.([{ isIntersecting: true }]));
    expect(result.current).toBe(true);

    act(() => callback?.([{ isIntersecting: false }]));
    expect(result.current).toBe(true);
  });

  it("is true at once where IntersectionObserver does not exist", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { result } = renderHook(() => useInView(ref()));
    expect(result.current).toBe(true);
  });
});
