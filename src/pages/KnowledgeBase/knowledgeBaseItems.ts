import { KnowledgeBaseItem } from './types';

// The Knowledge Base catalog. Static by design (see spec FR-004): editing a
// description or attaching a video is a change to this file and nothing else.
//
// Array order is display order. `videoUrl` is deliberately absent until the
// tutorial videos are produced — every entry renders a "coming soon" state
// until then, which is the expected shipping state.
export const KNOWLEDGE_BASE_ITEMS: readonly KnowledgeBaseItem[] = [
    {
        id: 'dashboard-report',
        title: 'How to Read the Dashboard Report',
        description:
            'Walks through each panel on the admin dashboard — app user totals, invitation records, and the activity figures — and explains what each number counts and how often it refreshes.',
        keywords: ['report', 'statistics', 'kpi', 'metrics', 'overview', 'home'],
        targetRoute: '/dashboard',
        // No targetAppId: the Dashboard is ungated, matching its sidebar entry.
    },
    {
        id: 'access-requests',
        title: 'How to Manage Access Requests',
        description:
            'Covers reviewing incoming access requests, checking the details behind each one, and approving or rejecting them so the right people reach the right app.',
        keywords: ['approval', 'reject', 'permissions', 'pending', 'review'],
        // /requests renders the app chooser; the request list itself is at
        // /requests/list. /requests is correct here — it matches the sidebar
        // destination and is where a user following the tutorial would start.
        targetRoute: '/requests',
        targetAppId: 75,
    },
    {
        id: 'partner-categories',
        title: 'How to Manage Partner Categories, Tags and Offers',
        description:
            'Shows the category to partner to offers and tags hierarchy: creating and reordering categories, assigning partners to them, and managing each partner’s offers and tags.',
        keywords: ['category', 'categories', 'tag', 'tags', 'offer', 'offers', 'partner', 'discount'],
        targetRoute: '/category/partner',
        // /category/partner has no sidebar link and therefore no appId of its
        // own. Mapped to 76 (Partner List), the permission governing partner
        // data. Pending product owner confirmation — see research.md R7.
        targetAppId: 76,
    },
    {
        id: 'app-users',
        title: 'How to Manage Mobile Application Users',
        description:
            'Explains how to find mobile app users, read their account and membership details, and carry out the account actions available from the user list.',
        keywords: ['members', 'accounts', 'mobile', 'app users', 'customers', 'search'],
        targetRoute: '/users',
        targetAppId: 79,
    },
    {
        id: 'push-notification',
        title: 'How to Use Push Notification',
        description:
            'Takes you through composing a push notification, choosing and testing recipients, and sending or scheduling the send to the mobile app.',
        keywords: ['push', 'notification', 'notifications', 'send', 'message', 'broadcast', 'alert'],
        targetRoute: '/push-notification',
        targetAppId: 82,
    },
    {
        id: 'partner-onboarding',
        title: 'How to Work with the Partner Onboarding Section',
        description:
            'Covers the partner onboarding workflow end to end — partner records, contact roles with recipient and CC tagging, sending onboarding mail, and reading the mail logs.',
        keywords: ['onboarding', 'contacts', 'email', 'mail', 'logs', 'invite', 'prospect'],
        targetRoute: '/partner-onboarding',
        targetAppId: 88,
    },
];
