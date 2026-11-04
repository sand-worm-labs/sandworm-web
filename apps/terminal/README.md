# @sandworm/terminal

`terminal.sandworm`: a Next.js app that extends the main Sandworm app (`apps/web`). It runs
on its own and reuses what Sandworm already has.

```bash
pnpm install
pnpm --filter @sandworm/terminal dev   # dev server on http://localhost:3001
```

### Dev ports

Like the other apps, the dev server sits behind a Caddy front door (`deployment/caddy/Caddyfile.dev`):

| App          | Front door  | Dev server  |
| ------------ | ----------- | ----------- |
| Landing      | `:8080`     | `:4321`     |
| Web app      | `:8081`     | `:3000`     |
| **Terminal** | **`:8082`** | **`:3001`** |

Use `http://localhost:8082` when running the whole stack with `scripts/start-dev.sh`. Port 3001 is
what Next.js listens on, and what you open if you run only the terminal without Caddy.

Copy `.env.example` to `.env` if you need to change where the main app lives.

## Kept in step with `apps/web`

| What                                | Same as web                                         |
| ----------------------------------- | --------------------------------------------------- |
| Next.js, React, `next-themes`       | the `react` pnpm catalog (`pnpm-workspace.yaml`)    |
| Tailwind                            | the `ui` catalog, 3.4.x, with `tailwindcss-animate` |
| `tailwind.config.ts`                | web's `theme.extend`, copied                        |
| `tsconfig.json`, PostCSS, ESLint    | web's, with the paths adjusted                      |
| Design tokens (`:root` and `.dark`) | copied from `apps/web/src/styles/globals.scss`      |

The last two are **copies**. If you change a token or the Tailwind theme in web, change it here
too, or the two apps drift apart. When this gets tiresome, move the tokens and the theme into a
shared package.

## Shared from the monorepo

- `@sandworm/ui`: components, imported as `@sandworm/ui/components/input`. Its folder is in the
  Tailwind `content` list, so its classes are generated here.
