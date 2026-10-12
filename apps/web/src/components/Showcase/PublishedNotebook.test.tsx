import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { getLayout } from "@sandworm/editor";
import * as Y from "yjs";
import { describe, expect, it, vi } from "vitest";

import { PublishedNotebook } from "./PublishedNotebook";

const state = vi.hoisted(() => ({ yDoc: null as unknown }));

vi.mock("@/components/Editor/hooks/usePublicYDoc", () => ({
  usePublicYDoc: () => ({
    yDoc: state.yDoc,
    document: { id: "d1", title: "Sample" },
    error: null,
    isSyncing: false,
  }),
}));
// The editor only works in the browser, so the page loads it with next/dynamic; here it is a stub.
vi.mock("next/dynamic", () => ({
  default: () =>
    function EditorStub({
      header,
      footer,
    }: {
      header: ReactNode;
      footer: ReactNode;
    }) {
      return (
        <div data-testid="editor">
          {header}
          {footer}
        </div>
      );
    },
}));

const props = {
  slug: "sample",
  header: <div>hero</div>,
  footer: <div>closing</div>,
  empty: <div>placeholder</div>,
};

describe("PublishedNotebook", () => {
  it("shows the placeholder, between the hero and the closing, for a notebook with no cells", () => {
    state.yDoc = new Y.Doc();
    render(<PublishedNotebook {...props} />);

    expect(screen.getByText("hero")).toBeTruthy();
    expect(screen.getByText("placeholder")).toBeTruthy();
    expect(screen.getByText("closing")).toBeTruthy();
    expect(screen.queryByTestId("editor")).toBeNull();
  });

  it("shows the notebook, not the placeholder, once it has a cell", () => {
    const doc = new Y.Doc();
    getLayout(doc).push([new Y.XmlElement("block-group")]);
    state.yDoc = doc;
    render(<PublishedNotebook {...props} />);

    expect(screen.getByTestId("editor")).toBeTruthy();
    expect(screen.queryByText("placeholder")).toBeNull();
  });

  it("leaves an empty notebook empty when the page gives no placeholder", () => {
    state.yDoc = new Y.Doc();
    render(<PublishedNotebook {...props} empty={undefined} />);

    expect(screen.getByTestId("editor")).toBeTruthy();
  });
});
