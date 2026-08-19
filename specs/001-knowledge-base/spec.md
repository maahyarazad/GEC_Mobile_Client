# Feature Specification: Knowledge Base

**Feature Branch**: `001-knowledge-base`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "Add new section to admin panel under the Partner Onboarding and name it Knowledge Base this section will provide the Video file and the QuickAccess Icon next to it which navigates to where the section exists so user can check it after seeing the tutorial - add a short description to the below titles in the Knowledge base and allow user to have text search through the below items - these are the list of sections and they are static: 1- How to Read Dashboard Report, 2- How to manage Access Requests, 3- How to Manage Partner Categories and Tags and offers, 4- how to manage Mobile Application Users, 5- how to use Push Notification, 6- how to work with Partner Onboarding section"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and watch a tutorial (Priority: P1)

An admin user opens **Knowledge Base** from the sidebar (listed directly below *Partner Onboarding*) and sees a list of six tutorial entries. Each entry shows its title and a one- or two-sentence description of what the tutorial covers. The user clicks an entry and its tutorial video plays inside the admin panel.

**Why this priority**: Without the catalog and the video playback there is no feature. This alone delivers the training value the section exists for.

**Independent Test**: Log in, click *Knowledge Base* in the sidebar, confirm six titled entries with descriptions render, click one, confirm the video player opens and plays.

**Acceptance Scenarios**:

1. **Given** an authenticated admin on any page, **When** they click *Knowledge Base* in the sidebar, **Then** the Knowledge Base page loads at `/knowledge-base` and lists all six entries with titles and descriptions.
2. **Given** the Knowledge Base page, **When** the user activates an entry that has a tutorial video, **Then** a video player opens showing that entry's video with standard playback controls (play/pause, seek, volume, fullscreen).
3. **Given** an open video player, **When** the user closes it, **Then** playback stops and the user returns to the entry list with their search text and scroll position intact.
4. **Given** an entry whose video is not yet available, **When** the list renders, **Then** that entry shows a clear "video coming soon" state instead of a broken player, and the rest of the entry (title, description, quick access) still works.

---

### User Story 2 - Jump to the section the tutorial describes (Priority: P1)

After watching (or instead of watching) a tutorial, the user clicks a quick-access icon next to the entry and is taken straight to the admin screen the tutorial is about, so they can immediately apply what they saw.

**Why this priority**: This is the explicit second half of the request and is what turns a video library into a workflow aid. It is independently valuable — the icons work whether or not the videos exist yet.

**Independent Test**: From the Knowledge Base page, click the quick-access icon on each entry and confirm each lands on the correct admin screen.

**Acceptance Scenarios**:

1. **Given** the Knowledge Base list, **When** the user clicks the quick-access icon on *How to Read Dashboard Report*, **Then** the app navigates to the Dashboard screen.
2. **Given** the Knowledge Base list, **When** the user clicks the quick-access icon on any entry, **Then** the app navigates to that entry's target screen without a full page reload and the sidebar highlights the destination.
3. **Given** a user whose role does not grant access to an entry's target screen, **When** the list renders, **Then** that entry's quick-access control is disabled (or hidden) with an explanation, and the user is never navigated to a screen they cannot use.
4. **Given** an open video player, **When** the user triggers quick access for that entry, **Then** playback stops before navigation so audio does not continue on the destination screen.

---

### User Story 3 - Find a tutorial by typing (Priority: P2)

The user types words into a search box and the entry list narrows to entries whose title or description matches, so they can find the right tutorial without reading all six.

**Why this priority**: Valuable but not essential at six entries; the list is browsable without it. It becomes important as the catalog grows.

**Independent Test**: Type a term matching exactly one entry and confirm only that entry remains; clear the box and confirm all six return.

**Acceptance Scenarios**:

1. **Given** the Knowledge Base page, **When** the user types text matching an entry's title, **Then** only entries matching that text remain visible.
2. **Given** the Knowledge Base page, **When** the user types text that appears only in an entry's description, **Then** that entry is still shown as a match.
3. **Given** search text with different letter casing or surrounding spaces than the source text, **When** matching runs, **Then** the match still succeeds.
4. **Given** search text matching nothing, **When** the list renders, **Then** an empty-state message appears with a way to clear the search.
5. **Given** an active search, **When** the user clears the search box, **Then** all six entries are shown again.

---

### Edge Cases

