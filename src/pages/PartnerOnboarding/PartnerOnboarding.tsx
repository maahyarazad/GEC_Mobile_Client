

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

// Extracts a scalar filter value from PrimeReact's filter meta
const getFilterValue = (filters: DataTableFilterMeta, field: string): string | null => {
    const f = filters[field];
    if (!f) return null;
    // menu-style filter → constraints array
    if ('constraints' in f) return f.constraints[0]?.value ?? null;
    // row-style filter → single value
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
    const canRead = StorageService.hasPrivilege(88, 'read')
    const canAdd = StorageService.hasPrivilege(88, 'add')
    const canEdit = StorageService.hasPrivilege(88, 'edit')
    const canDelete = StorageService.hasPrivilege(88, 'delete')

    const canModify = canAdd || canEdit || canDelete

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
    const [globalFilter, setGlobalFilter] = useState('');
    const [filters, setFilters] = useState<DataTableFilterMeta>(EMPTY_FILTERS);
    const [sortField, setSortField] = useState('id');
    const [sortOrder, setSortOrder] = useState<1 | -1>(1);


    const [checkedTestMode, setCheckedTestMode] = useState(true);
    const [addRemark, setAddRemark] = useState(false);
    const [remark, setRemark] = useState<any>('');

    // ── Fetch ────────────────────────────────────────────────────────

    // const fetchData = useCallback(async (
    //     page: number,
    //     limit: number,
    //     currentFilters: DataTableFilterMeta,
    //     search: string,
    //     orderBy: string,
    //     orderDir: 'ASC' | 'DESC',
    // ) => {
    //     setLoading(true);
    //     try {
    //         const params = new URLSearchParams();

    //         params.set('page', String(page));
    //         params.set('limit', String(limit));
    //         params.set('orderBy', orderBy);
    //         params.set('orderDir', orderDir);

    //         if (search) params.set('search', search);

    //         // Map filter fields → query params
    //         const status = getFilterValue(currentFilters, 'status') || '1';
    //         const type = getFilterValue(currentFilters, 'type') || 'partner';


    //         if (status) params.set('status', status);
    //         if (type) params.set('type', type);


    //         const response = await axiosInstance.get(
    //             `${SERVER_BASE_URL}/partners/get-web-partner?${params.toString()}`
    //         );

    //         if (response.status === 200) {
    //             setList(response.data.data);
    //             setPagination(response.data.pagination);
    //         }
    //     } catch (err) {
    //         console.error('Failed to fetch partners:', err);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

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

    // Initial load
    useEffect(() => {
        // fetchData(1, rows, EMPTY_FILTERS, '', 'id', 'DESC');
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
            console.error('Failed to fetch partners:', err);
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
            console.error('Failed to fetch partners:', err);
        } finally {
            debugger;
            setLoadingFetchContacts(false);
        }
    }, []);

    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onSearch = (value: string) => {
        setGlobalFilter(value);               // update input instantly (no lag while typing)

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(() => {
            setFirst(0);
            fetchData();
        }, 400);                              // 400ms is the sweet spot — responsive but not spammy
    };

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, []);



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

    const handleShowSelected = (ids: number[]) => {
        const emails = contactList
            .filter((c) => ids.includes(c.id))
            .map((c) => c.email);
        setSelectedEmails(emails);

        setSelectedEmail_RecipientName(contactList
            .filter((c) => ids.includes(c.id))
            .map((c) => c.firstName));

        setLanguageList(contactList
            .filter((c) => ids.includes(c.id))
            .map((c) => c.language.slice(0, 2)));
    };


    const setUserDialog = async (partner: WebPartner) => {

        setWebPartnerDiloag(partner);
        fetchContactData(partner.id);
        setShowDialog(true);
    }

    const setLogDialog = async (partner: WebPartner) => {
        setLoadingLogList(true);
        setWebPartnerDiloag(partner);
        fetchEmailLogData(partner.id);
        setShowLogDialog(true);
    }






    // ── Event handlers ───────────────────────────────────────────────

    // const onPage = (e: DataTablePageEvent) => {
    //     setFirst(e.first);
    //     setRows(e.rows);
    //     fetchData(
    //         Math.floor(e.first / e.rows) + 1,
    //         e.rows,
    //         filters,
    //         globalFilter,
    //         sortField,
    //         sortOrder === 1 ? 'ASC' : 'DESC',
    //     );
    // };

    // const onSort = (e: DataTableSortEvent) => {
    //     const field = e.sortField as string;
    //     const order = e.sortOrder as 1 | -1;
    //     setSortField(field);
    //     setSortOrder(order);
    //     fetchData(
    //         Math.floor(first / rows) + 1,
    //         rows,
    //         filters,
    //         globalFilter,
    //         field,
    //         order === 1 ? 'ASC' : 'DESC',
    //     );
    // };

    // const onFilter = (e: DataTableFilterEvent) => {
    //     setFilters(e.filters);
    //     setFirst(0);
    //     fetchData(1, rows, e.filters, globalFilter, sortField, sortOrder === 1 ? 'ASC' : 'DESC');
    // };


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
        setFirst(0); // reset to first page on filter
    };



    const clearFilters = () => {
        setGlobalFilter('');
        setFilters(EMPTY_FILTERS);
        setFirst(0);
        setSortField('id');
        setSortOrder(1);
        // fetchData(1, rows, EMPTY_FILTERS, '', 'id', 'ASC');
        fetchData();
    };

    // ── Column templates ─────────────────────────────────────────────

    const statusBody = (row: WebPartner) => (
        <Tag value={row.status === '1' ? 'Active' : 'Inactive'} severity={row.status === '1' ? 'success' : 'danger'} />
    );

    const typeBody = (row: WebPartner) => {
        const map: Record<string, 'info' | 'warning' | 'secondary'> = { partner: 'info', business: 'warning', alliance: 'secondary' };
        return <Tag value={row.type.charAt(0).toUpperCase() + row.type.slice(1)}
            style={{ backgroundColor: '#F67D1D' }} />;
        // severity={map[row.type] ?? 'secondary'} />;
    };

    const areaBody = (row: WebPartner) => {
        const map: Record<string, string> = { '2': 'National', '1': 'Regional', '0': 'Local' };
        return <span>{map[row.area] ?? row.area}</span>;
    };

    const expiryBody = (row: WebPartner) => {
        if (!row.expiry_date) return <span className="text-color-secondary">—</span>;
        const date = new Date(row.expiry_date);
        const isPast = date < new Date();
        return (
            <span style={{ color: isPast ? 'var(--red-500)' : 'inherit' }}>
                {date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })}
            </span>
        );
    };

    const timeBody = (row: WebPartner) =>
        new Date(row.time).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });

    const expirtTimeBody = (row: WebPartner) => {
        const now = new Date();
        const expiryDate = row?.expiry_date ? new Date(row.expiry_date) : null;

        const isExpired = expiryDate && expiryDate < now;
        const isExpiringSoon = expiryDate && (() => {
            const threeMonthsFromNow = new Date();
            threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
            return expiryDate > now && expiryDate <= threeMonthsFromNow;
        })(); // ← missing () to invoke the IIFE
        const isVisible = isExpired || isExpiringSoon;
        return (
            <div className='d-flex align-items-center gap-1'>

                <i
                    className={`pi pi-exclamation-triangle mr-2 ${(isExpired || isExpiringSoon) ? "pi-pulse" : ""}`}
                    style={{
                        fontSize: '1.4rem',
                        color: isExpired ? 'red' : 'orange',
                        opacity: isVisible ? 1 : 0
                    }}
                    title={isExpired ? 'Expired' : 'Expiring within 3 months'}
                />

                <span>{expiryDate ? expiryDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }) : '-'}</span>
            </div>
        );
    };


    const discountBody = (row: WebPartner) => row.discount ? `${row.discount}%` : '—';
    const durationBody = (row: WebPartner) => `${row.duration}yr`;
    const hitsBody = (row: WebPartner) => row.hits?.toLocaleString() ?? 0;
    const coordsBody = (row: WebPartner) =>
        row.lat && row.lng
            ? <span style={{ fontSize: 12, color: 'var(--text-color-secondary)' }}>{row.lat}, {row.lng}</span>
            : '—';

    const webBody = (row: WebPartner) =>
        row.web ? (
            <a href={row.web.startsWith('http') ? row.web : `https://${row.web}`}
                target="_blank" rel="noreferrer"
                style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                {row.web}
            </a>
        ) : '—';

    // ── Header ───────────────────────────────────────────────────────

    const renderHeader = () => (
        <div className="flex justify-content-between align-items-center gap-2 flex-wrap">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search partners…"
                    style={{ width: '22rem' }}
                />
            </IconField>
            <Button type="button" icon="pi pi-filter-slash" label="Clear filters" outlined size="small" onClick={clearFilters} />
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────

    const Loader = (): JSX.Element => (<div style={{ width: '100vw', height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ProgressSpinner style={{ width: '50px', height: '50px' }} animationDuration=".5s" />
    </div>);




    const [requestLoading, setRequestLoading] = useState(false);
    const sendPostRequest = async () => {

        setRequestLoading(true);
        try {
            debugger;
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
                        remark: remark
                    }
                }
            );

            if (response.status) {

                const { data } = response;
                toastRef.current?.show({
                    summary: `${data.message}`,
                    detail: ``,
                    severity: "success",
                });
            }


        } catch (err) {
            console.error('Failed to fetch partners:', err);
            toastRef.current?.show({
                summary: "Failed",
                detail: ``,
                severity: "error",
            });
        } finally {
            setRequestLoading(false);
        }
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isDisabled = (
        selectedEmails.length === 0
        || !isValidEmail(selectedTestEmail)
    );

    return (<>
        {loading ? (<Loader />) : (<>
            {/* <DataTable
                value={list}
                lazy                          // ← tells PrimeReact the server owns pagination/sort/filter
                //   loading={loading}
                totalRecords={pagination.total}
                style={{ fontSize: 13 }}
                rowClassName={(row: WebPartner) => ({ 'bg-red-50': row.expiry_date ? new Date(row.expiry_date) < new Date() : false })}
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
                globalFilter={globalFilter}
                globalFilterFields={['title', 'phone', 'email', 'web', 'hotline', 'notice']}
                emptyMessage="No partners found"
            >
                <Column field="id" header="ID" sortable style={{ minWidth: 70 }} />

                
                <Column field="title" header="Title" sortable filter filterPlaceholder="Search title" style={{ maxWidth: 250 }} />
                <Column field="type" header="Type" body={typeBody} sortable filter style={{ maxWidth: 50 }} />
                <Column field="status" header="Status" body={statusBody} sortable filter style={{ maxWidth: 50 }} />
                
                {canModify && (
                    <Column
                        header="Actions" style={{ maxWidth: 150 }}
                        body={(rowData: WebPartner) => {
                            return (
                                <div style={{ transform: 'scale(0.8)' }}>
                                    <Button

                                        className="custom-view-button p-1 mr-1"
                                        size="small"
                                        label={"Send Email"}
                                        onClick={() => setUserDialog(rowData)} />
                                    <Button

                                        className="custom-view-button p-1"
                                        size="small"
                                        label={"View Email Logs"}
                                        onClick={() => setLogDialog(rowData)} />
                                </div>

                            );
                        }}
                    />
                )}
               
               
                <Column field="time" header="Start date" body={timeBody} sortable style={{ minWidth: 120 }} />
                <Column field="duration" header="Duration" body={durationBody} sortable style={{ minWidth: 90 }} />
             
            </DataTable> */}

            <DataTable
                value={list}
                // remove lazy, totalRecords, they are not needed without lazy mode
                style={{ fontSize: 13 }}
                // rowClassName={(row: WebPartner) => ({ 'bg-red-50': row.expiry_date ? new Date(row.expiry_date) < new Date() : false })}
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
                globalFilter={globalFilter}
                globalFilterFields={['title', 'phone', 'email', 'web', 'hotline', 'notice']}
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
                        header="Actions" style={{ maxWidth: 150 }}
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
            <Dialog
                visible={showDialog}
                onHide={() => { setShowDialog(false); setWebPartnerDiloag(null); setContactList([]); setSelectedEmails([]) }}
                style={{ width: "60vw", maxWidth: "1500px" }}
                dismissableMask
                header={() => {
                    return (<div className='flex align-items-center justify-content-between '>
                        <div>
                            <span style={{ color: '#F67D1D', fontSize: '1.5rem' }}>{`Send Employee Onboarding Email`}</span>
                            <br /><br />
                            <span style={{ color: 'gray' }}>{`Selected Partner:  `}</span>{`${webPartnerDiloag?.group_name}`}
                        </div>
                        <div>  <div style={{ maxWidth: 200, paddingRight: 10 }}>

                            <div className="flex align-items-center justify-content-between">
                                <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Enable Test Mode</span>
                                <InputSwitch checked={checkedTestMode} onChange={(e) => setCheckedTestMode(e.value)} style={{ transform: 'scale(0.7)' }} />
                            </div>
                            <div className="mt-2 flex justify-content-between align-items-center">
                                <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Add Remarks</span>
                                <InputSwitch checked={addRemark} onChange={(e) => setAddRemark(e.value)} style={{ transform: 'scale(0.7)' }} />
                            </div>
                        </div></div>

                    </div>)
                }}
            >
                {loadingFetchContacts ?

                    <div style={{ minHeight: '20dvh' }} className="position-relative">
                        <div style={{ position: 'absolute', left: '50%', top: '60%' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                        </div>
                    </div>

                    :
                    <div className='p-2'>


                        <div className='pt-2'>

                            <ContactTable
                                contactList={contactList}
                                ref={contactTableRef}
                                onChangeSelected={handleShowSelected}
                            />
                        </div>

                        <div className='mt-2'>
                            {selectedEmails.length > 0 &&
                                <>
                                    <strong className='mb-1'>Recipients</strong>
                                    <InputText
                                        type='text'
                                        value={selectedEmails.join(", ")} disabled
                                        onChange={(e) => setCcInput(e.target.value)}
                                        className='w-full border rounded px-3 py-1.5 text-sm'
                                    />
                                </>
                            }
                        </div>

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

                                <Editor value={remark} onTextChange={(e) => setRemark(e.htmlValue)} style={{ height: '150px' }} />


                            </div>
                        )}


                        <div className='mt-2'>
                            <strong className='mb-1'>CC</strong>
                            <InputText
                                type='text'
                                value={ccInput} disabled
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



                        <>

                            {checkedTestMode ?

                                <Button
                                    disabled={isDisabled}
                                    className={`mt-2 ${requestLoading ? "p-button-secondary outlined" : ""}`}
                                    size="small"

                                    onClick={sendPostRequest}
                                >
                                    {requestLoading ? (
                                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                                    ) : (<>Send</>)}

                                </Button>
                                :



                                <Button
                                    disabled={selectedEmails.length === 0 || requestLoading}
                                    className={`mt-2 ${requestLoading ? "p-button-secondary outlined" : ""}`}
                                    size="small"

                                    onClick={sendPostRequest}
                                >
                                    {requestLoading ? (

                                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                                    ) : (<>Send</>)}

                                </Button>
                            }
                        </>
                    </div>
                }


            </Dialog>

            <Dialog
                visible={showLogDialog}
                onHide={() => { setShowLogDialog(false); setWebPartnerDiloag(null); setLogList([]); }}
                style={{ width: "60vw", maxWidth: "1500px" }}
                dismissableMask
                header={() => {
                    return (<div>
                        <span style={{ color: '#F67D1D', fontSize: '1.5rem' }}>{`Sent Email Logs`}</span>
                        <br /><br />
                        <span style={{ color: 'gray' }}>{`Selected Partner:  `}</span>{`${webPartnerDiloag?.group_name}`}
                    </div>)
                }}
            >
                {loadingLogList ?
                    <div style={{ minHeight: '20dvh' }} className="position-relative">
                        <div style={{ position: 'absolute', left: '50%', top: '60%' }}>
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                        </div>
                    </div>

                    :
                    <div className='p-2'>
                        <MailLogs mailLogs={logList} />
                    </div>
                }

            </Dialog>

        </>)}
        <Toast ref={toastRef} position="bottom-right" />
    </>);



}