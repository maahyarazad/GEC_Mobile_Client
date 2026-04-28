export interface IOCategory {
    id: number;
    category_en: string;
    category_de: string;
    color: string;
    initials: string;
}

export type OfferServiceType = {
    getAllCategories: () => Promise<IOCategory[]>
    getPremiums: () => Promise<IOfferPremium[]>
    addOffer: (offer: any) => Promise<boolean>;
    updateOffer: (offer: any) => Promise<boolean>;
    getOffersByPartner: (partnerId: number) => Promise<IOffer[]>;
    getOfferById: (id: number) => Promise<IOffer>;
    updateStatus: (offers: IOffer[], status: number) => Promise<boolean>;
    updateCategory: (update: IOCategory[], add: IOCategory[], remove: IOCategory[]) => Promise<boolean>;
}

export interface IOfferPremium {
    id: number;
    premium_en: string;
    premium_de: string;
    percentage: number;
    with_freebie: number;
    type: number;
}

export interface IOffer {
    id?: number;
    partner_id: number;
    offer_category: number;
    offer_premium: number;
    allowed_in_apps: any[];
    min_value: number;
    stock_qty: number;
    prodname_en: string;
    prodname_de: string;
    highlights_en: string;
    highlights_de: string;
    fineprints_en: string;
    fineprints_de: string;
    tnc_en: string;
    tnc_de: string;
    freebie_en: string;
    freebie_de: string;
    freebie_value: number;
    date_start: Date | Date[];
    date_end: Date | Date[];
    date_created?: Date;
    date_modified?: Date;
    avail_count?: number;
    premium_en?: string;
    status?: number;
    isHotpick: number;
    hotpick_image?: string;
    app?: string;
}
