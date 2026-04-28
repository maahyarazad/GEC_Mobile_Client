import { AxiosResponse } from "axios"
import { axiosInstance } from "../../utils/interceptor/Interceptor"
import { IProspect, ProspectServiceType } from "../../@types/Prospect";
import { IProspectResponse } from "../../@types/Response";

const result = (response: AxiosResponse) => response.data.result;
const success = (response: AxiosResponse) => response.data.success;

const API_URL = 'prospect'

const response = (response: AxiosResponse) => {
    const res: IProspectResponse = response.data;
    return res;
};

export const ProspectService: ProspectServiceType = {
    createProspect(data: IProspect): Promise<IProspectResponse>  {
        return axiosInstance.get<IProspect>(`${API_URL}/test`).then(response).catch(err => err);
    }
}

