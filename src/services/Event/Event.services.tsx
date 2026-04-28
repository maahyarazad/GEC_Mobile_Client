import axios, { AxiosResponse } from "axios";
import {
  EventServiceType,
  IEventDetail,
  IEventDetailEn,
  IEventList,
  IGuestList,
} from "../../@types/Event";
import { axiosInstance } from "../../utils/interceptor/Interceptor";

const API_URL = `event`;

const res = (response: AxiosResponse) => response.data.data;
const success = (response: AxiosResponse) => response.data.success;

export const EventService: EventServiceType = {
  getAllWebEvents(): Promise<IEventList[]> {
    return axiosInstance.get<IEventList[]>(`${API_URL}/allWeb`).then(res);
  },
  getAllAppEvents() {
    return axiosInstance.get<IEventList[]>(`${API_URL}/allApp`).then(res);
  },
  getEvent(id): Promise<IEventDetail> {
    return axiosInstance
      .post<IEventDetail>(`${API_URL}/detail`, { id, admin: 1 })
      .then(res);
  },
  updateEvent(data): Promise<boolean> {
    return axiosInstance.post<boolean>(`${API_URL}/update`, data).then(success);
  },
  migrateEvent(id): Promise<boolean> {
    return axiosInstance
      .post<boolean>(`${API_URL}/migrate`, { id })
      .then(success);
  },
  getGuestList(id): Promise<IGuestList[]> {
    return axiosInstance.get<IGuestList[]>(`${API_URL}/guests/${id}`).then(res);
  },
  updateGuest(data): Promise<{ success: boolean }> {
    return axiosInstance
      .put<{ success: boolean }>(`${API_URL}/guest/update`, data)
      .then(success);
  },
};
