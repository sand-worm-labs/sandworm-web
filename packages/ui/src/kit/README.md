# kit

Sandworm-styled components that more than one place reuses. They follow our design standard
(the tokens in the app's Tailwind theme), unlike `../components`, which holds the shadcn
primitives as generated.

- **Own the look, not the app.** A kit component takes data and callbacks. It never imports
  `next/link`, `next/image`, a route registry or anything from an app. Links and routing stay in
  the app (`AppLink`, `PageTabs`), and artwork is inline so there is no `public/` file to copy.
- **Tokens, not hex.** Classes such as `text-ink-100`, `bg-block-surface` and `bg-option-hover`
  come from the host app's Tailwind theme. An app that uses the kit must scan
  `packages/ui/src` in its Tailwind `content`.
- **Server-safe by default.** Add `"use client"` only to a file that uses hooks or a client-only
  primitive.
- **Import by path:** `@sandworm/ui/kit/button`, `@sandworm/ui/kit/form/text-field`,
  `@sandworm/ui/kit/tone`. Files are kebab-case, like `../components`.
- **Tests sit next to the code** (`pnpm test` in this package).

The shadcn files in `../components` (`button`, `card`, `badge`, ...) are in use in web and are not
changed by anything here.
