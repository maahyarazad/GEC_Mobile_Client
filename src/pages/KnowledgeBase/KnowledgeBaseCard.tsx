import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { IKnowledgeBaseEntry } from '../../@types/KnowledgeBase';

interface Props {
    entry: IKnowledgeBaseEntry;
    // False when the signed-in user's role denies the target screen, while
    // roles are still loading, or when the entry has no quick-access route.
    permitted: boolean;
    permissionPending: boolean;
    onWatch: (entry: IKnowledgeBaseEntry) => void;
    onQuickAccess: (entry: IKnowledgeBaseEntry) => void;
}

const KnowledgeBaseCard: React.FC<Props> = ({
    entry,
    permitted,
    permissionPending,
    onWatch,
    onQuickAccess,
}) => {
    const hasVideo = entry.videoId !== null;
    const hasQuickAccess = Boolean(entry.targetRoute);

    const quickAccessTitle = permitted
        ? `Go to ${entry.title}`
        : permissionPending
            ? 'Checking your permissions…'
            : hasQuickAccess
                ? 'You do not have permission to open this section'
                : 'This tutorial has no linked section';

    return (
        <Card className='kb-card'>
            <div className='kb-card__body'>
                <div className='kb-card__text'>
                    <h2 className='kb-card__title'>{entry.title}</h2>
                    <p className='kb-card__description'>{entry.description}</p>
                </div>

                <div className='kb-card__actions'>
                    {hasVideo ? (
                        <Button
                            className='kb-card__watch'
                            icon='pi pi-play'
                            label='Watch tutorial'
                            onClick={() => onWatch(entry)}
                        />
                    ) : (
                        <span className='kb-card__coming-soon'>
                            <i className='pi pi-clock' aria-hidden='true' /> Video coming soon
                        </span>
                    )}

                    <Button
                        className='kb-card__quick-access'
                        icon='pi pi-external-link'
                        text
                        rounded
                        disabled={!permitted}
                        aria-label={`Go to ${entry.title}`}
                        title={quickAccessTitle}
                        onClick={() => onQuickAccess(entry)}
                    />
                </div>
            </div>
        </Card>
    );
};

export default KnowledgeBaseCard;
