import { Button } from "primereact/button";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch } from 'primereact/inputswitch';
import { IApp } from "../../@types/AppInfo";
import {
    INotification,
    ISentNotifications, IUser, ITestNotification
} from "../../@types/Notification";
import AppListDropdown from "../../components/Applist/AppListDropdown";
import LinkSelector, {
    PathEnum,
} from "../../components/LinkSelector/LinkSelector";
import NotificationTestRecipients from "../../components/NotificationTestRecipients/NotificationTestRecipients";
import { NotificationService } from "../../services/Notification/Notification.service";
import "./PushNotification.css";
import UserDropDown from "./UserDropDown";

interface Props { }

const PushNotification: React.FC<Props> = () => {
    const APIBASEURL = process.env.REACT_APP_API_URL;
    const APIEndpoint = `${APIBASEURL}/v1/api/notification/sent-notifications`;

    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<IApp | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [includeLink, setIncludeLink] = useState(false);
    const [selectedPathType, setSelectedPathType] =
        useState<PathEnum>("partner");
    const [selectedValue, setSelectedValue] = useState<string | number>(0);
    const [notificationList, setNotificationList] =
        useState<ISentNotifications[]>();
    const [confirmation, setConfirmation] = useState({
        show: false,
        message: "",
    });

    const [notification, setNotification] = useState<INotification>({
        body: "",
        title: "",
        app_id: 0,
        path: "",
        id: 0,
    });

    const [limits, setLimits] = useState({
        title: 0,
        body: 0,
    });

    const toastRef = useRef<Toast>(null);

    const [checkedTestMode, setCheckedTestMode] = useState<boolean>(true);

    const [testUserList, setTestUserList] = useState<Array<IUser>>([]);
    const isTestMode = checkedTestMode;
    const hasNoTestUsers = testUserList.length === 0 || !notification.title || !notification.body;
    const isNotificationIncomplete = !notification.title || !notification.body;

    const shouldDisableSendButton = isTestMode
        ? hasNoTestUsers
        : isNotificationIncomplete;




    const fetchSentNotificationsList = async () => {
        try {
            setIsLoading(true);

            const response = await fetch(APIEndpoint);

            if (!response.ok) {
                throw new Error("NETWORK RESPONSE ERROR");
            }

            const result = await response.json();
            setNotificationList(result.data || []);
        } catch (error) {
            console.error("ERROR:", error);
            toastRef.current?.show({
                summary: "Load Failed",
                detail: "Failed to load sent notifications",
                severity: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSentNotificationsList();
    }, []);

    const buildNotificationPayload = (): ITestNotification => ({
        ...notification,
        path: includeLink ? selectedPathType : "",
        id: includeLink ? selectedValue : 0,
        user_list: testUserList
    });

    const dropdownChange = (e: DropdownChangeEvent) => {
        const application: IApp = e.value;
        setSelectedApp(application);
        setNotification((prev) => ({
            ...prev,
            app_id: application?.id || 0,
        }));
    };

    const handleBodyChange = (e: { target: { value: string } }) => {
        const value = e.target.value;
        setLimits((prev) => ({ ...prev, body: value.length }));
        setNotification((prev) => ({ ...prev, body: value }));
    };

    const handleTitleChange = (e: { target: { value: string } }) => {
        const value = e.target.value;
        setLimits((prev) => ({ ...prev, title: value.length }));
        setNotification((prev) => ({ ...prev, title: value }));
    };

    const validateNotification = () => {
        // if (!notification.title || !notification.body || !notification.app_id) {
        if (!notification.title || !notification.body) {
            toastRef.current?.show({
                summary: "Validation Failed",
                detail: "Application, title, and content are required",
                severity: "warn",
            });
            return false;
        }

        if (includeLink && (!selectedPathType || !selectedValue)) {
            toastRef.current?.show({
                summary: "Validation Failed",
                detail: "Please select both path and value",
                severity: "warn",
            });
            return false;
        }

        return true;
    };

    const handleSendTest = async () => {
        if (!toastRef.current) return;

        try {
            closeConfirmationWindow();

            if (!validateNotification()) return;

            const payload = buildNotificationPayload();

            console.log("TEST PAYLOAD:", payload);

            const response = await NotificationService.sendTestNotification(payload);

            if (!response.success) {
                toastRef.current.show({
                    summary: "Sending Failed",
                    detail: "Test Notification was not sent",
                    severity: "error",
                });
                return;
            }

            toastRef.current.show({
                summary: "Sending Successful",
                detail: "Test Notification has been successfully sent",
                severity: "success",
            });
        } catch (error) {
            console.log(error);
            toastRef.current.show({
                summary: "Sending Failed",
                detail: "Test Notification was not sent",
                severity: "error",
            });
        }
    };

    const handleSendNotification = async () => {
        if (!toastRef.current) return;

        try {
            closeConfirmationWindow();

            if (!validateNotification()) return;

            const payload = buildNotificationPayload();
            console.log("SEND PAYLOAD:", payload);

            const response = await NotificationService.sendNotification(payload);

            if (!response.success) {
                toastRef.current.show({
                    summary: "Sending Failed",
                    detail: "Notification was not sent",
                    severity: "error",
                });
                return;
            }

            toastRef.current.show({
                summary: "Sending Successful",
                detail: "Notification has been successfully sent",
                severity: "success",
            });

            fetchSentNotificationsList();
        } catch (error) {
            console.error(error);
            toastRef.current.show({
                summary: "Sending Failed",
                detail: "Notification was not sent",
                severity: "error",
            });
        }
    };

    const openModal = () => {
        setShowDialog(true);
    };

    const closeModal = () => {
        setShowDialog(false);
    };

    const closeConfirmationWindow = () => {
        setConfirmation((prev) => ({ ...prev, show: false }));
    };

    const showConfirmationWindow = (message: string) => {
        setConfirmation({
            show: true,
            message
        });
    };

    const toggleIncludeLink = (e: CheckboxChangeEvent) => {
        setIncludeLink(!!e.checked);
    };



    return (
        <>
            <div className="push-notification px-4">
                <h2>Push Notification</h2>
                <div className="grid">
                    <div className="col-6">
                        <div>

                            <div className="flex align-items-center justify-content-between mb-2" style={{ maxWidth: 300 }}>
                                <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Enable Test Mode</span>
                                <InputSwitch checked={checkedTestMode} onChange={(e) => setCheckedTestMode(e.value)} style={{ transform: 'scale(0.7)' }} />

                            </div>
                            <div className=" align-items-center justify-content-between mb-2" style={{ display: checkedTestMode ? "flex" : "none" }}>
                                <span style={{ fontSize: '1rem', fontWeight: 'normal', minWidth: 120 }}>Select User</span>

                                <UserDropDown onUserSelect={setTestUserList} />

                            </div>
                        </div>
                        <hr
                            style={{
                                border: "none",
                                borderTop: "1px solid rgb(173, 173, 175)",
                                margin: "12px 0",
                            }}
                        />
                        {/* <div className="grid">
                            <div className="col-8">
                                <label className="block">Application Name</label>
                                <AppListDropdown
                                    dropdownChange={dropdownChange}
                                    selectedApp={selectedApp}
                                />
                            </div>

                            <div className="col-4 flex align-items-end">
                                <Button
                                    onClick={openModal}
                                    className="mr-2 text-sm p-button-warning w-full"
                                    label="Test Recipients List"
                                />
                            </div>
                        </div> */}

                        <div className="mt-3">
                            <label className="block">Notification Title</label>
                            <div className="w-full">
                                <InputText
                                    className="w-full"
                                    value={notification.title}
                                    onChange={handleTitleChange}
                                    maxLength={65}
                                />
                                <div className="text-right text-gray-400">
                                    {limits.title}/65
                                </div>
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="block">Notification Content</label>
                            <div className="w-full">
                                <InputTextarea
                                    className="w-full"
                                    value={notification.body}
                                    onChange={handleBodyChange}
                                    rows={2}
                                    maxLength={178}
                                />
                                <div className="text-right text-gray-400">
                                    {limits.body}/178
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div
                                className="w-full flex"
                                style={{ gap: 8, alignItems: "center" }}
                            >
                                <Checkbox checked={includeLink} onChange={toggleIncludeLink} />
                                <label>Include Link</label>
                            </div>
                        </div>

                        <LinkSelector
                            show={includeLink}
                            selectedApp={selectedApp}
                            path={selectedPathType}
                            value={selectedValue}
                            setPath={setSelectedPathType}
                            setValue={setSelectedValue}
                        />

                        <div className="grid">
                            {/* <div className="col-6">
                                <Button
                                    onClick={() =>
                                        showConfirmationWindow(
                                            "Are you sure you want to send a test notification?",
                                            0
                                        )
                                    }
                                    className="mr-2 py-4 text w-full p-button-warning"
                                    label="Send Test"
                                />
                            </div> */}

                            <div className="col-12">
                                <Button
                                    onClick={() =>
                                        showConfirmationWindow(
                                            "Are you sure you want to send a notification?"
                                        )
                                    }
                                    className="text w-full"
                                    label="Send Notification"
                                    disabled={shouldDisableSendButton}
                                />
                            </div>
                        </div>

                        <DataTable
                            id="sent-notification-table"
                            loading={isLoading}
                            value={notificationList}
                            paginator
                            rows={10}
                        >
                            <Column field="app_id" header="App ID" />
                            <Column field="title" header="Title" />
                            <Column field="body" header="Body" />
                            <Column field="recipients_count" header="Recipients Count" />
                        </DataTable>
                    </div>
                </div>

                <Dialog
                    visible={confirmation.show}
                    onHide={closeConfirmationWindow}
                    draggable={false}
                    closeOnEscape
                    header="Confirmation"
                    footer={() => (
                        <>
                            <Button
                                onClick={checkedTestMode ? handleSendTest : handleSendNotification}
                                className="mr-2 text-sm p-button-success"
                                label="Confirm"

                            />
                            <Button
                                onClick={closeConfirmationWindow}
                                className="mr-2 text-sm p-button-danger"
                                label="Close"
                            />
                        </>
                    )}
                >
                    {confirmation.message}
                </Dialog>

                <Dialog
                    className="w-6 h-full"
                    visible={showDialog}
                    onHide={closeModal}
                    draggable={false}
                    header="Test Recipients List"
                    closeOnEscape
                    footer={() => (
                        <>
                            <Button
                                onClick={closeModal}
                                className="mr-2 text-sm p-button-danger"
                                label="Close"
                            />
                        </>
                    )}
                >
                    <NotificationTestRecipients />
                </Dialog>

                <Toast ref={toastRef} position="top-right" />
            </div>
        </>
    );
};

export default PushNotification;