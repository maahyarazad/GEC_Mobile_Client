# Phase 0 Research: Knowledge Base

**Feature**: `001-knowledge-base` | **Date**: 2026-08-19

All Technical Context unknowns are resolved below. No `NEEDS CLARIFICATION` markers remain.

---

## R1. Where does the catalog live — static module, backend, or CMS?

**Decision**: A typed TypeScript constant at `src/pages/KnowledgeBase/knowledgeBaseItems.ts`, exported as `readonly KnowledgeBaseItem[]`.

**Rationale**: The spec states the sections are static (FR-004). A compile-time constant gives type safety on every field, zero network latency, zero failure modes, and no backend coordination. The API is a separate service that would need its own change cycle for content the team edits perhaps twice a year. Search and filtering over six in-memory objects need no server.

**Alternatives considered**:
- *Backend endpoint* — rejected: cross-repo work, a loading state, an error state, and a cache, all to serve six constants.
- *JSON file in `public/`* — rejected: loses type checking and adds a fetch for data the bundle can inline.
- *Admin-editable CMS entries* — rejected: explicitly out of scope; the user specified static content.

---

## R2. How are tutorial videos hosted and referenced?

**Decision**: Each entry carries an optional `videoUrl?: string`. Absolute URLs are used as-is; the catalog documents that files are expected under the existing GEC file store (the same host `SERVER_URL` in `src/utils/constants/constants.ts` points at, which `src/services/File/FileList.service.ts` already builds URLs against). Entries ship with `videoUrl` omitted until real files exist, and the UI renders a "coming soon" state for those (FR-007).

**Rationale**: Video production is not part of this feature, and blocking the screen on unproduced assets would deliver nothing. Making the field optional with an explicit empty state means the feature ships complete and each video becomes a one-line catalog edit later. Reusing the existing file host avoids adding a CDN or a storage decision.

**Note for the team**: the existing uploader at `src/pages/FilesPage/FileUploader.tsx` sets `accept="image/*"` and `maxFileSize={10000000}` (10 MB). It is *not* usable for video today. Uploading tutorial videos is an out-of-band operation (or a separate change to that uploader) — this feature only consumes URLs and does not depend on that uploader.

**Alternatives considered**:
- *Bundle videos in `src/assets/` or `public/`* — rejected: video files would bloat the build artifact and every deploy.
- *Embed YouTube/Vimeo iframes* — rejected: internal admin training material on a third-party host; also adds an external network dependency to an internal tool.
- *Make `videoUrl` required* — rejected: would block the entire feature on video production.

---

## R3. Which player — native `<video>` or a library?

**Decision**: Native HTML5 `<video controls preload="none">` inside a PrimeReact `Dialog`, with an `onError` handler rendering a readable message.

**Rationale**: `controls` gives play/pause, seek, volume, and fullscreen for free in every target browser, satisfying FR-006 with no dependency (a hard constraint). `preload="none"` satisfies FR-017 and SC-005 — no video bytes are requested until the user opens a player. PrimeReact `Dialog` is already used in `PartnerOnboarding.tsx`, so the modal behaviour and styling match the app.

**Playback-stop mechanics**: keep a `useRef<HTMLVideoElement>`; on dialog `onHide` and before any quick-access navigation, call `pause()` and reset `currentTime = 0`. Rendering the `<video>` only while the dialog is open (conditional render) additionally guarantees teardown, satisfying FR-015.

**Alternatives considered**:
- *`video.js` / `react-player`* — rejected: a new dependency for controls the browser already provides.
- *Inline player per card (no modal)* — rejected: six players on one page, and a small viewport makes each unusably small.

---

## R4. How is search implemented?

**Decision**: Controlled `InputText` inside PrimeReact `IconField`/`InputIcon` (the exact pattern in `PartnerOnboarding.tsx`), filtering in a `useMemo` over the catalog. Match = query trimmed and lowercased, tested with `String.prototype.includes` against the lowercased concatenation of `title`, `description`, and `keywords`.

**Rationale**: `includes` on lowercased strings is literal by construction, so FR-012's "treat the query as literal text" holds with no escaping — a `RegExp` built from user input would need `.` and `*` escaped and could throw. Six entries filter faster than a frame, so no debounce is warranted (adding one would only make typing feel laggy). A `keywords` field lets an entry match vocabulary the user might type ("report", "tags", "offers") without padding the visible description.

**Alternatives considered**:
- *Fuzzy search (Fuse.js)* — rejected: new dependency, and fuzzy matching over six items produces confusing near-matches.
- *PrimeReact `DataTable` global filter* — rejected: a table is the wrong presentation for six video cards; the app already uses `DataTable` where tabular data warrants it.
- *Regex matching* — rejected: violates FR-012 and risks a thrown `SyntaxError` on input like `(`.

---

## R5. Where does the route and sidebar entry go?

**Decision**: Route `knowledge-base` registered inside the existing `<Route element={<ProtectedRoute />}>` block in `src/components/PageContainer/PageContainer.tsx`, immediately after the `partner-onboarding` route. Sidebar entry appended to `links` in `src/components/Navbar/links.tsx` after *Partner Onboarding* and before *Log Out*.

**Rationale**: "Under the Partner Onboarding" in the request refers to sidebar position, and placing the entry last before *Log Out* matches that literally. Registering inside `ProtectedRoute` inherits the existing auth redirect for free (FR-001) and gives the unauthenticated-deep-link behaviour the spec's edge cases require. `TitleManager` already derives `document.title` from the path, so `/knowledge-base` yields "GEC Mobile Application – Admin Panel | Knowledge Base" with no extra code — FR-016 is satisfied by placement alone.

