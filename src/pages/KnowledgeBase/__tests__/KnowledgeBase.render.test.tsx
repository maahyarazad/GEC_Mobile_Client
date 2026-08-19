import { screen } from '@testing-library/react';
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

describe('Knowledge Base catalog rendering', () => {
    it('renders all six entries', () => {
        renderKnowledgeBase();

        expect(KNOWLEDGE_BASE_ITEMS).toHaveLength(6);
        KNOWLEDGE_BASE_ITEMS.forEach(item => {
            expect(screen.getByText(item.title)).toBeInTheDocument();
        });
    });

    it('renders every entry in catalog order', () => {
        renderKnowledgeBase();

        const headings = screen.getAllByRole('heading', { level: 2 }).map(node => node.textContent);
        expect(headings).toEqual(KNOWLEDGE_BASE_ITEMS.map(item => item.title));
    });

    it('gives every entry a non-empty description', () => {
        renderKnowledgeBase();

        KNOWLEDGE_BASE_ITEMS.forEach(item => {
            expect(item.description.trim()).not.toBe('');
            expect(screen.getByText(item.description)).toBeInTheDocument();
        });
    });

    it('uses a unique id for every entry', () => {
        const ids = KNOWLEDGE_BASE_ITEMS.map(item => item.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});