- `@sandworm/ui/kit/*` holds the reusable components that follow our design standard: buttons
  (copied from web's primary "Create New Team" and secondary "Edit" styles), cards, pills, status
  tones, the form fields, the dropdown and the avatars. They are separate from the shadcn files in
  `components/`, which web uses and which stay as generated. Put a component in the kit when a
  second place needs it; see `packages/ui/src/kit/README.md` for the rules. App-specific pieces
  (`AppLink`, `PageTabs`, the shell, the theme toggle) stay in `src/components`.
- Keep `@sandworm/ui` imports in `"use client"` files for now. `lib/utils` no longer exports a hook
  (it moved to `hooks/use-stable-keys`), but the kit is not yet checked from server components.
- Add `@sandworm/types` (and `transpilePackages`) when you need the shared types.

## Conventions

- A product area lives in `src/features/<name>/`. Components take typed props and never import
  fixtures. Dummy data sits in `fixtures.ts` and is returned by `source.ts` (reads) and
  `actions.ts` (writes), so replacing it with the API or notebook output changes those files only.
- Shared UI goes in `src/components`; config reads (env, site, fonts) in `src/config`.
- Form controls live in `src/components/form` and follow web's look: the checkbox is web's
  `StyledCheckbox` (outlined violet tick), not the ui package's. The ui `Input`, `Textarea` and
  `Label` are used behind those wrappers, which also fix their focus ring under Tailwind 3.
- `tsconfig.json` pins `react` types to this app's copy; `apps/mcp` pulls in React 19 types that
  otherwise break the build's type check.
- Never run `next build` while `next dev` is running: they share `.next` and the dev server
  starts returning 500.

- Icons come from `react-icons/pi` (Phosphor), as in web. The exceptions are copies of web's own
  parts: the theme Sun and Moon, the checkbox tick, and `lucide-react` for the header search icon,
  which is what web's search bar uses.
- Tests sit next to the code (`pnpm test`, vitest). Pure logic gets a test; the fixtures test
  guards every client's layout.
- Pages are registered in `src/config/routes.ts`. A page that is not built yet has
  `isBuilt: false` and renders as plain text, not a dead link. Flip it when the page ships.

## Client setup flow

`/setup/organisation`, `/setup/tracking` and `/setup/goals`. A step is one file in
`src/features/setup/steps` plus an entry in `steps/index.ts` and its id in `steps/routes.ts`.
Organisation types, goals and access levels are lists in `src/features/setup/options`.

## Shell and theme

The header is web's `AppHeader` (route title, search, theme toggle), ported as it is; `ThemeToggle`
uses next-themes and the ui dropdown like web's. Search is a placeholder for now.

Dark mode: web's `.dark` block does **not** flip `--background`, `--foreground`, `--ink-500`,
`--hover-bg` or `--bg-input` (web adds `dark:` variants per element instead). Use the tokens that do
flip (`page-surface`, `block-surface`, `header-surface`, `ink-100`) instead of `background`,
`foreground` and `base-100`; the three raw ones above are overridden at the end of `globals.scss`.

## Overview (`/`)

The page is a list of **blocks** placed by a **layout** (rows of columns, each column a stack of
block ids), both in `OverviewData`. A client with a different layout is different data, not
different code.

- A block is a `_tag` in `src/features/overview/types.ts`, one card in `blocks/`, and a case in
  `BlockRenderer` (the switch ends in `exhaustiveCheck`, so a new tag fails to compile until it is
  handled). A block fed by a notebook result will be one more `_tag`.
- The data comes from `source.ts`, which today returns `fixtures/` (one file per client type).
  `standardLayout()` is the shared template.
- Three states: `ready`, `settingUp` (day one) and `calculating`.

### Welcome (first login)

`features/welcome/` renders the "Welcome to your Terminal" dialog over a ready Overview. Its copy is
data (`WelcomeContent`, one per client type) and `buildWelcome` adds the parts that come from the
session: the analyst and the kick-off call's time and length. `getWelcome()` returns `undefined`
when there is nothing to show; for now it always returns the welcome, so every load behaves like a
first login. "See what's on your Overview" hands off to the customize drawer.

## Sections and Briefing (`/briefing`)

Overview, Briefing, Analysis, Opportunities and Requests are tabs (`features/sections`), not
sidebar entries. `SectionHeader` renders the title, subtitle, actions and `SectionTabs` on every
section page; the tab counts come from `getSectionCounts()`. Tabs for pages that are not built yet
render inert (`isBuilt` in `config/routes.ts`) and become links when the flag flips.

Briefing is a master-detail inbox: a grouped, filterable list on the left and the selected item on
the right. `inbox-state.ts` holds the pure logic (filter, unread, selection) with tests, and
`useBriefingInbox` wraps it for the client. Read state is local to the page for now.

- An item is data (`BriefingItem` in `features/briefing/types.ts`): its detail is an optional
  headline metric, bar breakdown and "what / why" text, so a notebook result can fill any of them.
- `source.ts` returns `fixtures/`. Robinhood has hand-written detail; the other client types fall
  back to the Overview's briefing entries (`from-overview.ts`) with no detail.
- With no items the page shows the "You're up to date" state.

## Analysis (`/analysis`)

A catalogue of the research prepared for the client: "New for you" cards, then one table that can
be grouped by project, region or sector, searched and sorted.

- `AnalysisCatalog` (`features/analysis/types.ts`) is pure data: highlights plus a list of views.
  A view carries its own column names and row route, so a new grouping is one more entry, and the
  switcher disappears when a client has a single view.
- Filtering, sorting and the subtitle (reports and projects, summed from the data) are pure
  functions in `catalog-state.ts` with tests. Sorting is a comparator table, not a switch.
- `source.ts` returns `fixtures/`. Robinhood has the full set from the design (its projects add
  up to the Analysis tab count, which a test checks); the other client types build a projects-only
  view from the Overview's briefing entries (`from-overview.ts`), so their numbers are thin.
- Rows are real `<table>` rows with a stretched link, so the whole row is clickable and the
  table stays readable by screen readers.

### Project, region and sector pages (`/analysis/<kind>/<slug>`)

One route and one screen serve all three kinds. A page is data (`EntityPage` in
`features/analysis/entity/types.ts`): a header, a KPI strip, a "what this means for the client"
banner, then rows of typed blocks (`columnChart`, `barList`, `lineChart`, `dataTable`,
`reportList`, `opportunityList`). `BlockRenderer` ends in `exhaustiveCheck`, so a new block type
fails to compile until it is drawn. A block fed by a notebook result will be one more `_tag`.

- Charts are plain SVG and CSS, with the geometry in `chart-math.ts` (tested).
- Only rows that have a page are links (`AnalysisRow.hasPage`, set in the analysis fixtures).
  Robinhood has Paycrest, Latin America and Cash-out and off-ramps; every other row stays text.
- `AppLink` takes a `slug`, and the header title falls back to the closest registered route.

## Opportunities (`/opportunities`)

Ranked moves for the client, grouped by status (New, Reviewing, Pursuing) with a Passed bucket
behind its own filter.

- `features/opportunities/` owns the `Opportunity` type, the status icon and the confidence meter.
  The Overview's Opportunities card imports them, so the two pages cannot drift apart.
- Filtering and grouping are pure functions in `opportunity-state.ts` with tests. "All open" is
  derived from `OPEN_STATUSES`, and the counts on the filter chips are computed, not typed in.
- `source.ts` returns `fixtures/`. Robinhood has the design's seven (its open ones match the tab
  count, which a test checks); the other client types reuse the Overview's opportunities with no
  "when" column value. Values are fixtures labelled as Sandworm estimates.
