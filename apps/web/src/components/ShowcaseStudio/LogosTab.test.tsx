import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LogosTab } from "./LogosTab";

vi.mock("./logoImage", () => ({
  toLogoPng: vi.fn().mockResolvedValue("UE5H"),
}));

const config = {
  taxonomy: {
    groups: [{ id: "money", label: "Money" }],
    chainOrder: [],
    categories: [
      {
        group: "money",
        slug: "off-ramps",
        name: "Off-ramps",
        question: "?",
        protocols: ["Paj Cash", "MoonPay", "Aave"],
      },
    ],
  },
  chains: {},
  templates: {},
} as never;

const logos = [
  { slug: "paj-cash", name: "Paj Cash", etag: "abc", updatedAt: "2026-10-12" },
];

describe("LogosTab", () => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    onSave.mockClear();
    onDelete.mockClear();
  });

  const setup = () =>
    render(
      <LogosTab
        config={config}
        logos={logos}
        onSave={onSave}
        onDelete={onDelete}
      />
    );

  it("lists every protocol the categories name, marking the uploaded one", () => {
    setup();
    expect(screen.getByText("Paj Cash")).toBeTruthy();
    expect(screen.getByText("MoonPay")).toBeTruthy();
    expect(screen.getByText("Aave")).toBeTruthy();
    expect(screen.getByText(/Uploaded · paj-cash/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Replace" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Upload" })).toHaveLength(2);
  });

  it("filters by name and by missing upload", () => {
    setup();
    fireEvent.change(screen.getByLabelText("Search protocols"), {
      target: { value: "moon" },
    });
    expect(screen.queryByText("Aave")).toBeNull();
    expect(screen.getByText("MoonPay")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Search protocols"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByLabelText("Without an upload"));
    expect(screen.queryByText("Paj Cash")).toBeNull();
  });

  it("sends a chosen file, resized, under the protocol's slug", async () => {
    setup();
    const file = new File(["x"], "moonpay.svg", { type: "image/svg+xml" });
    fireEvent.change(screen.getByLabelText("Logo file for MoonPay"), {
      target: { files: [file] },
    });
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith("moonpay", "MoonPay", "UE5H")
    );
  });

  it("removes an uploaded logo", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("paj-cash"));
  });
});
