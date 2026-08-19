import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StorageService } from '../../../services/Storage/Storage.service';
import { KnowledgeBaseService } from '../../../services/KnowledgeBase/KnowledgeBase.service';
import { IAdminRelease } from '../../../@types/AdminRelease';
import { IKnowledgeBaseApiEntry } from '../../../@types/KnowledgeBase';
import KnowledgeBase from '../KnowledgeBase';

jest.mock('../../../services/Storage/Storage.service');
jest.mock('../../../services/KnowledgeBase/KnowledgeBase.service');

const mockedStorage = StorageService as jest.Mocked<typeof StorageService>;
const mockedService = KnowledgeBaseService as jest.Mocked<typeof KnowledgeBaseService>;

const rolesFor = (appIds: number[]): IAdminRelease[] =>
    appIds.map(appId => ({ appId, r: '1', w: '1', e: '1', d: '1', s: '1' }));

const apiEntry = (over: Partial<IKnowledgeBaseApiEntry> = {}): IKnowledgeBaseApiEntry => ({
    id: 1,
    title: 'Entry With Video',
    description: 'This one has a registered video.',
    category_id: 1,
    category_name: 'Admin Guides',
    category_slug: 'admin-guides',
    quick_access_path: '/dashboard',
    quick_access_label: 'Dashboard',
    status: 1,
    sort_order: 0,
    date_created: '2026-08-01T00:00:00.000Z',
    video_id: 7,
    has_video: true,
    has_quick_access: true,
    ...over,
});

const renderKnowledgeBase = () =>
    render(
        <MemoryRouter>
            <KnowledgeBase />
        </MemoryRouter>,
    );

const video = () => document.querySelector('video');

const OBJECT_URL = 'blob:http://localhost/kb-video';

beforeEach(() => {
    mockedStorage.retrieveRoles.mockReturnValue(rolesFor([75, 76, 79, 82, 88]));
    mockedService.fetchVideoObjectUrl.mockResolvedValue(OBJECT_URL);
    // jsdom implements neither of these.
    (URL as any).createObjectURL = jest.fn(() => OBJECT_URL);
    (URL as any).revokeObjectURL = jest.fn();
    window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Knowledge Base video playback', () => {
    it('shows a coming-soon state and no watch button when no video is registered', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([
            apiEntry({ video_id: null, has_video: false }),
        ]);

        renderKnowledgeBase();

        expect(await screen.findByText(/video coming soon/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /watch tutorial/i })).toBeNull();
    });

    it('offers a watch button when a video is registered', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([apiEntry()]);

        renderKnowledgeBase();

        expect(await screen.findByRole('button', { name: /watch tutorial/i })).toBeInTheDocument();
        expect(screen.queryByText(/video coming soon/i)).toBeNull();
    });

    it('fetches no video bytes until a player is opened', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([apiEntry()]);

        renderKnowledgeBase();

        await screen.findByRole('button', { name: /watch tutorial/i });
        expect(mockedService.fetchVideoObjectUrl).not.toHaveBeenCalled();
        expect(video()).toBeNull();
    });

    it('streams the registered video id through the authenticated service', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([apiEntry({ video_id: 7 })]);

        renderKnowledgeBase();
        fireEvent.click(await screen.findByRole('button', { name: /watch tutorial/i }));

        await waitFor(() => expect(mockedService.fetchVideoObjectUrl).toHaveBeenCalledWith(7));
        await waitFor(() => expect(video()).not.toBeNull());
        expect(video()).toHaveAttribute('src', OBJECT_URL);
    });

    it('revokes the object URL and unmounts the video when the dialog closes', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([apiEntry()]);

        renderKnowledgeBase();
        fireEvent.click(await screen.findByRole('button', { name: /watch tutorial/i }));
        await waitFor(() => expect(video()).not.toBeNull());

        fireEvent.click(screen.getByRole('button', { name: /close/i }));

        await waitFor(() => expect(video()).toBeNull());
        expect(URL.revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
    });

    it('reports a readable message when the video cannot be fetched', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([apiEntry()]);
        mockedService.fetchVideoObjectUrl.mockRejectedValue(new Error('404'));

        renderKnowledgeBase();
        fireEvent.click(await screen.findByRole('button', { name: /watch tutorial/i }));

        expect(await screen.findByText(/could not be loaded/i)).toBeInTheDocument();
        expect(video()).toBeNull();
    });

    it('reports a readable message when the element itself errors', async () => {
        mockedService.listPublishedEntries.mockResolvedValue([apiEntry()]);

        renderKnowledgeBase();
        fireEvent.click(await screen.findByRole('button', { name: /watch tutorial/i }));
        await waitFor(() => expect(video()).not.toBeNull());

        fireEvent.error(video() as HTMLVideoElement);

        expect(await screen.findByText(/could not be loaded/i)).toBeInTheDocument();
    });
});
