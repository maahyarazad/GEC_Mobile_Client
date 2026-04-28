import { AxiosResponse } from "axios";
import { AppInfoServiceType, IApp, IAppBanner } from "../../@types/AppInfo";
import { axiosInstance } from "../../utils/interceptor/Interceptor";

const API_URL = 'app'

const result = (response: AxiosResponse) => response.data.result;
const success = (response: AxiosResponse) => response.data.success;
const response = (response: AxiosResponse) => response.data;
const resData = (response: AxiosResponse) => response.data.data;

export const AppInfoService: AppInfoServiceType = {

    getAppList(): Promise<IApp[]> {
        return axiosInstance.get<IApp[]>(`${API_URL}/`).then(result)
    },
    getAppListByPartner(id): Promise<IApp[]>{
        return axiosInstance.get<IApp[]>(`${API_URL}/${id}`).then(result)
    },
    createBanner(data): Promise<any> {
        return axiosInstance.post(`${API_URL}/create-banner`, data).then(response)
    },
    getBanners(data): Promise<any>{
        return axiosInstance.post(`${API_URL}/get-banners`, data).then(response)
    },
    getOneBanner(id): Promise<IAppBanner>{
        return axiosInstance.get<IAppBanner>(`${API_URL}/banner/${id}`).then(resData)
    },
    editBanner(data): Promise<any> {
        return axiosInstance.put(`${API_URL}/edit-banner`, data).then(response)
    },
    reorderBanner(data): Promise<any> {
        return axiosInstance.put(`${API_URL}/banner/reorder`, data).then(response) 
    },
    
}