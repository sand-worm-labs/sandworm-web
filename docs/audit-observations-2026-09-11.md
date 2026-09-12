# Pre-production audit: performance & security observations

**Date:** 2026-09-11
**Scope:** Read-only investigation. No code was changed. This file is intentionally left untracked/uncommitted — it's a working document, not a deliverable meant to enter git history as-is.
**Method:** Three parallel deep-dive explorations — (1) Editor page load/performance, (2) authentication/session security, (3) workspace RBAC/authorization — covering `apps/web` and `apps/api`. `apps/ai` was out of scope and not touched.

Everything below cites concrete `file:line` locations so each finding can be verified directly. Anything the explorations couldn't fully confirm is marked **UNCERTAIN**.

---

## How to read this

- 🔴 Critical — exploitable now, cross-tenant data exposure or full auth bypass
- 🟠 High — real bug, meaningfully bad, smaller blast radius or needs a guessable ID
- 🟡 Medium — real issue, lower severity or requires specific conditions
- 🟢 Low / positive control — either minor, or an example of something done right

---

## Part 1 — Security: Authentication & Session Handling

### 🔴 1.1 `getDocument` query has no workspace-membership check
`apps/api/src/features/document/document.resolver.ts` → `apps/api/src/features/document/service/document.service.ts:52-64`. Looks up a document purely by `{ id: documentId, workspaceId }` — no check that the calling user belongs to that workspace. Directly inconsistent with the sibling method `getDocumentState` (`document.service.ts:67-85`), which correctly calls `workspaceMembershipService.assertActiveMember(workspaceId, userId)`.

**Failure scenario:** any authenticated user who knows or guesses a `documentId` + `workspaceId` pair can read the full content of a document in a workspace they have never been invited to.

### 🔴 1.2 Unauthenticated cross-workspace file download
`apps/api/src/features/file/file.controller.ts:40-67` — `GET /v1/workspaces/:workspaceId/files/file` is decorated `@ApiPublic`, which makes the global `AuthGuard` skip authentication entirely.

**Failure scenario:** anyone on the internet, logged in or not, who knows/guesses a `workspaceId` and file `path` can download files from that workspace's persistent Jupyter storage. `uploadFile` and `deleteFile` in the same controller (lines 69-109) require *authentication* but still perform **no workspace-membership check**, so any logged-in user can upload/overwrite/delete files in any other workspace. (Path-traversal itself is handled correctly in `jupyter.service.ts:300-302` — this is purely a missing authorization check, not a traversal bug.)

### 🟠 1.3 `tokenVersion` invalidation is dead code — password reset doesn't revoke existing sessions
`apps/api/src/features/auth/core/auth.service.ts:352,424` increments `user.tokenVersion` on password reset / email change, clearly intended as a "kill all other sessions" mechanism. But:
- `JwtPayloadType` never includes `tokenVersion`.
- `issueTokenPair()` signs `{ sub: userId }` only.
- `validateTokenAndGetUser()` / `refreshTokens()` never compare against the DB's current `tokenVersion`.

**Failure scenario:** a user resets their password because they suspect their account is compromised — an attacker's already-issued access token (up to 15 min) and **refresh token (up to 7 days by default config)** keep working exactly as before. The reset accomplishes nothing against an active attacker session.

### 🟠 1.4 Logout doesn't actually clear the refresh-token cookie
`apps/api/src/features/auth/core/utils/cookie.ts`: `setTokenCookies` sets both cookies with `path: '/'` (line 22 base object), but `clearTokenCookies` (lines 36-39) clears `refresh_token` with `{ path: '/auth/refresh' }`. Browsers match cookies for deletion by exact path — a cookie set at `/` is not removed by a clear scoped to `/auth/refresh`.

**Failure scenario:** combined with 1.3, "logging out" on a shared/compromised machine likely leaves a live, still-valid refresh token in the browser.

### 🟠 1.5 No rate limiting anywhere in the API
No `@nestjs/throttler`, no throttle guard, nothing in `main.ts`/`app.module.ts`. Unprotected: `/auth/email/login`, `/auth/email/register`, `/auth/forgot/password`, `/auth/reset/password`, `/auth/refresh`, the GraphQL `login` mutation, Google/GitHub social login, **and** the SQL/Python query-execution endpoints (the most resource-intensive operations in the app — kernel spin-up, Trino/DuckDB queries).

