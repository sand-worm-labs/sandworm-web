// =====================================
// ⬢ JavaScript cell frame
// =====================================
// The page a JavaScript cell runs in: a sandboxed iframe with no access to
// the app, its cookies or its storage. The cell's code runs there as an ES
// module, with a small `sw` object to draw into the cell and to reach the
// notebook's Python variables. The frame and the page only ever exchange
// the messages below.
//
// apps/mcp's JAVASCRIPT_GUIDANCE describes this same `sw` to agents: keep the
// two in step.

// Frame -> page.
export type FromFrame =
  | { sw: "get"; id: number; name: string }
  | { sw: "set"; id: number; name: string; value: unknown }
  | { sw: "watch"; name: string }
  | { sw: "unwatch"; name: string }
  | { sw: "height"; height: number };

// Page -> frame.
export type ToFrame =
  // Answers a get (with the value) or a set (with nothing).
  | { sw: "reply"; id: number; value?: unknown; error?: string }
  // A watched variable has a new value.
  | { sw: "update"; name: string; value: unknown };

// The theme's neutrals and series colors (public/sandworm_theme/tokens.py),
// light and dark, handed to the cell as sw.colors.
const COLORS = {
  light: {
    ink: "#17101C",
    muted: "#6F6478",
    rule: "#E9E2ED",
    series: [
      "#EE149E",
      "#84185C",
      "#FB51BD",
      "#FE83D1",
      "#A308F0",
      "#C77DEB",
      "#4B2E83",
      "#6F6478",
    ],
  },
  dark: {
    ink: "#F3F0F5",
    muted: "#A5A5A4",
    rule: "#40403E",
    series: [
      "#EE149E",
      "#C1428A",
      "#FB51BD",
      "#FE83D1",
      "#A308F0",
      "#C77DEB",
      "#9A7BDB",
      "#A5A5A4",
    ],
  },
};

// Runs in the frame before the cell's code. Written as a string because it
// is part of the frame's document, not of this bundle.
const BOOTSTRAP = String.raw`
(() => {
  const config = window.__SW_CONFIG__;
  const root = document.getElementById("root");
  const post = message => parent.postMessage(message, "*");

  // What went wrong first, then where. Firefox leaves the message out of an
  // error's stack and Chrome puts it in, so the message is added when missing.
  // "line 3" counts from the top of the cell's code.
  const describe = error => {
    if (!error || typeof error !== "object") return String(error);
    const message = (error.name ? error.name + ": " : "") + (error.message || "");
    const stack = error.stack ? String(error.stack).trim() : "";
    if (!stack) return message || String(error);
    return stack.includes(error.message || "\u0000") && error.message ? stack : (message + "\n" + stack).trim();
  };
  const showError = error => {
    const box = document.createElement("pre");
    box.className = "sw-error";
    box.textContent = describe(error);
    document.body.append(box);
  };
  addEventListener("error", event => {
    if (event.error) showError(event.error);
    else showError(event.message + (event.lineno ? " (line " + event.lineno + ")" : ""));
  });
  addEventListener("unhandledrejection", event => showError(event.reason));

  let nextId = 1;
  const pending = new Map();
  const watchers = new Map();
  const ask = message =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      post({ ...message, id });
    });

  addEventListener("message", event => {
    const message = event.data;
    if (event.source !== parent || !message || typeof message !== "object") return;
    if (message.sw === "reply") {
      const waiting = pending.get(message.id);
      if (!waiting) return;
      pending.delete(message.id);
      if (message.error) waiting.reject(new Error(message.error));
      else waiting.resolve(message.value);
    } else if (message.sw === "update") {
      (watchers.get(message.name) || []).forEach(fn => {
        try {
          fn(message.value);
        } catch (error) {
          showError(error);
        }
      });
    }
  });

  window.sw = {
    root,
    theme: config.theme,
    colors: config.colors,
    // Whether this notebook has Python to read from and write to.
    python: config.python,
    get: name => ask({ sw: "get", name }),
    set: (name, value) => ask({ sw: "set", name, value }),
    watch(name, fn) {
      const fns = watchers.get(name) || [];
      watchers.set(name, [...fns, fn]);
      // The page answers every watch with the current value.
      post({ sw: "watch", name });
      return () => {
        const left = (watchers.get(name) || []).filter(f => f !== fn);
        if (left.length) watchers.set(name, left);
        else {
          watchers.delete(name);
          post({ sw: "unwatch", name });
        }
      };
    },
  };

  // The cell is as tall as what it draws.
  const report = () => post({ sw: "height", height: Math.ceil(document.documentElement.getBoundingClientRect().height) });
  new ResizeObserver(report).observe(document.documentElement);

  // As a module: imports by URL and top-level await both work. Added from
  // here rather than written into the page so a failed import is reported.
  const script = document.createElement("script");
  script.type = "module";
  script.textContent = config.code;
  script.addEventListener("error", () =>
    showError("A module this cell imports could not be loaded. Check the URL and that the version exists.")
  );
  document.body.append(script);
})();
`;

// JSON inside a <script>: "<" is the only character that could end the script.
const inScript = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

export function buildFrameDocument(opts: {
  code: string;
  isDark: boolean;
  hasPython: boolean;
  // In a dashboard tile the frame fills the tile instead of sizing itself.
  fillHeight: boolean;
}): string {
  const colors = opts.isDark ? COLORS.dark : COLORS.light;
  const config = {
    code: opts.code,
    theme: opts.isDark ? "dark" : "light",
    colors,
    python: opts.hasPython,
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; ${opts.fillHeight ? "height: 100%;" : ""} }
  body {
    color: ${colors.ink};
    font-family: "Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
  }
  #root { width: 100%; ${opts.fillHeight ? "height: 100%;" : ""} }
  .sw-error {
    margin: 8px 0 0; padding: 10px 12px; border-radius: 8px;
    background: ${opts.isDark ? "rgba(240,138,132,0.12)" : "#FEF3F2"};
    color: ${opts.isDark ? "#F08A84" : "#B42318"};
    font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: pre-wrap; word-break: break-word;
  }
</style>
</head>
<body>
<div id="root"></div>
<script>window.__SW_CONFIG__ = ${inScript(config)};</script>
<script>${BOOTSTRAP}</script>
</body>
</html>`;
}
