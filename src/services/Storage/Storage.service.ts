import { IAdminRelease } from "../../@types/AdminRelease";
import { IPCategory } from "../../@types/Partner";
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
        
        // when user have no read to at least one app, logout user
        let hasReadAccessToAnyApps = false
        let rolesArr = JSON.parse(roles)
        hasReadAccessToAnyApps = rolesArr.find((role: IAdminRelease)  => role.r === '1') 
        if (!hasReadAccessToAnyApps) {
            StorageService.removeToken();
            history.replace(`${process.env.REACT_APP_PROXY}/session-expired`)
            alert("You do not have any access to App Admin")
            return;
        }
        else {
            localStorage.setItem('roles', roles.toString())
        }
    },
    retrieveRoles() {
        let roles = localStorage.getItem('roles')

        // logout user
        if (!roles) {
            async function fetchRoles () {
                // try to fetch again user roles
                const fetchedRoles = await AuthService.roles()

                // logout user if still user still has no user role
                if (!fetchedRoles) {
                    StorageService.removeToken();
                    StorageService.removeRoles();
                    history.replace(`${process.env.REACT_APP_PROXY}/session-expired`)
                    history.replace(`${config.MODE === 'dev' ? '' : '/admin/application'}/session-expired`)
                    return;
                }
                roles = JSON.stringify(fetchedRoles.data)
                await StorageService.storeRole(roles)
            }
            fetchRoles()
            return null;
        } else {
            // has at least 1 READ access
            let hasAtLeastOne = false
            hasAtLeastOne = JSON.parse(roles).find((role: IAdminRelease) => role.r == '1')
            hasAtLeastOne = !!hasAtLeastOne

            // logout user if still user still has no user role
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
        const localStorageRole = localStorageRoles?.find((role: IAdminRelease) => role.appId == appId)
        if (!localStorageRole) return false;

        switch(role) {
            case 'read': return localStorageRole.r == '1';
                break;
            case 'add': return localStorageRole.w == '1';
                break;
            case 'edit': return localStorageRole.e == '1';
                break;
            case 'delete': return localStorageRole.d == '1';
                break;
            case 'status': return localStorageRole.s == '1';
                break;
            default:
                return false;

        }
    },

    /***** helpers to centralize data - START *****/

    // Partner Categories and Prospect Categories
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

    /***** helpers to centralize data - END *****/

}