import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { StorageService } from '../../services/Storage/Storage.service';
import { KnowledgeBaseService } from '../../services/KnowledgeBase/KnowledgeBase.service';
import { IAdminRelease } from '../../@types/AdminRelease';
import { IKnowledgeBaseApiEntry, IKnowledgeBaseEntry } from '../../@types/KnowledgeBase';
import KnowledgeBaseCard from './KnowledgeBaseCard';
import { APP_ID_BY_ROUTE, KNOWLEDGE_BASE_ITEMS } from './knowledgeBaseItems';
import './KnowledgeBase.css';

// Roles arrive asynchronously after login (Navbar polls the same way), so a
// first read can legitimately return null. Poll briefly rather than treating
// "not loaded yet" as "permission denied".
const ROLE_POLL_INTERVAL_MS = 500;
const ROLE_POLL_MAX_ATTEMPTS = 10;

// Server entries have no keywords column. Reuse the bundled catalog's keywords
// for entries that point at the same admin route, so searching "kpi" keeps
// working against API-sourced content.
const keywordsForRoute = (route: string): readonly string[] | undefined =>
    KNOWLEDGE_BASE_ITEMS.find(item => item.targetRoute === route)?.keywords;

const fromApi = (row: IKnowledgeBaseApiEntry): IKnowledgeBaseEntry => {
    const targetRoute = row.quick_access_path ?? '';
    return {
        id: `api-${row.id}`,
        title: row.title,
        description: row.description ?? '',
        keywords: keywordsForRoute(targetRoute),
        targetRoute,
        targetAppId: APP_ID_BY_ROUTE[targetRoute],
        videoId: row.has_video ? row.video_id : null,
    };
};

// The bundled catalog never carries videos; only the server serves bytes.
const FALLBACK_ENTRIES: IKnowledgeBaseEntry[] = KNOWLEDGE_BASE_ITEMS.map(item => ({
    ...item,
    videoId: null,
}));

const searchIndex = (entry: IKnowledgeBaseEntry): string =>
    `${entry.title} ${entry.description} ${(entry.keywords ?? []).join(' ')}`.toLowerCase();

const KnowledgeBase: React.FC = () => {
    const navigate = useNavigate();

    const [entries, setEntries] = useState<IKnowledgeBaseEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);

    const [query, setQuery] = useState('');
    const [activeEntry, setActiveEntry] = useState<IKnowledgeBaseEntry | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState(false);
    const [videoError, setVideoError] = useState(false);

    const [roles, setRoles] = useState<IAdminRelease[] | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Object URLs are owned by this component and must be revoked, including on
    // unmount while a dialog is still open.
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        KnowledgeBaseService.listPublishedEntries()
            .then(rows => {
                if (cancelled) return;
                setEntries(rows.map(fromApi));
                setLoadFailed(false);
            })
            .catch(error => {
                if (cancelled) return;
                console.log('Knowledge Base | listPublishedEntries | ', error);
                // Degrade to the bundled catalog rather than showing nothing:
                // the titles and quick-access links still have value offline.
                setEntries(FALLBACK_ENTRIES);
                setLoadFailed(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

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

    useEffect(
        () => () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        },
        [],
    );

    // Match with String.includes rather than a RegExp so the query is literal
    // by construction: "(" and ".*" neither throw nor match everything.
    const visibleEntries = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return entries;
        return entries.filter(entry => searchIndex(entry).includes(needle));
    }, [entries, query]);

    // Mirrors the predicate Navbar uses to filter links, so if the sidebar
    // hides a section, quick access to it is disabled too.
    const isTargetPermitted = useCallback(
        (entry: IKnowledgeBaseEntry): boolean => {
            if (!entry.targetRoute) return false;
            if (entry.targetAppId === undefined) return true;
            if (roles === null) return false;
            return roles.some(role => Number(role.appId) === entry.targetAppId && role.r === '1');
        },
        [roles],
    );

    const releaseVideo = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        setVideoUrl(null);
    }, []);

    const closeDialog = useCallback(() => {
        releaseVideo();
        setActiveEntry(null);
        setVideoError(false);
        setVideoLoading(false);
    }, [releaseVideo]);

    const handleWatch = useCallback((entry: IKnowledgeBaseEntry) => {
        if (entry.videoId === null) return;

        setActiveEntry(entry);
        setVideoError(false);
        setVideoLoading(true);

        KnowledgeBaseService.fetchVideoObjectUrl(entry.videoId)
            .then(url => {
                objectUrlRef.current = url;
                setVideoUrl(url);
            })
            .catch(error => {
                console.log('Knowledge Base | fetchVideoObjectUrl | ', error);
                setVideoError(true);
            })
            .finally(() => setVideoLoading(false));
    }, []);

    // Stop playback and release the blob before navigating, so audio never
    // continues on the destination screen.
    const handleQuickAccess = useCallback(
        (entry: IKnowledgeBaseEntry) => {
            if (!isTargetPermitted(entry)) return;
            releaseVideo();
            setActiveEntry(null);
            setVideoError(false);
            setVideoLoading(false);
            navigate(entry.targetRoute);
        },
        [isTargetPermitted, navigate, releaseVideo],
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

            {loadFailed && (
                <Message
                    className='kb-page__offline'
                    severity='warn'
                    text='Could not reach the Knowledge Base service. Showing the built-in guide list; videos are unavailable.'
                />
            )}

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

            {loading ? (
                <div className='kb-page__loading'>
                    <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
                </div>
            ) : visibleEntries.length === 0 ? (
                <div className='kb-page__empty' role='status'>
                    {query.trim() ? (
                        <>
                            <p>No tutorials match “{query.trim()}”.</p>
                            <Button label='Clear search' text onClick={() => setQuery('')} />
                        </>
                    ) : (
                        <p>No tutorials have been published yet.</p>
                    )}
                </div>
            ) : (
                <div className='kb-page__list'>
                    {visibleEntries.map(entry => (
                        <KnowledgeBaseCard
                            key={entry.id}
                            entry={entry}
                            permitted={isTargetPermitted(entry)}
                            permissionPending={roles === null && entry.targetAppId !== undefined}
                            onWatch={handleWatch}
                            onQuickAccess={handleQuickAccess}
                        />
                    ))}
                </div>
            )}

            <Dialog
                header={activeEntry?.title}
                visible={activeEntry !== null}
                modal
                dismissableMask
                className='kb-dialog'
                onHide={closeDialog}
            >
                {videoError ? (
                    <p className='kb-dialog__error'>
                        This tutorial video could not be loaded. Please try again, or contact the
                        administrator if the problem continues.
                    </p>
                ) : videoLoading || !videoUrl ? (
                    <div className='kb-dialog__loading'>
                        <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
                        <p>Loading tutorial…</p>
                    </div>
                ) : (
                    // Blob URL, not the endpoint: the stream is behind the admin
                    // JWT and <video src> cannot send an Authorization header.
                    <video
                        ref={videoRef}
                        className='kb-dialog__video'
                        src={videoUrl}
                        controls
                        autoPlay
                        onError={() => setVideoError(true)}
                    />
                )}
            </Dialog>
        </div>
    );
};

export default KnowledgeBase;
