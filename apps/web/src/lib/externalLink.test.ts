import { describe, expect, it } from "vitest";

import { decideLink, describeLink, linkWarnings } from "./externalLink";

const ORIGIN = "https://app.sandwormlab.xyz";

describe("decideLink", () => {
  it("lets our own pages and #anchors through", () => {
    expect(decideLink("/notebooks/abc", ORIGIN)).toBe("open");
    expect(decideLink("#section", ORIGIN)).toBe("open");
    expect(decideLink("https://app.sandwormlab.xyz/x", ORIGIN)).toBe("open");
    expect(decideLink("https://docs.sandwormlab.xyz", ORIGIN)).toBe("open");
    expect(decideLink("https://sandwormlab.xyz", ORIGIN)).toBe("open");
  });

  it("warns for any other web link", () => {
    expect(decideLink("https://pudgypenguins.com", ORIGIN)).toBe("warn");
    expect(decideLink("http://example.com/a?b=1", ORIGIN)).toBe("warn");
  });

  it("is not fooled by a name that merely contains ours", () => {
    expect(decideLink("https://sandwormlab.xyz.evil.com", ORIGIN)).toBe("warn");
    expect(decideLink("https://notsandwormlab.xyz", ORIGIN)).toBe("warn");
    expect(decideLink("https://sandwormlab.xyz@evil.com", ORIGIN)).toBe("warn");
  });

  it("leaves non-web links to the browser", () => {
    expect(decideLink("mailto:a@b.com", ORIGIN)).toBe("ignore");
    // eslint-disable-next-line no-script-url
    expect(decideLink("javascript:alert(1)", ORIGIN)).toBe("ignore");
    expect(decideLink("data:text/html,hi", ORIGIN)).toBe("ignore");
    expect(decideLink("http://[bad", ORIGIN)).toBe("ignore");
  });
});

describe("linkWarnings", () => {
  it("flags a name and password in front of the host", () => {
    expect(linkWarnings(new URL("https://trusted.com@evil.com/x"))).toContain(
      "credentials"
    );
  });

  it("flags a lookalike name written with special characters", () => {
    expect(linkWarnings(new URL("https://аpple.com"))).toContain("lookalike");
  });

  it("flags a number instead of a name", () => {
    expect(linkWarnings(new URL("http://192.168.0.1/login"))).toContain(
      "ip-address"
    );
  });

  it("flags nothing for an ordinary address", () => {
    expect(linkWarnings(new URL("https://pudgypenguins.com/a"))).toEqual([]);
  });
});

describe("describeLink", () => {
  it("splits the address around the host that decides where you land", () => {
    const link = describeLink("https://www.example.com:8443/a/b?c=1");
    expect(link?.host).toBe("example.com");
    expect(link?.before).toBe("https://");
    expect(link?.url.host).toBe("www.example.com:8443");
    expect(link?.after).toBe("/a/b?c=1");
  });

  it("highlights the real host when the name in front repeats it", () => {
    const link = describeLink("https://evil.com@evil.com/path");
    expect(link?.before).toBe("https://evil.com@");
    expect(link?.after).toBe("/path");
    expect(link?.warnings).toContain("credentials");
  });

  it("gives nothing for a link that is not a web address", () => {
    expect(describeLink("mailto:a@b.com")).toBeNull();
    expect(describeLink("nonsense")).toBeNull();
  });
});
