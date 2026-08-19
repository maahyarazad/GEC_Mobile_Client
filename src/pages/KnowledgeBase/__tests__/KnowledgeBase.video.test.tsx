import { screen, fireEvent } from '@testing-library/react';
import { StorageService } from '../../../services/Storage/Storage.service';

jest.mock('../../../services/Storage/Storage.service');

// The shipped catalog has no videoUrl yet (videos are not produced), so both
// the "coming soon" path and the player path are exercised against a stub
// catalog with one of each.
jest.mock('../knowledgeBaseItems', () => ({
    KNOWLEDGE_BASE_ITEMS: [
        {
            id: 'with-video',
            title: 'Entry With Video',
            description: 'This one has a tutorial video attached.',
            videoUrl: 'https://example.test/tutorial.mp4',
            targetRoute: '/dashboard',
        },
        {
            id: 'without-video',
            title: 'Entry Without Video',
            description: 'This one has no tutorial video yet.',
            targetRoute: '/users',
            targetAppId: 79,
        },
    ],
}));

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { IAdminRelease } from '../../../@types/AdminRelease';
import KnowledgeBase from '../KnowledgeBase';

// Inlined per file rather than shared from a module: Create React App treats
// every file under __tests__/ as a test suite, so a helper module there fails
// as a suite with no tests.
const ALL_APP_IDS = [75, 76, 79, 82, 88];

const rolesFor = (appIds: number[]): IAdminRelease[] =>
    appIds.map(appId => ({ appId, r: '1', w: '1', e: '1', d: '1', s: '1' }));

const renderKnowledgeBase = () =>
    render(
        <MemoryRouter>
            <KnowledgeBase />
        </MemoryRouter>,
    );

const mockedStorage = StorageService as jest.Mocked<typeof StorageService>;

beforeEach(() => {
    mockedStorage.retrieveRoles.mockReturnValue(rolesFor(ALL_APP_IDS));
});

afterEach(() => {
    jest.clearAllMocks();
});

const video = () => document.querySelector('video');

describe('Knowledge Base video playback', () => {
    it('shows a coming-soon state and no watch button when an entry has no video', () => {
        renderKnowledgeBase();

        expect(screen.getByText(/video coming soon/i)).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /watch tutorial/i })).toHaveLength(1);
    });

    it('does not mount a video element before a player is opened', () => {
        renderKnowledgeBase();

        expect(video()).toBeNull();
    });

    it('mounts the video with preload="none" when the dialog opens', () => {
        renderKnowledgeBase();

        fireEvent.click(screen.getByRole('button', { name: /watch tutorial/i }));

        const element = video();
        expect(element).not.toBeNull();
        expect(element).toHaveAttribute('src', 'https://example.test/tutorial.mp4');
        expect(element).toHaveAttribute('preload', 'none');
        expect(element).toHaveAttribute('controls');
    });

    it('unmounts the video when the dialog is closed', () => {
        renderKnowledgeBase();

        fireEvent.click(screen.getByRole('button', { name: /watch tutorial/i }));
        expect(video()).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: /close/i }));
        expect(video()).toBeNull();
    });

    it('replaces the player with a readable message when the video fails to load', () => {
        renderKnowledgeBase();

        fireEvent.click(screen.getByRole('button', { name: /watch tutorial/i }));
        fireEvent.error(video() as HTMLVideoElement);

        expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
        expect(video()).toBeNull();
    });
});
