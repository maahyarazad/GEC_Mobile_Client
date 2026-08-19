# Quickstart: Validating the Knowledge Base

**Feature**: `001-knowledge-base` | **Date**: 2026-08-19

How to run the admin panel and confirm the Knowledge Base works end to end. This is a validation guide — implementation belongs in `tasks.md`. Field definitions live in [data-model.md](./data-model.md); exact behaviours live in [contracts/ui-contract.md](./contracts/ui-contract.md).

---

## Prerequisites

- Node.js and npm, with dependencies installed (`npm install`).
- A `.env.development` file (copy `.env.sample`). `REACT_APP_API_URL` must be set — `src/utils/constants/constants.ts` throws at import time if it is missing.
- Admin credentials for the environment `REACT_APP_API_URL` points at. Roles are fetched after login and drive the quick-access permission checks.
- For the video checks: at least one entry in `knowledgeBaseItems.ts` with a reachable `videoUrl`. If no tutorial videos exist yet, the "coming soon" path (scenario 3) is the one to validate instead — that is the expected shipping state.

## Run

```bash
npm run dev          # serves on http://localhost:3333
```

Log in, then open `http://localhost:3333/knowledge-base` — or click **Knowledge Base** in the sidebar.

## Test

```bash
npm test             # react-scripts test (watch mode); CI=true npm test for a single run
```

---

## Validation scenarios

Each maps to acceptance scenarios in [spec.md](./spec.md).

### 1. Navigation and catalog — US1 §1, FR-002, FR-003, FR-005

1. From any admin screen, find **Knowledge Base** in the sidebar directly below *Partner Onboarding* and above *Log Out*.
2. Click it.

**Expected**: URL becomes `/knowledge-base`; the sidebar entry highlights as active; six entries render in the order listed in [data-model.md](./data-model.md); each shows a title and a non-empty description; the browser tab reads `GEC Mobile Application – Admin Panel | Knowledge Base`.

### 2. Video playback — US1 §2–3, FR-006, FR-014, FR-015, FR-017

*Requires an entry with a `videoUrl`.*

1. Open DevTools → Network, filter to media, and reload the page.
2. Type something in the search box first (to verify preservation later).
3. Click **Watch tutorial** on an entry that has a video.
4. Play, seek, adjust volume, then close the dialog.

**Expected**: no media request appears on page load — the first video byte is requested only at step 3. Playback controls all work. Closing stops playback (confirm no audio continues). The search text typed at step 2 is still in the box.

### 3. Missing video — US1 §4, FR-007

Find an entry with no `videoUrl` (all six, until videos are produced).

**Expected**: a clear "video coming soon" indicator in place of the watch control; no broken player, no console error; the title, description, and quick-access icon all still work.

### 4. Quick access — US2 §1–2, FR-008, FR-009

Click the quick-access icon on each of the six entries in turn, returning to `/knowledge-base` between each.

**Expected**: each lands on its destination from the map in [contracts/ui-contract.md](./contracts/ui-contract.md) — `/dashboard`, `/requests`, `/category/partner`, `/users`, `/push-notification`, `/partner-onboarding`. Navigation is client-side (no full page reload — the Network tab shows no document request) and the sidebar highlights the destination.

### 5. Permission gating — US2 §3, FR-010, SC-007

Log in as an account whose roles exclude at least one target (e.g. no Push Notification permission — confirm by checking that sidebar entry is hidden).

**Expected**: the corresponding entry still lists with its title and description, but its quick-access control is disabled with a tooltip explaining the missing permission, and clicking it navigates nowhere. Immediately after login, while roles are still loading, gated controls appear disabled and then become enabled once roles arrive — they never flash as permanently denied.

### 6. Stop playback on quick access — US2 §4, FR-015

Open a video, start playback, then trigger quick access for that entry.

**Expected**: playback stops before navigation; no audio continues on the destination screen.

### 7. Search — US3, FR-011, FR-012, FR-013

1. Type `push` → expect only the Push Notification entry.
2. Type `PUSH` and `  push  ` → same single result (case-insensitive, trimmed).
3. Type a word that appears only in a description (e.g. `invitation`) → the Dashboard Report entry matches.
4. Type a keyword not shown on screen (e.g. `kpi`) → the Dashboard Report entry matches.
5. Type `zzzz` → empty state with a clear control; click it.
6. Type `(` then `.*` → no crash, no console error, empty state or literal matches only.

**Expected**: filtering is immediate with no visible lag; clearing restores all six entries.

### 8. Access control — spec edge cases, FR-001

1. Log out, then request `/knowledge-base` directly.
2. Log back in and request `/knowledge-base` directly (deep link, not via sidebar).

**Expected**: step 1 redirects to `/login`; step 2 renders the page normally.

### 9. Narrow viewport — spec edge cases

Resize to roughly 768 px wide.

**Expected**: entries, search box, video dialog, and quick-access controls remain usable; the page does not scroll horizontally.

---

## Done when

- [ ] All nine scenarios pass
- [ ] `CI=true npm test` passes
- [ ] `npm run build` completes without new TypeScript errors
- [ ] No new console errors or warnings on `/knowledge-base`
- [ ] Product owner has signed off the six descriptions (see [data-model.md](./data-model.md))
- [ ] The `/category/partner` → `appId 76` permission mapping is confirmed (see [research.md](./research.md) R7)
