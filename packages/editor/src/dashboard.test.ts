import * as Y from "yjs";

import { BlockType } from "./blocks/index.js";
import {
  addDashboardItemToYDashboard,
  getDashboardItem,
  setDashboardItemChrome,
  yDashboardToRecord,
} from "./dashboard.js";
import { addDashboardCell } from "./operations/document.js";
import { getTabsFromBlockGroup } from "./operations/blockGroup.js";
import { getBlocks, getDashboard, getLayout } from "./index.js";

describe("setDashboardItemChrome", () => {
  test("switches a tile to plain and back to the default card", () => {
    const doc = new Y.Doc();
    const dashboard = getDashboard(doc);
    addDashboardItemToYDashboard(dashboard, {
      id: "tile",
      blockId: "block",
      x: 0,
      y: 0,
      w: 24,
      h: 3,
    });

    setDashboardItemChrome(dashboard, "tile", "plain");
    expect(getDashboardItem(dashboard, "tile")?.chrome).toBe("plain");

    setDashboardItemChrome(dashboard, "tile", "card");
    expect(getDashboardItem(dashboard, "tile")?.chrome).toBeUndefined();
  });

  test("ignores a tile that is not there", () => {
    const doc = new Y.Doc();
    expect(() =>
      setDashboardItemChrome(getDashboard(doc), "missing", "plain")
    ).not.toThrow();
  });
});

describe("addDashboardCell", () => {
  const hiddenInPublished = (doc: Y.Doc, blockId: string) =>
    getLayout(doc)
      .toArray()
      .flatMap(group => getTabsFromBlockGroup(group, getBlocks(doc)))
      .find(tab => tab.blockId === blockId)?.isHiddenInPublished;

  test("adds a markdown cell to the notebook, hidden in view mode, at the bottom of the dashboard", () => {
    const doc = new Y.Doc();
    const first = addDashboardCell(
      doc,
      { type: BlockType.Markdown, source: "Hello" },
      { w: 12, h: 3 }
    );
    const second = addDashboardCell(
      doc,
      { type: BlockType.Python, source: "print(1)" },
      { w: 24, h: 3 },
      "plain"
    );

    // Both are notebook cells, in order, hidden in view mode.
    const notebook = getLayout(doc)
      .toArray()
      .flatMap(group => getTabsFromBlockGroup(group, getBlocks(doc)))
      .map(tab => tab.blockId);
    expect(notebook).toEqual([first, second]);
    expect(hiddenInPublished(doc, first)).toBe(true);
    expect(hiddenInPublished(doc, second)).toBe(true);

    // The text and the code are in the cells.
    const text = (id: string) =>
      (
        getBlocks(doc)
          .get(id)
          ?.getAttribute("source" as never) as unknown as Y.Text
      ).toString();
    expect(text(first)).toBe("Hello");
    expect(text(second)).toBe("print(1)");

    // The second sits under the first on the dashboard, and is plain.
    const items = Object.values(yDashboardToRecord(getDashboard(doc))).sort(
      (a, b) => a.y - b.y
    );
    expect(items.map(i => [i.blockId, i.x, i.y, i.w, i.h, i.chrome])).toEqual([
      [first, 0, 0, 12, 3, undefined],
      [second, 0, 3, 24, 3, "plain"],
    ]);
  });
});
