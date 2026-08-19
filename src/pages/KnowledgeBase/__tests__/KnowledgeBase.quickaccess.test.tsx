import { screen, fireEvent } from '@testing-library/react';
import { StorageService } from '../../../services/Storage/Storage.service';
import { KNOWLEDGE_BASE_ITEMS } from '../knowledgeBaseItems';

jest.mock('../../../services/Storage/Storage.service');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
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

afterEach(() => {
    jest.clearAllMocks();
});

const quickAccessFor = (title: string) => screen.getByRole('button', { name: `Go to ${title}` });

describe('Knowledge Base quick access', () => {
    it('navigates to each entry target route', () => {
        mockedStorage.retrieveRoles.mockReturnValue(rolesFor(ALL_APP_IDS));
        renderKnowledgeBase();

        KNOWLEDGE_BASE_ITEMS.forEach(item => {
            mockNavigate.mockClear();
            fireEvent.click(quickAccessFor(item.title));
            expect(mockNavigate).toHaveBeenCalledWith(item.targetRoute);
        });
    });

    it('maps the six entries to the routes named in the UI contract', () => {
        expect(KNOWLEDGE_BASE_ITEMS.map(item => item.targetRoute)).toEqual([
            '/dashboard',
            '/requests',
            '/category/partner',
            '/users',
            '/push-notification',
            '/partner-onboarding',
        ]);
    });

    it('always enables the ungated Dashboard entry', () => {
        mockedStorage.retrieveRoles.mockReturnValue(rolesFor([]));
        renderKnowledgeBase();

        const dashboard = KNOWLEDGE_BASE_ITEMS[0];
        expect(dashboard.targetAppId).toBeUndefined();
        expect(quickAccessFor(dashboard.title)).toBeEnabled();
    });

    it('disables quick access and does not navigate when the role denies the target', () => {
        // Every permission except Push Notification (82).
        mockedStorage.retrieveRoles.mockReturnValue(rolesFor(ALL_APP_IDS.filter(id => id !== 82)));
        renderKnowledgeBase();

        const denied = KNOWLEDGE_BASE_ITEMS.find(item => item.targetAppId === 82)!;
        const control = quickAccessFor(denied.title);

        expect(control).toBeDisabled();
        fireEvent.click(control);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('treats a role with read denied as denied', () => {
        mockedStorage.retrieveRoles.mockReturnValue([
            { appId: 82, r: '0', w: '0', e: '0', d: '0', s: '1' },
        ]);
        renderKnowledgeBase();

        const denied = KNOWLEDGE_BASE_ITEMS.find(item => item.targetAppId === 82)!;
        expect(quickAccessFor(denied.title)).toBeDisabled();
    });

    it('disables gated controls while roles are still loading', () => {
        mockedStorage.retrieveRoles.mockReturnValue(null);
        renderKnowledgeBase();

        const gated = KNOWLEDGE_BASE_ITEMS.find(item => item.targetAppId !== undefined)!;
        const control = quickAccessFor(gated.title);

        expect(control).toBeDisabled();
        expect(control).toHaveAttribute('title', expect.stringMatching(/checking your permissions/i));
    });
});
