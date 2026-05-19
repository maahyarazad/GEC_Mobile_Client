import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { GroupedPartnerContact } from './DTO_Interfaces';

interface Props {
    visible: boolean;
    onHide: () => void;
    data: GroupedPartnerContact[];
    loading: boolean;
}

const thStyle: React.CSSProperties = { padding: '8px 12px', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '8px 12px', verticalAlign: 'middle' };

export default function GroupedContactListPanel({ visible, onHide, data, loading }: Props) {
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? data.filter(r =>
            r.group_name.toLowerCase().includes(search.toLowerCase()) ||
            r.fullname.toLowerCase().includes(search.toLowerCase())
        )
        : data;

    const groupCount = new Set(filtered.map(r => r.group_name)).size;
    const subsidiaryCount = filtered.reduce((acc, r) => {
        if (!r.subsidiaries) return acc;
        return acc + r.subsidiaries.split('/').map(s => s.trim()).filter(Boolean).length;
    }, 0);
    const totalContacts = filtered.length;

    return (
        <Sidebar
            visible={visible}
            onHide={onHide}
            position="right"
            style={{ width: '90vw', height: '100vh' }}
            header={
                <div className="flex align-items-center gap-3 w-full">
                   <span style={{ color: '#2B2C39', fontSize: '1.4rem', fontWeight: 600 }}>
                        Grouped Partner Contact List
                    </span>
                    <IconField iconPosition="left" style={{ marginLeft: 'auto' }}>
                        <InputIcon className="pi pi-search" />
                        <InputText
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search partner or contact…"
                            style={{ width: '22rem' }}
                        />
                    </IconField>
                </div>
            }
        >
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <ProgressSpinner style={{ width: 50, height: 50 }} animationDuration=".5s" />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Summary bar */}
                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        padding: '0.6rem 1rem',
                        background: '#f9f9f9',
                        borderBottom: '1px solid #e0e0e0',
                        fontSize: 13,
                        flexShrink: 0,
                    }}>
                        <span><strong>{groupCount}</strong> Group{groupCount !== 1 ? 's' : ''} / <strong>{subsidiaryCount}</strong> Subsidiar{subsidiaryCount !== 1 ? 'ies' : 'y'}</span>
                        <span style={{ color: '#888' }}>·</span>
                        <span><strong>{totalContacts}</strong> Total Contact{totalContacts !== 1 ? 's' : ''}</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No results found.</div>
                    ) : (
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                        <th style={{ ...thStyle, position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>Group</th>
                                        <th style={{ ...thStyle, position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>Subsidiaries</th>
                                        <th style={{ ...thStyle, position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>Full Name</th>
                                        <th style={{ ...thStyle, position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>Division</th>
                                        <th style={{ ...thStyle, position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>Emails</th>
                                        <th style={{ ...thStyle, position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>Email Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((r, i) => (
                                        <tr
                                            key={i}
                                            style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                                        >
                                            <td style={{ ...tdStyle, fontWeight: 600 }}>{r.group_name || '—'}</td>
                                            <td style={tdStyle}>{r.subsidiaries || '—'}</td>
                                            <td style={tdStyle}>{r.fullname || '—'}</td>
                                            <td style={tdStyle}>{r.divions || '—'}</td>
                                            <td style={tdStyle}>{r.emails || '—'}</td>
                                            <td style={tdStyle}>{r.email_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </Sidebar>
    );
}
