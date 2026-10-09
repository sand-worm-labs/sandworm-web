import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ReadOnlyBanner, {
  READ_ONLY_BANNER_DISMISSED_KEY,
} from "@/components/Editor/PublicHeader/ReadOnlyBanner";

vi.mock("@/components/Editor/PublicHeader/useForkFlow", () => ({
  useForkFlow: () => ({
    triggerFork: vi.fn(),
    isForkModalOpen: false,
    closeForkModal: vi.fn(),
    handleFork: vi.fn(),
    handleForkSuccess: vi.fn(),
  }),
}));

vi.mock("@/components/Explore/ForkToWorkspaceModal", () => ({
  ForkToWorkspaceModal: () => null,
}));

const renderBanner = () =>
  render(
    <ReadOnlyBanner
      document={{ id: "doc-1", title: "A notebook" }}
      isAuthenticated={false}
      onChangeView={vi.fn()}
    />
  );

describe("ReadOnlyBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the notice with its two actions", async () => {
    renderBanner();

    expect(await screen.findByText("Read-only preview.")).toBeTruthy();
    expect(screen.getByText("View the query")).toBeTruthy();
    expect(screen.getByText("fork")).toBeTruthy();
  });

  it("can be dismissed, and stays dismissed for the next notebook", async () => {
    const first = renderBanner();
    await screen.findByText("Read-only preview.");

    fireEvent.click(screen.getByLabelText("Dismiss read-only notice"));

    expect(screen.queryByText("Read-only preview.")).toBeNull();
    expect(window.localStorage.getItem(READ_ONLY_BANNER_DISMISSED_KEY)).toBe(
      "true"
    );

    // A different notebook, later: the choice is remembered.
    first.unmount();
    renderBanner();
    await waitFor(() =>
      expect(screen.queryByText("Read-only preview.")).toBeNull()
    );
  });

  it("still shows, and can be dismissed for the visit, when browser storage is unavailable", async () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });

    renderBanner();
    await screen.findByText("Read-only preview.");
    fireEvent.click(screen.getByLabelText("Dismiss read-only notice"));

    expect(screen.queryByText("Read-only preview.")).toBeNull();
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
