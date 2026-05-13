/**
 * Ambient typings for markdown-it plugins that publish JS only (no bundled .d.ts).
 * @see https://www.typescriptlang.org/docs/handbook/modules.html#ambient-modules
 */
declare module "markdown-it-emoji" {
  import type MarkdownIt from "markdown-it";

  function markdownItEmoji(md: MarkdownIt, options?: unknown): void;
  export default markdownItEmoji;
}

declare module "markdown-it-footnote" {
  import type MarkdownIt from "markdown-it";

  function markdownItFootnote(md: MarkdownIt, options?: unknown): void;
  export default markdownItFootnote;
}

declare module "markdown-it-deflist" {
  import type MarkdownIt from "markdown-it";

  function markdownItDeflist(md: MarkdownIt, options?: unknown): void;
  export default markdownItDeflist;
}

declare module "markdown-it-abbr" {
  import type MarkdownIt from "markdown-it";

  function markdownItAbbr(md: MarkdownIt, options?: unknown): void;
  export default markdownItAbbr;
}

declare module "markdown-it-sup" {
  import type MarkdownIt from "markdown-it";

  function markdownItSup(md: MarkdownIt, options?: unknown): void;
  export default markdownItSup;
}

declare module "markdown-it-sub" {
  import type MarkdownIt from "markdown-it";

  function markdownItSub(md: MarkdownIt, options?: unknown): void;
  export default markdownItSub;
}

declare module "markdown-it-mark" {
  import type MarkdownIt from "markdown-it";

  function markdownItMark(md: MarkdownIt, options?: unknown): void;
  export default markdownItMark;
}

declare module "markdown-it-ins" {
  import type MarkdownIt from "markdown-it";

  function markdownItIns(md: MarkdownIt, options?: unknown): void;
  export default markdownItIns;
}
