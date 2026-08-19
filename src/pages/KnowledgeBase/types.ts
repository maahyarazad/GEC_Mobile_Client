// One tutorial in the Knowledge Base catalog. The catalog is static content
// maintained in knowledgeBaseItems.ts — there is no backend, no loading state
// and no failure mode; see specs/001-knowledge-base/contracts/.
export interface KnowledgeBaseItem {
    // Stable kebab-case identifier. Used as the React list key and as the
    // dialog's selected-item handle. Never displayed.
    readonly id: string;
    // Display heading. Searchable.
    readonly title: string;
    // One to two sentences on what the tutorial covers. Searchable.
    readonly description: string;
    // Extra search vocabulary that is matched but never rendered.
    readonly keywords?: readonly string[];
    // Absolute URL of the tutorial video. When absent the entry renders its
    // "coming soon" state rather than a broken player.
    readonly videoUrl?: string;
    // In-app path the quick-access control navigates to. Must be a route
    // registered in PageContainer.tsx.
    readonly targetRoute: string;
    // Permission identifier for targetRoute, matching the `id` values in
    // components/Navbar/links.tsx. Omitted means the target is ungated.
    readonly targetAppId?: number;
}
