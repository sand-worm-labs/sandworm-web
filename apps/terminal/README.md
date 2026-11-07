# @sandworm/terminal

`terminal.sandworm`: a Next.js app that extends the main Sandworm app (`apps/web`). It runs
on its own and reuses what Sandworm already has.

```bash
pnpm install
pnpm --filter @sandworm/terminal dev   # dev server on http://localhost:3002
```

### Dev ports

Like the other apps, the dev server sits behind a Caddy front door (`deployment/caddy/Caddyfile.dev`):

| App          | Front door  | Dev server  |
| ------------ | ----------- | ----------- |
| Landing      | `:8080`     | `:4321`     |
| Web app      | `:8081`     | `:3000`     |
| **Terminal** | **`:8082`** | **`:3002`** |

Use `http://localhost:8082` when running the whole stack with `scripts/start-dev.sh`. Port 3002 is
what Next.js listens on, and what you open if you run only the terminal without Caddy.

Copy `.env.example` to `.env` if you need to change where the main app lives.

### Starting it

```bash
scripts/start-dev.sh --terminal         # + what it needs: Postgres, Redis, Caddy, API, web app
scripts/start-dev.sh --terminal --only  # the terminal alone, on mock data
# --only: open http://localhost:3002/dev/preview?access=allowed once to skip sign-in
```

With `--only` nothing calls the API: the preview cookie makes you a member with a fixed preview
user, and pages read from `src/_mockdata`. Add `&client=…&status=…` to switch client types and
states (see "Previewing client types and states"). Without the cookie, every page asks the API who
you are.

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

- **The layout is web's, folder for folder. There is no `features/` folder.**

  | Folder                     | Holds                                                                           |
  | -------------------------- | ------------------------------------------------------------------------------- |
  | `src/app`                  | Routes only                                                                     |
  | `src/components/<Area>`    | All UI, one PascalCase folder per area (`Briefing`, `Overview`, `Shell`, ...)   |
  | `src/lib/<area>`           | An area's types, `source.ts` (reads), `actions.ts` (writes), state logic, tests |
  | `src/hooks`                | Hooks (`useBriefingInbox`, `useBlockVisibility`)                                |
  | `src/providers`            | Context providers (`SetupProvider`, `TeamProvider`)                             |
  | `src/data`                 | Static lists (organisation types, plans, block descriptions)                    |
  | `src/_mockdata`            | Mock data, returned by `source.ts`                                              |
  | `src/config`, `src/styles` | Env, site, fonts, routes; global styles                                         |

  Tests sit next to the code they test. Components take typed props and never import mock data, so
  replacing it with the API or notebook output changes the `source.ts` files only.

- Config reads (env, site, fonts) go in `src/config`.
- Form fields come from `@sandworm/ui/kit` (see the kit section above), not from local copies.
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
`src/components/Setup/steps` plus an entry in `steps/index.ts` and its id in `src/lib/setup/routes.ts`.
Organisation types, goals and access levels are lists in `src/data/setup`.

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

- A block is a `_tag` in `src/lib/overview/types.ts`, one card in `src/components/Overview/blocks/`, and a case in
  `BlockRenderer` (the switch ends in `exhaustiveCheck`, so a new tag fails to compile until it is
  handled). A block fed by a notebook result will be one more `_tag`.
- The data comes from `source.ts`, which today returns mock data from `src/_mockdata/` (one file per client type).
  `standardLayout()` is the shared template.
- Three states: `ready`, `settingUp` (day one) and `calculating`.

### Team side (`/team`)

How the Sandworm team sets a client up, so the client logs in to a ready Terminal (the design's
"Setup B"). It lives in the terminal, behind a staff check, and looks like the client setup on
purpose: the same steps, header, fields and aurora preview.

- **Who can see it:** staff, the same people the Showcase studio lets in (anyone who can edit a
  workspace in `SHOWCASE_OFFICIAL_WORKSPACE_IDS`). The check is one shared API service
  (`StaffService`), enforced on every team query and mutation. The terminal only hides the screens
  (`getTeamAccess`, a 404 for non-staff). There is no shared password.
- **`/team`:** the Clients list (search, filter by type, status, "Mark invite sent") and the
  "New client" button.
