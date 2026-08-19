import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StorageService } from '../../../services/Storage/Storage.service';
import { KnowledgeBaseService } from '../../../services/KnowledgeBase/KnowledgeBase.service';
import { IAdminRelease } from '../../../@types/AdminRelease';
import { IKnowledgeBaseApiEntry } from '../../../@types/KnowledgeBase';
import { KNOWLEDGE_BASE_ITEMS } from '../knowledgeBaseItems';
import KnowledgeBase from '../KnowledgeBase';

jest.mock('../../../services/Storage/Storage.service');
jest.mock('../../../services/KnowledgeBase/KnowledgeBase.service');

const mockedStorage = StorageService as jest.Mocked<typeof StorageService>;
const mockedService = KnowledgeBaseService as jest.Mocked<typeof KnowledgeBaseService>;

const ALL_APP_IDS = [75, 76, 79, 82, 88];

const rolesFor = (appIds: number[]): IAdminRelease[] =>
    appIds.map(appId => ({ appId, r: '1', w: '1', e: '1', d: '1', s: '1' }));

// A published row as the list endpoint returns it, per the swagger schema.
export const apiEntry = (over: Partial<IKnowledgeBaseApiEntry> = {}): IKnowledgeBaseApiEntry => ({
    id: 1,
    title: 'How to Read the Dashboard Report',
    description: 'Walks through each dashboard panel and the invitation records it counts.',
    category_id: 1,
    category_name: 'Admin Guides',
    category_slug: 'admin-guides',
    quick_access_path: '/dashboard',
    quick_access_label: 'Dashboard',
    status: 1,
    sort_order: 0,
    date_created: '2026-08-01T00:00:00.000Z',
    video_id: null,
    has_video: false,
    has_quick_access: true,
    ...over,
});

const renderKnowledgeBase = () =>
    render(
        <MemoryRouter>
            <KnowledgeBase />
        </MemoryRouter>,
    );

beforeEach(() => {
    mockedStorage.retrieveRoles.mockReturnValue(rolesFor(ALL_APP_IDS));
    mockedService.listPublishedEntries.mockResolvedValue([]);
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Knowledge Base catalog rendering', () => {
    it('renders the entries returned by the API', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({ id: 1, title: 'First Guide' }),
            apiEntry({ id: 2, title: 'Second Guide', quick_access_path: '/users' }),
        ]);

        renderKnowledgeBase();

        expect(await screen.findByText('First Guide')).toBeInTheDocument();
        expect(screen.getByText('Second Guide')).toBeInTheDocument();
    });

    it('preserves the order the server returned', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({ id: 1, title: 'Alpha' }),
            apiEntry({ id: 2, title: 'Beta' }),
            apiEntry({ id: 3, title: 'Gamma' }),
        ]);

        renderKnowledgeBase();

        await screen.findByText('Alpha');
        expect(screen.getAllByRole('heading', { level: 2 }).map(n => n.textContent)).toEqual([
            'Alpha',
            'Beta',
            'Gamma',
        ]);
    });

    it('requests only published entries', async () => {
        renderKnowledgeBase();
        await waitFor(() => expect(mockedService.listPublishedEntries).toHaveBeenCalled());
    });

    it('falls back to the bundled catalog when the API fails', async () => {
        mockedService.listPublishedEntries.mockRejectedValue(new Error('network down'));

        renderKnowledgeBase();

        expect(await screen.findByText(KNOWLEDGE_BASE_ITEMS[0].title)).toBeInTheDocument();
        KNOWLEDGE_BASE_ITEMS.forEach(item => {
            expect(screen.getByText(item.title)).toBeInTheDocument();
        });
        expect(screen.getByText(/could not reach the knowledge base service/i)).toBeInTheDocument();
    });

    it('shows every fallback entry as having no video', async () => {
        mockedService.listPublishedEntries.mockRejectedValue(new Error('network down'));

        renderKnowledgeBase();

        await screen.findByText(KNOWLEDGE_BASE_ITEMS[0].title);
        expect(screen.getAllByRole('button', { name: /video coming soon/i })).toHaveLength(KNOWLEDGE_BASE_ITEMS.length);
        expect(screen.queryByRole('button', { name: /watch tutorial/i })).toBeNull();
    });

    it('shows an empty state when nothing is published', async () => {
        renderKnowledgeBase();
        expect(await screen.findByText(/no tutorials have been published yet/i)).toBeInTheDocument();
    });

    it('keeps every bundled fallback entry non-empty and uniquely keyed', () => {
        const ids = KNOWLEDGE_BASE_ITEMS.map(item => item.id);
        expect(new Set(ids).size).toBe(ids.length);
        KNOWLEDGE_BASE_ITEMS.forEach(item => {
            expect(item.title.trim()).not.toBe('');
            expect(item.description.trim()).not.toBe('');
        });
    });
});
