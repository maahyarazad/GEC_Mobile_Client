import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { StorageService } from '../../services/Storage/Storage.service';
import { IAdminRelease } from '../../@types/AdminRelease';
import KnowledgeBaseCard from './KnowledgeBaseCard';
import { KNOWLEDGE_BASE_ITEMS } from './knowledgeBaseItems';
import { KnowledgeBaseItem } from './types';
import './KnowledgeBase.css';

// Roles arrive asynchronously after login (Navbar polls the same way), so a
// first read can legitimately return null. Poll briefly rather than treating
// "not loaded yet" as "permission denied".
const ROLE_POLL_INTERVAL_MS = 500;
const ROLE_POLL_MAX_ATTEMPTS = 10;

const searchIndex = (item: KnowledgeBaseItem): string =>
    `${item.title} ${item.description} ${(item.keywords ?? []).join(' ')}`.toLowerCase();

const KnowledgeBase: React.FC = () => {
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [activeItem, setActiveItem] = useState<KnowledgeBaseItem | null>(null);
    const [videoError, setVideoError] = useState(false);
    const [roles, setRoles] = useState<IAdminRelease[] | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let attempts = 0;

        const loadRoles = () => {
            const storageRoles = StorageService.retrieveRoles();

            if (!storageRoles) {
                if (attempts++ >= ROLE_POLL_MAX_ATTEMPTS) return;
                pollRef.current = setTimeout(loadRoles, ROLE_POLL_INTERVAL_MS);
                return;
            }

            setRoles(storageRoles as IAdminRelease[]);
        };

        loadRoles();

        return () => {
            if (pollRef.current) clearTimeout(pollRef.current);
        };
    }, []);

    // Match with String.includes rather than a RegExp so the query is literal
    // by construction: "(" and ".*" can neither throw nor match everything.
    const visibleItems = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return KNOWLEDGE_BASE_ITEMS;
        return KNOWLEDGE_BASE_ITEMS.filter(item => searchIndex(item).includes(needle));
    }, [query]);

    // Mirrors the predicate Navbar uses to filter links, so if the sidebar
    // hides a section, quick access to it is disabled too.
    const isTargetPermitted = useCallback(
        (item: KnowledgeBaseItem): boolean => {
            if (item.targetAppId === undefined) return true;
            if (roles === null) return false;
            return roles.some(role => Number(role.appId) === item.targetAppId && role.r === '1');
        },
        [roles],
    );

    const stopPlayback = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.pause();
        video.currentTime = 0;
    }, []);

    const closeDialog = useCallback(() => {
        stopPlayback();
        setActiveItem(null);
        setVideoError(false);
    }, [stopPlayback]);

    const handleWatch = useCallback((item: KnowledgeBaseItem) => {
        setVideoError(false);
        setActiveItem(item);
    }, []);

    // Stop playback and tear the dialog down before navigating, so audio never
    // continues on the destination screen.
    const handleQuickAccess = useCallback(
        (item: KnowledgeBaseItem) => {
            if (!isTargetPermitted(item)) return;
            stopPlayback();
            setActiveItem(null);
            setVideoError(false);
            navigate(item.targetRoute);
        },
        [isTargetPermitted, navigate, stopPlayback],
    );

    return (
        <div className='kb-page'>
            <header className='kb-page__header'>
                <h1 className='kb-page__title'>Knowledge Base</h1>
                <p className='kb-page__subtitle'>
                    Short video tutorials for each section of the admin panel. Use the arrow next to a
                    tutorial to jump straight to that section.
                </p>
            </header>

            <div className='kb-page__search'>
                <IconField iconPosition='left'>
                    <InputIcon className='pi pi-search' />
                    <InputText
                        id='kb-search'
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder='Search tutorials…'
                        aria-label='Search tutorials'
                    />
                </IconField>
                {query !== '' && (
                    <Button
                        className='kb-page__search-clear'
                        icon='pi pi-times'
                        text
                        rounded
                        aria-label='Clear search'
                        onClick={() => setQuery('')}
                    />
                )}
            </div>

            {visibleItems.length === 0 ? (
                <div className='kb-page__empty' role='status'>
                    <p>No tutorials match “{query.trim()}”.</p>
                    <Button label='Clear search' text onClick={() => setQuery('')} />
                </div>
            ) : (
                <div className='kb-page__list'>
                    {visibleItems.map(item => (
                        <KnowledgeBaseCard
                            key={item.id}
                            item={item}
                            permitted={isTargetPermitted(item)}
                            permissionPending={roles === null && item.targetAppId !== undefined}
                            onWatch={handleWatch}
                            onQuickAccess={handleQuickAccess}
                        />
                    ))}
                </div>
            )}

            <Dialog
                header={activeItem?.title}
                visible={activeItem !== null}
                modal
                dismissableMask
                className='kb-dialog'
                onHide={closeDialog}
            >
                {activeItem && (
                    videoError ? (
                        <p className='kb-dialog__error'>
                            This tutorial video could not be loaded. Please try again, or contact the
                            administrator if the problem continues.
                        </p>
                    ) : (
                        // preload="none" so opening the page never costs video
                        // bytes; the element only exists while the dialog is open.
                        <video
                            ref={videoRef}
                            className='kb-dialog__video'
                            src={activeItem.videoUrl}
                            controls
                            preload='none'
                            onError={() => setVideoError(true)}
                        />
                    )
                )}
            </Dialog>
        </div>
    );
};

export default KnowledgeBase;
