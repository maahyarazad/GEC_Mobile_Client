import React, { useCallback, useEffect, useState } from 'react'
import './Dashboard.css'
import moment from 'moment'
import { ProgressSpinner } from 'primereact/progressspinner'
import { axiosInstance } from '../../utils/interceptor/Interceptor'

interface IInvitationRecord {
    id: number;
    created_at: string;
    recipient: string; // JSON-encoded array of email strings
    group_name: string;
}

const DEFAULT_VISIBLE = 3;

// recipient arrives as a JSON-encoded string; parse defensively.
const parseRecipients = (recipient: string): string[] => {
    try {
        const parsed = JSON.parse(recipient);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return recipient ? [recipient] : [];
    }
};

const Dashboard: React.FC = () => {
    const [records, setRecords] = useState<IInvitationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const SERVER_BASE_URL = process.env.REACT_APP_API_URL;

    const fetchInvitationRecords = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${SERVER_BASE_URL}/partners/onboarding/invitation-records`);
            
            if (response.status === 200) {
                const data: IInvitationRecord[] = response.data.data ?? [];
                // latest first
                const sorted = [...data].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setRecords(sorted);
            }
        } catch (err) {
            console.error('Failed to fetch invitation records:', err);
        } finally {
            setLoading(false);
        }
    }, [SERVER_BASE_URL]);

    useEffect(() => {
        fetchInvitationRecords();
    }, [fetchInvitationRecords]);

    const visibleRecords = showAll ? records : records.slice(0, DEFAULT_VISIBLE);

    const renderInvitationPanel = () => (
        <div className="dashboard-card">
            <div className="dashboard-card__header">
                <div>
                    <h3 className="dashboard-card__title">Partner Onboarding Invitations</h3>
                    <span className="dashboard-card__subtitle">Latest invitation email records</span>
                </div>
                <span className="dashboard-card__count">{records.length}</span>
            </div>

            <div className="dashboard-card__body">
                {loading ? (
                    <div className="dashboard-card__loading">
                        <ProgressSpinner style={{ width: 36, height: 36 }} strokeWidth="4" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="dashboard-card__empty">No invitation records found.</div>
                ) : (
                    <ul className="invitation-list">
                        {visibleRecords.map(record => {
                            const recipients = parseRecipients(record.recipient);
                            return (
                                <li key={record.id} className="invitation-item">
                                    <div className="invitation-item__top">
                                        <span className="invitation-item__group">{record.group_name}</span>
                                        <span className="invitation-item__date">
                                            {moment(record.created_at).format('DD MMM YYYY, h:mm a')}
                                        </span>
                                    </div>
                                    <div className="invitation-item__recipients">
                                        {recipients.map((email, i) => (
                                            <span key={i} className="invitation-chip">{email}</span>
                                        ))}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {!loading && records.length > DEFAULT_VISIBLE && (
                <button className="dashboard-card__toggle" onClick={() => setShowAll(prev => !prev)}>
                    {showAll ? 'Show less' : `Show all (${records.length})`}
                </button>
            )}
        </div>
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">
                <section className="dashboard-section dashboard-section--top-left">
                    {renderInvitationPanel()}
                </section>
                <section className="dashboard-section dashboard-section--top-right">
                    <div className="dashboard-card dashboard-card--placeholder">Coming soon</div>
                </section>
                <section className="dashboard-section dashboard-section--bottom-left">
                    <div className="dashboard-card dashboard-card--placeholder">Coming soon</div>
                </section>
                <section className="dashboard-section dashboard-section--bottom-right">
                    <div className="dashboard-card dashboard-card--placeholder">Coming soon</div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
