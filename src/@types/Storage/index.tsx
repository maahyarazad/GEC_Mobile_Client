import { IAdminRelease } from "../AdminRelease";
import { IPCategory } from "../Partner";

export type StorageServiceType = {
    storeToken: (token: string) => void;
    storeRole: (roles: string)  => void;
    retrieveToken: () => (string | null);
    removeToken: () => void;
    removeRoles: () => void;
    retrieveRoles: () => (IAdminRelease[] | null);
    hasPrivilege: (appId: number, role: string) => boolean;

    fetchPartnerCategories: () => void;
    retrievePartnerCategories: () => (IPCategory[]);
}