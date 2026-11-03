# @sandworm/terminal

`terminal.sandworm`: a Next.js app that extends the main Sandworm app (`apps/web`). It runs
on its own, on port **3001**, and reuses what Sandworm already has.

```bash
pnpm install
pnpm --filter @sandworm/terminal dev   # http://localhost:3001
```

Copy `.env.example` to `.env` if you need to change where the main app lives.

## Kept in step with `apps/web`

| What | Same as web |
| --- | --- |
| Next.js, React, `next-themes` | the `react` pnpm catalog (`pnpm-workspace.yaml`) |
| Tailwind | the `ui` catalog, 3.4.x, with `tailwindcss-animate` |
| `tailwind.config.ts` | web's `theme.extend`, copied |
| `tsconfig.json`, PostCSS, ESLint | web's, with the paths adjusted |
| Design tokens (`:root` and `.dark`) | copied from `apps/web/src/styles/globals.scss` |

The last two are **copies**. If you change a token or the Tailwind theme in web, change it here
too, or the two apps drift apart. When this gets tiresome, move the tokens and the theme into a
shared package.

## Shared from the monorepo

- `@sandworm/ui`: components, imported as `@sandworm/ui/components/button`. Its folder is in the
  Tailwind `content` list, so its classes are generated here.
- Import `@sandworm/ui` only from `"use client"` files (see `src/components/OpenSandwormButton.tsx`).
  `@sandworm/ui/lib/utils` exports a hook next to `cn` and the components are not marked
  `"use client"`, so a server component that imports one fails the build.
- Add `@sandworm/types` (and `transpilePackages`) when you need the shared types.

## Not wired up yet

- **Auth.** There is no sign-in. Sharing a session with web needs a decision first (a cookie on
  the parent domain, or an OAuth flow against web).
- **Deploy.** The root `vercel.json` builds web only. Make terminal its own Vercel project with
  the root directory set to `apps/terminal`.
