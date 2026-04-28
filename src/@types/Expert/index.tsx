export interface IExpertEvent {
    id: string | number;
    title: string;
    shortDescription: string;
    description: string;
    amountPerPerson: number;
    maxAttendees: number;
    place: string;
    eventTime: Date | undefined;
    startDesk: Date | undefined;
    endDesk: Date | undefined;
    desktopBG: string;
    desktopFG: string;
    mobileBG: string;
    status: string | boolean;
}

export interface IExpertTableEvent {
    id: string | number;
    title: string;
    maxAttendees: number;
    place: string;
    eventTime: Date | undefined;
    startDesk: Date | undefined;
    endDesk: Date | undefined;
    status: string | boolean;
    registeredCount: number;
}

export interface IResponseExpertEvent {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertEvent;
}

export interface IResponseExpertEvents {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertTableEvent[];
}

export interface IResponseExpertEventTableUpdate {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertTableEvent;
}

export type IExpertMember = {
    id: number;
    memberCode: string;
    besucherCode: string;
    firstname: string;
    lastname: string;
    status: number;
    dateCreated?: Date;
    dateUpdated?: Date;
}

export type IExpertMemberTable = {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertMember[];
}

export interface IResponseExpertMemberTableUpdate {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertTableEvent;
}

export interface IResponseExpertMember {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertMember
}

export interface IResponseExpertMembers {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertMember[]
} 

export interface IExpertGuest {
    id: number;
    memberId?: number;
    eventId: number;
    firstname: string;
    lastname: string;
    mobile?: string;
    email?: string;
    whatsapp?: string;
    origin?: string;
    remarks?: string;
    datepaid?: Date;
    dateCreated?: Date;
    dateUpdated?: Date;
    status: number;
    paymentLink?: string;
    paymentStatus?: string;
    referedBy?: string;
}

export interface IResponseExpertGuest {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertGuest
}

export interface IResponseExpertGuests {
    success: boolean;
    error?: string;
    message?: string;
    data?: IExpertGuest[]
}

export type ExpertServiceType = {
    createExpertEvent: (data: IExpertEvent) => Promise<IResponseExpertEvent>,
    editExpertEvent: (data: IExpertEvent) => Promise<IResponseExpertEvent>,
    fetchExpertEvent: (id: string) => Promise<IResponseExpertEvent>,
    fetchExpertEventList: () => Promise<IResponseExpertEvents>,
    updateExpertEventStatus: (id: string, status: string) => Promise<IResponseExpertEventTableUpdate>,
    editExpertEventGuest: (data: IExpertGuest) => Promise<IResponseExpertGuest>,
    fetchExpertEventGuests: (id: string) => Promise<IResponseExpertGuests>,
    createExpertMember: (data: IExpertMember) => Promise<IResponseExpertMember>,
    editExpertMember: (data: IExpertMember) => Promise<IResponseExpertMember>,
    fetchExpertMember: (id: string) => Promise<IResponseExpertMember>,
    fetchExpertMembers: () => Promise<IResponseExpertMembers>,
}