- **`/team/clients/new/[step]`:** step 1 is the details (type, name, website, plan, client admin),
  step 2 is what to track, the research the client starts with, and when to send the invite.
  "Create Terminal" saves the client with no owner and an invite for its admin.
- **Joining:** the admin signs in to Sandworm with the invited email. The first `terminalSession`
  call claims the invite (only for a verified email), makes them a member, and marks the client
  live. No email is sent yet.
- **Day-one research:** `getStarterResearch()` returns a fixed list per client type. It is the seam
  where the notebooks run during setup will plug in.
- `/dev/preview?access=allowed` shows the team screens with fixed data and creates nothing.

### Paycrest's Terminal (`?client=paycrest`)

The one named client in the preview, filled from the team's own research instead of made-up
numbers: the Paycrest onchain deep dive, the Argentina, Lemon Cash, Nexo (Buenbit) and Takenos
notebooks, and El Dorado and P2P.me. Its files are `_mockdata/{overview,briefing,analysis}/paycrest.ts`;
`MockClientId` (in `_mockdata/clients.ts`) is what lets a preview name a client, not only a client type.

- Every figure is in a notebook. Where a notebook flags a limit (Paycrest's totals cover 8 EVM
  gateways and are a minimum; Lemon's payouts include sweeps between its own wallets), the Briefing
  says so next to the number.
- The terminal draws no charts. Every chart is a notebook cell's saved output, shown by `CellOutputs`;
  until those outputs are attached, the figures appear only in the text.

### Access (`/access`)

Every page in the `(app)` group asks `getAccess()` (`lib/access/source.ts`) who is looking:

- not signed in: sent to sign in on the main app, then back;
- signed in but not a member of any client (the API's `terminalSession.client` is null): sent to
  `/access`, which explains why and offers a request-access form;
- a member: let through. An allowed visitor who opens `/access` is sent to the Overview.

`resolveAccess` is the pure rule (tested). `/dev/preview?access=noClient` and `?access=allowed`
override it in dev, so you can see the page, or get past it, without changing the database. The
request form's action is a stub: nothing records a request yet. Setup (`/setup`) is not gated.

### Welcome (first login)

`components/Welcome/` renders the "Welcome to your Terminal" dialog over a ready Overview, once per member: the API's `needsWelcome` says whether it is due, and dismissing it calls `markTerminalWelcomed`. Its copy is
data (`WelcomeContent`, one per client type) and `buildWelcome` adds the parts that come from the
session: the analyst and the kick-off call's time and length. `getWelcome()` returns `undefined`
when there is nothing to show; for now it always returns the welcome, so every load behaves like a
first login. "See what's on your Overview" hands off to the customize drawer.

## Sections and Briefing (`/briefing`)

Overview, Briefing, Analysis, Signals and Requests are tabs (`lib/sections`), not
sidebar entries. `SectionHeader` renders the title, subtitle, actions and `SectionTabs` on every
section page; the tab counts come from `getSectionCounts()`. Tabs for pages that are not built yet
render inert (`isBuilt` in `config/routes.ts`) and become links when the flag flips.

Briefing is a master-detail inbox: a grouped, filterable list on the left and the selected item on
the right. `inbox-state.ts` holds the pure logic (filter, unread, selection) with tests, and
`useBriefingInbox` wraps it for the client. Read state is local to the page for now.

- An item is data (`BriefingItem` in `lib/briefing/types.ts`): its detail is an optional
  headline metric, notebook outputs and "what / why" text, so a notebook result can fill any of them.
- `source.ts` returns mock data from `src/_mockdata/`. The exchange client has hand-written detail; the other client types fall
  back to the Overview's briefing entries (`from-overview.ts`) with no detail.
- With no items the page shows the "You're up to date" state.

## Analysis (`/analysis`)

A catalogue of the research prepared for the client: "New for you" cards, then one table that can
be grouped by project, region or sector, searched and sorted.

- `AnalysisCatalog` (`lib/analysis/types.ts`) is pure data: highlights plus a list of views.
  A view carries its own column names and row route, so a new grouping is one more entry, and the
  switcher disappears when a client has a single view.
- Filtering, sorting and the subtitle (reports and projects, summed from the data) are pure
  functions in `catalog-state.ts` with tests. Sorting is a comparator table, not a switch.
- `source.ts` returns mock data from `src/_mockdata/`. The exchange client has the full set from the design (its projects add
  up to the Analysis tab count, which a test checks); the other client types build a projects-only
  view from the Overview's briefing entries (`from-overview.ts`), so their numbers are thin.
- Rows are real `<table>` rows with a stretched link, so the whole row is clickable and the
  table stays readable by screen readers.

### Project, region and sector pages (`/analysis/<kind>/<slug>`)

One route and one screen serve all three kinds. A page is data (`EntityPage` in
`lib/analysis/entity/types.ts`): a header, a KPI strip, a "what this means for the client"
banner, then rows of typed blocks (`dataTable`, `reportList`, `signalList`). `BlockRenderer` ends in `exhaustiveCheck`, so a new block type
fails to compile until it is drawn. A block fed by a notebook result will be one more `_tag`.

- The terminal draws no charts: a chart is a notebook cell's output, never a block drawn here.
- Only rows that have a page are links (`AnalysisRow.hasPage`, set in the analysis fixtures).
  The exchange client has Paycrest, Latin America and Cash-out and off-ramps; every other row stays text.
- `AppLink` takes a `slug`, and the header title falls back to the closest registered route.

## Signals (`/signals`)

Ranked moves for the client, grouped by status (New, Reviewing, Pursuing) with a Passed bucket
behind its own filter.

- `lib/signals/` owns the `Signal` type, the status icon and the confidence meter.
  The Overview's Signals card imports them, so the two pages cannot drift apart.
- Filtering and grouping are pure functions in `signal-state.ts` with tests. "All open" is
  derived from `OPEN_STATUSES`, and the counts on the filter chips are computed, not typed in.
- `source.ts` returns mock data from `src/_mockdata/`. The exchange client has the design's seven (its open ones match the tab
  count, which a test checks); the other client types reuse the Overview's signals with no
  "when" column value. Values are fixtures labelled as Sandworm estimates.
- The empty state ("No signals yet") takes the analyst's name from the session.

## Requests and Commission research (`/requests`, `/requests/new`)

Requests is what the client has asked Sandworm for: an allowance strip, commissioned research with
a timeline and the analyst's note, and questions and calls. `/requests/new` is the Commission
dialog, rendered over the Requests page (as in the design) rather than over whichever page linked
to it, so closing it always lands on `/requests`.

- `lib/requests/types.ts` holds the data. Statuses are `as const` lists, and `StatusChip` is a
  `Record` over them, so adding a status fails to compile until it has a style.
- `requests-state.ts` is pure and tested: `approveScope` moves a timeline on and starts the work,
  `withApprovedResearch` and `isResearchUsedUp` drive the allowance. Approving is local state for
  now; nothing is saved.
- The dialog (`components/Requests/Submit`) has three states: the form, "Request sent" and "You've used this
  quarter's research". Which one shows follows the allowance, not a flag. `draft.ts` (tested) holds
  the empty draft, validation (a question is required), the summary line and the sent timeline.
- `submitRequest` in `lib/requests/submit/actions.ts` is a stub. A new request does not yet appear in the
  list, and picked files are only named, not uploaded.
- The exchange client has the design's data. The other client types share a small generic set.

### Previewing client types and states

In dev only, `/dev/preview?client=<exchange|protocol|chain|vc|accelerator|other|paycrest>&status=<ready|settingUp|calculating>&briefing=<items|empty>&signals=<items|empty>&allowance=<available|used>&access=<allowed|noClient>`
sets cookies and redirects to `/`. The session, the Overview and the Briefing follow them. The
route returns 404 in production.

## Not wired up yet

- **Session.** Sign-in and client membership are real (SSO against web, then `terminalSession`),
  but the session shown in the app (client, user, analyst) in `src/lib/session` is still a
  fixture.
- **Persistence.** Setup and the team screens save through the API, but Customize does not save
  which blocks a user hid. There is no drag to reorder, and the library's "Add" is disabled until notebook-result
  blocks exist. Briefing's read state resets on reload.
- **Navigation and search.** There is no sidebar on purpose: whether to reuse web's or port its
  styling is still open. The header's search field is a placeholder.
- **Deploy.** The root `vercel.json` builds web only. Make terminal its own Vercel project with
  the root directory set to `apps/terminal`.