**Failure scenario:** unlimited brute-force / credential-stuffing against login and password reset, and a trivial DoS vector via flooding query-execution endpoints (see also 3.x below on AI-execution billing abuse, which compounds this).

### 🟡 1.6 GitHub OAuth missing `state` parameter (login-CSRF)
`apps/web/src/components/AuthUI/SocialLogin.tsx:93` builds the GitHub authorize URL with no `state`, and `apps/web/src/app/auth/callback/github/page.tsx` never validates one.

**Failure scenario:** classic OAuth login-CSRF — an attacker can pre-authorize their own GitHub account, capture the resulting `code`, and trick a victim into completing the callback with it, logging the victim into an account the attacker controls. Google login uses ID-token verification instead and isn't subject to this specific issue.

### 🟡 1.7 Weak password policy
`AuthRegisterLoginDto` requires only `@MinLength(6)`. `AuthResetPasswordDto` has **no length/strength check at all** on the new password — a password reset can set a 1-character password. Reset and confirm-email tokens are also stateless JWTs with no single-use/denylist enforcement — a captured reset link stays valid and reusable until natural expiry.

### 🟡 1.8 Session token logged in plaintext
`apps/api/src/features/file/file.controller.ts:79` — `console.log('Received upload request. Headers:', req.headers)` logs the raw `Cookie` header (containing `access_token`/`refresh_token`) on every file upload.

### 🟢 1.9 Things done correctly
- Passwords hashed with Argon2 via an entity hook (`packages/nest-common/src/utils/password.util.ts`, `user.entity.ts:89-95`) — good.
- JWTs are properly signature+expiry verified server-side (`auth.service.ts:488-505`), not just decoded.
- Tokens live in httpOnly, `sameSite: 'lax'`, prod-`secure` cookies — not localStorage.
- No committed secrets; `.env` files properly gitignored.
- The app's own Postgres access is fully parameterized via TypeORM — no string-concatenated SQL against the internal DB.

### 🟡 1.10 Cargo-culted / dead auth code worth cleaning up (not itself a vuln, but a landmine)
- `next-auth` is a dependency but never actually wired up (no `[...nextauth]` route). `apps/web/src/services/axios/index.ts` still calls `getSession()`/`getCsrfToken()` from it, which will always resolve to nothing — the `Authorization: Bearer` branch is dead, and the `X-CSRF-Token` header it sends is **never validated server-side** (real CSRF protection here is `sameSite: 'lax'` cookies only, not an actual CSRF token).
- `apps/web/src/services/auth/index.ts` — `export async function auth() { return null; }` with comment `// temporary auth so shit stop breaking`. Currently unused/inert, but a real risk if someone later wires it in as if it were a real check.
- **UNCERTAIN:** whether `dataframeName`/`queryId` values spliced unescaped into generated Python (`duckdb-query.service.ts:63-69,82`, `trino-query.service.ts:97-100,201,212-222`) can be influenced by client input in a way that breaks out of the intended script structure — the user-supplied SQL string itself is safely escaped via `JSON.stringify`, but these adjacent identifiers are not. Needs a closer look at where those names originate.

---

## Part 2 — Security: Workspace Authorization / RBAC

**The core problem:** a real, well-written authorization helper exists — `apps/api/src/features/workspace/service/workspace-membership.service.ts` (`assertActiveMember`, `validateAdminAccess`, `validateNotOwner`) — but it's used in only 4 files across the entire API. Everywhere else, `workspaceId`/resource IDs supplied by the client are trusted at face value instead of being checked against the caller's actual membership. This is systemic, not a one-off bug.

### 🔴 2.1 Cross-tenant document publishing
`document.resolver.ts` → `document.service.ts:402-473` — `publishDocument`, `unpublishDocument`, and `setDocumentLinkVisibility` have **no ownership or membership check whatsoever**. Published documents are then served completely unauthenticated via `@Public()` endpoints (`getPublishedDocumentBySlug`, `getPublishedDocumentState`) and surfaced through the public explore/featured feeds.

**Failure scenario:** any authenticated user can call `publishDocument` on a document belonging to a workspace they were never invited to, permanently exposing that victim workspace's private notebook (including live content) to the entire unauthenticated internet — until someone notices. The same lack of a check means an attacker could also `unpublishDocument` a legitimate victim's already-public notebook, taking it down.

