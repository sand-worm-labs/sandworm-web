import { useEffect, useMemo, useRef, useState } from "react";

import { callKernel, subscribeNotebookChanges } from "@/lib/pyodide/kernel";

import { buildFrameDocument, type FromFrame, type ToFrame } from "./frame";

// How often, at most, watched variables are read again after a change.
const REFRESH_MS = 250;
const MIN_HEIGHT = 24;
const MAX_HEIGHT = 4000;
// A value no variable can have, so the first read of a watch is always sent.
const UNSENT = "\u0000unsent";

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Runs a JavaScript cell's code in its sandboxed frame and carries the
// messages between it and the notebook's Python (see ./frame.ts).
//
// `runId` changes each time the cell is run: the frame is thrown away and
// built again, so a run always starts clean.
export default function JavaScriptFrame(props: {
  notebookId: string;
  code: string;
  runId: number;
  isDark: boolean;
  // Whether this notebook's Python runs in this tab. Without it the cell
  // still draws; reading a variable gives undefined.
  hasPython: boolean;
  fillHeight: boolean;
}) {
  const { notebookId, hasPython } = props;
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);

  const srcDoc = useMemo(
    () =>
      buildFrameDocument({
        code: props.code,
        isDark: props.isDark,
        hasPython,
        fillHeight: props.fillHeight,
      }),
    // runId is here on purpose: running again rebuilds the frame even when
    // the code is the same.
    [props.code, props.isDark, hasPython, props.fillHeight, props.runId]
  );

  useEffect(() => {
    const send = (message: ToFrame) =>
      frameRef.current?.contentWindow?.postMessage(message, "*");

    // What the frame is following, and the value it last got for each (as
    // JSON), so it only hears about real changes.
    const watched = new Map<string, string | undefined>();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let reading = false;
    let stale = false;
    let stopped = false;

    const read = async (names: string[]): Promise<Record<string, unknown>> =>
      hasPython && names.length > 0
        ? callKernel({ kind: "get_variables", notebookId, names })
        : {};

    const refresh = async () => {
      if (reading) {
        stale = true;
        return;
      }
      reading = true;
      try {
        const names = Array.from(watched.keys());
        const values = await read(names);
        if (stopped) return;
        names.forEach(name => {
          if (!watched.has(name)) return;
          const json = JSON.stringify(values[name]);
          if (json !== watched.get(name)) {
            watched.set(name, json);
            send({ sw: "update", name, value: values[name] });
          }
        });
      } catch {
        // Python was restarted mid-read: the next change reads again.
      } finally {
        reading = false;
        if (stale && !stopped) {
          stale = false;
          refresh();
        }
      }
    };

    const schedule = () => {
      if (timer || stopped) return;
      timer = setTimeout(() => {
        timer = null;
        refresh();
      }, REFRESH_MS);
    };

    const onMessage = async (event: MessageEvent) => {
      // Only this cell's own frame; anything else on the page is ignored.
      if (event.source !== frameRef.current?.contentWindow) return;
      const message = event.data as FromFrame | null;
      if (!message || typeof message !== "object") return;

      switch (message.sw) {
        case "height":
          if (typeof message.height === "number") {
            setHeight(
              Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, message.height))
            );
          }
          break;
        case "get":
          try {
            const values = await read([String(message.name)]);
            send({ sw: "reply", id: message.id, value: values[message.name] });
          } catch (err) {
            send({ sw: "reply", id: message.id, error: errorText(err) });
          }
          break;
        case "set":
          try {
            if (!hasPython) {
              throw new Error("This notebook has no Python running here");
            }
            await callKernel({
              kind: "set_json_variable",
              notebookId,
              name: String(message.name),
              json: JSON.stringify(message.value ?? null),
            });
            send({ sw: "reply", id: message.id });
          } catch (err) {
            send({ sw: "reply", id: message.id, error: errorText(err) });
          }
          break;
        case "watch":
          watched.set(String(message.name), UNSENT);
          refresh();
          break;
        case "unwatch":
          watched.delete(String(message.name));
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", onMessage);
    const unsubscribe = hasPython
      ? subscribeNotebookChanges(notebookId, schedule)
      : () => {};

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      unsubscribe();
    };
    // A new run is a new frame, with nothing watched yet.
  }, [notebookId, hasPython, srcDoc]);

  return (
    <iframe
      ref={frameRef}
      // A new document each run, and a new element so nothing carries over.
      key={props.runId}
      srcDoc={srcDoc}
      title="JavaScript cell"
      // Scripts, and links that open in a new tab. Without allow-same-origin
      // the frame has its own empty origin: no cookies, no storage, and no
      // way to reach the notebook's page except the messages above.
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      className="w-full border-0 block bg-transparent"
      style={{ height: props.fillHeight ? "100%" : height }}
    />
  );
}
