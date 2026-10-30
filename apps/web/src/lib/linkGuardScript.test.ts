import { beforeEach, describe, expect, it, vi } from "vitest";

import { OPEN_LINK_MESSAGE } from "./externalLink";
import { LINK_GUARD_SCRIPT } from "./linkGuardScript";

describe("LINK_GUARD_SCRIPT", () => {
  const post = vi.fn();

  beforeEach(() => {
    post.mockClear();
    document.body.innerHTML = `
      <a id="web" href="https://pudgypenguins.com/x"><span id="inner">Website</span></a>
      <a id="mail" href="mailto:a@b.com">Mail</a>
      <a id="hash" href="#section">Section</a>
      <span id="plain">Not a link</span>`;
    // The script runs in a frame, where `parent` is the app's page.
    // eslint-disable-next-line no-new-func
    new Function("parent", LINK_GUARD_SCRIPT)({ postMessage: post });
  });

  const click = (id: string) => {
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    document.getElementById(id)!.dispatchEvent(event);
    return event;
  };

  it("hands a web link to the page instead of opening it, even when a child is clicked", () => {
    const event = click("inner");
    expect(event.defaultPrevented).toBe(true);
    expect(post).toHaveBeenCalledWith(
      { type: OPEN_LINK_MESSAGE, url: "https://pudgypenguins.com/x" },
      "*"
    );
  });

  it("leaves mailto links, in-page anchors and plain text alone", () => {
    ["mail", "hash", "plain"].forEach(id => {
      expect(click(id).defaultPrevented).toBe(false);
    });
    expect(post).not.toHaveBeenCalled();
  });
});
