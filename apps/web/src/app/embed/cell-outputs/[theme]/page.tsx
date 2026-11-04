"use client";

import { useEffect, useRef, useState } from "react";
import { Output } from "@sandworm/types";

import { PythonOutputs } from "@/components/Editor/blocks/customBlocks/python/PythonOutput";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";

// ─────────────────────────────────────────────────────────────
// ⬢ CELL OUTPUTS EMBED
// Draws a notebook cell's saved outputs exactly as the public notebook does,
// for an app that frames this page (the terminal's briefing). The outputs are
// handed over by postMessage, not loaded here, so the framing app decides who
// may see them. Protocol, all messages { type, ... }:
//   frame  → parent  sandworm-cell-ready
//   parent → frame   sandworm-cell-outputs  { outputs: Output[] }
//   frame  → parent  sandworm-cell-height   { height: number }
// ─────────────────────────────────────────────────────────────

const ALLOWED_PARENTS = new Set(
  [process.env.NEXT_PUBLIC_TERMINAL_URL ?? "http://localhost:8082"].map(
    url => new URL(url).origin
  )
);

// Only a list of well-formed outputs is drawn (Output is @sandworm/types' own schema).
function parseOutputsMessage(data: unknown): Output[] | null {
  const message = data as { type?: unknown; outputs?: unknown } | null;
  if (message?.type !== "sandworm-cell-outputs") return null;
  if (!Array.isArray(message.outputs)) return null;
  const outputs = message.outputs.map(o => Output.safeParse(o));
  return outputs.every(o => o.success)
    ? outputs.map(o => o.data as Output)
    : null;
}

export default function CellOutputsEmbedPage() {
  const isDark = useStringQuery("theme") === "dark";
  const [outputs, setOutputs] = useState<Output[] | null>(null);
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The page sits on the framing app's card, so it paints no background.
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";

    const onMessage = (event: MessageEvent) => {
      if (!ALLOWED_PARENTS.has(event.origin)) return;
      const parsed = parseOutputsMessage(event.data);
      if (!parsed) return;
      setParentOrigin(event.origin);
      setOutputs(parsed);
    };
    window.addEventListener("message", onMessage);

    // Every allowed parent hears it; it holds no data.
    ALLOWED_PARENTS.forEach(origin =>
      window.parent.postMessage({ type: "sandworm-cell-ready" }, origin)
    );

    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !parentOrigin || !outputs) return undefined;

    const report = () =>
      window.parent.postMessage(
        { type: "sandworm-cell-height", height: Math.ceil(box.scrollHeight) },
        parentOrigin
      );
    report();
    const observer = new ResizeObserver(report);
    observer.observe(box);
    return () => observer.disconnect();
  }, [outputs, parentOrigin]);

  return (
    <div ref={boxRef} className="editor-v2 font-body text-xs">
      {outputs && (
        <PythonOutputs
          outputs={outputs}
          isFixWithAILoading={false}
          canFixWithAI={false}
          onFixWithAI={() => {}}
          isPDF={false}
          isDashboardView
          isDashboardTile={false}
          isPublicMode
          lazyRender
          blockId="embed"
          isDark={isDark}
        />
      )}
    </div>
  );
}
