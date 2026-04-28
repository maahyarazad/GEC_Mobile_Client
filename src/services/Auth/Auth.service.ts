import { AxiosResponse } from "axios";
import { AuthServiceType } from "../../@types/Auth";
import { axiosInstance } from "../../utils/interceptor/Interceptor";
import { ICanDeleteInAppAdmin } from "../../@types/Auth";

const API_URL = 'user'

const resData = (response: AxiosResponse) => response.data;

export const AuthService: AuthServiceType = {
    login(data): Promise<{success: boolean, data: any}> {
        return axiosInstance.post<{success: boolean, data: any}>(`${API_URL}/admin/login`, data).then(resData)
    },
    canDeleteInAppAdmin(): Promise<ICanDeleteInAppAdmin> {
        return axiosInstance.get(`${API_URL}/admin/can-delete-in-app-admin`)
    },
    roles(): Promise<{success: boolean, data: any}> {
        return axiosInstance.get<{success: Boolean, data: any}>(`${API_URL}/admin/roles`).then(resData)
    },
    hasRoleInAppAdminBaseOnAppId(appId: number, role: string): Promise<ICanDeleteInAppAdmin> {
        const params = {
            appId,
            role
        }
        return axiosInstance.get(`${API_URL}/admin/has-access-role-for-appid`, {params})
    }
}