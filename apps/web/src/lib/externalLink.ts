// =====================================
// ⬢ External links
// =====================================
// A notebook is written by someone else, and its text and output can link
// anywhere. Before a reader leaves, the app says where the link goes and lets
// them back out (OWASP ASVS 16.1: warn before sending a user to content that
// may not be trusted). The rules for what counts as "leaving" live here, apart
// from the dialog, so they can be tested.

// A page inside a sandboxed output frame cannot open a dialog in the app, so it
// asks the page to with this message: { type: OPEN_LINK_MESSAGE, url }.
export const OPEN_LINK_MESSAGE = "sandworm-open-link";

// Sites that are ours: a link to them is not "leaving". Subdomains count.
const TRUSTED_HOSTS = ["sandwormlab.xyz"];

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

const isTrustedHost = (host: string) =>
  TRUSTED_HOSTS.some(
    trusted => host === trusted || host.endsWith(`.${trusted}`)
  );

// What a click on `href` should do.
//   "ignore"  not a web link (mailto:, #anchor, javascript:): the browser decides
//   "open"    a web link to a site that is ours: open it without asking
//   "warn"    a web link to anywhere else: ask first
export type LinkDecision = "ignore" | "open" | "warn";

export function decideLink(href: string, currentOrigin: string): LinkDecision {
  let url: URL;
  try {
    url = new URL(href, currentOrigin);
  } catch {
    return "ignore";
  }
  if (!HTTP_PROTOCOLS.has(url.protocol)) return "ignore";
  if (url.origin === currentOrigin || isTrustedHost(url.hostname))
    return "open";
  return "warn";
}

// Things in an address that look like an attempt to pass off one site as another.
export type LinkWarning = "credentials" | "lookalike" | "ip-address";

export function linkWarnings(url: URL): LinkWarning[] {
  const found: LinkWarning[] = [];
  // https://trusted.com@evil.com goes to evil.com, but reads as trusted.com.
  if (url.username || url.password) found.push("credentials");
  // xn-- is how a name with non-Latin letters is written, and how lookalikes such as a Cyrillic "a" are hidden.
  if (url.hostname.split(".").some(label => label.startsWith("xn--")))
    found.push("lookalike");
  if (
    /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname) ||
    url.hostname.startsWith("[")
  )
    found.push("ip-address");
  return found;
}

export const LINK_WARNING_TEXT: Record<LinkWarning, string> = {
  credentials:
    "The address has a name and password in front of it. The site you reach is the part after the @, not the part before it.",
  lookalike:
    "The site name uses special characters that can make it look like a different site. Check it carefully.",
  "ip-address":
    "The address is a number, not a site name, so there is no name to check.",
};

// The destination as the dialog shows it: the part that decides where you land, apart from the rest.
export function describeLink(href: string): {
  url: URL;
  host: string;
  before: string;
  after: string;
  warnings: LinkWarning[];
} | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (!HTTP_PROTOCOLS.has(url.protocol)) return null;
  const full = url.href;
  // The host starts after "scheme://" and after any "name:password@". Counted, not searched for, so a name that
  // repeats the host in front of the @ cannot move the highlight.
  const userinfo =
    url.username || url.password
      ? `${url.username}${url.password ? `:${url.password}` : ""}@`
      : "";
  const hostStart = full.indexOf("//") + 2 + userinfo.length;
  return {
    url,
    host: url.hostname.replace(/^www\./, ""),
    before: full.slice(0, hostStart),
    after: full.slice(hostStart + url.host.length),
    warnings: linkWarnings(url),
  };
}

// Opens a link in a new tab that cannot reach back into this page.
export function openLink(href: string): void {
  window.open(href, "_blank", "noopener,noreferrer");
}
