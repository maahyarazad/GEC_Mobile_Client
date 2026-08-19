# Contract: Knowledge Base Catalog Module

**Feature**: `001-knowledge-base`

The catalog is this feature's internal contract — the single source of truth every other part of the feature reads. Changing content means editing one file; changing shape means editing the interface and every consumer the compiler then flags.

**Module**: `src/pages/KnowledgeBase/knowledgeBaseItems.ts`
**Types**: `src/pages/KnowledgeBase/types.ts`

---

## Exported type

```ts
export interface KnowledgeBaseItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly keywords?: readonly string[];
  readonly videoUrl?: string;
  readonly targetRoute: string;
  readonly targetAppId?: number;
}
```

Field semantics, validation rules (V1–V6), and the six entries' content are specified in [data-model.md](../data-model.md); they are not duplicated here.

## Exported value

```ts
export const KNOWLEDGE_BASE_ITEMS: readonly KnowledgeBaseItem[];
```

### Guarantees consumers may rely on

- **G1** — Exactly six entries, in the order given in [data-model.md](../data-model.md) (FR-003).
- **G2** — `id` is unique across the array and stable across releases (safe as a React key and as a deep-link handle should one be added later).
- **G3** — Every entry has a non-empty `title` and `description` (SC-002).
- **G4** — The array and its entries are `readonly`; consumers must not mutate. Filtering produces a new array.
- **G5** — Available synchronously at import time. There is no loading state, no promise, and no failure mode.
- **G6** — `videoUrl` may be absent on any entry, including all of them. Consumers MUST handle absence as the "coming soon" state, never as an error (FR-007).

### Consumers

| Consumer | Uses |
|---|---|
| `KnowledgeBase.tsx` | Iterates the array, filters by search query, selects the active item for the dialog |
| `KnowledgeBaseCard.tsx` | Renders one entry; reads `title`, `description`, `videoUrl`, `targetRoute`, `targetAppId` |
| `__tests__/` | Imports the real catalog to assert all six render and that search narrows correctly |

## Change protocol

- **Adding a video**: set `videoUrl` on the entry. No other file changes; the card switches from "coming soon" to a working watch control automatically.
- **Editing copy**: edit `title` / `description` / `keywords`. Search picks the change up with no code change.
- **Adding an entry**: append to the array with a fresh `id` and a `targetRoute` already registered in `PageContainer.tsx` (V3). Note this widens FR-003's fixed six — get product sign-off.
- **Removing an entry**: delete it. Any test asserting a count of six must be updated in the same change.
- **Adding a field**: extend the interface; make it optional unless every entry can supply it in the same change.
