export interface IEventList {
  id: number;
  eventName: string;
  eventShortDesc: string;
  eventPlace: string;
  eventTime: Date;
}

export interface IEventDetail {
  id: number;
  eventName: string;
  eventShortDesc: string;
  eventDescription: string;
  eventName_en?: string | null;
  eventShortDesc_en?: string | null;
  eventDescription_en?: string | null;
  eventPlace: string;
  eventTime: Date;
  membercard: number;
  corporatecard: number;
}

export interface IEventDetailEn {
  id: number;
  eventName_en: string | null;
  eventShortDesc_en: string | null;
  eventDescription_en: string | null;
}

export interface IGuestList {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  origin: string;
  access_types?: string;
  with_card?: string;
  has_guest?: boolean;
  is_done: boolean;
  remarks: string;
  status: number;
  date_created?: Date;
  date_updated?: Date;
}

export interface IGuestUpdate {
  id: number;
  is_done?: boolean;
  remarks?: string;
}

export type EventServiceType = {
  getAllWebEvents: () => Promise<IEventList[]>;
  getAllAppEvents: () => Promise<IEventList[]>;
  getEvent: (id: number) => Promise<IEventDetail>;
  updateEvent: (data: IEventDetailEn) => Promise<boolean>;
  migrateEvent: (id: number) => Promise<boolean>;
  getGuestList: (id: number) => Promise<IGuestList[]>;
  updateGuest: (data: IGuestUpdate) => Promise<{ success: boolean }>;
};