- A tutorial video URL is configured but the file fails to load (404, network error) — the player must surface a readable error, not a silent black box.
- A video is large or the connection is slow — the page must not block on video bytes; video data loads only when the user opens a player.
- The user's role permits Knowledge Base but not a target screen — see US2 scenario 3.
- The user deep-links directly to `/knowledge-base` without going through the sidebar — the page must render normally for any authenticated admin.
- An unauthenticated visitor requests `/knowledge-base` — they are redirected to login, exactly as every other protected screen behaves.
- Search text contains regex-special characters (`.`, `*`, `(`) — these are matched literally, never interpreted as a pattern.
- The viewport is narrow — entries, video, and quick-access controls stay usable without horizontal page scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose a Knowledge Base screen at a stable in-app address, reachable only by authenticated admin users.
- **FR-002**: The sidebar MUST show a *Knowledge Base* entry positioned directly below *Partner Onboarding*, using an icon visually consistent with the other sidebar entries.
- **FR-003**: The Knowledge Base MUST present exactly these six entries, in this order: (1) How to Read Dashboard Report, (2) How to Manage Access Requests, (3) How to Manage Partner Categories, Tags and Offers, (4) How to Manage Mobile Application Users, (5) How to Use Push Notification, (6) How to Work with the Partner Onboarding Section.
- **FR-004**: The entry catalog MUST be static content maintained in the codebase — no admin-facing editor, upload flow, or backend catalog service is part of this feature.
- **FR-005**: Each entry MUST carry a short human-written description (roughly one to two sentences) explaining what the tutorial covers.
- **FR-006**: Each entry MUST offer a way to play its tutorial video within the admin panel, with standard playback controls.
- **FR-007**: An entry with no configured video MUST render a "coming soon" state rather than an error or a broken player, and MUST keep its title, description, and quick access functional.
- **FR-008**: Each entry MUST show a quick-access control, visually adjacent to the entry, that navigates to the admin screen that entry teaches.
- **FR-009**: Quick-access navigation MUST use in-app client-side navigation (no full page reload) and MUST land on: Dashboard, Access Requests, Partner Categories, User List, Push Notification, and Partner Onboarding respectively.
- **FR-010**: Quick access MUST respect the existing role-based screen permissions: when the signed-in user lacks permission for a target screen, that entry's quick-access control MUST be disabled with a visible reason and MUST NOT navigate.
- **FR-011**: The system MUST provide a free-text search input that filters the entry list as the user types.
- **FR-012**: Search MUST match against each entry's title and description, MUST be case-insensitive, MUST ignore leading and trailing whitespace, and MUST treat the query as literal text.
- **FR-013**: When search matches no entries, the system MUST show an empty-state message and a control to clear the search.
- **FR-014**: Opening or closing a video MUST NOT discard the user's current search text.
- **FR-015**: Closing a video player MUST stop playback; navigating away via quick access MUST also stop playback.
- **FR-016**: The screen MUST set a browser page title consistent with the rest of the admin panel.
- **FR-017**: Video content MUST be loaded on demand (when a user opens a player), not eagerly on page load.

### Key Entities

- **Knowledge Base Entry**: One tutorial in the catalog. Attributes: stable identifier, display title, short description, optional search keywords, optional tutorial video location, target admin screen address, and the permission identifier governing that target screen. The six entries are fixed and ordered.
- **Search Query**: The user's free-text input; transient UI state, never persisted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any admin screen, a user reaches the Knowledge Base in one click from the sidebar.
- **SC-002**: All six entries display a title and a non-empty description on first render.
- **SC-003**: A user can go from opening the Knowledge Base to the correct destination screen for any entry in two clicks or fewer.
- **SC-004**: Typing a distinctive word from any single entry narrows the list to that one entry.
- **SC-005**: The Knowledge Base page becomes interactive without waiting on any video bytes.
- **SC-006**: Zero entries render a broken or errored player when their video is unconfigured.
- **SC-007**: No user is navigated by quick access to a screen their role denies.

## Assumptions

- The six entries, their descriptions, and their video files are authored by the team and shipped as source-controlled content; the descriptions are drafted as part of this feature and reviewed by the product owner before release.
- Tutorial video files are hosted at stable URLs reachable by the browser and referenced from the static catalog; producing and hosting the video files themselves is outside this feature's scope, and every entry ships working without them.
- The Knowledge Base screen itself is visible to every authenticated admin, matching how the Dashboard entry behaves; per-entry quick access is what respects role permissions.
- The existing authentication guard and sidebar role model are reused as-is; no new permission identifier is introduced for this feature.
- Video content is single-language and needs no captions, transcripts, chapters, or progress tracking in this version.
- Entry ordering is fixed; there is no sorting, tagging, filtering by category, or favouriting in this version.