- The empty state ("No opportunities yet") takes the analyst's name from the session.

## Requests and Commission research (`/requests`, `/requests/new`)

Requests is what the client has asked Sandworm for: an allowance strip, commissioned research with
a timeline and the analyst's note, and questions and calls. `/requests/new` is the Commission
dialog, rendered over the Requests page (as in the design) rather than over whichever page linked
to it, so closing it always lands on `/requests`.

- `features/requests/types.ts` holds the data. Statuses are `as const` lists, and `StatusChip` is a
  `Record` over them, so adding a status fails to compile until it has a style.
- `requests-state.ts` is pure and tested: `approveScope` moves a timeline on and starts the work,
  `withApprovedResearch` and `isResearchUsedUp` drive the allowance. Approving is local state for
  now; nothing is saved.
- The dialog (`commission/`) has three states: the form, "Request sent" and "You've used this
  quarter's research". Which one shows follows the allowance, not a flag. `draft.ts` (tested) holds
  the empty draft, validation (a question is required), the summary line and the sent timeline.
- `submitCommission` in `commission/actions.ts` is a stub. A new request does not yet appear in the
  list, and picked files are only named, not uploaded.
- Robinhood has the design's data. The other client types share a small generic set.

### Previewing client types and states

In dev only, `/dev/preview?client=<exchange|nft|protocol|chain|vc|accelerator>&status=<ready|settingUp|calculating>&briefing=<items|empty>&opportunities=<items|empty>&allowance=<available|used>`
sets cookies and redirects to `/`. The session, the Overview and the Briefing follow them. The
route returns 404 in production.

## Not wired up yet

- **Auth.** There is no sign-in; the session in `src/features/session` is a fixture. The plan is
  redirect-based SSO against web, reusing its OAuth server.
- **Persistence.** `saveSetupDraft` is a stub, and Customize does not save which blocks a user
  hid. There is no drag to reorder, and the library's "Add" is disabled until notebook-result
  blocks exist. Briefing's read state resets on reload.
- **Navigation and search.** There is no sidebar on purpose: whether to reuse web's or port its
  styling is still open. The header's search field is a placeholder.
- **Deploy.** The root `vercel.json` builds web only. Make terminal its own Vercel project with
  the root directory set to `apps/terminal`.
