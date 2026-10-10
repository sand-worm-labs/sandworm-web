import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  renderHook,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

import ApiKeyNudge, {
  ApiKeyNudges,
  KEY_PROVIDERS,
  keyNudgeDismissedKey,
  shouldShowKeyNudge,
  useKeyNudgeDismissed,
} from "@/components/Environment/ApiKeyNudge";

const nansen = KEY_PROVIDERS.find(p => p.id === "nansen")!;
const avacloud = KEY_PROVIDERS.find(p => p.id === "avacloud")!;

const base = {
  variables: [{ name: "ETHERSCAN_API_KEY" }],
  added: [],
  loading: false,
  isViewer: false,
  dismissed: false as boolean | null,
};

describe("KEY_PROVIDERS", () => {
  it("asks for the workspace's own Nansen and AvaCloud keys, and never for Etherscan, which Sandworm supplies", () => {
    expect(KEY_PROVIDERS.map(p => p.varName)).toEqual([
      "NANSEN_API_KEY",
      "AVACLOUD_API_KEY",
    ]);
  });
});

describe("shouldShowKeyNudge", () => {
  it("shows while the workspace has no key for that provider", () => {
    expect(shouldShowKeyNudge(nansen, base)).toBe(true);
    expect(shouldShowKeyNudge(avacloud, { ...base, variables: [] })).toBe(true);
  });

  it("asks about each provider on its own", () => {
    const withNansen = { ...base, variables: [{ name: nansen.varName }] };

    expect(shouldShowKeyNudge(nansen, withNansen)).toBe(false);
    expect(shouldShowKeyNudge(avacloud, withNansen)).toBe(true);
  });

  it("stops once the key is saved, or typed into a new row", () => {
    expect(
      shouldShowKeyNudge(nansen, { ...base, added: [{ name: nansen.varName }] })
    ).toBe(false);
  });

  it("stays quiet while loading (it could be there already), for a viewer, and once dismissed or not yet known", () => {
    expect(shouldShowKeyNudge(nansen, { ...base, loading: true })).toBe(false);
    expect(shouldShowKeyNudge(nansen, { ...base, isViewer: true })).toBe(false);
    expect(shouldShowKeyNudge(nansen, { ...base, dismissed: true })).toBe(
      false
    );
    expect(shouldShowKeyNudge(nansen, { ...base, dismissed: null })).toBe(
      false
    );
  });
});

describe("ApiKeyNudge", () => {
  it("says which key is missing and offers to add it, get one, or skip", () => {
    const onAddKey = vi.fn();
    const onDismiss = vi.fn();
    render(
      <ApiKeyNudge
        provider={nansen}
        onAddKey={onAddKey}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText("Nansen is waiting for its key")).toBeTruthy();
    expect(screen.getByText("NANSEN_API_KEY")).toBeTruthy();
    const link = screen.getByText("Get a key").closest("a");
    expect(link?.getAttribute("href")).toBe("https://app.nansen.ai");
    expect(link?.getAttribute("rel")).toContain("noopener");

    fireEvent.click(screen.getByText("Add Nansen key"));
    expect(onAddKey).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Not now"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("is honest that Avalanche data works without a key", () => {
    render(
      <ApiKeyNudge provider={avacloud} onAddKey={vi.fn()} onDismiss={vi.fn()} />
    );

    expect(screen.getByText("AvaCloud is waiting for its key")).toBeTruthy();
    expect(screen.getByText(/works without it/)).toBeTruthy();
  });
});

describe("ApiKeyNudges", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const props = {
    workspaceId: "w1",
    variables: [] as { name: string }[],
    added: [] as { name: string }[],
    loading: false,
    isViewer: false,
  };

  it("shows one per missing key, and reports which one was asked for", async () => {
    const onAddKey = vi.fn();
    render(<ApiKeyNudges {...props} onAddKey={onAddKey} />);

    expect(
      await screen.findByText("Nansen is waiting for its key")
    ).toBeTruthy();
    expect(screen.getByText("AvaCloud is waiting for its key")).toBeTruthy();

    fireEvent.click(screen.getByText("Add AvaCloud key"));
    expect(onAddKey).toHaveBeenCalledWith("AVACLOUD_API_KEY");
  });

  it("drops the one whose key is there and keeps the other", async () => {
    render(
      <ApiKeyNudges
        {...props}
        variables={[{ name: "NANSEN_API_KEY" }]}
        onAddKey={vi.fn()}
      />
    );

    expect(
      await screen.findByText("AvaCloud is waiting for its key")
    ).toBeTruthy();
    expect(screen.queryByText("Nansen is waiting for its key")).toBeNull();
  });

  it("'Not now' hides only that provider, and stays hidden for the workspace", async () => {
    const first = render(<ApiKeyNudges {...props} onAddKey={vi.fn()} />);
    await screen.findByText("Nansen is waiting for its key");

    const nansenCard = screen
      .getByText("Nansen is waiting for its key")
      .closest("section")!;
    fireEvent.click(
      Array.from(nansenCard.querySelectorAll("button")).find(
        b => b.textContent === "Not now"
      )!
    );

    expect(screen.queryByText("Nansen is waiting for its key")).toBeNull();
    expect(screen.getByText("AvaCloud is waiting for its key")).toBeTruthy();

    first.unmount();
    render(<ApiKeyNudges {...props} onAddKey={vi.fn()} />);
    await screen.findByText("AvaCloud is waiting for its key");
    expect(screen.queryByText("Nansen is waiting for its key")).toBeNull();
  });
});

describe("useKeyNudgeDismissed", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("is false for a new visitor, and remembers 'Not now' per workspace and provider", async () => {
    const first = renderHook(() => useKeyNudgeDismissed("w1", "nansen"));
    await waitFor(() => expect(first.result.current[0]).toBe(false));

    act(() => first.result.current[1]());

    expect(first.result.current[0]).toBe(true);
    expect(
      window.localStorage.getItem(keyNudgeDismissedKey("w1", "nansen"))
    ).toBe("true");

    const sameAgain = renderHook(() => useKeyNudgeDismissed("w1", "nansen"));
    await waitFor(() => expect(sameAgain.result.current[0]).toBe(true));
    const otherWorkspace = renderHook(() =>
      useKeyNudgeDismissed("w2", "nansen")
    );
    await waitFor(() => expect(otherWorkspace.result.current[0]).toBe(false));
    const otherProvider = renderHook(() =>
      useKeyNudgeDismissed("w1", "avacloud")
    );
    await waitFor(() => expect(otherProvider.result.current[0]).toBe(false));
  });

  it("still shows, and can be dismissed for the visit, when storage is blocked", async () => {
    const get = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const set = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    const { result } = renderHook(() => useKeyNudgeDismissed("w1", "nansen"));
    await waitFor(() => expect(result.current[0]).toBe(false));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    get.mockRestore();
    set.mockRestore();
  });
});
