import React, { useCallback, useEffect, useMemo, useState } from 'react'
import './Dashboard.css'
import moment from 'moment'
import { ProgressSpinner } from 'primereact/progressspinner'
import { FaAndroid, FaApple } from 'react-icons/fa'
import { axiosInstance } from '../../utils/interceptor/Interceptor'
import { useOutletContext } from "react-router-dom";
interface IInvitationRecord {
    id: number;
    created_at: string;
    recipient: string; // JSON-encoded array of email strings
    group_name: string;
}

// A record returned by the sync-stat endpoint; `partner` is the partner name
// and `total_records` is the number of synced records for that partner.
interface ISyncRecord {
    partner: string;
    total_records: number;
}

// A row from /dashboard/app-user-stat. `member` encodes the user's language.
interface IAppUserStat {
    member: number; // 0 = English speaker, 1 = German speaker
    platform: string; // 'android' | 'ios'
    allowed_push_notification: number;
    past_year_active_login: number;
}

type Platform = 'android' | 'ios';

// react-icons' exported type isn't assignable to JSX under this @types/react
// version; cast through a minimal local type (matches the Navbar convention).
type RIIcon = React.FC<{ size?: number; className?: string }>;
const AndroidIcon = FaAndroid as unknown as RIIcon;
const AppleIcon = FaApple as unknown as RIIcon;

// Per-language buckets for a single platform.
interface IPlatformStat {
    push: { en: number; de: number };
    active: { en: number; de: number };
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

// Mirror of the backend normalization used to compare partner names:
//   REPLACE(... lower(trim(partner)) ..., umlauts -> ascii, 'ß' -> 'ss')
// lower-casing already maps 'Ü' -> 'ü' etc., so only lowercase forms remain.
const normalizePartner = (partner: string): string =>
    (partner ?? '')
        .trim()
        .toLowerCase()
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ä/g, 'a')
        .replace(/ß/g, 'ss');

