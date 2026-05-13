
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DataTable, DataTableFilterMeta, DataTablePageEvent, DataTableSortEvent, DataTableFilterEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { axiosInstance } from '../../utils/interceptor/Interceptor';
import { StorageService } from '../../services/Storage/Storage.service'
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import ContactTable, { ContactTableRef } from "./ContactTable";
import MailLogs from "./MailLogs";
import { InputSwitch } from 'primereact/inputswitch';
import { InputTextarea } from 'primereact/inputtextarea';
import { Editor } from 'primereact/editor';

// ── Types ──────────────────────────────────────────────────────────────────
import { WebPartner, PartnerContact, Pagination } from './DTO_Interfaces';
import './PartnerOnboarding.css';

// ── Helpers ────────────────────────────────────────────────────────────────

const getFilterValue = (filters: DataTableFilterMeta, field: string): string | null => {
    const f = filters[field];
    if (!f) return null;
    if ('constraints' in f) return f.constraints[0]?.value ?? null;
    if ('value' in f) return f.value ?? null;
    return null;
};

// ── Empty filter state ─────────────────────────────────────────────────────

const EMPTY_FILTERS: DataTableFilterMeta = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    type: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    status: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    area: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    categoryId: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    regionId: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    discount: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    phone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
    email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function PartnerOnboarding() {

    const toastRef = useRef<Toast>(null);
    const canRead = StorageService.hasPrivilege(88, 'read');
    const canAdd = StorageService.hasPrivilege(88, 'add');
    const canEdit = StorageService.hasPrivilege(88, 'edit');
    const canDelete = StorageService.hasPrivilege(88, 'delete');
    const canModify = canAdd || canEdit || canDelete;

    const SERVER_BASE_URL = process.env.REACT_APP_API_URL;

    const [list, setList] = useState<WebPartner[]>([]);
    const [contactList, setContactList] = useState<PartnerContact[]>([]);
    const [loadingLogList, setLoadingLogList] = useState(false);
    const [logList, setLogList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingFetchContacts, setLoadingFetchContacts] = useState(true);

    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(25);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 0 });

    const [filters, setFilters] = useState<DataTableFilterMeta>(EMPTY_FILTERS);
    const [sortField, setSortField] = useState('id');
    const [sortOrder, setSortOrder] = useState<1 | -1>(1);

    const [checkedTestMode, setCheckedTestMode] = useState(true);
    const [addRemark, setAddRemark] = useState(false);
    const [remark, setRemark] = useState<any>('');

    // ── Dialog / email state ───────────────────────────────────────────────

    const [showDialog, setShowDialog] = useState(false);
    const [showLogDialog, setShowLogDialog] = useState(false);
    const contactTableRef = useRef<ContactTableRef>(null);

    const [webPartnerDiloag, setWebPartnerDiloag] = useState<WebPartner | null>(null);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [selectedEmail_RecipientName, setSelectedEmail_RecipientName] = useState<string[]>([]);
    const [languageList, setLanguageList] = useState<string[]>([]);
    const [selectedTestEmail, setSelectedTestEmail] = useState<string>('');
    const [ccInput, setCcInput] = useState<string>("office2@german-emirates-club.com");
    const [bccInput, setBccInput] = useState<string>("");
    const [requestLoading, setRequestLoading] = useState(false);

    // ── Data fetching ──────────────────────────────────────────────────────

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${SERVER_BASE_URL}/partners/get-web-partner`);
            if (response.status === 200) {
                setList(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch partners:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchEmailLogData = useCallback(async (id: any) => {
        try {
            const params = new URLSearchParams();
            params.append("partnerId", id);
            const response = await axiosInstance.get(
                `${SERVER_BASE_URL}/partners/get-partner-email-logs?${params.toString()}`
            );
            if (response.status === 200) {
                const { data } = response.data;
                if (data.length > 0) {
                    const parsed = data.map((x: any) => ({ ...x, data: JSON.parse(x.data) }));
                    setLogList(parsed);
                }
            }
        } catch (err) {
            console.error('Failed to fetch email logs:', err);
        } finally {
            setLoadingLogList(false);
        }
    }, []);

    const fetchContactData = useCallback(async (id: any) => {
        setLoadingFetchContacts(true);
        try {
            const params = new URLSearchParams();
            params.append("id", id);
            const response = await axiosInstance.get(
                `${SERVER_BASE_URL}/partners/get-web-partner-contact?${params.toString()}`
            );
            if (response.status === 200) {
                setContactList(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
        } finally {
            setLoadingFetchContacts(false);
        }
    }, []);

    // ── Handlers ───────────────────────────────────────────────────────────

    // FIX: onSearch now only updates filters; no nested declarations inside it
    const onSearch = (value: string) => {
        setFilters(prev => ({
            ...prev,
            global: { value: value || null, matchMode: FilterMatchMode.CONTAINS },
        }));
    };

    const handleShowSelected = (ids: number[]) => {
        const filtered = contactList.filter((c) => ids.includes(c.id));
        setSelectedEmails(filtered.map((c) => c.email));
        setSelectedEmail_RecipientName(filtered.map((c) => c.firstName));
        setLanguageList(filtered.map((c) => c.language.slice(0, 2)));
    };

    const setUserDialog = async (partner: WebPartner) => {
        setWebPartnerDiloag(partner);
        fetchContactData(partner.id);
        setShowDialog(true);
    };

    const setLogDialog = async (partner: WebPartner) => {
        setLoadingLogList(true);
        setWebPartnerDiloag(partner);
        fetchEmailLogData(partner.id);
        setShowLogDialog(true);
    };

    const onPage = (e: DataTablePageEvent) => {
        setFirst(e.first);
        setRows(e.rows);
    };

    const onSort = (e: DataTableSortEvent) => {
        setSortField(e.sortField);
        setSortOrder(e.sortOrder as 1 | -1);
    };

    const onFilter = (e: DataTableFilterEvent) => {
        setFilters(e.filters);
        setFirst(0);
    };

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS);
        setFirst(0);
        setSortField('id');
        setSortOrder(1);
        fetchData();
    };

    const sendPostRequest = async () => {
        setRequestLoading(true);
        try {
            const response = await axiosInstance.post(
                `${SERVER_BASE_URL}/partners/send-partner-Email`,
                {
                    data: {
                        name: selectedEmail_RecipientName,
                        recipients: selectedEmails,
                        language: languageList,
                        cc: ccInput,
                        bcc: [...bccInput.split(",")],
                        partnerId: webPartnerDiloag?.id,
                        test_mode: checkedTestMode,
                        test_mode_recipient: selectedTestEmail,
                        remark: remark,
                    },
                }
            );
            if (response.status) {
                const { data } = response;
                toastRef.current?.show({ summary: `${data.message}`, detail: ``, severity: "success" });
            }
        } catch (err) {
            console.error('Failed to send email:', err);
            toastRef.current?.show({ summary: "Failed", detail: ``, severity: "error" });
        } finally {
            setRequestLoading(false);
        }
    };

    // ── Helpers ────────────────────────────────────────────────────────────

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isDisabled = selectedEmails.length === 0 || !isValidEmail(selectedTestEmail);

    // ── Column templates ───────────────────────────────────────────────────

    const statusBody = (row: WebPartner) => (
        <Tag value={row.status === '1' ? 'Active' : 'Inactive'} severity={row.status === '1' ? 'success' : 'danger'} />
    );

    const typeBody = (row: WebPartner) => (
        <Tag
            value={row.type.charAt(0).toUpperCase() + row.type.slice(1)}
            style={{ backgroundColor: '#F67D1D' }}
        />
    );

    const areaBody = (row: WebPartner) => {
        const map: Record<string, string> = { '2': 'National', '1': 'Regional', '0': 'Local' };
        return <span>{map[row.area] ?? row.area}</span>;
    };

    const expirtTimeBody = (row: WebPartner) => {
        const now = new Date();
        const expiryDate = row?.expiry_date ? new Date(row.expiry_date) : null;
        const isExpired = expiryDate && expiryDate < now;
        const isExpiringSoon = expiryDate && (() => {
            const threeMonthsFromNow = new Date();
            threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
            return expiryDate > now && expiryDate <= threeMonthsFromNow;
        })();
        const isVisible = isExpired || isExpiringSoon;
        return (
            <div className='d-flex align-items-center gap-1'>
                <i
                    className={`pi pi-exclamation-triangle mr-2 ${isVisible ? "pi-pulse" : ""}`}
                    style={{
                        fontSize: '1.4rem',
                        color: isExpired ? 'red' : 'orange',
                        opacity: isVisible ? 1 : 0,
                    }}
                    title={isExpired ? 'Expired' : 'Expiring within 3 months'}
                />
                <span>
                    {expiryDate
                        ? expiryDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
                        : '-'}
                </span>
            </div>
        );
    };

    const timeBody = (row: WebPartner) =>
        new Date(row.time).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });

    const discountBody = (row: WebPartner) => row.discount ? `${row.discount}%` : '—';
    const durationBody = (row: WebPartner) => `${row.duration}yr`;
    const hitsBody = (row: WebPartner) => row.hits?.toLocaleString() ?? 0;

    const webBody = (row: WebPartner) =>
        row.web ? (
            <a
                href={row.web.startsWith('http') ? row.web : `https://${row.web}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
            >
                {row.web}
            </a>
        ) : '—';

    // ── Header ─────────────────────────────────────────────────────────────

    const renderHeader = () => (
        <div className="flex justify-content-between align-items-center gap-2 flex-wrap">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                    // FIX: read the global filter value safely with a fallback to ''
                    value={
                        filters.global && 'value' in filters.global
                            ? (filters.global.value ?? '')
                            : ''
                    }
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search partners…"
                    style={{ width: '22rem' }}
                />
            </IconField>
            <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Clear filters"
                outlined
                size="small"
                onClick={clearFilters}
            />
        </div>
    );

    // ── Loader ──────────────────────────────────────────────────────────────

    const Loader = (): JSX.Element => (
        <div style={{ width: '100vw', height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} animationDuration=".5s" />
        </div>
    );

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <>
                    <DataTable
                        value={list}
                        style={{ fontSize: 13 }}
                        responsiveLayout="scroll"
                        header={renderHeader}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} partners"
                        rowsPerPageOptions={[10, 25, 50]}
                        dataKey="id"
                        first={first}
                        rows={rows}
                        onPage={onPage}
                        paginator
                        filters={filters}
                        onFilter={onFilter}
                        filterDisplay="menu"
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={onSort}
                        scrollable
                        scrollHeight="70dvh"
                        // FIX: added all searchable fields; globalFilter drives the search
                        globalFilterFields={['group_name', 'phone', 'email', 'type', 'status']}
                        globalFilter={
                            filters.global && 'value' in filters.global
                                ? (filters.global.value ?? undefined)
                                : undefined
                        }
                        emptyMessage="No partners found"
                    >
                        <Column field="id" header="ID" sortable style={{ minWidth: 70 }} />

                        <Column
                            field="group_name"
                            header="Group / Partner"
                            sortable
                            filter
                            filterPlaceholder="Search group"
                            style={{ maxWidth: 200 }}
                            body={(rowData: WebPartner) => (
                                <div>
                                    <div className="font-semibold">{rowData.group_name}</div>
                                    {rowData.subsidiaries && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {rowData.subsidiaries.split(' / ').map((sub, i) => (
                                                <span key={i} className="mr-1">
                                                    <span className="text-gray-300">↳</span> {sub}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        />

                        <Column field="type" header="Type" body={typeBody} sortable filter style={{ maxWidth: 50 }} />
                        <Column field="status" header="Status" body={statusBody} sortable filter style={{ maxWidth: 50 }} />
                        <Column field="expiry_date" header="Expiry Date" body={expirtTimeBody} sortable filter style={{ maxWidth: 70 }} />

                        {canModify && (
                            <Column
                                header="Actions"
                                style={{ maxWidth: 150 }}
                                body={(rowData: WebPartner) => (
                                    <div style={{ transform: 'scale(0.8)' }}>
                                        <Button
                                            className="custom-view-button p-1 mr-1"
                                            size="small"
                                            label="Send Email"
                                            onClick={() => setUserDialog(rowData)}
                                        />
                                        <Button
                                            className="custom-view-button p-1"
                                            size="small"
                                            label="View Email Logs"
                                            onClick={() => setLogDialog(rowData)}
                                        />
                                    </div>
                                )}
                            />
                        )}

                        <Column field="time" header="Start date" body={timeBody} sortable style={{ minWidth: 120 }} />
                        <Column field="duration" header="Duration" body={durationBody} sortable style={{ minWidth: 90 }} />
                    </DataTable>

                    {/* ── Send Email Dialog ── */}
                    <Dialog
                        visible={showDialog}
                        onHide={() => {
                            setShowDialog(false);
                            setWebPartnerDiloag(null);
                            setContactList([]);
                            setSelectedEmails([]);
                        }}
                        style={{ width: "60vw", maxWidth: "1500px" }}
                        dismissableMask
                        header={() => (
                            <div className='flex align-items-center justify-content-between'>
                                <div>
                                    <span style={{ color: '#F67D1D', fontSize: '1.5rem' }}>Send Employee Onboarding Email</span>
                                    <br /><br />
                                    <span style={{ color: 'gray' }}>Selected Partner:&nbsp;</span>
                                    {webPartnerDiloag?.group_name}
                                </div>
                                <div style={{ maxWidth: 200, paddingRight: 10 }}>
                                    <div className="flex align-items-center justify-content-between">
                                        <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Enable Test Mode</span>
                                        <InputSwitch
                                            checked={checkedTestMode}
                                            onChange={(e) => setCheckedTestMode(e.value)}
                                            style={{ transform: 'scale(0.7)' }}
                                        />
                                    </div>
                                    <div className="mt-2 flex justify-content-between align-items-center">
                                        <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Add Remarks</span>
                                        <InputSwitch
                                            checked={addRemark}
                                            onChange={(e) => setAddRemark(e.value)}
                                            style={{ transform: 'scale(0.7)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    >
                        {loadingFetchContacts ? (
                            <div style={{ minHeight: '20dvh' }} className="position-relative">
                                <div style={{ position: 'absolute', left: '50%', top: '60%' }}>
                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        ) : (
                            <div className='p-2'>
                                <div className='pt-2'>
                                    <ContactTable
                                        contactList={contactList}
                                        ref={contactTableRef}
                                        onChangeSelected={handleShowSelected}
                                    />
                                </div>

                                {selectedEmails.length > 0 && (
                                    <div className='mt-2'>
                                        <strong className='mb-1'>Recipients</strong>
                                        <InputText
                                            type='text'
                                            value={selectedEmails.join(", ")}
                                            disabled
                                            className='w-full border rounded px-3 py-1.5 text-sm'
                                        />
                                    </div>
                                )}

                                {checkedTestMode && (
                                    <div className='mt-2'>
                                        <strong className='mb-1'>Send Test Email to:</strong>
                                        <InputText
                                            type='text'
                                            value={selectedTestEmail}
                                            onChange={(e) => setSelectedTestEmail(e.target.value)}
                                            placeholder='cc@example.com, cc2@example.com'
                                            className='w-full border rounded px-3 py-1.5 text-sm'
                                        />
                                    </div>
                                )}

                                {addRemark && (
                                    <div className='mt-2'>
                                        <strong className='mb-1'>Remarks</strong>
                                        <Editor
                                            value={remark}
                                            onTextChange={(e) => setRemark(e.htmlValue)}
                                            style={{ height: '150px' }}
                                        />
                                    </div>
                                )}

                                <div className='mt-2'>
                                    <strong className='mb-1'>CC</strong>
                                    <InputText
                                        type='text'
                                        value={ccInput}
                                        disabled
                                        onChange={(e) => setCcInput(e.target.value)}
                                        placeholder='cc@example.com, cc2@example.com'
                                        className='w-full border rounded px-3 py-1.5 text-sm'
                                    />
                                </div>

                                <div className='mt-2'>
                                    <strong className='mb-1'>BCC</strong>
                                    <InputText
                                        type='text'
                                        value={bccInput}
                                        onChange={(e) => setBccInput(e.target.value)}
                                        placeholder='bcc@example.com, bcc2@example.com'
                                        className='w-full border rounded px-3 py-1.5 text-sm'
                                    />
                                </div>

                                <Button
                                    disabled={checkedTestMode ? isDisabled : selectedEmails.length === 0 || requestLoading}
                                    className={`mt-2 ${requestLoading ? "p-button-secondary outlined" : ""}`}
                                    size="small"
                                    onClick={sendPostRequest}
                                >
                                    {requestLoading
                                        ? <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                                        : <>Send</>
                                    }
                                </Button>
                            </div>
                        )}
                    </Dialog>

                    {/* ── Email Logs Dialog ── */}
                    <Dialog
                        visible={showLogDialog}
                        onHide={() => {
                            setShowLogDialog(false);
                            setWebPartnerDiloag(null);
                            setLogList([]);
                        }}
                        style={{ width: "60vw", maxWidth: "1500px" }}
                        dismissableMask
                        header={() => (
                            <div>
                                <span style={{ color: '#F67D1D', fontSize: '1.5rem' }}>Sent Email Logs</span>
                                <br /><br />
                                <span style={{ color: 'gray' }}>Selected Partner:&nbsp;</span>
                                {webPartnerDiloag?.group_name}
                            </div>
                        )}
                    >
                        {loadingLogList ? (
                            <div style={{ minHeight: '20dvh' }} className="position-relative">
                                <div style={{ position: 'absolute', left: '50%', top: '60%' }}>
                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        ) : (
                            <div className='p-2'>
                                <MailLogs mailLogs={logList} />
                            </div>
                        )}
                    </Dialog>
                </>
            )}
            <Toast ref={toastRef} position="bottom-right" />
        </>
    );
}
