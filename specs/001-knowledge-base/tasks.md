---
description: "Task list for Knowledge Base feature implementation"
---

# Tasks: Knowledge Base

**Input**: Design documents from `/specs/001-knowledge-base/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Test tasks ARE included. This is not a TDD mandate from the spec — it follows research decision **R8**, which selected React Testing Library via the already-installed `react-scripts test`. Each story's tests cover exactly that story's acceptance scenarios. If the team decides to skip automated tests, delete the test subsections; every implementation task stands on its own.

**Organization**: Tasks are grouped by user story so each can be implemented, tested, and demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task serves (US1, US2, US3)
- Every task names an exact file path

## Path Conventions

Single-project React SPA (see plan.md "Structure Decision"). All new code lives under `src/pages/KnowledgeBase/`; two existing files receive one registration each.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature directory and its type contract

- [X] T001 Create the feature directory `src/pages/KnowledgeBase/` and add `src/pages/KnowledgeBase/index.tsx` re-exporting the page (`export { default } from './KnowledgeBase'`), matching the pattern in `src/pages/FilesPage/index.tsx`
- [X] T002 [P] Define the `KnowledgeBaseItem` interface in `src/pages/KnowledgeBase/types.ts` with all seven fields (`id`, `title`, `description`, `keywords?`, `videoUrl?`, `targetRoute`, `targetAppId?`) exactly as specified in `specs/001-knowledge-base/contracts/knowledge-base-catalog.md`, all members `readonly`
- [X] T003 [P] Create an empty feature stylesheet `src/pages/KnowledgeBase/KnowledgeBase.css` and confirm the import convention used by `src/pages/PartnerOnboarding/PartnerOnboarding.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The catalog, the route, the sidebar entry, and the bare list — everything all three user stories build on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. US1 (video), US2 (quick access), and US3 (search) all render into the card built here.

- [X] T004 Create the static catalog in `src/pages/KnowledgeBase/knowledgeBaseItems.ts`, exporting `KNOWLEDGE_BASE_ITEMS: readonly KnowledgeBaseItem[]` with all six entries — ids, titles, descriptions, keywords, `targetRoute`, and `targetAppId` copied verbatim from the tables in `specs/001-knowledge-base/data-model.md`. Omit `videoUrl` on every entry (videos are not yet produced; see research R2). Depends on T002.
- [X] T005 [P] Register the protected route in `src/components/PageContainer/PageContainer.tsx`: import `KnowledgeBase` from `../../pages/KnowledgeBase` and add `<Route path={"knowledge-base"} element={<KnowledgeBase />} />` inside the existing `<Route element={<ProtectedRoute />}>` block, immediately after the `partner-onboarding` route
- [X] T006 [P] Add the sidebar entry in `src/components/Navbar/links.tsx`: import `MdMenuBook` alongside the existing `react-icons/md` imports and append `{ name: "Knowledge Base", link: "/knowledge-base", icon: MdMenuBook }` after the *Partner Onboarding* entry and before *Log Out*. Deliberately omit `id` so the entry is visible to every authenticated admin (see `contracts/ui-contract.md`)
- [X] T007 Create the page component `src/pages/KnowledgeBase/KnowledgeBase.tsx` — a function component that renders a page heading and maps `KNOWLEDGE_BASE_ITEMS` to `<KnowledgeBaseCard>` elements keyed by `item.id`, importing `./KnowledgeBase.css`. Depends on T004.
- [X] T008 [P] Create the presentational card `src/pages/KnowledgeBase/KnowledgeBaseCard.tsx` using PrimeReact `Card`, rendering the entry's `title` and `description` and accepting the item as a prop. Depends on T002.

**Checkpoint**: `/knowledge-base` is reachable from the sidebar, redirects to `/login` when logged out, lists all six titles and descriptions in order, and the browser tab reads "GEC Mobile Application – Admin Panel | Knowledge Base" (via existing `TitleManager`, no code needed). Validates quickstart scenarios 1 and 8.

---