const Dashboard: React.FC = () => {
    const [records, setRecords] = useState<IInvitationRecord[]>([]);
    // Normalized partner name -> total_records reported by the sync-stat endpoint.
    const [syncedCounts, setSyncedCounts] = useState<Map<string, number>>(new Map());
    const [appUserStats, setAppUserStats] = useState<IAppUserStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);


    const SERVER_BASE_URL = process.env.REACT_APP_API_URL;

    const fetchInvitationRecords = useCallback(async () => {
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
        }
    }, [SERVER_BASE_URL]);

    const fetchSyncStat = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`${SERVER_BASE_URL}/partners/onboarding/sync-stat`);

            if (response.status === 200) {
                // The payload is nested: { data: { status, data: [...] }, status }.
                const data: ISyncRecord[] =
                    response.data?.data?.data ?? response.data?.data ?? [];

                // Map each normalized partner name to its total_records value.
                const counts = new Map<string, number>();
                (Array.isArray(data) ? data : []).forEach(record => {
                    counts.set(normalizePartner(record.partner), record.total_records);
                });
                setSyncedCounts(counts);
            }
        } catch (err) {
            console.error('Failed to fetch sync stat:', err);
        }
    }, [SERVER_BASE_URL]);

    const fetchAppUserStats = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`${SERVER_BASE_URL}/dashboard/app-user-stat`);

            if (response.status === 200) {
                const data: IAppUserStat[] = response.data?.data ?? response.data ?? [];
                setAppUserStats(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Failed to fetch app user stats:', err);
        }
    }, [SERVER_BASE_URL]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchInvitationRecords(),
            fetchSyncStat(),
            fetchAppUserStats(),
        ]).finally(() => setLoading(false));
    }, [fetchInvitationRecords, fetchSyncStat, fetchAppUserStats]);

    const visibleRecords = showAll ? records : records.slice(0, DEFAULT_VISIBLE);

    // Badge count: synced partners that match an invitation record's group_name.
    const matchedSyncedCount = useMemo(() => {
        const invitationPartners = new Set(records.map(r => normalizePartner(r.group_name)));
        let matches = 0;
        syncedCounts.forEach((_, partner) => {
            if (invitationPartners.has(partner)) matches += 1;
        });
        return matches;
    }, [records, syncedCounts]);

    // Fold the flat stat rows into per-platform, per-language buckets.
    const platformStats = useMemo(() => {
        const empty = (): IPlatformStat => ({ push: { en: 0, de: 0 }, active: { en: 0, de: 0 } });
        const grouped: Record<Platform, IPlatformStat> = { android: empty(), ios: empty() };

        appUserStats.forEach(row => {
            const platform = row.platform?.trim().toLowerCase() as Platform;
            if (platform !== 'android' && platform !== 'ios') return;
            const lang = row.member === 1 ? 'de' : 'en';
            grouped[platform].push[lang] += row.allowed_push_notification ?? 0;
            grouped[platform].active[lang] += row.past_year_active_login ?? 0;
        });

        return grouped;
    }, [appUserStats]);

    const renderInvitationPanel = () => (
        <div className="dashboard-card">
            <div className="dashboard-card__header">
                <div>
                    <h3 className="dashboard-card__title">Partner Onboarding Invitations</h3>
                    <span className="dashboard-card__subtitle">Latest invitation email records</span>
                </div>
                <div className="dashboard-card__counts">
                    <span className="dashboard-card__count" title="Invitation records">{records.length}</span>
                    <span className="dashboard-card__count dashboard-card__count--synced" title="Matched synced partners">
                        {matchedSyncedCount}
                    </span>
                </div>
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
                            const partnerSyncCount = syncedCounts.get(normalizePartner(record.group_name)) ?? 0;
                            const isSynced = partnerSyncCount > 0;
                            return (
                                <li
                                    key={record.id}
                                    className={`invitation-item${isSynced ? ' invitation-item--synced' : ''}`}
                                >
                                    <div className="invitation-item__top">
                                        <span className="invitation-item__group">
                                            {record.group_name}
                                            {isSynced && (
                                                <span
                                                    className="invitation-item__synced-tag"
                                                    title="Synced records for this partner"
                                                >
                                                    {partnerSyncCount}
                                                </span>
                                            )}
                                        </span>
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

    const renderPlatformBlock = (platform: Platform) => {
        const stat = platformStats[platform];
        const label = platform === 'android' ? 'Android' : 'iOS';
        const pushTotal = stat.push.en + stat.push.de;
        const activeTotal = stat.active.en + stat.active.de;

        return (
            <div className={`app-stat-platform app-stat-platform--${platform}`}>
                <div className="app-stat-platform__head">
                    {platform === 'android'
                        ? <AndroidIcon className="app-stat-platform__icon" />
                        : <AppleIcon className="app-stat-platform__icon" />}
                    <span className="app-stat-platform__name">{label}</span>
                </div>

                <div className="app-stat-metric">
                    <div className="app-stat-metric__top">
                        <span className="app-stat-metric__label">Push enabled</span>
                        <span className="app-stat-metric__total">{pushTotal}</span>
                    </div>
                    <div className="app-stat-metric__split">
                        <span className="app-stat-lang">EN <b>{stat.push.en}</b></span>
                        <span className="app-stat-lang">DE <b>{stat.push.de}</b></span>
                    </div>
                </div>

                <div className="app-stat-metric">
                    <div className="app-stat-metric__top">
                        <span className="app-stat-metric__label">Active (past year)</span>
                        <span className="app-stat-metric__total">{activeTotal}</span>
                    </div>
                    <div className="app-stat-metric__split">
                        <span className="app-stat-lang">EN <b>{stat.active.en}</b></span>
                        <span className="app-stat-lang">DE <b>{stat.active.de}</b></span>
                    </div>
                </div>
            </div>
        );
    };

    const renderAppUserStatPanel = () => (
        <div className="dashboard-card">
            <div className="dashboard-card__header">
                <div>
                    <h3 className="dashboard-card__title">App Users by Platform</h3>
                    <span className="dashboard-card__subtitle">Push opt-in &amp; activity, split by language</span>
                </div>
            </div>

            <div className="dashboard-card__body">
                {loading ? (
                    <div className="dashboard-card__loading">
                        <ProgressSpinner style={{ width: 36, height: 36 }} strokeWidth="4" />
                    </div>
                ) : appUserStats.length === 0 ? (
                    <div className="dashboard-card__empty">No app user statistics found.</div>
                ) : (
                    <div className="app-stat-grid">
                        {renderPlatformBlock('android')}
                        {renderPlatformBlock('ios')}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">
                <section className="dashboard-section dashboard-section--top-left">
                    {renderInvitationPanel()}
                </section>
                <section className="dashboard-section dashboard-section--top-right">
                    {renderAppUserStatPanel()}
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
