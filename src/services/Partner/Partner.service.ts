import { AxiosResponse } from "axios"
import { IPartner, IPartnerDetail, ISpecialTags, IPartnerTags, IPartnerTag, IPCategory, PartnerServiceType, ICuisine, ICategoryOffer } from "../../@types/Partner";
import { axiosInstance } from "../../utils/interceptor/Interceptor"

const result = (response: AxiosResponse) => response.data.result;
const success = (response: AxiosResponse) => response.data.success;

const API_URL = 'partner'

export const PartnerService:PartnerServiceType = {
    
    getPartner(partnerId: number): Promise<IPartner> {
        return axiosInstance.get<IPartner>(`${API_URL}/get/${partnerId}`).then(result);
    },

    getPartnersByApp(app_id): Promise<IPartner[]> {
        return axiosInstance.get<IPartner[]>(`${API_URL}/app/${app_id}`).then(result)
    },
    
    getAllPartnersByApp(app_id): Promise<IPartner[]> {
        return axiosInstance.get<IPartner[]>(`${API_URL}/all/app/${app_id}`).then(result)
    },

    getAllPartners(): Promise<IPartner[]>{
        return axiosInstance.get<IPartner[]>(`${API_URL}/`).then(result)
    },

    updateAssignedPartners(changes): Promise<boolean> {
        return axiosInstance.post<boolean>(`${API_URL}/assign`, changes).then(success)
    },

    getAllCategories(): Promise<IPCategory[]> {
        return axiosInstance.get<IPCategory[]>(`${API_URL}/categories`).then(result)
    },
    
    getPartnerDetails(partnerId): Promise<IPartnerDetail>{
        return axiosInstance.get<IPartnerDetail>(`${API_URL}/details/${partnerId}`).then(result)
    },

    updatePartnerDetail(data): Promise<boolean> {
        return axiosInstance.put<boolean>(`${API_URL}/details`, data).then(success)
    },
    
    getPartnerTags(partnerId): Promise<IPartnerTags[]> {
        return axiosInstance.get<IPartnerTags[]>(`${API_URL}/tags/${partnerId}`).then(result)
    },

    getAllSpecialTags(): Promise<ISpecialTags[]> {
        return axiosInstance.get<ISpecialTags[]>(`${API_URL}/specialtags`).then(result)
    },

    getAllCuisines(): Promise<ICuisine[]> {
        return axiosInstance.get<ICuisine[]>(`${API_URL}/cuisines`).then(result)
    },

    updateCategory(update, add, remove): Promise<boolean> {
        return axiosInstance.put<boolean>(`${API_URL}/categories`, {update, add, remove}).then(success)
    },

    deleteCategory(id): Promise<boolean> {
        return axiosInstance.delete<boolean>(`${API_URL}/categories/${id}`).then(success)
    },

    getCategoryOffers(): Promise<ICategoryOffer[]> {
        return axiosInstance.get<ICategoryOffer[]>(`${API_URL}/category-offer`).then(result)
    },

    updateCategoryOffers(category_id, add, remove): Promise<boolean> {
        return axiosInstance.put<boolean>(`${API_URL}/category-offer`, { category_id, add, remove }).then(success)
    },

    updatePartnerOffersTags(payload): Promise<boolean> {
        return axiosInstance.put<boolean>(`${API_URL}/offers-tags`, payload).then(success)
    },

    createPartnerSpecialTag(partner_id, en_tag, de_tag): Promise<IPartnerTag> {
        return axiosInstance.post<IPartnerTag>(`${API_URL}/specialtag`, { partner_id, en_tag, de_tag }).then(result)
    },
    
    checkPin(pin): Promise<boolean> {
        return axiosInstance.post<boolean>(`${API_URL}/checkpin`, { merchant_pin: pin}).then(success)
    },

    getPartnerExpiry(partnerId) {
        return axiosInstance.get<Date|Date[]>(`${API_URL}/expiry/${partnerId}`).then(result)
    },

    createNewSpecialTag(en: string, de: string): Promise<ISpecialTags> {
        return axiosInstance.post<ISpecialTags>(`${API_URL}/tag/new`, { en, de }).then(result)
    },

}