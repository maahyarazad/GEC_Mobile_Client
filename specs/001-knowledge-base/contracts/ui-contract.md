# Contract: Knowledge Base Screen

**Feature**: `001-knowledge-base`

The user-facing contract of the feature: its address, what it renders, and how it behaves. Written so it can be verified from the browser without reading the implementation.

---

## Route

| Property | Value |
|---|---|
| Path | `/knowledge-base` |
| Registration | Inside `<Route element={<ProtectedRoute />}>` in `src/components/PageContainer/PageContainer.tsx`, after the `partner-onboarding` route |
| Element | `<KnowledgeBase />` from `src/pages/KnowledgeBase` |
| Auth | Authenticated admins only; unauthenticated requests redirect to `/login` via the existing guard (FR-001) |
| Page title | `GEC Mobile Application – Admin Panel | Knowledge Base`, derived automatically by `TitleManager` from the path (FR-016) |

## Sidebar entry

| Property | Value |
|---|---|
| File | `src/components/Navbar/links.tsx` |
| Label | `Knowledge Base` |
| Link | `/knowledge-base` |
| Icon | `MdMenuBook` from `react-icons/md` |
| Position | Immediately after `Partner Onboarding`, immediately before `Log Out` (FR-002) |
| `id` | **Omitted** — the entry is visible to every authenticated admin, matching how `Dashboard` behaves (spec Assumptions) |
| Active highlight | Works unchanged: `Navbar.tsx` compares `location.pathname.split('/')[1]` against the link, and `/knowledge-base` is single-segment |

> Omitting `id` is deliberate. `Navbar.tsx` hides any link whose `id` has no matching granted role; an `id` here would need a backing permission in the roles API, which this feature does not introduce.

## Screen structure

```text
┌─ Knowledge Base ─────────────────────────────────────────┐
│  [🔍 Search tutorials…                              ✕ ]  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ How to Read the Dashboard Report                   │  │
│  │ Walks through each panel on the admin dashboard…   │  │
│  │ [▶ Watch tutorial]                    [↗ quick access] │
│  └────────────────────────────────────────────────────┘  │
│  … five more entries, fixed order …                      │
└──────────────────────────────────────────────────────────┘
```

### Elements and required behaviour

| Element | Contract |
|---|---|
| Search input | `IconField` + `InputIcon` + `InputText`, placeholder "Search tutorials…". Controlled. Filters as the user types (FR-011). Shows a clear control when non-empty (FR-013). |
| Entry card | PrimeReact `Card`. Always renders `title` and `description` (FR-005). Fixed order (FR-003). |
| Watch control | Present when `videoUrl` is set — opens the player dialog (FR-006). Absent when `videoUrl` is not set; a "Video coming soon" indicator takes its place (FR-007). |
| Quick access | Icon button, `pi pi-external-link`, adjacent to the entry, with an `aria-label` naming the destination. Calls `navigate(targetRoute)` — client-side, no reload (FR-008, FR-009). |
| Quick access (denied) | Rendered `disabled` with a tooltip explaining the user lacks permission. MUST NOT navigate (FR-010). |
| Quick access (roles pending) | Rendered disabled while `retrieveRoles()` is still `null`; becomes enabled once roles arrive. Never shown as permanently denied. |
| Empty state | When search matches nothing: a message plus a control that clears the query (FR-013). |

## Player dialog

| Property | Contract |
|---|---|
| Container | PrimeReact `Dialog`, modal, dismissable, header = the entry's `title` |
| Player | Native `<video controls preload="none">`; `<video>` is rendered only while the dialog is open |
| Loading | No video bytes are requested until the dialog opens (FR-017, SC-005) |
| Close | `pause()` and `currentTime = 0`, then unmount the `<video>` (FR-015) |
| Quick access from dialog | Stop playback, then navigate (FR-015) |
| Error | On `<video>` `onError`, replace the player with a readable failure message; do not leave a silent black box |
| Search preservation | Opening and closing the dialog leaves the search input's text untouched (FR-014) |

## Search matching contract

Given a query `q` and an entry `e`:

```text
needle  = q.trim().toLowerCase()
haystack = (e.title + ' ' + e.description + ' ' + (e.keywords ?? []).join(' ')).toLowerCase()

match(e) = needle === '' || haystack.includes(needle)
```

- Case-insensitive and whitespace-trimmed (FR-012).
- Literal by construction: `includes` never interprets `.`, `*`, `(` or any other character as a pattern, and cannot throw (FR-012, spec edge case).
- Keywords are matched but never displayed.
- Empty query shows all six entries.

## Quick-access destination map

| Entry | Destination | Permission (`appId`) |
|---|---|---|
| How to Read the Dashboard Report | `/dashboard` | none — always permitted |
| How to Manage Access Requests | `/requests` | `75` |
| How to Manage Partner Categories, Tags and Offers | `/category/partner` | `76` |
| How to Manage Mobile Application Users | `/users` | `79` |
| How to Use Push Notification | `/push-notification` | `82` |
| How to Work with the Partner Onboarding Section | `/partner-onboarding` | `88` |

Permission predicate, mirroring `Navbar.tsx`:

```text
permitted(e) = e.targetAppId === undefined
             || (roles !== null && roles.some(r => Number(r.appId) === e.targetAppId && r.r === '1'))
```

## Out of scope for this contract

No API endpoint, no request/response payload, no persisted record, and no new permission identifier. This feature consumes the existing auth guard and roles data and adds nothing to the backend surface.
