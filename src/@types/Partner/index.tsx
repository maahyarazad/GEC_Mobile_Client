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

// A single flat row returned by the `/category-offer` endpoint: the special-tag
// x offer join for a partner (each partner tag is paired with each of that
// partner's offers). Shape mirrors getAvailableCategoryOffers.txt.
export interface ICategoryOffer {
    specialtags_id: number;   // app_specialtags.id (the tag)
    en_tag: string;           // app_specialtags.specialtags_en
    de_tag: string;           // app_specialtags.specialtags_de
    partner_title: string;    // wp.title
    partner_id: number;       // wp.id
    offer_id: number;         // ao.id
    en_offername: string;     // ao.prodname_en
    de_offername: string;     // ao.prodname_de
    avail_count: number;      // ao.avail_count
    isHotpick: number;        // ao.isHotpick (0 | 1)
    category_id: number;      // aoc.id
    category_en: string;      // aoc.category_en
    category_de: string;      // aoc.category_de
}

// One tag of a partner (deduped from the flat rows by specialtags_id).
export interface IPartnerTag {
    specialtags_id: number;
    en_tag: string;
    de_tag: string;
}

// One offer of a partner (deduped from the flat rows by offer_id).
export interface IPartnerOffer {
    offer_id: number;
    en_offername: string;
    de_offername: string;
    avail_count: number;
    isHotpick: number;
}

// A partner within a category, with its deduped tags and offers plus the
// convenience aggregates rendered in the partners table.
export interface ICategoryPartner {
    partner_id: number;
    partner_title: string;
    tags: IPartnerTag[];
    offers: IPartnerOffer[];
    offerCount: number;   // offers.length
    totalAvail: number;   // sum of offers' avail_count
}

// A category enriched with its partners (grouped from the flat `/category-offer`
// result by category_id, merged onto the authoritative category list so empty
// categories still appear).
export interface ICategoryWithOffers extends IPCategory {
    partners: ICategoryPartner[];
    totalAvail: number;   // sum of every partner's availability in the category
}

// Batched edit/delete payload for a partner's offers and tags, applied server-
// side in a single transaction (PartnerService.updatePartnerOffersTags).
export interface IPartnerOffersTagsUpdate {
    partner_id: number;
    // New tags are created immediately via createPartnerSpecialTag, so this batch
    // only carries edits/removals of existing rows.
    tags: {
        update: IPartnerTag[];
        remove: number[];                          // specialtags_id[] to unlink
    };
    offers: { update: IPartnerOffer[]; remove: number[] }; // remove = offer_id[]
}

export interface IPartnerTags {
    id?: number;         // web_partner_tags.id (present when the row carries it)
    partnerId?: number;  // web_partner_tags.partnerId
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
    deleteCategory: (id: number) => Promise<boolean>;
    getCategoryOffers: () => Promise<ICategoryOffer[]>;
    updateCategoryOffers: (category_id: number, add: number[], remove: number[]) => Promise<boolean>;
    updatePartnerOffersTags: (payload: IPartnerOffersTagsUpdate) => Promise<boolean>;
    createPartnerSpecialTag: (partner_id: number, en_tag: string, de_tag: string) => Promise<IPartnerTag>;
    checkPin: (pin: number) => Promise<boolean>;
    getPartnerExpiry: (partnerId: number) => Promise<Date|Date[]>;
    createNewSpecialTag: (en: string, de: string) => Promise<ISpecialTags>;
}