# Phase 1 Data Model: Knowledge Base

**Feature**: `001-knowledge-base` | **Date**: 2026-08-19

This feature persists nothing. The "data model" is a compile-time catalog plus transient UI state. There is no database table, no migration, and no API payload.

---

## Entity: `KnowledgeBaseItem`

The single domain entity. Defined in `src/pages/KnowledgeBase/types.ts`, instantiated in `src/pages/KnowledgeBase/knowledgeBaseItems.ts`.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Stable kebab-case identifier. Used as the React list key and as the dialog's selected-item handle. Never displayed. |
| `title` | `string` | Yes | Display heading, e.g. `"How to Read the Dashboard Report"`. Searchable. |
| `description` | `string` | Yes | One to two sentences on what the tutorial covers. Searchable. |
| `keywords` | `readonly string[]` | No | Extra search vocabulary not shown in the UI (e.g. `["kpi", "metrics"]`). Searchable. Defaults to empty. |
| `videoUrl` | `string` | No | Absolute URL of the tutorial video. When omitted, the entry renders its "coming soon" state (FR-007). |
| `targetRoute` | `string` | Yes | In-app path the quick-access control navigates to, e.g. `"/dashboard"`. Must be a path already registered in `PageContainer.tsx`. |
| `targetAppId` | `number` | No | Permission identifier for `targetRoute`, matching the `id` values in `src/components/Navbar/links.tsx`. Omitted means the target is ungated (Dashboard). |

### Validation rules

- **V1** — `id` is unique across the catalog. Enforced by review; a duplicate would produce a React duplicate-key warning.
- **V2** — `title` and `description` are non-empty after trimming (SC-002).
- **V3** — `targetRoute` corresponds to a route registered under `<ProtectedRoute />` in `PageContainer.tsx`. An unregistered path would render `PageNotFound`.
- **V4** — `targetAppId`, when present, is one of the `appId` values the roles API returns (the `id` values already listed in `links.tsx`).
- **V5** — `videoUrl`, when present, is an absolute `https://` URL. A relative path would resolve against the SPA's `homepage` base and 404.
- **V6** — Array order is the display order (FR-003). The catalog is exported `as const` / `readonly` so no consumer can reorder or mutate it.

### Relationships

`KnowledgeBaseItem` → **admin route** (via `targetRoute`) — a soft reference to a path string in `PageContainer.tsx`; not type-checked by the compiler, covered by V3 and by the quick-access test.

`KnowledgeBaseItem` → **permission** (via `targetAppId`) — a soft reference to an `IAdminRelease.appId` returned by `StorageService.retrieveRoles()`; see the access rules below.

---

## The catalog: six fixed entries

Order is fixed and matches FR-003. Descriptions below are the proposed copy — **product owner sign-off required before release** (see spec Assumptions). `videoUrl` is omitted for every entry at implementation time and filled in as each video is produced.

| # | `id` | `title` | `targetRoute` | `targetAppId` |
|---|---|---|---|---|
| 1 | `dashboard-report` | How to Read the Dashboard Report | `/dashboard` | — (ungated) |
| 2 | `access-requests` | How to Manage Access Requests | `/requests` | `75` |
| 3 | `partner-categories` | How to Manage Partner Categories, Tags and Offers | `/category/partner` | `76` |
| 4 | `app-users` | How to Manage Mobile Application Users | `/users` | `79` |
| 5 | `push-notification` | How to Use Push Notification | `/push-notification` | `82` |
| 6 | `partner-onboarding` | How to Work with the Partner Onboarding Section | `/partner-onboarding` | `88` |

### Proposed descriptions and keywords

1. **`dashboard-report`** — "Walks through each panel on the admin dashboard — app user totals, invitation records, and the activity figures — and explains what each number counts and how often it refreshes."
   Keywords: `report`, `statistics`, `kpi`, `metrics`, `overview`, `home`