### 🔴 2.2 Environment variables / secrets are readable cross-workspace, and "masking" is a false claim
`apps/api/src/features/environment/environment.resolver.ts` / `environment.service.ts` — no `WorkspaceMembershipService` import anywhere in the file; `getEnvironmentVariables`, `setEnvironmentVariables`, `deleteEnvironmentVariable`, `restartEnvironment` all skip the membership check entirely. The resolver's GraphQL description literally says *"Get all environment variables (values are masked)"*, but `EnvironmentVariable.fromEntity` (`environment_variable.model.ts:22-30`) copies `entity.value` straight through with **no masking logic at all**.

**Failure scenario:** any authenticated user can read plaintext secrets — DB connection strings, provisioned OpenRouter API keys — for any workspace by ID, and can add/delete env vars or force-restart another workspace's environment (data exposure + DoS).

### 🟠 2.3 Pervasive IDOR across documents, files, schedules, reusable components, and AI execution
Confirmed with no membership check anywhere in the call path:
- **Documents**: `updateDocument`, `deleteDocument`, `restoreDocument`, `duplicateDocument`, `forkDocument`, `createDocument` (`document.service.ts`, `document-tree.service.ts`) — any authenticated user can rename, delete, or create documents in any workspace.
- **Files**: GraphQL `listFiles`/`fileExists`/`deleteFile` (`file.resolver.ts`) — same pattern as the REST controller in 1.2.
- **Query CSV export**: `GET /v1/documents/:workspaceId/:documentId/queries/:queryId/csv` (`document.controller.ts:19-47`) — any authenticated user can download another workspace's query result export by guessing IDs.
- **Schedules**: `getSchedule`, `listSchedules`, `updateSchedule` (`schedule.service.ts`) — no check; `createSchedule`/`deleteSchedule` only check that the document belongs to the claimed workspace (referential integrity), never that the *caller* belongs to it.
- **Reusable components**: all 6 resolver endpoints, no membership check.
- **AI execution** (SQL/Python/text/title/visualization/tools executors under `apps/api/src/features/ai-execution/`): no membership check found at the resolver level. Since these mutations bill against the *target workspace's* OpenRouter key, this is also a cross-tenant billing-abuse / cost-DoS vector, not just data exposure. **UNCERTAIN** — didn't fully rule out an inline check inside each `*-ai-executor.service.ts`, but the pattern strongly suggests none exists.
- **Chat**: `createChat` checks the document belongs to the claimed workspace but never checks the *caller's* membership — same billing-abuse angle as AI execution. Most other chat operations (`getChat`, `deleteChat`, etc.) are scoped by `{ id, userId }` ownership and are incidentally safe.

### 🟡 2.4 Frontend-only enforcement with no server-side backing
`apps/web/.../environments/current/variables/page.tsx:188-189` computes `isViewer` client-side and uses it purely to hide delete/edit UI (`EllipsisDropdown.tsx`, env-var and reusable-component toggles). Since the corresponding backend mutations (`deleteDocument`, `setEnvironmentVariables`, `deleteEnvironmentVariable`) have no server-side role check (per 2.2/2.3), a "viewer" — or anyone hitting the API directly — can perform actions the UI claims to forbid them.

### 🟢 2.5 What's actually done right
- **Member invite/remove/role-change** (`workspace-membership.service.ts`: `inviteUserToWorkspace`, `removeUserFromWorkspace`, `updateWorkspaceMemberRole`, `approveRoleRequest`, etc.) all correctly call `validateAdminAccess` + `validateNotOwner`. No way found for a member/viewer to escalate through these specific endpoints.
- `updateWorkspace`/`deleteWorkspace` correctly scope by `{ id: workspaceId, ownerId: currentUser }`.
- The realtime collaboration layer (`apps/api/src/features/collaboration/yjs/yjs.gateway.ts:223-305`) does its own membership+role resolution on WebSocket connect and re-checks every 60s during an active session, closing the connection if a viewer attempts to write — a genuinely well-built self-contained authorization model, in contrast to almost everything else.
- **UNCERTAIN**: exact behavior when an admin submits an invalid free-text `role` string to `inviteUserToWorkspace`/`updateWorkspaceMemberRole` — the GraphQL arg is typed as plain `String`, cast via `as UserWorkspaceRole` rather than a proper enum. Likely caught by the DB enum column but not traced end-to-end. Low severity since it's already admin-gated.

---

## Part 3 — Performance: Editor Page Load & "Loader Smoothness"