## Phase 3: User Story 1 - Browse and watch a tutorial (Priority: P1) 🎯 MVP

**Goal**: Each entry offers a tutorial video that plays in a modal, or a clear "coming soon" state when no video is configured. Video bytes are never fetched until the user opens a player.

**Independent Test**: Click an entry's watch control and confirm the video plays with full controls; close it and confirm playback stops. For entries without a video, confirm a "coming soon" indicator appears with no broken player and no console error.

### Tests for User Story 1

- [X] T009 [P] [US1] Test in `src/pages/KnowledgeBase/__tests__/KnowledgeBase.render.test.tsx` that all six entries render in catalog order and every one shows a non-empty title and description (spec SC-002, FR-003)
- [X] T010 [P] [US1] Test in `src/pages/KnowledgeBase/__tests__/KnowledgeBase.video.test.tsx` that an entry without `videoUrl` renders the coming-soon state and no `<video>` element, that opening a dialog for an entry with a `videoUrl` mounts the `<video>`, and that closing it unmounts the `<video>` (FR-007, FR-015)

### Implementation for User Story 1

- [X] T011 [US1] In `src/pages/KnowledgeBase/KnowledgeBaseCard.tsx`, derive `hasVideo` from `Boolean(item.videoUrl)` and render either a "Watch tutorial" PrimeReact `Button` (with `pi pi-play`) or a "Video coming soon" indicator — never a player and never an error (FR-006, FR-007)
- [X] T012 [US1] Add an `onWatch(item)` callback prop to `src/pages/KnowledgeBase/KnowledgeBaseCard.tsx` and wire the watch button to it
- [X] T013 [US1] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, add `activeItem: KnowledgeBaseItem | null` state (initial `null`), pass `onWatch` down to set it, and render a PrimeReact `Dialog` — modal, dismissable, header set to `activeItem.title`, `onHide` clearing `activeItem`
- [X] T014 [US1] Inside the dialog in `src/pages/KnowledgeBase/KnowledgeBase.tsx`, render `<video controls preload="none" src={activeItem.videoUrl} />` **only while the dialog is open** (conditional render, not CSS hiding), holding it in a `useRef<HTMLVideoElement>` (FR-006, FR-017)
- [X] T015 [US1] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, on dialog `onHide` call `pause()` and set `currentTime = 0` on the video ref before clearing `activeItem`, so playback stops and does not resume on reopen (FR-015)
- [X] T016 [US1] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, add `videoError` state set by the `<video>` `onError` handler and reset whenever `activeItem` changes; when true, replace the player with a readable failure message rather than a silent black box (spec edge case)
- [X] T017 [P] [US1] Style the card layout and the dialog player in `src/pages/KnowledgeBase/KnowledgeBase.css`, keeping the `#F67D1D` brand colour used in `src/pages/PartnerOnboarding/PartnerOnboarding.tsx` and making the video fill the dialog width

**Checkpoint**: US1 is fully functional. Validates quickstart scenarios 2 and 3. Shippable as the MVP even with zero videos produced — every entry shows its coming-soon state.

---

## Phase 4: User Story 2 - Jump to the section the tutorial describes (Priority: P1)

**Goal**: A quick-access icon on each entry routes the user to the admin screen that entry teaches, client-side, and is disabled when the user's role denies that screen.

**Independent Test**: Click the quick-access icon on each of the six entries and confirm each lands on its mapped route with no full page reload. Sign in as an account missing a permission and confirm that entry's icon is disabled and navigates nowhere.

**Note**: Independent of US1 — the icons work whether or not any video exists. T024 is the single point of contact with US1 and is a no-op if US1 is not yet built.

### Tests for User Story 2

- [X] T018 [P] [US2] Test in `src/pages/KnowledgeBase/__tests__/KnowledgeBase.quickaccess.test.tsx` that clicking each entry's quick-access control calls `navigate` with that entry's `targetRoute`, asserting the full six-route map in `specs/001-knowledge-base/contracts/ui-contract.md` (FR-009)
- [X] T019 [P] [US2] Test in the same file that an entry whose `targetAppId` is absent from the mocked roles renders its quick-access control `disabled` and does not navigate when clicked, and that entry 1 (no `targetAppId`) is always enabled (FR-010, SC-007)

