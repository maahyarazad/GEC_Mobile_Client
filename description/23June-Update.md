
  ---
  Work Log — GEC App CMS — 2026-06-23

  Quick Q&A (no code)

  - Explained how Create React App auto-loads .env.production on npm run build (and the REACT_APP_ prefix rule).
  - Explained the difference between .env.production and .env.production.local (shared vs. local/secret, git tracking, override priority).

  ---
  Feature 1 — Improve Navbar Style (issue #12)

  - Added icon?: IconType to INavbarLinks; assigned react-icons/md icons to every nav link.
  - Rewrote Navbar.tsx as a persistent, collapsible Google Cloud Console–style sidebar with an active vertical indicator.
  - Rewrote Navbar.css (dark sidebar, pill active state, collapse/expand transitions).
  - Switched Main.tsx layout to flex-row (sidebar always left; header + content right).
  - Removed the hamburger + PrimeReact Sidebar overlay from Header.tsx.
  - Adjusted PageContainer.tsx height to fit the new layout.

  Feature 2 — Improve Career Page (issue #13)

  - Part 1: Fixed-height DataGrid (no layout shift on paginate), stateful star-rating component, general UI cleanup.
  - Part 2: Moved the Message column into a "View" modal; uniform row heights; plain star icons (removed circular styling).
  - Part 3: Hid the "View Message" button when no message exists.

  Feature 3 — User List & Event List (issue #14)

  - Part 1: Moved the mobile-app users grid into UsersList.tsx (careerViewer style, search, delete); wired it into ApprovalList's "Users" toggle.
  - Part 2: Event List — careerViewer styling, working search, consistent row heights; fixed Short Description binding.
  - Part 3: Event description tooltip — applied autoHide: false, moved <Tooltip> into the cell body so it attaches reliably; added eventDescription to IEventList.

  Feature 4 — useAuth Hook Migration (issue #15)

  - Migrated Navbar, Header, Login, Logout, SessionExpired from useContext(AuthContext) to the new useAuth() hook; removed unused imports.

  Feature 5 — Dashboard Items (issue #19)

  - Added the /dashboard route in PageContainer.tsx.
  - Built a 2×2 dashboard; top-left panel fetches /partners/onboarding/invitation-records, shows latest 3 + total count + "Show all" toggle, with vertical scroll.

  ---
  Bug 01 — Hide Navbar for Logged-Out Users (issue #16)

  - Part 1: Navbar returns null when there's no auth token.
  - Part 2: Fixed the react-hooks/rules-of-hooks error (moved early return after all hooks).
  - Part 3: Fixed continuous "Authentication failed" runtime errors — gated role reading on a valid token, bounded the retry loop, and guarded StorageService.retrieveRoles against missing tokens / overlapping fetches / unhandled rejections.

  Bug 02 / Bug 03 — Browser Refresh on Subpaths (issue #20)

  - php/.htaccess: added Options -MultiViews, FallbackResource, and a robust rewrite.
  - php/index.php: absolute readfile(__DIR__ . "/index.html") + explicit HTML content-type.
  - Root fix in the legacy docroot .htaccess: added a rule routing /admin/application/* (non-file/dir) to the SPA's index.php.
  - Fixed the resulting HTTP 500 infinite-redirect loop by excluding index.php from the rewrite condition.

  ---
  GitHub Issues Created on the "GEC App CMS - (App Admin UI)" Board

  ┌─────┬──────────┬─────────────────────────────────────────────────────────────────┐
  │  #  │   Type   │                              Title                              │
  ├─────┼──────────┼─────────────────────────────────────────────────────────────────┤
  │ 12  │ feat     │ Improve Navbar style (Google Cloud Console style)               │
  ├─────┼──────────┼─────────────────────────────────────────────────────────────────┤
  │ 13  │ feat     │ Improve Career page style, fixed-height grid & rating fixes     │
  ├─────┼──────────┼─────────────────────────────────────────────────────────────────┤
  │ 14  │ feat     │ Improve User List and Event List sections                       │
  ├─────┼──────────┼─────────────────────────────────────────────────────────────────┤
  │ 15  │ refactor │ Migrate AuthContext usages to useAuth hook                      │
  ├─────┼──────────┼─────────────────────────────────────────────────────────────────┤
  │ 16  │ bug      │ Hide navbar for logged-out users & fix role-reading auth errors │
  ├─────┼──────────┼─────────────────────────────────────────────────────────────────┤
  │ 19  │ feat     │ Implement Dashboard items                                       │
  ├─────┼──────────┼─────────────────────────────────────────────────────────────────┤
  │ 20  │ bug      │ Browser refresh / deep-link routing on PHP host                 │
  └─────┴──────────┴─────────────────────────────────────────────────────────────────┘

Branches Created

- feature/improve-user-event-list
- feature/implement-dashboard-items

---
⚠️ Open Follow-Ups

- Uncommitted work spans multiple features across the two branches — needs to be committed/split per feature.
- debugger; statement left in EventList.tsx:33 — remove before deploying.
- feature_3.md rating item (plain stars for Event List) not done — Event data has no rating field.
- Redundant .htaccess layers — once the legacy docroot rule is confirmed working, consider reverting php/.htaccess to its simple original form (single source of truth).
- Verify the live deploy: refresh /admin/application/push-notification after pushing the .htaccess fix.

---