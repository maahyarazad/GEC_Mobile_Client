import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StorageService } from '../../../services/Storage/Storage.service';
import { KnowledgeBaseService } from '../../../services/KnowledgeBase/KnowledgeBase.service';
import { IAdminRelease } from '../../../@types/AdminRelease';
import { IKnowledgeBaseApiEntry } from '../../../@types/KnowledgeBase';
import { APP_ID_BY_ROUTE, KNOWLEDGE_BASE_ITEMS } from '../knowledgeBaseItems';
import KnowledgeBase from '../KnowledgeBase';

jest.mock('../../../services/Storage/Storage.service');
jest.mock('../../../services/KnowledgeBase/KnowledgeBase.service');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const mockedStorage = StorageService as jest.Mocked<typeof StorageService>;
const mockedService = KnowledgeBaseService as jest.Mocked<typeof KnowledgeBaseService>;

const ALL_APP_IDS = [75, 76, 79, 82, 88];

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

// One API row per bundled guide, so the full route map is exercised.
const allEntries = (): IKnowledgeBaseApiEntry[] =>
    KNOWLEDGE_BASE_ITEMS.map((item, index) =>
        apiEntry({ id: index + 1, title: item.title, quick_access_path: item.targetRoute }),
    );

const renderKnowledgeBase = () =>
    render(
        <MemoryRouter>
            <KnowledgeBase />
        </MemoryRouter>,
    );

const quickAccessFor = (title: string) => screen.getByRole('button', { name: `Go to ${title}` });

afterEach(() => {
    jest.clearAllMocks();
});

describe('Knowledge Base quick access', () => {
    it('navigates to the quick_access_path the server supplied', async () => {
        mockedStorage.retrieveRoles.mockReturnValue(rolesFor(ALL_APP_IDS));
        mockedService.listPublishedEntries.mockResolvedValue(allEntries());

        renderKnowledgeBase();
        await screen.findByText(KNOWLEDGE_BASE_ITEMS[0].title);

        KNOWLEDGE_BASE_ITEMS.forEach(item => {
            mockNavigate.mockClear();
            fireEvent.click(quickAccessFor(item.title));
            expect(mockNavigate).toHaveBeenCalledWith(item.targetRoute);
        });
    });

    it('maps the six admin routes to the permissions in the UI contract', () => {
        expect(KNOWLEDGE_BASE_ITEMS.map(item => item.targetRoute)).toEqual([
            '/dashboard',
            '/requests',
            '/category/partner',
            '/users',
            '/push-notification',
            '/partner-onboarding',
        ]);
        expect(APP_ID_BY_ROUTE).toEqual({
            '/requests': 75,
            '/category/partner': 76,
            '/users': 79,
            '/push-notification': 82,
            '/partner-onboarding': 88,
        });
    });

    it('always enables the ungated Dashboard route', async () => {
        mockedStorage.retrieveRoles.mockReturnValue(rolesFor([]));
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({ title: 'Dashboard Guide', quick_access_path: '/dashboard' }),
        ]);

        renderKnowledgeBase();
        await screen.findByText('Dashboard Guide');

        expect(APP_ID_BY_ROUTE['/dashboard']).toBeUndefined();
        expect(quickAccessFor('Dashboard Guide')).toBeEnabled();
    });

    it('disables quick access and does not navigate when the role denies the target', async () => {
        mockedStorage.retrieveRoles.mockReturnValue(rolesFor(ALL_APP_IDS.filter(id => id !== 82)));
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({ title: 'Push Guide', quick_access_path: '/push-notification' }),
        ]);

        renderKnowledgeBase();
        await screen.findByText('Push Guide');

        const control = quickAccessFor('Push Guide');
        expect(control).toBeDisabled();
        fireEvent.click(control);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('treats a role with read denied as denied', async () => {
        mockedStorage.retrieveRoles.mockReturnValue([
            { appId: 82, r: '0', w: '0', e: '0', d: '0', s: '1' },
        ]);
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({ title: 'Push Guide', quick_access_path: '/push-notification' }),
        ]);

        renderKnowledgeBase();
        await screen.findByText('Push Guide');

        expect(quickAccessFor('Push Guide')).toBeDisabled();
    });

    it('disables gated controls while roles are still loading', async () => {
        mockedStorage.retrieveRoles.mockReturnValue(null);
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({ title: 'Push Guide', quick_access_path: '/push-notification' }),
        ]);

        renderKnowledgeBase();
        await screen.findByText('Push Guide');

        const control = quickAccessFor('Push Guide');
        expect(control).toBeDisabled();
        expect(control).toHaveAttribute('title', expect.stringMatching(/checking your permissions/i));
    });

    it('disables quick access for an entry the server gave no route', async () => {
        mockedStorage.retrieveRoles.mockReturnValue(rolesFor(ALL_APP_IDS));
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({ title: 'Unlinked Guide', quick_access_path: null, has_quick_access: false }),
        ]);

        renderKnowledgeBase();
        await screen.findByText('Unlinked Guide');

        const control = quickAccessFor('Unlinked Guide');
        expect(control).toBeDisabled();
        fireEvent.click(control);
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