### Implementation for User Story 2

- [X] T020 [US2] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, read roles via `StorageService.retrieveRoles()` into `roles: IAdminRelease[] | null` state. Tolerate a `null` result — roles arrive asynchronously after login (`src/components/Navbar/Navbar.tsx` polls for them), so re-read on a short interval with a bounded attempt count and clean the timer up on unmount (research R7)
- [X] T021 [US2] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, implement `isTargetPermitted(item)` returning `true` when `item.targetAppId === undefined`, else `roles !== null && roles.some(r => Number(r.appId) === item.targetAppId && r.r === '1')` — the same predicate `src/components/Navbar/Navbar.tsx` uses to filter links (FR-010)
- [X] T022 [US2] In `src/pages/KnowledgeBase/KnowledgeBaseCard.tsx`, add the quick-access `Button` with `icon="pi pi-external-link"`, `text` and `rounded` styling, positioned adjacent to the entry, with an `aria-label` naming the destination; wire it to an `onQuickAccess(item)` prop that calls `useNavigate()`'s `navigate(item.targetRoute)` in the page component — client-side, no reload (FR-008, FR-009)
- [X] T023 [US2] In `src/pages/KnowledgeBase/KnowledgeBaseCard.tsx`, accept a `permitted` prop and, when false, render the quick-access button `disabled` with a PrimeReact `Tooltip` explaining the missing permission. While `roles` is still `null`, render disabled-pending — never as permanently denied (FR-010, research R7)
- [X] T024 [US2] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, stop playback (`pause()`, `currentTime = 0`) and close the dialog **before** calling `navigate()`, so audio never continues on the destination screen (FR-015, US2 scenario 4)

**Checkpoint**: US1 and US2 both work independently. Validates quickstart scenarios 4, 5, and 6.

---

## Phase 5: User Story 3 - Find a tutorial by typing (Priority: P2)

**Goal**: A search box filters the entry list live against title, description, and hidden keywords — case-insensitive, whitespace-trimmed, and literal.

**Independent Test**: Type a distinctive word from one entry and confirm only that entry remains; clear the box and confirm all six return; type `(` or `.*` and confirm nothing throws.

### Tests for User Story 3

- [X] T025 [P] [US3] Test in `src/pages/KnowledgeBase/__tests__/KnowledgeBase.search.test.tsx` that typing `push` leaves only the Push Notification entry, that `PUSH` and `  push  ` give the same result, and that a word appearing only in a description (and one only in `keywords`) still matches (FR-011, FR-012)
- [X] T026 [P] [US3] Test in the same file that a no-match query renders the empty state with a working clear control, and that queries `(` and `.*` neither throw nor match everything — proving the query is treated literally (FR-013, spec edge case)
- [X] T027 [P] [US3] Test in the same file that opening and then closing the video dialog leaves the search input's text unchanged (FR-014)

### Implementation for User Story 3

- [X] T028 [US3] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, add controlled `query` state and render PrimeReact `IconField` + `InputIcon` (`pi pi-search`) + `InputText` with placeholder "Search tutorials…", following the pattern already used in `src/pages/PartnerOnboarding/PartnerOnboarding.tsx`
- [X] T029 [US3] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, derive `visibleItems` in a `useMemo` keyed on `query`: empty trimmed query yields the whole catalog, otherwise match `(title + ' ' + description + ' ' + keywords.join(' ')).toLowerCase().includes(query.trim().toLowerCase())`. Use `String.prototype.includes` — never a `RegExp` — so special characters are literal by construction and cannot throw (FR-012, research R4). No debounce: six in-memory entries filter within a frame
- [X] T030 [US3] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, render the list from `visibleItems` instead of the raw catalog, and confirm `query` lives in state entirely separate from `activeItem` so opening a dialog cannot disturb it (FR-014)
- [X] T031 [US3] In `src/pages/KnowledgeBase/KnowledgeBase.tsx`, add a clear control on the search field (shown only when `query` is non-empty) and an empty-state message with its own clear action when `visibleItems` is empty (FR-013)