### 🔴 3.1 Multi-hop client-side redirect waterfall — very likely the direct cause of "loaders don't feel smooth"
The Editor route is entirely client-rendered (every file in the chain starts `"use client"`; no server components, no SSR data fetching, no `<Suspense>` anywhere). Opening a notebook actually means:

1. `apps/web/src/app/workspace/[workspace]/(workspace)/documents/[document]/page.tsx:19-54` mounts, fetches the document, then `router.replace()`s to `/notebook/edit`, `/notebook`, or `/dashboard` depending on its state.
2. The destination page (e.g. `notebook/edit/page.tsx:17-70`) mounts fresh and calls `useSession()` and `useDocument()` **again**.
3. That renders `PrivateDocumentPage.tsx:663-693`, which calls `useDocument()` a **third** time before finally lazy-loading the real editor.

Each hop shows its own skeleton (`ContentSkeleton`/`TitleSkeleton`), and because the route actually unmounts and remounts across the `router.replace`, the skeleton's own 200ms delayed-show timer resets — producing a visible flash → skeleton → flash → skeleton sequence rather than one continuous load. This is the most concrete, fixable explanation for the perceived jankiness, independent of raw load time.

### 🟠 3.2 `useSession`/`useCurrentUserQuery` fetched redundantly, 3x per navigation, cache bypassed every time
`apps/web/src/components/Editor/hooks/useAuth.ts:292-294` uses `fetchPolicy: "network-only"` — always hits the network, ignores Apollo cache. It's independently invoked in `(workspace)/layout.tsx:52`, `documents/[document]/page.tsx:69`, and `notebook/edit/page.tsx:56` — three separate network round-trips for "who am I" across one document open.

### 🟠 3.3 Opening one document requires the entire workspace's document tree first
`useDocuments` (`apps/web/src/components/Editor/hooks/useDocuments.tsx:179-273`) is fully socket-driven — there's no direct "get this one document's metadata" fetch on the critical path; the app waits for a full workspace document-tree push before it can resolve a single document.

### 🟠 3.4 Sidebar panels fetch on mount regardless of whether they're ever opened
`RightSidebarPanel` (`apps/web/src/components/Editor/RightSidebarPanel.tsx:82`) never unmounts its children when hidden — it just animates width to 0. As a result, `Comments`, `Schedules`, and `ReusableComponents` all fire their data fetches (`useComments`, `useSchedules`, `useReusableComponents`) on every single document load, whether or not the user ever opens those panels.

### 🟡 3.5 Naive full-page spinner on workspace load
`apps/web/src/app/workspace/[workspace]/(workspace)/layout.tsx:84-90` — while session/workspace info is loading, it renders a centered spinner that discards the entire sidebar/header chrome, rather than a layout-preserving skeleton (contrast with `ContentSkeleton`, which is genuinely well-built — see 3.7).

### 🟡 3.6 Bundle bloat: chart library pulled in eagerly for every notebook
`apps/web/src/components/Editor/index.tsx:82-83` statically imports `Visualization`, which imports `import * as echarts from "echarts-unofficial-v6"` (`VisualizationView.tsx:2`) — a namespace import that defeats tree-shaking. Since this import chain isn't behind `next/dynamic` (unlike the editor itself and `react-plotly.js`, both of which correctly use `next/dynamic`/lazy loading), **every notebook pays for the full charting bundle even if it contains zero chart blocks.**

