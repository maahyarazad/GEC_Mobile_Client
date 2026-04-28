import { IAdminRelease } from "../../@types/AdminRelease";
import { StorageServiceType } from "../../@types/Storage";
import { config } from "../../utils/constants/constants";
import { history } from "../../utils/history/history";
import { AuthService } from "../Auth/Auth.service";
import { PartnerService } from "../Partner/Partner.service";

export const StorageService: StorageServiceType = { 
    storeToken(token) {
        localStorage.setItem('token', token)
    },
    retrieveToken(): (string | null) {
        return localStorage.getItem('token');
    },
    removeToken() {
        localStorage.removeItem('token')
    },
    removeRoles() {
        localStorage.removeItem('roles')
    },
    storeRole(roles) {
        
        let hasReadAccessToAnyApps = false
        let rolesArr = JSON.parse(roles)
        hasReadAccessToAnyApps = rolesArr.find((role: IAdminRelease) => role.r === '1') 
        if (!hasReadAccessToAnyApps) {
            StorageService.removeToken();
            history.replace(`${process.env.REACT_APP_PROXY}/session-expired`)
            alert("You do not have any access to App Admin")
            return;
        } else {
            localStorage.setItem('roles', roles.toString())
        }
    },
    retrieveRoles() {
        let roles = localStorage.getItem('roles')

        if (!roles) {
            async function fetchRoles () {
                const fetchedRoles = await AuthService.roles()

                if (!fetchedRoles) {
                    StorageService.removeToken();
                    StorageService.removeRoles();
                    history.replace(`${config.MODE === 'dev' ? '' : '/admin/application'}/session-expired`)
                    return;
                }
                roles = JSON.stringify(fetchedRoles.data)
                await StorageService.storeRole(roles)
            }
            fetchRoles()
            return null;
        } else {
            let hasAtLeastOne = false
            hasAtLeastOne = JSON.parse(roles).find((role: IAdminRelease) => role.r === '1')
            hasAtLeastOne = !!hasAtLeastOne

            if (!hasAtLeastOne) {
                StorageService.removeToken();
                StorageService.removeRoles();
                history.replace(`${config.MODE === 'dev' ? '' : '/admin/application'}/session-expired`)
                return;
            } else {
                if (roles) {
                    return JSON.parse(roles);
                }
                return {}
            }
        }
    },
    hasPrivilege(appId: number, role: string) {
        const rolesStr = localStorage.getItem('roles')
        if (!rolesStr) return false;

        const localStorageRoles = JSON.parse(rolesStr);
        const localStorageRole = localStorageRoles?.find((r: IAdminRelease) => r.appId === appId)
        if (!localStorageRole) return false;

        switch(role) {
            case 'read':   return localStorageRole.r === '1';
            case 'add':    return localStorageRole.w === '1';
            case 'edit':   return localStorageRole.e === '1';
            case 'delete': return localStorageRole.d === '1';
            case 'status': return localStorageRole.s === '1';
            default:       return false;
        }
    },

    fetchPartnerCategories() {
        const STORAGE_KEY = 'partner-categories';

        async function fetchData() {
            const fetchedData = await PartnerService.getAllCategories()
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedData))
        }
        fetchData();
    },
    retrievePartnerCategories() {
        const STORAGE_KEY = 'partner-categories';
        return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')
    }
}