**Checkpoint**: All three user stories independently functional. Validates quickstart scenario 7.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T032 [P] Verify responsive behaviour of `src/pages/KnowledgeBase/KnowledgeBase.css` at ~768px — cards, search field, dialog, and quick-access controls stay usable and the page never scrolls horizontally (quickstart scenario 9)
- [X] T033 [P] Accessibility pass on `src/pages/KnowledgeBase/KnowledgeBase.tsx` and `src/pages/KnowledgeBase/KnowledgeBaseCard.tsx`: every icon-only button has an `aria-label`, the dialog traps focus and closes on Escape, and the search input has an associated label
- [X] T034 Run `CI=true npm test` and `npm run build`; resolve any new TypeScript or lint error introduced by this feature
- [ ] T035 Walk all nine validation scenarios in `specs/001-knowledge-base/quickstart.md` against a running `npm run dev`
- [ ] T036 [P] Confirm the open question from research R7 with the product owner: `/category/partner` has no sidebar link of its own and is currently mapped to `targetAppId: 76` (*Partner List*). Correct the value in `src/pages/KnowledgeBase/knowledgeBaseItems.ts` if a different permission is intended
- [ ] T037 [P] Obtain product owner sign-off on the six descriptions in `src/pages/KnowledgeBase/knowledgeBaseItems.ts` (flagged as required in `specs/001-knowledge-base/data-model.md`)
- [X] T038 [P] ~~Confirm how tutorial video files will be hosted~~ **Superseded.** A backend Knowledge Base API now exists (`/v2/knowledge-base`, `gec-node-admin/routes_v2/knowledgeBase/`). Entries and videos are served by it; the bundled catalog is now only an offline fallback. See "Backend integration" below.

---

## Phase 7: Backend Integration (added after `/v2/knowledge-base` shipped)

**Context**: research R1/R2 chose a static catalog because no backend existed. One now does, with entry CRUD, categories, publish status, and an admin-only video stream. The screen reads from it; the static catalog is retained purely as an offline fallback.

- [X] T039 Add API types in `src/@types/KnowledgeBase/index.ts` (`IKnowledgeBaseApiEntry`, `IKnowledgeBaseListData`, `IKnowledgeBaseEntry`, `KB_STATUS`) mirroring the controller's response shape
- [X] T040 Add `src/services/KnowledgeBase/KnowledgeBase.service.ts` with `listPublishedEntries()` (GET `/v2/knowledge-base?status=1&limit=100`) and `fetchVideoObjectUrl(videoId)` (GET `/v2/knowledge-base/video/:videoId` as a blob), passing absolute v2 URLs through `axiosInstance` so the auth interceptor still applies
- [X] T041 Fetch entries on mount in `src/pages/KnowledgeBase/KnowledgeBase.tsx`, with a loading spinner and a fallback to the bundled catalog plus a warning banner when the request fails
- [X] T042 Play video from an authenticated blob object URL rather than a direct `src`, revoking the URL on dialog close, quick-access navigation, and unmount
- [X] T043 Derive quick-access permissions from the server's `quick_access_path` via `APP_ID_BY_ROUTE` in `src/pages/KnowledgeBase/knowledgeBaseItems.ts`; disable quick access for an entry the server gave no route
- [X] T044 Update all four suites in `src/pages/KnowledgeBase/__tests__/` to mock the service and assert the API-backed behaviour (31 tests)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Needs T002 (types) from Setup — **blocks all user stories**
- **User Stories (Phases 3–5)**: All depend on Phase 2 completion; then independent of each other
- **Polish (Phase 6)**: Depends on the user stories the team intends to ship

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2. No dependency on other stories.
- **US2 (P1)**: Starts after Phase 2. No dependency on US1 — the icons work with zero videos. T024 touches US1's dialog and is a no-op if US1 is not built yet.
- **US3 (P2)**: Starts after Phase 2. No dependency on US1 or US2. T027 asserts search survives dialog open/close, so it needs US1 built; it can be deferred if US3 lands first.

