import { AxiosResponse } from "axios";
import { IStandardResponse } from "../../@types/Response";
import { IDateRange, ReportsServiceType } from "../../@types/Reports";
import { axiosInstance } from "../../utils/interceptor/Interceptor";

const API_URL = `/report`

const response = (response: AxiosResponse) => { 
    const res: IStandardResponse = response.data;
    return res
};

export const ReportsService: ReportsServiceType = {
    getTransactionByCardholder(range: IDateRange, app: number): Promise<IStandardResponse> {
        return axiosInstance.post<IStandardResponse>(`${API_URL}/transaction-cardholder`, {range, app}).then(response)
    },
    getTransactionByMerchant(range: IDateRange, app: number): Promise<IStandardResponse> {
        return axiosInstance.post<IStandardResponse>(`${API_URL}/transaction-merchant`, {range, app}).then(response)
    },
}



