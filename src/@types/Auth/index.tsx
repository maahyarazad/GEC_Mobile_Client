export interface ILoginCreds {
    username: string;
    password: string;   
    auto?: string;
}

export interface ILoginResponse {
    success: boolean;
    data: string;
}


export interface ICanDeleteInAppAdmin {
    status: number;
    data: {
        success: boolean;
        message: string;
        auth: boolean;
    };
}


export type AuthServiceType = {
    login: (data: ILoginCreds) => Promise<{success: boolean, data: any}>;
    canDeleteInAppAdmin: () => Promise<ICanDeleteInAppAdmin>;
    roles: () => Promise<{success: boolean, data: any}>;
    hasRoleInAppAdminBaseOnAppId: (appId: number, role: string) => Promise<ICanDeleteInAppAdmin>;
}