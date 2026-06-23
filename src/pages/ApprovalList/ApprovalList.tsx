import "./ApprovalList.css";
import React, { FC, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Button } from "primereact/button";
import { IUserAccessRequest } from "../../@types/ApprovalList";
import { ApprovalListService } from "../../services/ApprovalList/ApprovalList.service";
import { InputText } from "primereact/inputtext";
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from "primereact/column";
import { SERVER_URL } from "../../utils/constants/constants";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Image } from "primereact/image";
import moment from "moment";
import { InputTextarea } from "primereact/inputtextarea";
import { IApp } from "../../@types/AppInfo";
import { useLocation } from "react-router-dom";
import AppListDropdown from "../../components/Applist/AppListDropdown";
import { DropdownChangeEvent } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { AuthService } from "../../services/Auth/Auth.service";
import { StorageService } from "../../services/Storage/Storage.service";
import { FilterMatchMode } from 'primereact/api';
import CorruptedDataGrid from './CorruptedDataGrid';
import UserDataGrid from './UserDataGrid';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { Badge } from 'primereact/badge';

import { IUserDetailForm, IUserHistoryRequest, IViewUser } from "../../@types/ApprovalList";
import MembershipShipRecordTable from './MemberShipRecordTable';

interface Props { }

interface ButtonProps {
    index?: number;
    rowData: IUserAccessRequest;
}

interface LocationProps {
    app: IApp;
}

