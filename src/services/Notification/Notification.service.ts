import { AxiosResponse } from "axios";
import { ISentNotifications, ITestRecipient, NotificationServiceType } from "../../@types/Notification";
import { axiosInstance } from "../../utils/interceptor/Interceptor";

const API_URL = 'notification'

const res = (response: AxiosResponse) => response.data;
const resData = (response: AxiosResponse) => response.data.data;

export const NotificationService: NotificationServiceType = {
    sendTestNotification(data): Promise<any> {
        return axiosInstance.post<any>(`${API_URL}/test`, data).then(res)
    },
    sendNotification(data) {
        return axiosInstance.post<any>(`${API_URL}/send-notification`, data).then(res)
    },
    getTestRecipients(): Promise<ITestRecipient[]> {
        return axiosInstance.get<ITestRecipient[]>(`${API_URL}/get-test-recipients`).then(resData)
    },
    getSentNotifications(): Promise<ISentNotifications[]> {
        return axiosInstance.get<ISentNotifications[]>(`${API_URL}/sent-notifications`).then(resData)
    },
    searchUser(user) {
        return axiosInstance.post<ITestRecipient[]>(`${API_URL}/search-user`, {user}).then(resData)
    },
    addTestRecipient(user_id): Promise<any>{
        return axiosInstance.post<any>(`${API_URL}/add-test-recipient`, {user_id}).then(res)
    },
    removeTestRecipient(user_id) {
        return axiosInstance.delete<any>(`${API_URL}/remove-test-recipient/${user_id}`,).then(res)
    },
}