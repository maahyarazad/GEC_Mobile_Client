import React, { useEffect, useState, useRef } from "react";
import "./careerViewer.css";
import moment from "moment";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { ICareerList } from "../../@types/Career";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { MultiSelect } from "primereact/multiselect";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { Dialog } from "primereact/dialog";
import { StorageService } from "../../services/Storage/Storage.service";

interface Props {}

// Plain icon stars — no PrimeReact Button wrapper, so no circular/border-radius styling
const RatingCell: React.FC<{
    rowData: ICareerList;
    canEdit: boolean;
    onRate: (rowData: ICareerList, rating: number) => void;
}> = ({ rowData, canEdit, onRate }) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const displayRating = hoverRating ?? rowData.rating;

    return (
        <div className="rating-group" onMouseLeave={() => setHoverRating(null)}>
            {[1, 2, 3, 4, 5].map(star => (
                <i
                    key={star}
                    className={`rating-star pi ${displayRating >= star ? 'pi-star-fill rating-star--filled' : 'pi-star'}`}
                    onClick={() => onRate(rowData, star)}
                    onMouseOver={() => setHoverRating(star)}
                    title={canEdit ? `Rate ${star}` : 'No edit permission'}
                />
            ))}
        </div>
    );
};

const CareerViewer: React.FC<Props> = () => {
    const canDelete = StorageService.hasPrivilege(83, 'delete');
    const canEdit = StorageService.hasPrivilege(83, 'edit');
    const canRead = StorageService.hasPrivilege(83, 'read');

    const [isLoading, setIsLoading] = useState(true);
    const [careerList, setCareerList] = useState<ICareerList[]>([]);
    const APIBASEURL = process.env.REACT_APP_API_URL;
    const APIEndpoint = APIBASEURL + "/v1/api/career/applicants";
    const resumePath = "/career/file/";
    const toastRef = useRef<Toast>(null);

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        position: { value: null, matchMode: FilterMatchMode.IN },
    });
    const [positionOptions, setPositionOptions] = useState<string[]>([]);
    const [messageModal, setMessageModal] = useState<{ visible: boolean; applicant: ICareerList | null }>({
        visible: false,
        applicant: null,
    });

    useEffect(() => {
        fetch(APIEndpoint)
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("NETWORK RESPONSE ERROR");
            })
            .then(res => {
                const applicants: ICareerList[] = res.data.filter((a: ICareerList) => !a.trashed);
                setCareerList(applicants);
                const positions = Array.from(new Set(res.data.map((a: ICareerList) => a.position))) as string[];
                setPositionOptions(positions);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("ERROR: ", err);
                setIsLoading(false);
            });
    }, []);

    function handleRating(rowData: ICareerList, rating: number) {
        if (!canEdit) {
            toastRef.current?.show({
                summary: "Unauthorized",
                detail: "You need Edit rights to rate applicants.",
                severity: "info",
            });
            return;
        }
        setIsLoading(true);
        fetch(`${APIEndpoint}/${rowData.id}?rating=${rating}`, { method: "POST" })
            .then(res => { if (res.ok) return res.json(); })
            .then(() => {
                rowData.rating = rating;
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }

    function handleDeleteApplicant(applicant: ICareerList) {
        setIsLoading(true);
        fetch(`${APIEndpoint}/${applicant.id}?trash=true`, { method: "POST" })
            .then(res => { if (res.ok) return res.json(); })
            .then(res => {
                if (res) setCareerList(prev => prev.filter(a => a !== applicant));
                setIsLoading(false);
                toastRef.current?.show({ summary: "Applicant removed", detail: `${applicant.name} removed`, severity: "success" });
            })
            .catch(err => {
                setIsLoading(false);
                toastRef.current?.show({ summary: "Failed to remove applicant", detail: `${err}`, severity: "error" });
            });
    }

    const cvButtonTemplate = (rowData: ICareerList) => (
        <a className="cv-link" target="_blank" rel="noreferrer" href={APIBASEURL + resumePath + rowData.path}>
            <i className="pi pi-file-pdf" style={{ marginRight: 6 }} />
            View CV
        </a>
    );

    const messageTemplate = (rowData: ICareerList) => {
        if (!rowData.message) return null;
        return (
            <Button
                label="View"
                icon="pi pi-comment"
                text
                size="small"
                className="message-btn"
                onClick={() => setMessageModal({ visible: true, applicant: rowData })}
            />
        );
    };

    const dateSubmittedTemplate = (rowData: ICareerList) =>
        moment(rowData.dateSubmitted as Date).format("DD MMM YYYY, h:mm a");

    const ratingTemplate = (rowData: ICareerList) => (
        <RatingCell rowData={rowData} canEdit={canEdit} onRate={handleRating} />
    );

    const actionTemplate = (rowData: ICareerList) => {
        const confirmTrash = (event: React.MouseEvent) => {
            confirmPopup({
                target: event.currentTarget as HTMLElement,
                message: 'Delete this applicant?',
                icon: 'pi pi-exclamation-triangle',
                defaultFocus: 'reject',
                acceptClassName: 'p-button-danger',
                accept: () => handleDeleteApplicant(rowData),
                reject: () => {},
            });
        };
        return (
            <>
                <ConfirmPopup />
                <Button icon="pi pi-trash" text severity="danger" onClick={confirmTrash} />
            </>
        );
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, global: { value: value as any, matchMode: FilterMatchMode.CONTAINS } }));
        setGlobalFilterValue(value);
    };

    const tableHeader = (
        <div className="career-table-header">
            <span className="career-table-header__count">
                {careerList.length} applicant{careerList.length !== 1 ? 's' : ''}
            </span>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search applicants…" />
            </IconField>
        </div>
    );

    const positionRowFilterTemplate = (options: any) => (
        <MultiSelect
            value={options.value}
            options={positionOptions}
            onChange={e => options.filterApplyCallback(e.value)}
            placeholder="Any"
            className="p-column-filter text-xs w-full"
            maxSelectedLabels={1}
            style={{ minWidth: '11rem' }}
        />
    );

    return (
        <div className="career-page">
            <Toast ref={toastRef} position="bottom-right" />

            <Dialog
                header={`Message from ${messageModal.applicant?.name ?? ''}`}
                visible={messageModal.visible}
                onHide={() => setMessageModal({ visible: false, applicant: null })}
                style={{ width: '36rem', maxWidth: '90vw' }}
                draggable={false}
            >
                <p className="message-modal__body">
                    {messageModal.applicant?.message || <em style={{ color: '#999' }}>No message provided.</em>}
                </p>
            </Dialog>

            <div className="career-page__header">
                <div>
                    <h2 className="career-page__title">Resume Submissions</h2>
                    <p className="career-page__subtitle">Review and rate job applicants</p>
                </div>
            </div>

            <div className="career-table-wrapper">
                <DataTable
                    id="applicants-table"
                    loading={isLoading}
                    value={careerList}
                    className="text-xs"
                    dataKey="id"
                    stripedRows
                    sortField="dateSubmitted"
                    sortOrder={-1}
                    paginator
                    rows={20}
                    rowsPerPageOptions={[10, 20, 50]}
                    filters={filters}
                    globalFilterFields={['name', 'position', 'email', 'phone']}
                    header={tableHeader}
                    filterDisplay="row"
                    scrollable
                    scrollHeight="flex"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                >
                    <Column field="id" header="ID" style={{ width: '4rem' }} />
                    <Column field="name" header="Name" style={{ minWidth: '10rem' }} />
                    <Column
                        field="position"
                        header="Position"
                        filterField="position"
                        showFilterMenu={false}
                        style={{ minWidth: '11rem' }}
                        filter
                        filterElement={positionRowFilterTemplate}
                    />
                    <Column field="phone" header="Phone" style={{ minWidth: '8rem' }} />
                    <Column field="email" header="Email" style={{ minWidth: '12rem' }} />
                    <Column field="origin" header="Origin" style={{ minWidth: '6rem' }} />
                    {canRead && <Column field="path" header="CV" body={cvButtonTemplate} style={{ width: '7rem' }} />}
                    <Column header="Message" body={messageTemplate} style={{ width: '7rem' }} />
                    <Column field="rating" header="Rating" body={ratingTemplate} sortable style={{ minWidth: '9rem' }} />
                    <Column field="dateSubmitted" header="Date" body={dateSubmittedTemplate} sortable style={{ minWidth: '11rem' }} />
                    {canDelete && <Column header="Actions" body={actionTemplate} style={{ width: '5rem' }} />}
                </DataTable>
            </div>
        </div>
    );
};

export default CareerViewer;