//Functional Component
const ApprovalList: React.FC<Props> = () => {

    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [viewCorrupted, setViewCorrupted] = useState(false);
    const [viewUsers, setViewUsers] = useState(false);
    const [status, setStatus] = useState(false);

    const canRead = StorageService.hasPrivilege(75, 'read')
    const canAdd = StorageService.hasPrivilege(75, 'add')
    const canEdit = StorageService.hasPrivilege(75, 'edit')
    const canDelete = StorageService.hasPrivilege(75, 'delete')

    const [list, setList] = useState<IUserAccessRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const msg = useRef("");
    const isMounted = useRef(true);
    const location = useLocation();
    const app: IApp = (location.state as LocationProps)?.app;
    const [selectedApp, setSelectedApp] = useState<IApp | null>(null);
    const toastRef = useRef<Toast>(null);
    const toastUserRef = useRef<Toast>(null);
    const [visibleUserDialog, setVisibleUserDialog] = useState(false);
    const [userDetailsDialog, setUserDetailsDialog] = useState<IUserAccessRequest>();


    useEffect(() => {

        setSelectedApp(app);
    }, [selectedApp]);



    const getApprovalList = useCallback(async () => {
        try {
            let response;
            if (selectedApp !== undefined) {
                
                response = await ApprovalListService.getApprovalList(
                    selectedApp!.id,
                    status,
                    hasSubmitted
                );

            }

            if (isMounted.current) {
                
                setList(response || []);
                setIsLoading(false);
            }
        } catch (error) {
            setIsLoading(false);
        }
    }, [status, hasSubmitted, selectedApp, viewCorrupted]); // dependencies are crucial


    useEffect(() => {
        isMounted.current = true;

        getApprovalList();

        return () => {
            isMounted.current = false;
        };
    }, [getApprovalList]); // just depend on getApprovalList



    const rejection = (hello: string) => {
        alert(hello);
    };

    const handleRequest = () => {
        setIsLoading(true);
        getApprovalList();
    };

    const renderRejectionContent = () => {
        return (
            <div>
                <div className="grid">
                    <div className="col-2">
                        <div className="flex h-full justify-content-center align-items-center">
                            <i className="pi pi-exclamation-triangle text-3xl"></i>
                        </div>
                    </div>
                    <div className="col-10">
                        <div className="flex h-full justify-content-center align-items-center">
                            Are you sure you want to reject this authorization request?
                        </div>
                    </div>
                </div>
                <div className="grid mt-3 w-30rem">
                    <div className="col-12">
                        <label>Reason for rejection *</label>
                        <InputTextarea
                            onChange={(e) => {
                                msg.current = e.target.value;
                            }}
                            className="w-full"
                            rows={6}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderDeleteContent = () => {
        return (
            <div>
                <div className="grid">
                    <div className="col-2">
                        <div className="flex h-full justify-content-center align-items-center">
                            <i className="pi pi-exclamation-triangle text-3xl"></i>
                        </div>
                    </div>
                    <div className="col-10">
                        <div className="flex h-full justify-content-center align-items-center">
                            Are you sure you want to decline and DELETE this user?<br />
                            We will not be able to retrieve this information.
                        </div>
                    </div>
                </div>
                <div className="grid mt-3 w-30rem">
                    <div className="col-12">
                        <label>Reason for rejection and delete*</label>
                        <InputTextarea
                            onChange={(e) => {
                                msg.current = e.target.value;
                            }}
                            className="w-full"
                            rows={6}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const ActionButtons: FC<ButtonProps> = ({ rowData }) => {
        const handleAccept = () => {
            confirmDialog({
                accept: () => {
                    setIsLoading(true);
                    ApprovalListService.setAccess({
                        request_id: rowData.id,
                        user_id: rowData.user_id,
                        status: 1,
                        app_id: app.id,
                    }).then((response) => {
                        setIsLoading(false);
                        setVisibleUserDialog(false);
                        setList(list.filter((req) => req.id !== rowData.id));
                    }).catch(err => {
                        setIsLoading(false);
                        if (toastRef && toastRef.current) {
                            toastRef.current.show({
                                summary: "Edit Failed",
                                detail: err.response.data.message,
                                severity: "error",
                            });
                        }
                    });
                },
                reject: () => { },
                header: "Confirm Authorize",
                message: "Are you sure you want to approve this authorization request?",
                acceptLabel: "Accept",
                rejectLabel: "Cancel",
                className: "text-sm",
                icon: "pi pi-exclamation-triangle",
                acceptClassName: "p-button-success",
                rejectClassName: "p-button-text p-button-secondary text-xs",
            });
        };

        const handleReject = () => {
            msg.current = ''
            confirmDialog({
                accept: () => {
                    if (!msg.current.trim()) {
                        if (toastRef && toastRef.current) {
                            toastRef.current.show({
                                summary: "Update Failed",
                                detail: "Reject Message cannot be blank.",
                                severity: "error",
                            });
                        }
                        return;
                    }

                    setIsLoading(true);
                    ApprovalListService.setAccess({
                        request_id: rowData.id,
                        user_id: rowData.user_id,
                        status: 0,
                        remarks: msg.current.trim(),
                        app_id: app.id,
                    }).then((response) => {
                        setIsLoading(false);
                        setVisibleUserDialog(false);
                        setList(list.filter((req) => req.id !== rowData.id));
                    }).catch(err => {
                        setIsLoading(false);
                        if (toastRef && toastRef.current) {
                            toastRef.current.show({
                                summary: "Edit Failed",
                                detail: err?.response?.data?.message,
                                severity: "error",
                            });
                        }
                    });
                },
                reject: () => { },
                header: "Confirm Reject",
                acceptLabel: "Decline",
                rejectLabel: "Cancel",
                className: "text-sm m-0 p-0",
                message: renderRejectionContent(),

                contentClassName: " m-0 pl-2",
                acceptClassName: "p-button-danger",
                rejectClassName: "p-button-text p-button-secondary text-xs",
            });
        };

        const handleDelete = () => {
            msg.current = ''
            confirmDialog({
                accept: () => {
                    if (!msg.current.trim()) {
                        if (toastRef && toastRef.current) {
                            toastRef.current.show({
                                summary: "Update Failed",
                                detail: "Reject Message cannot be blank.",
                                severity: "error",
                            });
                        }
                        return;
                    }

                    // Reject user request approval
                    setIsLoading(true);
                    ApprovalListService.setAccess({
                        request_id: rowData.id,
                        user_id: rowData.user_id,
                        status: 0,
                        remarks: msg.current.trim(),
                        app_id: app.id,
                    }).then((response) => {
                        // Delete User
                        ApprovalListService.purgeUser(rowData.user_id).then((response) => {
                            setVisibleUserDialog(false);
                            setList(list.filter((req) => req.id !== rowData.id));
                            setIsLoading(false);
                        })
                            .catch((err) => {
                                setIsLoading(false);
                                if (toastRef && toastRef.current) {
                                    toastRef.current.show({
                                        summary: "Delete Failed",
                                        detail: err?.response?.data?.message,
                                        severity: "error",
                                    });
                                }
                            });
                    }).catch(err => {
                        setIsLoading(false);
                        if (toastRef && toastRef.current) {
                            toastRef.current.show({
                                summary: "Edit Failed",
                                detail: err?.response?.data?.message,
                                severity: "error",
                            });
                        }
                    });
                },
                reject: () => { },
                header: "Confirm Decline and Delete",
                acceptLabel: "DELETE",
                rejectLabel: "Cancel",
                className: "text-sm m-0 p-0",
                message: renderDeleteContent(),
                contentClassName: " m-0 pl-2",
                acceptClassName: "p-button-danger",
                rejectClassName: "p-button-text p-button-secondary text-xs",
            });
        }

        return (
            <>
                <div className="flex flex-1" style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="flex flex-wrap mb-8">
                        {canEdit && <Button
                            className="mt-4 mb-4 p-button-success w-full"
                            icon={"pi pi-check"}
                            label="Accept"
                            onClick={handleAccept}
                        />}
                        <br />
                        {canEdit && <Button
                            className="p-button-danger w-full"
                            icon={"pi pi-times"}
                            label="Decline"
                            onClick={handleReject}
                        />}
                    </div>
                    {selectedApp?.id === 2 && canDelete && <Button
                        label="Decline & Delete"
                        severity="danger"
                        outlined
                        onClick={handleDelete}
                    />}
                </div>
            </>
        );
    };

    const userDetailsBodyTemplate = (rowData: IUserAccessRequest) => {
        const commonStyle: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        };

        if (selectedApp != undefined && (app.id === 2 || selectedApp.id === 2)) {
            return (
                <small style={commonStyle}>
                    <strong>{`${rowData.full_name}`}</strong>

                    <span>
                        <small>Partner: </small>
                        <strong>{` ${rowData.title}`}</strong>
                    </span>

                    {rowData.member !== null && rowData.old_user_id !== 0 && (
                        <span>
                            <small>Member ID:</small>
                            <strong>{rowData.old_user_id}</strong>
                        </span>
                    )}

                    <span>
                        <small>Card Validity:</small>
                        <strong>{`${moment(rowData.card_valid_date).format("MM/YYYY")} - ${moment(rowData.card_valid_date).format("MMM YYYY").toUpperCase()}`}</strong>
                    </span>
                </small>
            );
        } else {
            return (
                <small style={commonStyle}>
                    <strong>{`${rowData.full_name}`}</strong>
                    <span>
                        <small>Card Number:</small>
                        <strong>{rowData.card_number}</strong>
                    </span>
                    <span>
                        <small>Card Validity:</small>
                        <strong>{`${moment(rowData.card_valid_date).format("MM/YY")} - ${moment(rowData.card_valid_date).format("MMM YYYY").toUpperCase()}`}</strong>
                    </span>
                </small>
            );
        }
    };


    const remarks = (rowData: IUserAccessRequest) => {
        return (
            <div className="card flex justify-content-center">
                <Tooltip target=".custom-target-icon" className="custom-tooltip" />

                <i
                    className="custom-target-icon pi pi-envelope p-text-secondary p-overlay-badge"
                    data-pr-tooltip={rowData.remarks}

                    data-pr-position="right"
                    data-pr-at="right+5 top"
                    data-pr-my="left center-2"
                    style={{ fontSize: '2rem', cursor: 'pointer' }}
                >
                    <Badge severity="danger"></Badge>
                </i>
            </div>
        );
    };


    const onSelectApp = (e: DropdownChangeEvent) => {
        setSelectedApp(e.value);
    };

    // const renderHeader = () => {
    //   return (
    //     <div className="w-4">
    //       <AppListDropdown
    //         dropdownChange={onSelectApp}
    //         selectedApp={selectedApp}
    //       />
    //     </div>
    //   );
    // };

    // const versionBodyTemplate = (rowData: IUserAccessRequest) => {
    //   return !!rowData.version ? rowData.version : "N/A";
    // };

    // const rowClass = (rowData: IUserAccessRequest): string => {
    //   return rowData.member ? "bg-blue-100" : "";
    // };


    const setUserDialog = (user: IUserAccessRequest) => {
        setUserDetailsDialog(user);
        getUserDetail({ user_id: user?.user_id!, old_user_id: user?.old_user_id === null ? 0 : user?.old_user_id! })
        setVisibleUserDialog(true);
    }



    const [globalFilter, setGlobalFilter] = useState<string | null>(null);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10); // rows per page

    // const renderHeader = () => {
    //     return (
    //         <div className="table-header">
    //             <InputText
    //                 placeholder="Search..."
    //                 value={globalFilter || ""}
    //                 onChange={(e) => setGlobalFilter(e.target.value)}
    //                 style={{ width: "200px" }}
    //             />
    //         </div>
    //     );



    // };

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
            <h2 className="m-0">Approval Requests</h2>
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

    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
        user_id: { value: undefined, matchMode: FilterMatchMode.STARTS_WITH },
        full_name: { value: undefined, matchMode: FilterMatchMode.STARTS_WITH },
        ip_address: { value: undefined, matchMode: FilterMatchMode.STARTS_WITH },
        device_id: { value: undefined, matchMode: FilterMatchMode.STARTS_WITH },
        version: { value: undefined, matchMode: FilterMatchMode.STARTS_WITH },
        platform: { value: undefined, matchMode: FilterMatchMode.STARTS_WITH },
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');


    const rowClass = (rowData: IUserAccessRequest): string => {
        return rowData.member ? "highlight-row" : "";
    };


    const versionBodyTemplate = (rowData: any) => {
        return <span>{rowData.version}</span>;
    };

    const spanStyle: React.CSSProperties = {
        paddingLeft: 2,
        paddingRight: 2,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        visibility: viewCorrupted ? "hidden" : "visible",
    };

    const [useDetail, setUserDetail] = useState<IUserDetailForm | null>(null);
    const getUserDetail = async (request: IUserHistoryRequest) => {
        try {
            
            const response = await ApprovalListService.getCorruptedUserDetail(request);
            if (response) {

                setUserDetail(response);
            }
        } catch (error) {
            console.error(error);
        } finally {

        }
    };

    //    useEffect(()=>{

    //         getUserDetail({user_id: userDetailsDialog?.user_id!, old_user_id: userDetailsDialog?.old_user_id=== null ? 0 : userDetailsDialog?.old_user_id!})
    //    }, [getUserDetail])


    return (
        <>
            <div style={{ height: '100%' }}>
                <div className="" style={{ whiteSpace: "pre-wrap" }}>
                    <div className="col-12 text-right" style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            size="small"
                            severity="contrast"
                            style={{ transform: 'scale(0.8)' }}

                            loading={isLoading}
                            icon="pi pi-refresh"
                            label={"Refresh List"}
                            onClick={handleRequest}
                        />
                        <div style={{ paddingLeft: 2, paddingRight: 2, display: "flex", alignItems: "center", flexDirection: "column" }}>

                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                                View Corrupted Records
                            </span>
                            <InputSwitch checked={viewCorrupted} onChange={(e) => setViewCorrupted(e.value)} />
                        </div>
                        {/* <div style={{ paddingLeft: 2, paddingRight: 2, display: "flex", alignItems: "center", flexDirection: "column" }}>

                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                                Users
                            </span>
                            <InputSwitch checked={viewUsers} onChange={(e) => setViewUsers(e.value)} />
                        </div> */}
                        <div style={spanStyle}>


                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                                Toggle Submitted
                            </span>
                            <InputSwitch checked={hasSubmitted} onChange={(e) => setHasSubmitted(e.value)} disabled={viewCorrupted} />
                        </div>
                        <div style={spanStyle}>


                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                                Toggle Status
                            </span>
                            <InputSwitch checked={status} onChange={(e) => setStatus(e.value)} disabled={viewCorrupted} />
                        </div>
                        <br></br>
                    </div>
                    <div className=""
                        style={{ height: '85dvh', overflow: 'scroll' }}
                    >

                        {viewCorrupted ? (

                            <CorruptedDataGrid toastRef={toastRef} />

                        ) : isLoading ? (

                            <div style={{ width: '100vw', height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <ProgressSpinner style={{ width: '50px', height: '50px' }} animationDuration=".5s" />
                            </div>

                        ) : (
                            <DataTable
                                value={list}
                                style={{ fontSize: 13 }}
                                rowClassName={rowClass}
                                responsiveLayout="scroll"
                                header={renderHeader}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                rowsPerPageOptions={[10, 25, 50]}
                                dataKey="id"
                                first={first}
                                onPage={(e) => setFirst(e.first)}
                                rows={rows}
                                paginator
                                filters={filters}
                                filterDisplay="menu"
                                scrollable
                                scrollHeight="70dvh"
                                globalFilter={globalFilter}
                                globalFilterFields={["user_id", "platform", "device_id", "ip_address", "full_name", "old_user_id", "title"]}
                                emptyMessage="No records found"
                            >
                                <Column
                                    field="user_id"
                                    header="User ID"
                                    sortable
                                    filter
                                    filterPlaceholder="Search by ID"
                                    style={{ width: "100px" }}
                                />
                                <Column
                                    field="old_user_id"

                                    hidden={true}
                                />
                                <Column
                                    field="title"


                                    hidden={true}
                                />
                                <Column
                                    field="full_name"
                                    header="Owner Details"
                                    body={userDetailsBodyTemplate}

                                    style={{ width: "200px" }}
                                    filterPlaceholder="Search by name"

                                />
                                <Column
                                    field="remarks"
                                    header="Remark"

                                    body={remarks}
                                    style={{ width: "30" }}


                                />
                                <Column
                                    field="card_image"
                                    header="Card Image"
                                    body={(detail) => (
                                        <Image
                                            imageClassName="border-round-lg"
                                            src={detail.card_image}
                                            alt="Image"
                                            width="100"
                                            height="70"
                                            preview
                                        />
                                    )}
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
                                    style={{ width: "50px" }}
                                />
                                <Column
                                    field="platform"
                                    header="Platform"
                                    sortable
                                    filter
                                    filterPlaceholder="Search platform"
                                    style={{ width: "50px" }}
                                />
                                <Column
                                    field="date_updated"
                                    header="Date"
                                    sortable
                                    body={(detail) => <div>{moment(detail.date_updated).format("D-MMM, Y h:mm:ss A")}</div>}
                                />
                                {canRead && (
                                    <Column
                                        header="Actions"
                                        body={(rowData: IUserAccessRequest) => {
                                            return (
                                                <div style={{ transform: 'scale(0.8)' }}>
                                                    <Button
                                                        
                                                        className="custom-view-button"
                                                        size="small"
                                                        label={"View"}
                                                        onClick={() => setUserDialog(rowData)} />
                                                </div>

                                            );
                                        }}
                                    />
                                )}
                            </DataTable>
                        )}

                    </div>
                </div>


                <Dialog
                    visible={visibleUserDialog}
                    onHide={() => { setVisibleUserDialog(false); setUserDetail(null); }}
                    style={{ width: "60vw", maxWidth: "1500px" }}
                    dismissableMask
                    header={() => { return selectedApp?.id === 1 ? "IFZA Rewards User Approval" : `GEC Mobile Approval - ${userDetailsDialog?.full_name} ` }}
                >
                    {
                        useDetail && (
                            <div className="pb-2">

                                <MembershipShipRecordTable data={useDetail?.membership!} />
                            </div>

                        )
                    }
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", border: "solid", borderRadius: '2px', borderWidth: 1, padding: '20px', borderColor: '#bababa' }}>
                        <div>
                            <Image
                                imageClassName="border-round-lg"
                                src={userDetailsDialog?.card_image}
                                alt="Image is missing"
                                width="100%"
                                height="100%"
                                preview
                            />
                        </div>

                        <div className="flex flex-1" style={{ flexDirection: 'column' }}>
                            <pre>{userDetailsDialog && userDetailsBodyTemplate(userDetailsDialog)}</pre>
                            {userDetailsDialog && <ActionButtons rowData={userDetailsDialog} />}
                        </div>
                    </div>

                </Dialog>

            </div>
            <ConfirmDialog breakpoints={{ "960px": "75vw", "640px": "100vw" }} />
            <Toast ref={toastRef} position="bottom-right" />
        </>
    );
};

export default ApprovalList;
