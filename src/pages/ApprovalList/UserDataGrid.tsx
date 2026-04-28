import React, { FC, useState, useEffect, useCallback, useRef, RefObject } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import { FilterMatchMode } from "primereact/api";
import moment from "moment";
import { IViewUser } from "../../@types/ApprovalList";
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

    rowData: IViewUser;
}

const UserDataGrid: React.FC<Props> = ({ }) => {

    const formRef = useRef<UserDetailFormRef>(null);
    const [list, setList] = useState<IViewUser[]>([]);
    const [userId, setUserId] = useState<IViewUser | null>();
    const [validation, setValidation] = useState<validation>();
    const [useDetail, setUserDetail] = useState<IViewUser | null>();
    const [isLoading, setIsLoading] = useState<Boolean>(true);
    const toastRef = useRef<Toast>(null);

    const getCorruptedList = useCallback(async () => {
        try {

            const response = await ApprovalListService.getUsers();
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

    // const getCorruptedUserDetail = useCallback(async (request: IUserHistoryRequest) => {
    //     try {
    //         const response = await ApprovalListService.getUsers();
    //         if (response) {

    //             setUserDetail(response);
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     } finally {

    //     }
    // }, []);

    // useEffect(() => {
    //     if (userId !== undefined) {
    //         getCorruptedUserDetail(userId);
    //     }
    // }, [userId, getCorruptedUserDetail]);

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

   

    const dateBodyTemplate = (row: IViewUser) =>
        moment(row.date_created).format("D-MMM, Y h:mm:ss A");



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
    const [userDetailsDialog, setUserDetailsDialog] = useState<IViewUser | null>();
    // const setUserDialog = (user: IViewUser) => {
        
    //     setUserDetailsDialog(user);
        
    // }



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
                        "phone_number",
                        "id",
                        "email",
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
                        field="id"
                        header="ID"
                        sortable
                        filter
                        
                    />
                    <Column
                        field="user_id"
                        header="User ID"
                        sortable
                        filter
                        
                    />
                   
                    <Column
                        field="username"
                        header="Username"
                        sortable
                        filter
                        
                    />
                    <Column
                        field="email"
                        header="Email"
                        sortable
                        filter
                       
                    />
                    <Column
                        field="phone_number"
                        header="Phone Number"
                        sortable
                        filter
                        
                    />

                   
               

                    <Column
                        header="Actions"
                        body={(rowData: IViewUser) => {
                            return (
                                <div style={{transform:'scale(0.8)'}}>
                                    <Button
                                        style={{backgroundColor: 'red'}}
                                        className="custom-view-button"
                                        size="small"
                                        label={"Delete"}
                                        onClick={() => {

                                            setUserId(rowData);
                                            setUserDetailsDialog(rowData);
                                            setVisibleUserDialog(true);
                                            
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
        transform: "scale(0.9)",
        width: "40dvw",
        maxWidth: "1500px",
        maxHeight: "80dvh",
        padding: 0,
    }}
    contentStyle={{
        display: "block",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        overflowY: "auto",
        background: "white",
        paddingTop: 0,
    }}
    header={`Confirm${userId?.user_id ? " — Current User Email: " + userId.email : ""}`}
    visible={visibleUserDialog}
    onHide={() => setVisibleUserDialog(false)}
    footer={
        <div className="flex justify-content-end align-items-center gap-2">
            <Button
                size="small"
                label="Cancel"
                className="p-button-secondary outlined"
                onClick={() => setVisibleUserDialog(false)}
            />

            <Button
                size="small"
                label="Confirm"
                className="p-button-danger"
                onClick={async () => {
                   

                    try {
                        const result = await ApprovalListService.deleteViewUser(userDetailsDialog as any);
                        
                        if (result) {
                            getCorruptedList();
                            toastRef.current?.show({
                                summary: "Success",
                                detail: ``,
                                severity: "success",
                            });
                        }else{
                            toastRef.current?.show({
                                summary: "Failed",
                                detail: ``,
                                severity: "error",
                            });
                        }
                       
                    } catch (err) {
                        toastRef.current?.show({
                            summary: "Error",
                            detail: JSON.stringify(err),
                            severity: "error",
                        });
                        console.error(err);
                    }finally{
                        setUserId(null);
                       setUserDetailsDialog(null);
                       
                       setVisibleUserDialog(false);
                    }
                }}
            />
        </div>
    }
>
   
</Dialog>

        </div>
    );
};

export default UserDataGrid;
