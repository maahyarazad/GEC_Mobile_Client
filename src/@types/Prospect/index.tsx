import { IPContact } from "../Partner";
import { IProspectResponse, IStandardResponse } from "../Response";

export interface IProspect {
    id?: number;
    title: string;
    contacts: IPContact[];
    website?: string;
    address?: string;
}

export type ProspectServiceType = {
    createProspect: (data: IProspect) => Promise<IProspectResponse>;
}