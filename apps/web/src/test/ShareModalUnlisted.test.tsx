import type * as HeadlessUI from "@headlessui/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ShareModal from "@/components/Editor/blocks/ShareModal";

// Headless UI's animation wrappers need a real layout to attach to (the dialog fails to open in jsdom even before
// these changes), so they are replaced by plain elements. The options and buttons are the real ones.
vi.mock("@headlessui/react", async importOriginal => {
  const actual = await importOriginal<typeof HeadlessUI>();
  const Plain = ({ children }: { children?: React.ReactNode }) => children;
  return {
    ...actual,
    Transition: ({
      show,
      children,
    }: {
      show?: boolean;
      children?: React.ReactNode;
    }) => (show ? children : null),
    TransitionChild: Plain,
    Dialog: ({ children }: { children?: React.ReactNode }) => (
      <div role="dialog">{children}</div>
    ),
    DialogPanel: ({ children }: { children?: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children?: React.ReactNode }) => (
      <h2>{children}</h2>
    ),
  };
});

// The tooltip wrapper positions itself against real layout, which jsdom does not have.
vi.mock("@/components/Editor/blocks/ToolTips", () => ({
  TooltipV2: ({
    children,
  }: {
    children: (ref: { current: null }) => unknown;
  }) => children({ current: null }),
}));

const SECRET =
  "https://app.sandwormlab.xyz/notebooks/my-notebook-AbCdEfGhIjKlMnOpQrStUv";

describe("ShareModal, unlisted link", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("offers an unlisted link, and says who can open each kind", async () => {
    render(<ShareModal isOpen onOpenChange={vi.fn()} />);
    expect(await screen.findByText("Unlisted link")).toBeTruthy();
    expect(
      screen.getByText(/Anyone with the link can view, no sign-in/)
    ).toBeTruthy();
    // Signed-in-only sharing sat next to this one and was easy to confuse with it, so it is no longer offered.
    expect(screen.queryByText("Signed-in users with link")).toBeNull();
  });

  it("still shows signed-in-only sharing for a notebook that is already shared that way", async () => {
    render(
      <ShareModal isOpen onOpenChange={vi.fn()} initialVisibility="LINK" />
    );
    expect(await screen.findByText("Signed-in users with link")).toBeTruthy();
  });

  it("shows the secret link of a notebook that is already unlisted, and copies exactly that", async () => {
    render(
      <ShareModal
        isOpen
        onOpenChange={vi.fn()}
        initialVisibility="UNLISTED"
        unlistedLink={SECRET}
      />
    );

    const input = (await screen.findByDisplayValue(SECRET)) as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    fireEvent.click(screen.getByText("Copy link"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(SECRET);
  });

  it("has no link to copy until it is saved as unlisted: the server makes the address", async () => {
    render(
      <ShareModal isOpen onOpenChange={vi.fn()} initialVisibility="WORKSPACE" />
    );

    fireEvent.click(await screen.findByText("Unlisted link"));

    expect(
      await screen.findByDisplayValue("The link is made when you save")
    ).toBeTruthy();
    const copy = screen
      .getByText("Copy link")
      .closest("button") as HTMLButtonElement;
    expect(copy.disabled).toBe(true);
    fireEvent.click(copy);
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("stays open after saving as unlisted so the new link can be copied, and closes for the other kinds", async () => {
    const onVisibilityChange = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(
      <ShareModal
        isOpen
        onOpenChange={onOpenChange}
        onVisibilityChange={onVisibilityChange}
      />
    );

    fireEvent.click(await screen.findByText("Unlisted link"));
    fireEvent.click(screen.getByText("Save changes"));
    await waitFor(() =>
      expect(onVisibilityChange).toHaveBeenCalledWith("UNLISTED", undefined)
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText("Workspace only"));
    fireEvent.click(screen.getByText("Save changes"));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("makes a new link on request, and only offers to once the notebook is unlisted", async () => {
    const onRotateLink = vi.fn().mockResolvedValue(undefined);
    const { unmount } = render(
      <ShareModal
        isOpen
        onOpenChange={vi.fn()}
        initialVisibility="UNLISTED"
        unlistedLink={SECRET}
        onRotateLink={onRotateLink}
      />
    );
    fireEvent.click(await screen.findByText("New link"));
    await waitFor(() => expect(onRotateLink).toHaveBeenCalledTimes(1));
    unmount();

    render(
      <ShareModal
        isOpen
        onOpenChange={vi.fn()}
        initialVisibility="PUBLIC"
        onRotateLink={onRotateLink}
      />
    );
    await screen.findByText("Unlisted link");
    expect(screen.queryByText("New link")).toBeNull();
  });
});
