import { AxiosResponse } from "axios"
import { axiosInstance } from "../../utils/interceptor/Interceptor"

import { ITemplate, IResponseTemplate, IResponseTemplates, TemplateServiceType } from "../../@types/Template";

const API_URL = 'event/expert'; // CHANGE ME

const response = (response: AxiosResponse) => {
    const res: ITemplate = response.data;
    return res;
};

export const TemplateService: TemplateServiceType = {
    createTemplate(data: ITemplate): Promise<IResponseTemplate>  {
        return axiosInstance.post<ITemplate>(`${API_URL}/event/new`, data).then(response).catch(err => err);
    },
    editTemplate(data: ITemplate): Promise<IResponseTemplate>  {
        return axiosInstance.post<ITemplate>(`${API_URL}/event/edit/${data.id}`, data).then(response).catch(err => err);
    },
    fetchTemplate(id: string): Promise<IResponseTemplate>  {
        return axiosInstance.get<ITemplate>(`${API_URL}/event/${id}`).then(response).catch(err => err);
    },
    fetchTemplates(): Promise<IResponseTemplates> {
        return axiosInstance.get<ITemplate>(`${API_URL}/events/all`).then(response).catch(err => err);
    }
}
