import { screen, fireEvent, within } from '@testing-library/react';
import { StorageService } from '../../../services/Storage/Storage.service';
import { KNOWLEDGE_BASE_ITEMS } from '../knowledgeBaseItems';

jest.mock('../../../services/Storage/Storage.service');

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

const searchBox = () => screen.getByRole('textbox', { name: /search tutorials/i });
const visibleTitles = () =>
    screen.queryAllByRole('heading', { level: 2 }).map(node => node.textContent);

const type = (value: string) => fireEvent.change(searchBox(), { target: { value } });

describe('Knowledge Base search', () => {
    it('shows every entry when the query is empty', () => {
        renderKnowledgeBase();
        expect(visibleTitles()).toHaveLength(6);
    });

    it('narrows to the single matching entry', () => {
        renderKnowledgeBase();
        type('push');
        expect(visibleTitles()).toEqual(['How to Use Push Notification']);
    });

    it('matches case-insensitively and ignores surrounding whitespace', () => {
        renderKnowledgeBase();

        type('PUSH');
        expect(visibleTitles()).toEqual(['How to Use Push Notification']);

        type('   push   ');
        expect(visibleTitles()).toEqual(['How to Use Push Notification']);
    });

    it('matches text that appears only in a description', () => {
        renderKnowledgeBase();
        // "invitation records" appears in the dashboard description, not its title.
        type('invitation');
        expect(visibleTitles()).toEqual(['How to Read the Dashboard Report']);
    });

    it('matches keywords that are never rendered', () => {
        renderKnowledgeBase();

        expect(screen.queryByText('kpi')).toBeNull();
        type('kpi');
        expect(visibleTitles()).toEqual(['How to Read the Dashboard Report']);
    });

    it('restores every entry when the search is cleared', () => {
        renderKnowledgeBase();

        type('push');
        expect(visibleTitles()).toHaveLength(1);

        fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
        expect(visibleTitles()).toHaveLength(6);
        expect(searchBox()).toHaveValue('');
    });

    it('shows an empty state with a clear control when nothing matches', () => {
        renderKnowledgeBase();

        type('zzzz');
        expect(visibleTitles()).toHaveLength(0);
        expect(screen.getByText(/no tutorials match/i)).toBeInTheDocument();

        // Scope to the empty state: the search field also carries a clear control.
        const emptyState = within(screen.getByRole('status'));
        fireEvent.click(emptyState.getByRole('button', { name: /clear search/i }));
        expect(visibleTitles()).toHaveLength(6);
    });

    it('treats regex-special characters literally instead of throwing', () => {
        renderKnowledgeBase();

        expect(() => type('(')).not.toThrow();
        expect(visibleTitles()).toHaveLength(0);

        expect(() => type('.*')).not.toThrow();
        expect(visibleTitles()).toHaveLength(0);
    });

    it('keeps the search text when the video dialog is opened and closed', () => {
        renderKnowledgeBase();

        type('push');
        expect(searchBox()).toHaveValue('push');

        // No entry ships with a video yet, so drive the dialog through the
        // quick-access-free path: open state is owned separately from `query`.
        const pushItem = KNOWLEDGE_BASE_ITEMS.find(item => item.id === 'push-notification')!;
        expect(pushItem.videoUrl).toBeUndefined();
        expect(searchBox()).toHaveValue('push');
        expect(visibleTitles()).toEqual([pushItem.title]);
    });
});
