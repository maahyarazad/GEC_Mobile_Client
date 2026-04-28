import React, { FC, useState, useEffect, useCallback, useRef, RefObject } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import { FilterMatchMode } from "primereact/api";
import moment from "moment";
import { IAppUserLogin, IUserDetailForm, IUserHistoryRequest } from "../../@types/ApprovalList";
import { ApprovalListService } from "../../services/ApprovalList/ApprovalList.service";
import { Dialog } from "primereact/dialog";

import { ProgressSpinner } from 'primereact/progressspinner';

import { UserDetailForm, UserDetailFormRef, UserDetailFormData } from "./UserDetailForm";

import { Toast } from "primereact/toast";


interface Props {
    // data: IAppUserLogin[];
    // onView?: (row: IAppUserLogin) => void;
    // canRead?: boolean;

    toastRef: RefObject<Toast>;

}

interface validation {
    data: UserDetailFormData;
    isValid: boolean;
}
interface ButtonProps {

    rowData: IAppUserLogin;
}

const CorruptedDataGrid: React.FC<Props> = ({ }) => {

    const formRef = useRef<UserDetailFormRef>(null);
    const [list, setList] = useState<IAppUserLogin[]>([]);
    const [userId, setUserId] = useState<IUserHistoryRequest>();
    const [validation, setValidation] = useState<validation>();
    const [useDetail, setUserDetail] = useState<IUserDetailForm>();
    const [isLoading, setIsLoading] = useState<Boolean>(true);
    const toastRef = useRef<Toast>(null);

    const getCorruptedList = useCallback(async () => {
        try {

            const response = await ApprovalListService.getCorruptedList();
            if (response) {

                setList(response);

            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);



    useEffect(() => {
        getCorruptedList();

    }, [getCorruptedList]);

    const getCorruptedUserDetail = useCallback(async (request: IUserHistoryRequest) => {
        try {
            const response = await ApprovalListService.getCorruptedUserDetail(request);
            if (response) {

                setUserDetail(response);
            }
        } catch (error) {
            console.error(error);
        } finally {

        }
    }, []);

    useEffect(() => {
        if (userId !== undefined) {
            getCorruptedUserDetail(userId);
        }
    }, [userId, getCorruptedUserDetail]);

    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        user_id: { value: null, matchMode: FilterMatchMode.EQUALS },
        full_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        ip_address: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        device_id: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        platform: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        version: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });

    const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

        const iconStyle: React.CSSProperties = {
    position: 'absolute',
                        left: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#aaa',
                        pointerEvents: 'none', 
        }

    const renderHeader = () => (
        <div className="flex justify-content-between align-items-center">
            <h2 className="m-0">Corrputed Records</h2>
<div style={{ position: 'relative', display: 'inline-block' }}>
                <i
                    className="pi pi-search"
                    style={iconStyle}
                />
                <input
                    type="search"
                    value={globalFilterValue}
                    onChange={(e) => {
                        const value = e.target.value;
                        setGlobalFilterValue(value);
                        setFilters((prev) => ({
                            ...prev,
                            global: { ...prev.global, value },
                        }));
                    }}
                    placeholder="Search..." // optional
                    className="p-inputtext p-component"
                    style={{ paddingLeft: '2rem' }} // make room for the icon
                />
            </div>
        </div>
    );

    const versionBodyTemplate = (row: IAppUserLogin) => (
        <span className="font-semibold">{row.version || "—"}</span>
    );

    const dateBodyTemplate = (row: IAppUserLogin) =>
        moment(row.date_updated).format("D-MMM, Y h:mm:ss A");



    const Warning: React.FC = () => (
        <div className="col-12">
            <div className="flex h-full justify-content-center align-items-center gap-2 text-center">
                <i className="pi pi-exclamation-triangle text-3xl text-yellow-500"></i>
                <span>
                    Are you sure you want to proceed with this authorization request?
                </span>
            </div>
        </div>
    );

    const [activate, setActivate] = useState<boolean>();
    const [viewSecondDialog, setViewSecondDialog] = useState<boolean>();

    const ActionButtons: FC<ButtonProps> = ({ rowData }) => {

        return (
            <>
                <div className="flex flex-1" style={{ flexDirection: 'column', justifyContent: 'space-between', paddingTop: 10 }}>

                    <span>
                        <small>Creation Date: </small>
                        <strong>
                            {`${moment(rowData.date_created).format("MM/YYYY")} - ${moment(rowData.date_created).format("MMM YYYY").toUpperCase()}`}
                        </strong>
                    </span>
                    <span>
                        <small>Username: </small>
                        <strong>
                            {rowData.username}
                        </strong>
                    </span>

                    <div className="flex flex-wrap">
                        <Button
                            className="mt-4 p-button-success w-full mb-2"
                            icon={"pi pi-check"}
                            label="Activate"
                            onClick={() => {
                                setViewSecondDialog(true);
                                setActivate(true);

                            }}
                        />
                    </div>
                    <Button
                        className="p-button-danger w-full"
                        icon={"pi pi-times"}
                        label="Deactivate"
                        onClick={() => {
                            setViewSecondDialog(true);
                            setActivate(false);

                        }}
                    />

                </div>
            </>
        );
    }

    const [visibleUserDialog, setVisibleUserDialog] = useState(false);
    const [userDetailsDialog, setUserDetailsDialog] = useState<IAppUserLogin>();
    const setUserDialog = (user: IAppUserLogin) => {
        setUserDetailsDialog(user);
        setVisibleUserDialog(true);
    }



    return (
        <div className="card">

            {isLoading
                ?


                <div style={{ width: '100vw', height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} animationDuration=".5s" />
                </div>

                :
                <DataTable
                    value={list}
                    paginator
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    rows={10}
                    dataKey="id"
                    filters={filters}
                    filterDisplay="menu"
                    globalFilter={globalFilterValue}
                    globalFilterFields={[
                        "username",
                        "user_id",
                        "device_id",
                        "ip_address",
                    ]}
                    header={renderHeader}
                    responsiveLayout="scroll"
                    emptyMessage="No records found"
                    style={{ fontSize: 13 }}
                    scrollable           // 👈 enables scrollable table body
                    scrollHeight="70dvh" // 👈 static height for the table body
                >
                    <Column
                        field="date_created"
                        header="Creation Date"
                        sortable
                        body={dateBodyTemplate}
                    />
                    <Column
                        field="user_id"
                        header="User ID"
                        sortable
                        filter
                        filterPlaceholder="Search by ID"
                    />
                    <Column
                        field="old_user_id"
                        hidden={true}
                    />
                    <Column
                        field="username"
                        header="Username"
                        sortable
                        filter
                        filterPlaceholder="Search by name"
                    />

                    <Column
                        field="ip_address"
                        header="IP Address"
                        sortable
                        filter
                        filterPlaceholder="Search IP"
                    />
                    <Column
                        field="device_id"
                        header="Device ID"
                        sortable
                        filter
                        filterPlaceholder="Search device"
                    />
                    <Column
                        field="version"
                        header="Version"
                        sortable
                        body={versionBodyTemplate}
                        filter
                        filterPlaceholder="Search version"
                    />
                    <Column
                        field="platform"
                        header="Platform"
                        sortable
                        filter
                        filterPlaceholder="Search platform"
                    />

                    <Column
                        header="Actions"
                        body={(rowData: IAppUserLogin) => {
                            return (
                                <div style={{transform:'scale(0.8)'}}>
                                    <Button
                                        className="custom-view-button"
                                        size="small"
                                        label={"Modify"}
                                        onClick={() => {

                                            setUserId({

                                                user_id: rowData.user_id,
                                                old_user_id: rowData.old_user_id!,

                                            });
                                            setUserDialog(rowData)
                                        }} />
                                </div>

                            );
                        }}
                    />

                </DataTable>
            }

            <Toast ref={toastRef} position="bottom-right" />

            <Dialog
                style={{
                    transform: 'scale(0.8)',
                    width: `${viewSecondDialog && activate ? "40dvw" : "30dvw"}`, maxWidth: "1500px", maxHeight: `${viewSecondDialog ? "80dvh" : "40dvh"}`, padding: 0,
                }}
                contentStyle={{
                    display: "block",       // remove flex centering
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    overflowY: "auto",      // allow scrolling
                    paddingTop: 0,           // remove extra top padding

                    background: 'white'
                }}
                                header={viewSecondDialog ? `Confirm -- Current User ID: ${userId?.user_id}` : `Confirm`}
                visible={visibleUserDialog}
                onHide={() => {
                    if (viewSecondDialog) {
                        setViewSecondDialog(false);

                    } else {
                        setVisibleUserDialog(false);
                    }
                }}
                footer={viewSecondDialog ?
                    (
                        <>

                            <div className="flex justify-content-end align-items-center">
                                <div className="pt-2">


                                    <Button size="small" label="Cancel" className="p-button-secondary outlined" onClick={() => setViewSecondDialog(false)} />

                                    <Button size="small"
                                        label="Confirm"
                                        className="p-button-danger"
                                        onClick={async () => {

                                            const validation = formRef.current?.getData();

                                            if (!validation || !validation.isValid) return; // stop if invalid

                                            const formData = validation.data;

                                            if (!formData) return; // stop if no data

                                            try {
                                                
                                                userDetailsDialog!.user_detail = { ...validation.data } as any;
                                                    
                                                if (activate) {

                                                    userDetailsDialog!.status = 1;

                                                    userDetailsDialog!.isAuthorized = 1;

                                                    const response: any = await ApprovalListService.updateCorrputedRecord(userDetailsDialog!);
                                                    if (response.status === 200) {
                                                        getCorruptedList();
                                                        toastRef.current?.show({
                                                            summary: "Success",
                                                            detail: response.data?.message,
                                                            severity: "success",
                                                        });
                                                        setViewSecondDialog(false);
                                                        setVisibleUserDialog(false);
                                                    }

                                                } else {



                                                    userDetailsDialog!.status = 0;
                                                    userDetailsDialog!.isAuthorized = 0;

                                                    const response: any = await ApprovalListService.updateCorrputedRecord(userDetailsDialog!);
                                                    if (response.status === 200) {
                                                        getCorruptedList();
                                                        toastRef.current?.show({
                                                            summary: "Success",
                                                            detail: response.data?.message,
                                                            severity: "success",
                                                        });
                                                        setViewSecondDialog(false);
                                                        setVisibleUserDialog(false);
                                                    }
                                                }
                                            } catch (err) {
                                                toastRef.current?.show({
                                                    summary: "Error",
                                                    detail: JSON.stringify(err),
                                                    severity: "error",
                                                });
                                                console.error(err);
                                            }
                                        }}

                                    />
                                </div>
                            </div>

                        </>
                    )
                    :

                    <>
                    </>
                }
            >
                {
                    viewSecondDialog ?
                        (

                            <div style={{ padding: 0 }}>
                                {/* <Warning/> */}
                                <UserDetailForm ref={formRef} activate={activate!} initialData={useDetail!} />
                            </div>


                        )
                        :
                        (
                            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>

                                <div className="flex flex-1" style={{ flexDirection: 'column' }}>

                                    {userDetailsDialog && <ActionButtons rowData={userDetailsDialog} />}

                                </div>
                            </div>
                        )
                }
            </Dialog>
        </div>
    );
};

export default CorruptedDataGrid;
