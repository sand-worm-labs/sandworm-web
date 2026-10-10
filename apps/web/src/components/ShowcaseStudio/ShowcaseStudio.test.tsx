import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ShowcaseStudio } from ".";

const studio = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock("./useShowcaseStudio", () => ({
  useShowcaseStudio: () => studio.current,
}));

const config = {
  taxonomy: {
    groups: [{ id: "money", label: "Money" }],
    chainOrder: ["solana"],
    categories: [
      {
        group: "money",
        slug: "off-ramps",
        name: "Off-ramps",
        question: "How does money leave crypto?",
        metricSpec: "",
      },
    ],
  },
  chains: { solana: { color: "#9945FF" } },
  templates: { case_study: { sections: [] }, category: { sections: [] } },
};

const notebook = {
  id: "d1",
  workspaceId: "w",
  title: "Paj off-ramp",
  slug: "paj",
  description: null,
  visibility: "PUBLIC",
  publishedAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-02T00:00:00Z",
  showcase: null,
};

beforeEach(() => {
  studio.current = {
    overview: null,
    config: null,
    loading: false,
    locked: true,
    gateError: null,
    unlock: vi.fn(),
    lock: vi.fn(),
    saveNotebook: vi.fn().mockResolvedValue(undefined),
    saveCategory: vi.fn(),
    deleteCategory: vi.fn(),
    saveChain: vi.fn(),
    approveClaim: vi.fn(),
  };
});

describe("ShowcaseStudio", () => {
  it("asks for the password and hands it over", () => {
    render(<ShowcaseStudio />);

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "open-sesame" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Open the studio" }));

    expect(studio.current.unlock).toHaveBeenCalledWith("open-sesame");
  });

  it("says when the password was wrong", () => {
    studio.current.gateError = "That is not the password";
    render(<ShowcaseStudio />);

    expect(screen.getByRole("alert")).toHaveTextContent("not the password");
  });

  it("opens on the notebooks once let in, and files one on the Showcase", async () => {
    studio.current = {
      ...studio.current,
      locked: false,
      overview: {
        officialWorkspaceIds: ["w"],
        notebooks: [notebook],
        leads: [],
      },
      config,
    };
    render(<ShowcaseStudio />);

    fireEvent.click(screen.getByText("Paj off-ramp"));
    fireEvent.change(screen.getByLabelText(/Category/), {
      target: { value: "off-ramps" },
    });
    fireEvent.change(screen.getByLabelText(/Protocol/), {
      target: { value: "Paj" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));

    await screen.findByText("Published on the Showcase");
    expect(studio.current.saveNotebook).toHaveBeenCalledWith(
      "d1",
      expect.objectContaining({
        kind: "case_study",
        category: "off-ramps",
        protocol: "Paj",
        status: "published",
      })
    );
  });

  it("will not publish an analysis with no protocol", () => {
    studio.current = {
      ...studio.current,
      locked: false,
      overview: {
        officialWorkspaceIds: ["w"],
        notebooks: [notebook],
        leads: [],
      },
      config,
    };
    render(<ShowcaseStudio />);

    fireEvent.click(screen.getByText("Paj off-ramp"));

    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
    expect(
      screen.getByText("An analysis needs a protocol")
    ).toBeInTheDocument();
  });
});
