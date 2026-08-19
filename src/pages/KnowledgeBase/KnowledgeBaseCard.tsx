import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { KnowledgeBaseItem } from './types';

interface Props {
    item: KnowledgeBaseItem;
    // False when the signed-in user's role denies the target screen, or while
    // roles are still loading. Either way the control is disabled — see
    // `permissionPending` for which message to show.
    permitted: boolean;
    permissionPending: boolean;
    onWatch: (item: KnowledgeBaseItem) => void;
    onQuickAccess: (item: KnowledgeBaseItem) => void;
}

const KnowledgeBaseCard: React.FC<Props> = ({
    item,
    permitted,
    permissionPending,
    onWatch,
    onQuickAccess,
}) => {
    const hasVideo = Boolean(item.videoUrl);

    const quickAccessTitle = permitted
        ? `Go to ${item.title.replace(/^How to (Read|Manage|Use|Work with) (the )?/i, '')}`
        : permissionPending
            ? 'Checking your permissions…'
            : 'You do not have permission to open this section';

    return (
        <Card className='kb-card'>
            <div className='kb-card__body'>
                <div className='kb-card__text'>
                    <h2 className='kb-card__title'>{item.title}</h2>
                    <p className='kb-card__description'>{item.description}</p>
                </div>

                <div className='kb-card__actions'>
                    {hasVideo ? (
                        <Button
                            className='kb-card__watch'
                            icon='pi pi-play'
                            label='Watch tutorial'
                            onClick={() => onWatch(item)}
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
                        aria-label={`Go to ${item.title}`}
                        title={quickAccessTitle}
                        onClick={() => onQuickAccess(item)}
                    />
                </div>
            </div>
        </Card>
    );
};

export default KnowledgeBaseCard;