**Sidebar active-state note**: `Navbar.tsx` computes `isActive` as `location.pathname.split('/')[1] === link.link.replace(/^\//, '')`. A single-segment path `/knowledge-base` matches that comparison directly, so highlighting works with no change to `Navbar.tsx`.

**Alternatives considered**:
- *Nest as `/partner-onboarding/knowledge-base`* — rejected: the Knowledge Base covers six areas of the panel, only one of which is Partner Onboarding; nesting it there would misrepresent its scope and hide it from users who skip that section.
- *A collapsible sidebar sub-menu* — rejected: `Navbar.tsx` renders a flat list with no nesting support; adding hierarchy is a larger change than this feature warrants.

---

## R6. Which icon marks the sidebar entry and the quick-access control?

**Decision**: Sidebar — `MdMenuBook` from `react-icons/md`, imported alongside the existing icons in `links.tsx`. Quick access — PrimeReact's `pi pi-external-link` on a `Button` with `text`/`rounded` styling and an `aria-label`.

**Rationale**: `links.tsx` imports exclusively from `react-icons/md`, and the file's `RIIcon` cast in `Navbar.tsx` expects that shape — using any other set would break the existing typing workaround. `MdMenuBook` reads unambiguously as documentation and is unused elsewhere in the list. For quick access, `pi pi-external-link` is the app's own icon font and conveys "go there" without implying the destination opens in a new tab of the browser (it does not — navigation is in-app).

**Alternatives considered**:
- *`MdHelp` / `MdSchool`* — viable; `MdMenuBook` chosen as it reads as reference material rather than support chat or coursework.
- *A text "Go to section" button* — rejected: the request explicitly asks for an icon next to the entry.

---

## R7. How does quick access respect role permissions?

**Decision**: Each catalog entry carries `targetAppId?: number` matching the `id` values already in `links.tsx`. The page reads `StorageService.retrieveRoles()` once and treats a target as permitted when the entry has no `targetAppId` (Dashboard) or when a role exists with that `appId` and `r === '1'` — the exact predicate `Navbar.tsx` uses to filter sidebar links. A denied target renders a disabled quick-access button with an explanatory tooltip.

**Rationale**: Without this, a user whose role hides *Push Notification* from the sidebar could still be routed there by a Knowledge Base icon, landing on a screen they cannot use. Reusing the identical predicate keeps the two places consistent — if the sidebar hides it, quick access disables it. The `appId` mapping is direct: Dashboard `undefined`, Access Requests `75`, Partner Categories `76`, User List `79`, Push Notification `82`, Partner Onboarding `88`.

**Note on the Partner Categories mapping**: `/category/partner` has no sidebar link of its own and therefore no `appId`. Partner category management is reached through partner administration, so this entry maps to `76` (*Partner List*), the permission that already governs partner data. Confirm with the product owner before release if a different permission is intended.

**Note on `retrieveRoles()` timing**: `Navbar.tsx` polls for roles (up to ten 500 ms attempts) because they arrive asynchronously after login. The Knowledge Base page must tolerate roles being briefly `null` — treat that as "not yet known" and render quick access in a disabled/pending state rather than as permanently denied, re-reading once roles are populated.

**Alternatives considered**:
- *Hide denied entries entirely* — rejected: the tutorial itself still has value (the user may be about to request access), and hiding entries would make the "six static sections" list inconsistent between users.
- *Navigate anyway and let the destination fail* — rejected: violates FR-010 and SC-007, and produces a confusing dead end.

---

## R8. Testing approach

**Decision**: Component tests with React Testing Library under `src/pages/KnowledgeBase/__tests__/`, run by the existing `npm test` (`react-scripts test`). Cover: all six entries render; search narrows and clears; a no-match query shows the empty state; a query with regex-special characters does not throw; a denied `targetAppId` disables quick access; opening then closing the dialog leaves search text intact.

**Rationale**: The repository ships no tests today, so there is no existing convention to follow and no suite to keep green — but `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` are already installed and `react-scripts test` is already wired, so tests cost nothing in setup. The listed cases are exactly the behaviours the spec's acceptance scenarios describe, and each is a pure render-and-assert with no network or backend.

**Alternatives considered**:
- *End-to-end (Playwright/Cypress)* — rejected: no E2E harness exists in this repo; standing one up is a much larger change than this feature justifies.
- *No automated tests* — rejected: the role-gating and literal-search behaviours are exactly the kind of logic that regresses silently.

---

## Resolved Technical Context summary

| Unknown | Resolution |
|---|---|
| Catalog source | Static typed TS module (R1) |
| Video hosting | Optional URL in catalog, existing file host, empty state when absent (R2) |
| Player | Native `<video controls preload="none">` in PrimeReact `Dialog` (R3) |
| Search | `useMemo` + lowercased `includes` over title/description/keywords (R4) |
| Route + nav placement | `/knowledge-base` under `ProtectedRoute`; sidebar entry after Partner Onboarding (R5) |
| Icons | `MdMenuBook` (sidebar), `pi pi-external-link` (quick access) (R6) |
| Permissions | Reuse `retrieveRoles()` + `appId`/`r === '1'` predicate (R7) |
| Testing | React Testing Library via existing `react-scripts test` (R8) |
