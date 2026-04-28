export interface IPartner {
    id: number;
    title: string;
    main_branch?: string;
    merchant_pin?: string;
    allowed_in_app?: string;
    pcategory_en?: string;
    pcategory_de?: string;
    active_offer_count?: number;
}

export interface IPartnerDetail {
    partner_id: number;
    phone: string;
    phone2?: string | undefined;
    merchant_pin: string;
    web?: string;
    content?: string;
    category_id: number;
    about_en: string;
    about_de: string;
    cuisines?: ICuisine[]
    specialtags?: ISpecialTags[]
}

export interface IPCategory {
    id: number;
    pcategory_en: string;
    pcategory_de: string;
}

export interface IPartnerTags {
    tag: string;
}

export interface ISpecialTags {
    id: number;
    specialtags_en: string;
    specialtags_de?: string;
}

export interface ICuisine {
    id: number;
    cuisine_en: string;
    cuisine_de: string;
}

export interface IPContact {
    id: number;
    partnerId: number;
    usrId: number;
    division: string;
    salutation: string;
    firstName: string;
    secondName: string;
    email: string;
    phone: string;
    mobile: string;
    fax: string;
    language: string;
}

export type PartnerServiceType = {
    getPartner: (partnerId: number) => Promise<IPartner>;
    getPartnersByApp: (app_id: number) => Promise<IPartner[]>;
    getAllPartnersByApp: (app_id: number) => Promise<IPartner[]>;
    getAllPartners: () => Promise<IPartner[]>;
    updateAssignedPartners: (data: {changes: {id: number, op: number}[], app_id: number}) => Promise<boolean>;
    getAllCategories: () => Promise<IPCategory[]>
    getPartnerDetails: (partnerId: number) => Promise<IPartnerDetail>; 
    updatePartnerDetail: (data: IPartnerDetail) => Promise<boolean>;
    getPartnerTags: (partnerId: number) => Promise<IPartnerTags[]>;
    getAllSpecialTags: () => Promise<ISpecialTags[]>;
    getAllCuisines: () => Promise<ICuisine[]>;
    updateCategory: (update: IPCategory[], add: IPCategory[], remove: IPCategory[]) => Promise<boolean>;
    checkPin: (pin: number) => Promise<boolean>;
    getPartnerExpiry: (partnerId: number) => Promise<Date|Date[]>;
    createNewSpecialTag: (en: string, de: string) => Promise<ISpecialTags>;
}