import React, { useState, useEffect, useCallback, useRef } from "react";
import "./UsersList.css";
import moment from "moment";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { IViewUser } from "../../@types/ApprovalList";
import { ApprovalListService } from "../../services/ApprovalList/ApprovalList.service";

interface Props {}

const UsersList: React.FC<Props> = () => {
    const [list, setList] = useState<IViewUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const toastRef = useRef<Toast>(null);

    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const getUsers = useCallback(async () => {
        try {
            const response = await ApprovalListService.getUsers();
            if (response) setList(response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, global: { value: value as any, matchMode: FilterMatchMode.CONTAINS } }));
        setGlobalFilterValue(value);
    };

    const handleDelete = (user: IViewUser) => {
        setIsLoading(true);
        ApprovalListService.deleteViewUser(user)
            .then(result => {
                if (result) {
                    setList(prev => prev.filter(u => u.id !== user.id));
                    toastRef.current?.show({ summary: "User removed", detail: `${user.username} removed`, severity: "success" });
                } else {
                    toastRef.current?.show({ summary: "Failed", detail: "Could not remove user", severity: "error" });
                }
            })
            .catch(err => {
                toastRef.current?.show({ summary: "Error", detail: JSON.stringify(err), severity: "error" });
            })
            .finally(() => setIsLoading(false));
    };

    const dateTemplate = (row: IViewUser) =>
        moment(row.date_created).format("DD MMM YYYY, h:mm a");

    const actionTemplate = (rowData: IViewUser) => {
        const confirmDelete = (event: React.MouseEvent) => {
            confirmPopup({
                target: event.currentTarget as HTMLElement,
                message: `Delete user "${rowData.username}"?`,
                icon: "pi pi-exclamation-triangle",
                defaultFocus: "reject",
                acceptClassName: "p-button-danger",
                accept: () => handleDelete(rowData),
                reject: () => {},
            });
        };
        return (
            <>
                <ConfirmPopup />
                <Button icon="pi pi-trash" text severity="danger" onClick={confirmDelete} />
            </>
        );
    };

    const tableHeader = (
        <div className="users-table-header">
            <span className="users-table-header__count">
                {list.length} user{list.length !== 1 ? "s" : ""}
            </span>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search users…" />
            </IconField>
        </div>
    );

    return (
        <div className="users-page">
            <Toast ref={toastRef} position="bottom-right" />

            <div className="users-page__header">
                <div>
                    <h2 className="users-page__title">Mobile Application Users</h2>
                    <p className="users-page__subtitle">Registered users of the mobile application</p>
                </div>
            </div>

            <div className="users-table-wrapper">
                <DataTable
                    id="users-table"
                    loading={isLoading}
                    value={list}
                    className="text-xs"
                    dataKey="id"
                    stripedRows
                    sortField="date_created"
                    sortOrder={-1}
                    paginator
                    rows={20}
                    rowsPerPageOptions={[10, 20, 50]}
                    filters={filters}
                    globalFilterFields={["username", "email", "phone", "user_id", "id"]}
                    header={tableHeader}
                    scrollable
                    scrollHeight="flex"
                    emptyMessage="No users found"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                >
                    <Column field="id" header="ID" sortable style={{ width: "5rem" }} />
                    <Column field="user_id" header="User ID" sortable style={{ width: "6rem" }} />
                    <Column field="username" header="Username" sortable style={{ minWidth: "10rem" }} />
                    <Column field="email" header="Email" sortable style={{ minWidth: "12rem" }} />
                    <Column field="phone" header="Phone" style={{ minWidth: "9rem" }} />
                    <Column field="date_created" header="Creation Date" body={dateTemplate} sortable style={{ minWidth: "11rem" }} />
                    <Column header="Actions" body={actionTemplate} style={{ width: "5rem" }} />
                </DataTable>
            </div>
        </div>
    );
};

export default UsersList;
