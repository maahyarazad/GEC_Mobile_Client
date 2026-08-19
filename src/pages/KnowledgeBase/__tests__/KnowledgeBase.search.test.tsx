import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

const rolesFor = (appIds: number[]): IAdminRelease[] =>
    appIds.map(appId => ({ appId, r: '1', w: '1', e: '1', d: '1', s: '1' }));

const apiEntry = (over: Partial<IKnowledgeBaseApiEntry> = {}): IKnowledgeBaseApiEntry => ({
    id: 1,
    title: 'Guide',
    description: 'A guide.',
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

// Mirror the bundled guides so title, description and keyword matching are all
// exercised against realistic content.
const allEntries = (): IKnowledgeBaseApiEntry[] =>
    KNOWLEDGE_BASE_ITEMS.map((item, index) =>
        apiEntry({
            id: index + 1,
            title: item.title,
            description: item.description,
            quick_access_path: item.targetRoute,
        }),
    );

const renderKnowledgeBase = () =>
    render(
        <MemoryRouter>
            <KnowledgeBase />
        </MemoryRouter>,
    );

const searchBox = () => screen.getByRole('textbox', { name: /search tutorials/i });
const visibleTitles = () =>
    screen.queryAllByRole('heading', { level: 2 }).map(node => node.textContent);
const type = (value: string) => fireEvent.change(searchBox(), { target: { value } });

beforeEach(() => {
    mockedStorage.retrieveRoles.mockReturnValue(rolesFor([75, 76, 79, 82, 88]));
    mockedService.listPublishedEntries.mockResolvedValue(allEntries());
});

afterEach(() => {
    jest.clearAllMocks();
});

const ready = () => screen.findByText(KNOWLEDGE_BASE_ITEMS[0].title);

describe('Knowledge Base search', () => {
    it('shows every entry when the query is empty', async () => {
        renderKnowledgeBase();
        await ready();
        expect(visibleTitles()).toHaveLength(6);
    });

    it('narrows to the single matching entry', async () => {
        renderKnowledgeBase();
        await ready();

        type('push');
        expect(visibleTitles()).toEqual(['How to Use Push Notification']);
    });

    it('matches case-insensitively and ignores surrounding whitespace', async () => {
        renderKnowledgeBase();
        await ready();

        type('PUSH');
        expect(visibleTitles()).toEqual(['How to Use Push Notification']);

        type('   push   ');
        expect(visibleTitles()).toEqual(['How to Use Push Notification']);
    });

    it('matches text that appears only in a description', async () => {
        renderKnowledgeBase();
        await ready();

        type('invitation');
        expect(visibleTitles()).toEqual(['How to Read the Dashboard Report']);
    });

    it('matches keywords that are never rendered', async () => {
        renderKnowledgeBase();
        await ready();

        expect(screen.queryByText('kpi')).toBeNull();
        type('kpi');
        expect(visibleTitles()).toEqual(['How to Read the Dashboard Report']);
    });

    it('filters client-side without re-querying the server', async () => {
        renderKnowledgeBase();
        await ready();

        type('push');
        expect(mockedService.listPublishedEntries).toHaveBeenCalledTimes(1);
    });

    it('restores every entry when the search is cleared', async () => {
        renderKnowledgeBase();
        await ready();

        type('push');
        expect(visibleTitles()).toHaveLength(1);

        fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
        expect(visibleTitles()).toHaveLength(6);
        expect(searchBox()).toHaveValue('');
    });

    it('shows an empty state with a clear control when nothing matches', async () => {
        renderKnowledgeBase();
        await ready();

        type('zzzz');
        expect(visibleTitles()).toHaveLength(0);
        expect(screen.getByText(/no tutorials match/i)).toBeInTheDocument();

        // Scope to the empty state: the search field also carries a clear control.
        const emptyState = within(screen.getByRole('status'));
        fireEvent.click(emptyState.getByRole('button', { name: /clear search/i }));
        expect(visibleTitles()).toHaveLength(6);
    });

    it('treats regex-special characters literally instead of throwing', async () => {
        renderKnowledgeBase();
        await ready();

        expect(() => type('(')).not.toThrow();
        expect(visibleTitles()).toHaveLength(0);

        expect(() => type('.*')).not.toThrow();
        expect(visibleTitles()).toHaveLength(0);
    });

    it('keeps the search text while a video dialog is opened and closed', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({
                id: 1,
                title: 'How to Use Push Notification',
                quick_access_path: '/push-notification',
                video_id: 7,
                has_video: true,
            }),
            apiEntry({ id: 2, title: 'Unrelated Guide', quick_access_path: '/users' }),
        ]);
        mockedService.fetchVideoObjectUrl.mockResolvedValue('blob:http://localhost/kb');
        (URL as any).revokeObjectURL = jest.fn();

        renderKnowledgeBase();
        await screen.findByText('How to Use Push Notification');

        type('push');
        expect(visibleTitles()).toEqual(['How to Use Push Notification']);

        fireEvent.click(screen.getByRole('button', { name: /watch tutorial/i }));
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(searchBox()).toHaveValue('push');

        fireEvent.click(screen.getByRole('button', { name: /close/i }));
        expect(searchBox()).toHaveValue('push');
        expect(visibleTitles()).toEqual(['How to Use Push Notification']);
    });
});
