import { AxiosResponse } from "axios"
import { axiosInstance } from "../../utils/interceptor/Interceptor"
import { ExpertServiceType, IExpertEvent, IExpertGuest, IResponseExpertEvents, IResponseExpertEvent, IResponseExpertEventTableUpdate, IResponseExpertGuest, IResponseExpertGuests, IExpertMember, IResponseExpertMember, IResponseExpertMembers } from "../../@types/Expert";

const result = (response: AxiosResponse) => response.data.result;
const success = (response: AxiosResponse) => response.data.success;

const API_URL = 'event/expert'

const response = (response: AxiosResponse) => {
    const res: IExpertEvent = response.data;
    return res;
};

export const ExpertService: ExpertServiceType = {
    createExpertEvent(data: IExpertEvent): Promise<IResponseExpertEvent>  {
        return axiosInstance.post<IExpertEvent>(`${API_URL}/event/new`, {data}).then(response).catch(err => err);
    },
    editExpertEvent(data: IExpertEvent): Promise<IResponseExpertEvent>  {
        return axiosInstance.post<IExpertEvent>(`${API_URL}/event/edit/${data.id}`, data).then(response).catch(err => err);
    },
    fetchExpertEvent(id: string): Promise<IResponseExpertEvent>  {
        return axiosInstance.get<IExpertEvent>(`${API_URL}/event/${id}`).then(response).catch(err => err);
    },
    fetchExpertEventList(): Promise<IResponseExpertEvents> {
        return axiosInstance.get<IExpertEvent>(`${API_URL}/events/all`).then(response).catch(err => err);
    },
    updateExpertEventStatus(id: string, status: string): Promise<IResponseExpertEventTableUpdate> {
        return axiosInstance.post<IExpertEvent>(`${API_URL}/event/edit/status/${id}`, {status}).then(response).catch(err => err);
    },
    editExpertEventGuest(data: IExpertGuest): Promise<IResponseExpertGuest>  {
        return axiosInstance.post<IExpertEvent>(`${API_URL}/guest/edit/${data.id}`, data).then(response).catch(err => err);
    },
    fetchExpertEventGuests(eventId: string): Promise<IResponseExpertGuests> {
        return axiosInstance.get<IExpertEvent>(`${API_URL}/guests/${eventId}`).then(response).catch(err => err);
    },
    createExpertMember(data: IExpertMember): Promise<IResponseExpertMember> {
        return axiosInstance.post<IExpertMember>(`${API_URL}/member/new`, data).then(response).catch(err => err);
    },
    editExpertMember(data: IExpertMember): Promise<IResponseExpertMember>  {
        return axiosInstance.post<IExpertEvent>(`${API_URL}/member/edit/${data.id}`, data).then(response).catch(err => err);
    },
    fetchExpertMember(id: string): Promise<IResponseExpertMember> {
        return axiosInstance.get<IExpertMember>(`${API_URL}/member/${id}`).then(response).catch(err => err);
    },
    fetchExpertMembers(): Promise<IResponseExpertMembers> {
        return axiosInstance.get<IExpertMember>(`${API_URL}/members`).then(response).catch(err => err);
    }
}