### Within Each User Story

- Tests before implementation where the team is running TDD; otherwise write them alongside
- Card presentation (`KnowledgeBaseCard.tsx`) before page-level wiring (`KnowledgeBase.tsx`) where a task adds a prop the page must supply
- Story complete and its checkpoint validated before moving to the next priority

### File-contention warning

`KnowledgeBase.tsx` and `KnowledgeBaseCard.tsx` are each touched by all three stories. Tasks within a single story that hit the same file are deliberately **not** marked `[P]`. If two developers take different stories in parallel, expect merge contention in these two files and coordinate — this is the main cost of the parallel-team strategy on a feature this small.

### Parallel Opportunities

- T002 and T003 (Setup) — different files
- T005, T006 and T008 (Foundational) — three different files, none importing another
- All test tasks within a story (T009/T010, T018/T019, T025–T027) — separate test files
- T017 (CSS) runs parallel to US1 logic tasks — different file
- T032, T033, T036, T037, T038 (Polish) — independent concerns
- Across stories: US1, US2, US3 can be staffed in parallel once Phase 2 lands, subject to the file-contention warning above

---

## Parallel Example: Foundational Phase

```bash
# After T004 (catalog) completes, launch the three independent registrations together:
Task: "Register the /knowledge-base protected route in src/components/PageContainer/PageContainer.tsx"
Task: "Add the Knowledge Base sidebar entry in src/components/Navbar/links.tsx"
Task: "Create the presentational card in src/pages/KnowledgeBase/KnowledgeBaseCard.tsx"
```

## Parallel Example: User Story 1 Tests

```bash
# Both test files are independent:
Task: "Test all six entries render in order in src/pages/KnowledgeBase/__tests__/KnowledgeBase.render.test.tsx"
Task: "Test video dialog mount/unmount in src/pages/KnowledgeBase/__tests__/KnowledgeBase.video.test.tsx"
```

---

## Implementation Strategy

### MVP First (Foundational + User Story 1)

1. Phase 1: Setup (T001–T003)
2. Phase 2: Foundational (T004–T008) — **blocks everything**
3. Phase 3: User Story 1 (T009–T017)
4. **STOP and VALIDATE**: quickstart scenarios 1, 2, 3, 8
5. Ships as a working Knowledge Base even with zero videos produced — every entry shows its coming-soon state

### Recommended delivery order

US2 is also P1 and is arguably the higher-value half while videos are still unproduced: quick access works from day one, whereas the players are empty until video files exist. Consider **Phase 2 → US2 → US1 → US3** if video production will lag. The phases are written to allow either order.

### Incremental Delivery

1. Setup + Foundational → navigable page listing six entries
2. Add US1 → video playback and coming-soon states → demo
3. Add US2 → quick-access navigation with permission gating → demo
4. Add US3 → live search → demo
5. Polish → responsive, a11y, sign-offs, video URLs

### Parallel Team Strategy

Realistically this feature is one developer's work — roughly 38 tasks across six files. Splitting it three ways would cost more in `KnowledgeBase.tsx` merge coordination than it saves. If parallelising anyway: one developer takes Phase 1 + 2 alone, then US1 and US2 can be split, with US3 folded into whoever finishes first.

---

## Notes

- `[P]` = different files, no dependency on an incomplete task
- `[Story]` labels map tasks to spec.md user stories for traceability
- No backend change, no new npm dependency, and no new permission identifier in any task — see plan.md "Constraints"
- `TitleManager` derives the page title from the route automatically; FR-016 needs no task
- `Navbar.tsx` active-state highlighting works unchanged for a single-segment path; no task needed (research R5)
- Commit after each task or logical group; validate at each checkpoint before advancing
