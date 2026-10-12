import type { FromWorker, ToWorker } from "./protocol";

// =====================================
// ⬢ Kernel sandbox
// =====================================
// Notebook code is written by whoever made the notebook and runs in the
// browser of whoever opens it. Run as a worker of this page, it would be this
// page as far as the browser is concerned: Python can reach `fetch` (through
// Pyodide's `js` module), and a request from this origin carries the reader's
// session, so a notebook could act as its reader against the API.
//
// So the worker is started from inside a hidden iframe that is sandboxed
// without allow-same-origin. That gives it an origin of its own that nothing
// else shares: its requests carry no cookies, it has no storage, and the only
// thing connecting it to this page is the messages relayed below.

export type KernelPort = {
  postMessage: (message: ToWorker) => void;
  terminate: () => void;
};

// What the frame's own script and this page say to each other, apart from the
// kernel's messages, which pass through untouched.
type Relay =
  | { __sandbox: "ready" }
  | { __sandbox: "boot"; source: string }
  | { __sandbox: "error"; error: string };

// The whole document of the frame: start the worker it is handed, then pass
// messages both ways. A string because it runs in the frame, not this bundle.
const RELAY_DOCUMENT = `<!doctype html><meta charset="utf-8"><script>
(() => {
  let worker = null;
  const fail = error => parent.postMessage({ __sandbox: "error", error: String(error) }, "*");

  const startWorker = source => {
    const type = { type: "module" };
    try {
      // A blob made here has this frame's origin, so the frame may run it.
      return new Worker(URL.createObjectURL(new Blob([source], { type: "text/javascript" })), type);
    } catch (blobError) {
      // Browsers that refuse a blob worker in a sandboxed frame take a data: one.
      return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(source), type);
    }
  };

  addEventListener("message", event => {
    if (event.source !== parent) return;
    const message = event.data;
    if (message && message.__sandbox === "boot") {
      if (worker) return;
      try {
        worker = startWorker(message.source);
      } catch (error) {
        fail(error);
        return;
      }
      worker.onmessage = e => parent.postMessage(e.data, "*");
      worker.onerror = e => fail(e.message || "Python crashed");
      return;
    }
    if (worker) worker.postMessage(message);
  });

  parent.postMessage({ __sandbox: "ready" }, "*");
})();
</script>`;

function isRelay(data: unknown): data is Relay {
  return typeof data === "object" && data !== null && "__sandbox" in data;
}

// Starts the kernel worker in its sandbox. `init` is the first message it
// gets; anything posted before the worker is up waits behind it, in order.
export function createSandboxedKernel(opts: {
  workerUrl: string;
  init: Promise<ToWorker>;
  onMessage: (message: FromWorker) => void;
  onError: (error: string) => void;
}): KernelPort {
  const frame = document.createElement("iframe");
  // Scripts and nothing else: no same-origin, no forms, no popups, no
  // navigation of this page.
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.title = "Python sandbox";
  frame.style.cssText =
    "position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none";
  frame.srcdoc = RELAY_DOCUMENT;

  let open = false;
  let closed = false;
  const queue: ToWorker[] = [];
  const send = (message: ToWorker | Relay) =>
    frame.contentWindow?.postMessage(message, "*");

  const source = fetch(opts.workerUrl).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load the Python worker: ${response.status}`);
    }
    return response.text();
  });

  const boot = async () => {
    try {
      const [code, init] = await Promise.all([source, opts.init]);
      if (closed) return;
      send({ __sandbox: "boot", source: code });
      send(init);
      queue.splice(0).forEach(send);
      open = true;
    } catch (err) {
      if (!closed)
        opts.onError(err instanceof Error ? err.message : String(err));
    }
  };

  const onMessage = (event: MessageEvent) => {
    // Only this frame. Everything it says is the notebook's word, not ours:
    // the caller treats it as untrusted.
    if (event.source !== frame.contentWindow) return;
    const { data } = event;
    if (isRelay(data)) {
      if (data.__sandbox === "ready") boot();
      else if (data.__sandbox === "error") opts.onError(data.error);
      return;
    }
    if (typeof data === "object" && data !== null && "kind" in data) {
      opts.onMessage(data as FromWorker);
    }
  };

  window.addEventListener("message", onMessage);
  document.body.appendChild(frame);

  return {
    postMessage(message) {
      if (closed) return;
      if (open) send(message);
      else queue.push(message);
    },
    // Removing the frame ends the worker and everything it started.
    terminate() {
      closed = true;
      window.removeEventListener("message", onMessage);
      frame.remove();
    },
  };
}
