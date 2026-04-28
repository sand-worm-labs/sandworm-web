// ─────────────────────────────────────────────────────────────────────────────
// ⬢ Imports
// ─────────────────────────────────────────────────────────────────────────────
import { Markdown } from "tiptap-markdown";
import katex from "katex";
import texmath from "markdown-it-texmath";

// ─────────────────────────────────────────────────────────────────────────────
// ⬢ Types
// ─────────────────────────────────────────────────────────────────────────────

interface MarkdownStorage {
  parser?: {
    md?: {
      use: (plugin: unknown, options?: unknown) => void;
    };
  };
  serializer?: {
    nodes: Record<string, unknown>;
    marks: Record<string, unknown>;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ⬢ Math Serializers
//   @aarkue/tiptap-math-extension uses node names "mathInline" and "mathDisplay"
//   The markdown extension doesn't know about these — we teach it here.
// ─────────────────────────────────────────────────────────────────────────────

const mathSerializers = {
  nodes: {
    mathInline: (state: { write: (s: string) => void }, node: { textContent: string }) => {
      state.write(`$${node.textContent}$`);
    },
    mathDisplay: (state: { write: (s: string) => void; ensureNewLine: () => void }, node: { textContent: string }) => {
      state.ensureNewLine();
      state.write(`$$\n${node.textContent}\n$$`);
      state.ensureNewLine();
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ⬢ Extension
//   Extends base Markdown to:
//   1. Wire markdown-it-texmath so $...$ and $$...$$ parse on paste
//   2. Register math node serializers so copy → markdown round-trips cleanly
// ─────────────────────────────────────────────────────────────────────────────

export const MarkdownExtension = Markdown.extend({
  onCreate() {
    const storage = this.storage as MarkdownStorage;

    // ── Parser: inject texmath so pasted $math$ becomes a mathInline node ──
    const md = storage?.parser?.md;
    if (md) {
      try {
        md.use(texmath, {
          engine: katex,
          delimiters: "dollars",
          katexOptions: { throwOnError: false },
        });
      } catch (e) {
        // texmath may already be registered if onCreate fires twice (StrictMode)
        console.warn("[MarkdownExtension] texmath registration skipped:", e);
      }
    }

    // ── Serializer: teach it how to write math nodes back to markdown ──
    const serializer = storage?.serializer;
    if (serializer) {
      Object.assign(serializer.nodes, mathSerializers.nodes);
    }
  },
}).configure({
  html: true,
  transformPastedText: true,
  transformCopiedText: true,
  tightLists: true,
  bulletListMarker: "-",
  linkify: false,
  breaks: false,
});