2. **`access-requests`** — "Covers reviewing incoming access requests, checking the details behind each one, and approving or rejecting them so the right people reach the right app."
   Keywords: `approval`, `reject`, `permissions`, `pending`, `review`
3. **`partner-categories`** — "Shows the category → partner → offers and tags hierarchy: creating and reordering categories, assigning partners to them, and managing each partner's offers and tags."
   Keywords: `category`, `categories`, `tag`, `tags`, `offer`, `offers`, `partner`, `discount`
4. **`app-users`** — "Explains how to find mobile app users, read their account and membership details, and carry out the account actions available from the user list."
   Keywords: `members`, `accounts`, `mobile`, `app users`, `customers`, `search`
5. **`push-notification`** — "Takes you through composing a push notification, choosing and testing recipients, and sending or scheduling the send to the mobile app."
   Keywords: `push`, `notification`, `notifications`, `send`, `message`, `broadcast`, `alert`
6. **`partner-onboarding`** — "Covers the partner onboarding workflow end to end — partner records, contact roles with recipient and CC tagging, sending onboarding mail, and reading the mail logs."
   Keywords: `onboarding`, `contacts`, `email`, `mail`, `logs`, `invite`, `prospect`

> **Route caveat for entry 2**: `/requests` renders `AppList` (an app chooser); the request list itself is at `/requests/list`. `/requests` is the correct target because it matches the sidebar's *Access Requests* destination and is where a user following the tutorial would start.

> **Permission caveat for entry 3**: `/category/partner` has no sidebar link and therefore no `appId` of its own. It maps to `76` (*Partner List*), the permission governing partner data. Confirm before release (see research R7).

---

## Transient UI state

Not persisted, not shared, scoped to the page component. Lost on unmount by design (FR-014 only requires survival across dialog open/close, not across navigation).

| State | Type | Initial | Purpose |
|---|---|---|---|
| `query` | `string` | `''` | Raw search box text. Trimmed and lowercased only at match time, never written back to the input. |
| `activeItem` | `KnowledgeBaseItem \| null` | `null` | Entry whose video dialog is open; `null` means closed. Held separately from `query` so opening a dialog cannot disturb the search (FR-014). |
| `videoError` | `boolean` | `false` | Set by the `<video>` `onError` handler; drives the readable load-failure message. Reset when `activeItem` changes. |
| `roles` | `IAdminRelease[] \| null` | `null` | Read from `StorageService.retrieveRoles()`. `null` = not yet loaded (quick access renders pending/disabled, not denied — see research R7). |

### Derived values

- `visibleItems` — `useMemo(() => filter(catalog, query), [query])`. Match: `query.trim().toLowerCase()` is empty → all entries; otherwise the entry matches when its lowercased `title + ' ' + description + ' ' + keywords.join(' ')` contains that string (FR-011, FR-012). Literal by construction — no regex, no escaping.
- `isTargetPermitted(item)` — `true` when `item.targetAppId === undefined`; otherwise `roles !== null && roles.some(r => Number(r.appId) === item.targetAppId && r.r === '1')`. Mirrors the predicate in `Navbar.tsx` (FR-010).
- `hasVideo(item)` — `Boolean(item.videoUrl)`. Drives watch button vs. "coming soon" state (FR-007).

---

## State transitions

**Video dialog**

```text
closed (activeItem = null)
  --[user clicks Watch on an item with videoUrl]--> open (activeItem = item, videoError = false)
open
  --[user closes dialog / presses Esc]--> closed   (pause(), currentTime = 0, video unmounted)
  --[user clicks quick access]--> closed, then navigate(targetRoute)   (playback stopped before navigation, FR-015)
  --[video emits error]--> open with videoError = true (readable message replaces player)
```

`query` is untouched by every transition above (FR-014).

**Roles**

```text
null (unknown)  --[retrieveRoles() returns]--> IAdminRelease[]  --> quick access re-evaluates
```

While `null`, quick-access controls for entries with a `targetAppId` render disabled-pending. Entry 1 (no `targetAppId`) is enabled immediately.
