# Implementation Plan: Knowledge Base

**Branch**: `001-knowledge-base` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-knowledge-base/spec.md`

## Summary

Add a **Knowledge Base** screen to the GEC admin CMS, reached from a new sidebar entry placed directly below *Partner Onboarding*. The screen renders a fixed, source-controlled catalog of six tutorial entries; each shows a title, a short description, a control that plays its tutorial video in a modal, and a quick-access icon that routes the user to the admin screen the tutorial teaches. A search box filters the list client-side against title, description, and keywords.

Technical approach: a self-contained, frontend-only feature. The catalog is a typed TypeScript constant (`knowledgeBaseItems.ts`); the page is a React function component under `src/pages/KnowledgeBase/` built from PrimeReact primitives already used across the app (`IconField`/`InputText` for search, `Card` for entries, `Dialog` for the player, `Button` for quick access), with a native HTML5 `<video controls preload="none">` element inside the dialog. Routing reuses the existing protected-route tree in `PageContainer.tsx`; quick-access permission checks reuse `StorageService.retrieveRoles()` and the same `appId` values that already gate the sidebar. No backend endpoint, database table, migration, or new dependency is introduced.

## Technical Context

**Language/Version**: TypeScript 4.7 targeting React 18.3 (Create React App / `react-scripts` 5.0.1)

**Primary Dependencies**: `react` 18.3, `react-router-dom` 6.3, `primereact` 10.9 + `primeicons` 7 + `primeflex` 4, `react-icons` 5.6 (Material Design set, matching `src/components/Navbar/links.tsx`). No new dependency required.

**Storage**: None. The entry catalog is a compile-time TypeScript constant. Video files are referenced by URL and served by the existing static/file host; nothing is written or persisted by this feature. Search state is transient React state.

**Testing**: `react-scripts test` (Jest + React Testing Library, already in `devDependencies` via `@testing-library/react` 13.3 and `@testing-library/jest-dom` 5.16). The repository currently ships no test files, so this feature adds its own focused component tests rather than extending an existing suite.

**Target Platform**: Desktop browsers (evergreen Chrome/Edge/Safari/Firefox) rendering the admin SPA at `https://www.german-emirates-club.com/admin/application`.

**Project Type**: Single-page web frontend (the CMS admin panel). The `php/` directory holds deploy assets only; the API is a separate service and is untouched here.

**Performance Goals**: Page interactive without fetching any video bytes (`preload="none"`). Search over six in-memory entries filters synchronously in a `useMemo` — no debounce, no network round-trip, sub-frame at this scale.

**Constraints**: No backend change and no new npm dependency. Must reuse the existing `ProtectedRoute` auth guard, the existing role model (`StorageService.retrieveRoles()` / `appId`), and the existing PrimeReact visual language including the `#F67D1D` brand colour used in `PartnerOnboarding.tsx`. Must not regress the sidebar's role-filtering behaviour.

**Scale/Scope**: One new route, one new sidebar entry, six static entries, roughly four new source files plus two small edits to existing files (`links.tsx`, `PageContainer.tsx`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is the **unmodified Spec Kit template** — every principle is still a `[PRINCIPLE_N_NAME]` / `[PRINCIPLE_N_DESCRIPTION]` placeholder. There are therefore no ratified project principles to gate against, and no gate can be meaningfully evaluated or failed.

**Initial check (pre-Phase 0)**: PASS by vacuity. Recorded as a known gap, not a violation — run `/speckit-constitution` to ratify real principles if the team wants future features gated.

In the absence of ratified principles, this plan is held to the conventions the codebase already demonstrates:

| Convention observed in repo | How this plan complies |
|---|---|
| Pages live in `src/pages/<Feature>/`, one directory per feature | New `src/pages/KnowledgeBase/` directory |
| Routes registered in `src/components/PageContainer/PageContainer.tsx` under `<ProtectedRoute />` | `knowledge-base` route added inside the same protected block |
| Sidebar entries declared in `src/components/Navbar/links.tsx` with a `react-icons/md` icon | New entry appended after *Partner Onboarding*, before *Log Out* |
| UI built from PrimeReact components | `Card`, `Dialog`, `Button`, `IconField`/`InputIcon`/`InputText` |
| Feature-local types in a co-located file (`DTO_Interfaces.ts` pattern) | `types.ts` co-located in the feature directory |
| No new runtime dependencies added casually | Zero new dependencies |

**Post-design re-check (post-Phase 1)**: PASS. The Phase 1 design introduces no new project, service, layer of indirection, or dependency; it adds one page, one static data module, and two one-line registrations. Complexity Tracking is therefore empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-knowledge-base/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── knowledge-base-catalog.md   # Shape + content of the static catalog
│   └── ui-contract.md              # Route, navigation, and screen behaviour contract
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── pages/
│   └── KnowledgeBase/                 # NEW — the whole feature
│       ├── index.tsx                  # re-export, matching src/pages/FilesPage/index.tsx
│       ├── KnowledgeBase.tsx          # page component: search + list + player dialog
│       ├── KnowledgeBaseCard.tsx      # one entry: title, description, watch, quick access
│       ├── knowledgeBaseItems.ts      # the static six-entry catalog (single source of truth)
│       ├── types.ts                   # KnowledgeBaseItem interface
│       └── KnowledgeBase.css          # feature-scoped styles
├── components/
│   ├── Navbar/
│   │   └── links.tsx                  # EDIT — add Knowledge Base entry after Partner Onboarding
│   └── PageContainer/
│       └── PageContainer.tsx          # EDIT — register the /knowledge-base protected route
└── services/
    └── Storage/
        └── Storage.service.ts         # UNCHANGED — read via retrieveRoles() for quick-access gating
```

**Structure Decision**: Single-project frontend layout. This repository is one Create React App SPA (`src/` only; `php/` is deploy glue and the API lives in a separate service), so the template's backend/frontend split does not apply. The feature follows the established one-directory-per-page convention seen in `src/pages/PartnerOnboarding/` and `src/pages/FilesPage/`, keeping all new code inside `src/pages/KnowledgeBase/` and limiting edits to existing files to two registration points.

## Complexity Tracking

> No Constitution Check violations. Table intentionally empty.
