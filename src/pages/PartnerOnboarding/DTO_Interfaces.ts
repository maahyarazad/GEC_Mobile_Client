export interface PartnerContact {
  id: number;
  partnerId: number;
  usrId: number | null;
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

export interface WebPartner {
    id: number;
    orderId: number;
    time: string;
    duration: number;
    title: string;
    categoryId: number;
    discount: number;
    discount_addition: string;
    phone: string;
    fax: string;
    email: string;
    web: string;
    hotline: string;
    contact_addition: string;
    regionId: number | null;
    content: string;
    type: 'partner' | 'business' | 'alliance';
    area: '0' | '1' | '2';
    lat: number | null;
    lng: number | null;
    zoom: number;
    status: '0' | '1';
    notice: string;
    hits: number;
    expiry_date: string;
      group_name: string;
  subsidiaries: string | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}