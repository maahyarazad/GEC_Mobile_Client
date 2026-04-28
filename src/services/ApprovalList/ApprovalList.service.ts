import { AxiosResponse } from "axios";
import { ApprovalListServiceType, IUserAccessRequest, IUserAccessUpdate, IAppUserLogin, IUserDetailForm, IUserHistoryRequest, IViewUser, IViewUserRequest } from "../../@types/ApprovalList";
import { axiosInstance } from "../../utils/interceptor/Interceptor";

const API_URL = 'user'

const response = (response: AxiosResponse) => response.data.result;

export const ApprovalListService: ApprovalListServiceType = {

    getApprovalList(app: number, status: boolean, submitted: boolean): Promise<IUserAccessRequest[]> {
    
    return axiosInstance
        .post<IUserAccessRequest[]>(`${API_URL}/approval-requests`, {
        app,
        status,
        submitted,
        })
        .then(response);
    },

    getCorruptedList(): Promise<IAppUserLogin[]> {
    return axiosInstance
        .get<IAppUserLogin[]>(`${API_URL}/corrupted-list`)
        .then(response);
    },

    getCorruptedUserDetail(request: IUserHistoryRequest): Promise<IUserDetailForm> {
        return axiosInstance
            .get<IUserDetailForm[]>(`${API_URL}/get-user-detail-for-corrupted-record?user_id=${request.user_id}&old_user_id=${request.old_user_id}`)
            .then(response);
        },

    getUsers(): Promise<IViewUser[]> {
        return axiosInstance
            .get<IViewUser[]>(`${API_URL}/get-view-users`)
            .then(response);
        },

        deleteViewUser(user: IViewUser): Promise<boolean> {
            return axiosInstance
                .post(`${API_URL}/delete-view-users`, { user })
                .then(res => {
                    
                    return res.data.result ?? res.data.success ?? false;
                });
        },



    setAccess(data: IUserAccessUpdate): Promise<IUserAccessRequest> {
        return axiosInstance.put(`${API_URL}/change-status`, data);
    },

    updateCorrputedRecord(data: IAppUserLogin): Promise<IAppUserLogin> {
        return axiosInstance.put(`${API_URL}/update-corrupted-record`, data);
    },

    purgeUser(user_id): Promise<Boolean> {
        return axiosInstance.delete(`${API_URL}/purge-user/${user_id}`)
    }
}
