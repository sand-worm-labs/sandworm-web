import { describe, expect, it } from "vitest";

import { buildFrameDocument } from "./frame";

const build = (code: string, isDark = false) =>
  buildFrameDocument({ code, isDark, hasPython: true, fillHeight: false });

// The config the frame's bootstrap reads, parsed back out of the document.
function configOf(html: string) {
  const match = html.match(/window\.__SW_CONFIG__ = (.*);<\/script>/);
  return JSON.parse(match![1]!);
}

describe("the JavaScript cell's frame", () => {
  it("carries the cell's code to the frame unchanged", () => {
    const code =
      'import x from "https://esm.sh/x@1.0.0";\nsw.root.textContent = `a < b && "q"`;';
    expect(configOf(build(code)).code).toBe(code);
  });

  it("can't be broken out of by code that contains a closing script tag", () => {
    const code = 'sw.root.innerHTML = "</script><script>alert(1)</script>";';
    const html = build(code);
    // Two scripts of ours and no more: the code is data, not markup.
    expect(html.match(/<script/g)).toHaveLength(2);
    expect(html.match(/<\/script>/g)).toHaveLength(2);
    expect(configOf(html).code).toBe(code);
  });

  it("tells the cell the theme and gives it the theme's colors", () => {
    const light = configOf(build("", false));
    const dark = configOf(build("", true));
    expect(light.theme).toBe("light");
    expect(dark.theme).toBe("dark");
    expect(light.colors.ink).not.toBe(dark.colors.ink);
    expect(light.colors.series.length).toBeGreaterThan(3);
  });

  it("says whether there is Python to read from", () => {
    const html = buildFrameDocument({
      code: "",
      isDark: false,
      hasPython: false,
      fillHeight: true,
    });
    expect(configOf(html).python).toBe(false);
  });

  it("is a bootstrap that parses", () => {
    const html = build("1");
    const bootstrap = html.split("<script>")[2]!.split("</script>")[0]!;
    // Compiled, not run: a syntax error in it would leave every cell blank.
    // eslint-disable-next-line no-new-func
    expect(() => new Function(bootstrap)).not.toThrow();
  });
});