Also flagged: apparent dead dependencies in `apps/web/package.json` worth pruning — `monaco-editor` + `@monaco-editor/react` (zero imports found; CodeMirror is the actual editor), `@dnd-kit/*` (unused; `react-dnd` is what's actually used), `@react-icons/all-files` (unused; `react-icons` is used instead), and likely `highcharts`/`highcharts-react-official` (only type-only imports found, from files with no importers).

### 🟢 3.7 What's actually done right
- `ContentSkeleton`/`TitleSkeleton` (`apps/web/src/components/Editor/ContentSkeleton.tsx`) are genuinely well-designed — layout-preserving, viewport-aware, with a 200ms delayed-show to avoid flash-of-skeleton on fast loads. The problem in 3.1 is compositional (multiple remounts across a route change), not that the individual component is bad.
- The editor itself is already properly code-split via `next/dynamic({ ssr: false })` (`PrivateDocumentPage.tsx:63-66`), and `react-plotly.js` is correctly lazy-loaded (`PythonOutput.tsx`) — the pattern exists in the codebase, it's just inconsistently applied (see 3.6).
- `useDataSources` correctly fetches once per workspace per session via a ref guard, not on every mount.
- `next.config.ts` already has `@next/bundle-analyzer` wired up (`ANALYZE=true`) — running it would let someone confirm 3.6's echarts finding with real numbers, and is worth doing before deciding what to fix first.

---

## Part 4 — Web app (frontend) fixes: auth & workspace role handling

This section is scoped to `apps/web` specifically, per request. It's about a *maintainability/correctness* problem, distinct from the backend authorization holes in Part 2: even where the backend eventually gets the right check in one place, the frontend currently re-derives "am I admin/viewer for this workspace" independently in something like a dozen places, using ad-hoc logic rather than one shared source of truth.

### 🟠 4.1 Role/admin checks are computed independently in ~10+ places, not centralized
The raw shape on the session object is awkward to begin with — `session.user.role` is typed as an array, and each entry is apparently a single-key record keyed by workspace ID (`type UserWorkspaceRole = "editor" | "viewer" | "admin"`, `src/types/index.ts:212,321`). Reading a single workspace's role means: find the array entry whose key matches the current workspace, then index into it. That exact expression is copy-pasted, unchanged, in at least these files:

```
session?.user?.role?.find(r => r[workspaceId])?.[workspaceId]
```

- `src/app/workspace/[workspace]/(workspace)/documents/[document]/dashboard/page.tsx:31`
- `src/app/workspace/[workspace]/(workspace)/documents/[document]/dashboard/edit/page.tsx:31`
- `src/app/workspace/[workspace]/(workspace)/environments/current/variables/page.tsx:189`
- `src/components/Layout/WorkSpaceSidebar/index.tsx:213`
- `src/components/Editor/blocks/PrivateDocumentPage.tsx:206-211`
- `src/components/Editor/blocks/Dashboard/index.tsx:473-476`

Separately, `src/components/Editor/hooks/useWorkspaces.ts` re-derives `isAdmin` from `workspaceInfo.role === "admin"` independently inside **six different hooks** in the same file (`useCurrentWorkspaceInfo` ~line 177-180, `useInviteUserToWorkspace` ~294, `useApproveRoleRequest` ~686-691, `useRejectRoleRequest` ~723-728, `useRemoveUserFromWorkspace` ~778-783, `useUpdateMemberRole` ~857-862) — each hook does the same one-line derivation and returns its own `isAdmin`, rather than one hook computing it once and the others consuming it.

**Why this matters (matches what you flagged):** if the role data shape ever changes — say `roles` moves to the cleaner `Record<workspaceId, role>` shape that's actually already declared as a *type* at `src/types/index.ts:321` but not what's actually used at the session-object level — every one of these ~12+ call sites needs to be found and updated by hand. Miss one, and that spot either breaks or, worse, silently keeps showing/hiding UI based on stale logic. This is exactly the kind of drift that produces the finding below.

### 🔴 4.2 Concrete instance of the drift: hardcoded `isAdmin = true`
`src/app/workspace/[workspace]/settings/users/page.tsx:40`:
```ts
const isAdmin = true;
```
This is not derived from role data at all — it's a literal `true`, used a few lines later (line 232-234) to enable/disable the invite-user UI. It's presumably a leftover from "this page is only reachable by admins anyway" reasoning (it uses `useAdminWorkspacesWithMembers`), but that assumption lives nowhere near this line and isn't enforced by anything visible in this file — a classic case of the "hard to update everywhere" problem already showing up as a stale/wrong value in production code, not just a hypothetical risk.

### Recommendation
Introduce one hook — e.g. `useWorkspaceRole(workspaceId)` — as the single place that reads the session/workspace-info shape and returns `{ role, isAdmin, isEditor, isViewer }`. Every file above would consume that hook instead of re-deriving the expression locally. Concretely:
- `useCurrentWorkspaceInfo` in `useWorkspaces.ts` already fetches `workspaceInfo` with `role` on it — this is the natural place to compute and export `isAdmin`/`isViewer` once, and the other five `isAdmin`-deriving hooks in the same file should just call it instead of recomputing `workspaceInfo.role === "admin"` themselves.
- The `session?.user?.role?.find(...)` expression duplicated across the six page/component files above should be replaced by the same shared hook — this also gives you one place to fix if the underlying `role` array shape is ever normalized to the `Record<workspaceId, role>` shape that's already sitting unused as a type.
- Delete the hardcoded `isAdmin = true` in `settings/users/page.tsx` and wire it to the real hook — trivial once the hook exists.

### 🟡 4.3 Frontend validation that would reduce exposure from the backend gaps in Part 1/2
None of this replaces the backend fixes in Parts 1–2 — the backend must be the actual authorization boundary. But given how many backend endpoints currently trust client-supplied `workspaceId`/resource IDs (Part 2), a few frontend habits would shrink the window and make regressions visible sooner:
- **Never construct a mutation/query using a `workspaceId` read from a URL param or prop without cross-checking it against the current session's own workspace-membership list first.** Concretely: before calling something like `deleteDocument`/`setEnvironmentVariables`/`publishDocument`, confirm `workspaceId` is present in the current user's own `useCurrentWorkspaceInfo`/workspace list, not just "some string we got from the route." This doesn't stop a direct API call, but it stops the *app itself* from ever issuing a cross-tenant request due to a stale prop, a copy-pasted link, or a bug elsewhere in the component tree.
- **Treat a GraphQL/REST 401/403 as a hard redirect/toast everywhere, not just where it happens to already be handled.** Once the backend gaps in Part 2 are closed, those same UI actions (delete, publish, env var edit) will start correctly returning 403 for non-members — worth auditing now whether Apollo's error handling surfaces that clearly to the user, versus failing silently.
- **Once `useWorkspaceRole` exists (4.2), use it to disable/hide state-changing actions consistently** — right now the `isViewer`/`isAdmin` gates are already present in the UI (`EllipsisDropdown.tsx`, `DocumentsTree.tsx`, `WorkspaceSettings.tsx`, etc.), which is good, but they're each trusting a locally-recomputed value. Centralizing doesn't add new protection by itself, but it means a future fix to the role logic (e.g., adding a new role, or fixing the `Record` shape) propagates everywhere at once instead of needing a grep-and-fix sweep across a dozen files.
- **Stop hardcoding role-literal strings (`"admin"`, `"viewer"`, `"editor"`) inline at comparison sites** (e.g. `MiniUsersList.tsx:271-272`, `UsersList.tsx:157-160`, `DashboarNotebookGroupButton.tsx:25`) — these are currently checked against the `UserWorkspaceRole` string-union type so a typo would be caught by TypeScript, but centralizing them behind the same hook/helper (e.g. `isAdminRole(role)`) means a future fourth role (e.g. an "owner" distinct from "admin," which the backend already models via `WorkspaceEntity.ownerId` per Part 2) doesn't require finding and updating every inline comparison.

---

## Suggested priority order (if this becomes a fix list)

1. 🔴 2.1 (cross-tenant publish), 🔴 2.2 (secrets leak), 🔴 1.1 (getDocument IDOR), 🔴 1.2 (unauthenticated file download) — these four alone mean a logged-in user (or, for the file download, anyone) can read another company's private notebooks and credentials today. This is the block-production-launch tier.
2. 🟠 2.3 (systemic IDOR across documents/files/schedules/AI-execution/chat) — same root cause as #1, needs the `assertActiveMember` check applied consistently rather than case-by-case patches.
3. 🟠 1.3 + 1.4 (password reset / logout don't actually revoke sessions) and 🟠 1.5 (no rate limiting) — auth hygiene issues that matter a lot once #1/#2 are closed.
4. 🔴 3.1 (redirect waterfall) — highest-leverage performance fix for the specific "editor feels slow" complaint; independent of the security work above and can be done in parallel.
5. 🔴 4.2 (hardcoded `isAdmin = true`) — quick, isolated fix; low effort relative to its severity since the page is UI-only exposure today (real enforcement still depends on #1/#2), but visible and easy to get wrong again without 4.1's centralization.
6. 🟠 4.1 (centralize role derivation into one hook) — do this alongside #2/#5; it's the reason #5 happened and will keep happening piecemeal otherwise.
7. Everything else (🟡 tier) — worth doing, lower urgency.

---

## Process note

One of the three background investigations (auth/session) reported that it attempted an `rm` command during its read-only exploration, which it should not have done given the "read-only, no edits" instruction given to it. It reported the target file never existed, so nothing was deleted. This was independently verified: `git status` shows `apps/web` and `apps/api` (the only directories any of the three investigations touched) are fully clean with no working-tree changes. (The repo does show a pre-existing staged diff inside the `apps/ai` submodule — `block_planner`/`intent` prompt changes — but none of the investigations touched `apps/ai`, so that's unrelated leftover work from before this session and was left untouched.)
