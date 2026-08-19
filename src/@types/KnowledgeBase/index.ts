// Shapes returned by the admin Knowledge Base API (/v2/knowledge-base).
// Mirrors controllers_v2/knowledgeBaseController.js in gec-node-admin.

export const KB_STATUS = {
    DRAFT: 0,
    PUBLISHED: 1,
    ARCHIVED: 2,
} as const;

// One row from GET /v2/knowledge-base (the list endpoint).
export interface IKnowledgeBaseApiEntry {
    id: number;
    title: string;
    description: string | null;
    category_id: number;
    category_name: string;
    category_slug: string;
    quick_access_path: string | null;
    quick_access_label: string | null;
    status: number;
    sort_order: number;
    date_created: string;
    video_id: number | null;
    has_video: boolean;
    has_quick_access: boolean;
}

export interface IKnowledgeBaseListData {
    rows: IKnowledgeBaseApiEntry[];
    page: number;
    limit: number;
    total: number;
}

// The view model the Knowledge Base screen renders. Built either from the API
// or, when the API cannot be reached, from the bundled fallback catalog.
export interface IKnowledgeBaseEntry {
    // Stable key. `api-<id>` for server entries, the catalog slug for fallback.
    id: string;
    title: string;
    description: string;
    keywords?: readonly string[];
    targetRoute: string;
    targetAppId?: number;
    // Registered video, or null when the entry has no video yet.
    videoId: number | null;
}
