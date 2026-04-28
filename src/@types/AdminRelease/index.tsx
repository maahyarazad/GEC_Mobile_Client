export interface IAdminRelease {
    appId: number,
    usrId?: number,
    r: string,         // read
    w: string,         // add
    e: string,         // edit
    d: string,         // delete
    s: string          // status

}