import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ExternalLinkProvider } from "@/components/ExternalLink/ExternalLinkProvider";
import { OPEN_LINK_MESSAGE } from "@/lib/externalLink";

const renderPage = (inner: ReactNode) =>
  render(<ExternalLinkProvider>{inner}</ExternalLinkProvider>);

describe("ExternalLinkProvider", () => {
  let open: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    open = vi.fn();
    vi.stubGlobal("open", open);
    window.open = open as unknown as typeof window.open;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks before a link in a read-only note leaves for another site", async () => {
    renderPage(
      <div className="ProseMirror" contentEditable={false}>
        <a href="https://pudgypenguins.com/path">Website</a>
      </div>
    );

    fireEvent.click(screen.getByText("Website"));

    expect(await screen.findByText("Leave Sandworm?")).toBeTruthy();
    expect(screen.getByTestId("external-link-url").textContent).toBe(
      "https://pudgypenguins.com/path"
    );
    expect(open).not.toHaveBeenCalled();
  });

  it("stays put when the reader goes back", async () => {
    renderPage(
      <div className="ProseMirror">
        <a href="https://pudgypenguins.com">Website</a>
      </div>
    );
    fireEvent.click(screen.getByText("Website"));
    fireEvent.click(await screen.findByText("Stay on Sandworm"));

    await waitFor(() =>
      expect(screen.queryByText("Leave Sandworm?")).toBeNull()
    );
    expect(open).not.toHaveBeenCalled();
  });

  it("opens the link in a tab that cannot reach back, only after the reader continues", async () => {
    renderPage(
      <div className="ProseMirror">
        <a href="https://pudgypenguins.com">Website</a>
      </div>
    );
    fireEvent.click(screen.getByText("Website"));
    fireEvent.click(await screen.findByText("Continue to pudgypenguins.com"));

    expect(open).toHaveBeenCalledWith(
      "https://pudgypenguins.com/",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("does not ask for our own pages or in-page anchors", () => {
    renderPage(
      <div className="ProseMirror">
        <a href="/some-local-path">Ours</a>
        <a href="#top">Anchor</a>
        <a href="https://docs.sandwormlab.xyz">Docs</a>
      </div>
    );
    ["Ours", "Anchor", "Docs"].forEach(name => {
      const notStopped = fireEvent.click(screen.getByText(name));
      expect(notStopped).toBe(true);
    });
    expect(screen.queryByText("Leave Sandworm?")).toBeNull();
  });

  it("does not touch links outside notebook content", () => {
    renderPage(<a href="https://pudgypenguins.com">Footer link</a>);
    expect(fireEvent.click(screen.getByText("Footer link"))).toBe(true);
    expect(screen.queryByText("Leave Sandworm?")).toBeNull();
  });

  it("lets a plain click place the cursor while writing, and asks on cmd-click", async () => {
    renderPage(
      <div
        className="ProseMirror"
        contentEditable
        suppressContentEditableWarning
      >
        <a href="https://pudgypenguins.com">Website</a>
      </div>
    );
    expect(fireEvent.click(screen.getByText("Website"))).toBe(true);
    expect(screen.queryByText("Leave Sandworm?")).toBeNull();

    fireEvent.click(screen.getByText("Website"), { metaKey: true });
    expect(await screen.findByText("Leave Sandworm?")).toBeTruthy();
  });

  it("warns about an address that hides where it goes", async () => {
    renderPage(
      <div className="ProseMirror">
        <a href="https://sandwormlab.xyz@evil.com/login">Sign in</a>
      </div>
    );
    fireEvent.click(screen.getByText("Sign in"));
    expect(await screen.findByText(/name and password in front/)).toBeTruthy();
    expect(screen.getByText("Continue to evil.com")).toBeTruthy();
  });

  it("asks when one of our output frames asks, and only then", async () => {
    const { container } = renderPage(
      <div>
        <iframe data-link-guard title="ours" />
        <iframe title="someone else's" />
      </div>
    );
    const [ours, other] = Array.from(container.querySelectorAll("iframe")) as [
      HTMLIFrameElement,
      HTMLIFrameElement,
    ];
    const send = (source: Window | null) =>
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: OPEN_LINK_MESSAGE, url: "https://pudgypenguins.com" },
          source,
        })
      );

    send(other.contentWindow);
    expect(screen.queryByText("Leave Sandworm?")).toBeNull();

    send(ours.contentWindow);
    expect(await screen.findByText("Leave Sandworm?")).toBeTruthy();
  });
});
