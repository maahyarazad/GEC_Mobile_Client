import { AxiosResponse } from "axios";
import { IOffer, IOCategory, IOfferPremium, OfferServiceType } from "../../@types/Offer";
import { axiosInstance } from "../../utils/interceptor/Interceptor";

const API_URL = 'offer'

const response = (response: AxiosResponse) => response.data.result;
const success = (response: AxiosResponse) => response.data.success;

export const OfferService: OfferServiceType = {

        getAllCategories(): Promise<IOCategory[]>{
            return axiosInstance.get<IOCategory[]>(`${API_URL}/categories`).then(response)
        },

        getPremiums(): Promise<IOfferPremium[]>{
            return axiosInstance.get<IOfferPremium[]>(`${API_URL}/premiums`).then(response)
        },
        
        addOffer(offer): Promise<boolean> {
            return axiosInstance.post(`${API_URL}/add`, offer).then(success)
        },

        updateOffer(offer): Promise<boolean> {
            return axiosInstance.put(`${API_URL}/update`, offer).then(success)
        },

        getOffersByPartner(partnerId): Promise<IOffer[]> {
            return axiosInstance.get<IOffer[]>(`${API_URL}/bypartner?partner=${partnerId}`).then(response)
        },

        getOfferById(id): Promise<IOffer> {
            return axiosInstance.get<IOffer>(`${API_URL}/${id}`).then(response)
        },        

        updateStatus(offers, status): Promise<boolean> {
            return axiosInstance.put<boolean>(`${API_URL}/status`, {offers, status}).then(success)
        },

        updateCategory(update, add, remove): Promise<boolean> {
            return axiosInstance.put<boolean>(`${API_URL}/`, {update, add, remove}).then(success)
        },

}