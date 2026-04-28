export interface IUserAccessRequest {
    id: number;
    app_id: number;
    user_id: number;
    full_name: string;
    card_image: string;
    ip_address: string;
    device_id: string;
    platform: string;
    date_created: string;
    date_updated: string;
    remarks?: string;
    card_number?: string;
    card_valid_date?: Date;
    title?: string;
    member?: boolean;
    old_user_id?: number;
    version: string;
}


export interface IAppUserLogin {
  id: number;                   // mediumint - Primary Key
  user_id: number;              // int - Not Null
  old_user_id?: number;         // int - Nullable
  username: string;             // varchar(255) - Not Null
  password: string;             // varchar(255) - Not Null
  ip_address?: string;          // varchar(25) - Nullable
  device_id?: string;           // varchar(50) - Nullable
  refresh_token?: string;       // varchar(255) - Nullable
  otp_code?: string;            // varchar(255) - Nullable
  otp_issued?: string;          // datetime - Nullable (use string for ISO or MySQL format)
  date_created: string;         // datetime - Not Null
  date_updated: string;         // datetime - Not Null
  last_login?: string;          // datetime - Nullable
  member: boolean | number;     // tinyint - Not Null (0 or 1 → boolean)
  status: boolean | number;     // tinyint - Not Null (0 or 1 → boolean)
  isAuthorized: boolean | number; // tinyint - Not Null (0 or 1 → boolean)
  hasSubmit: boolean | number;  // tinyint - Not Null (0 or 1 → boolean)
  app_id: number;               // tinyint - Not Null
  platform?: string;            // varchar(20) - Nullable
  request_id: number;           // int - Not Null
  version?: string;             // varchar(25) - Nullable
  remark?: string;
  user_detail?: IUserDetailForm
}
export interface IViewUser {
  date_created: Date,
  id: number;                  
  user_id: number;            
  
  username: string;            
  email: string;            
  phone: string;            
  
}


export interface IUserAccessUpdate {
    request_id: number,
    user_id: number,
    status: number,
    remarks?: string
    app_id: number;
}

export interface IUserHistoryRequest {
   
    user_id: number,
    old_user_id: number,
  
}

export interface IViewUserRequest {
   
  
  
}


export interface IUserDetailForm {
  remark?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  card_number?: string;
  card_valid_date?: string; // ISO string, e.g., '2025-10-22'
  gender?: string; // e.g. 'M' | 'F'
  honorifics?: string; // e.g. 'Mr.' | 'Ms.' | 'Dr.'
  birthdate?: string;

  // ✅ Add these
  membership?: IMembership | null;
  old_user_membership?: IOldUserMembership[];
}
export type IOldUserMembership = IMembership;
// Define membership (you can expand later if needed)
export interface IMembership {
  id?: number;
  usrId?: number;
  time?: string;
  duration?: string;
  package?: string;
  payment?: string;
  status?: string;
  token?: string;
  title?: string;
  first_name?: string;
  name?: string;
  place?: string;
  zip?: string;
  mobile?: string;
  address?: string;
  company?: string;
  _first_name?: string;
  _name?: string;
  paid?: string;
  conveyed?: string;
  reminder?: number;
  manual?: string;
  cardnumber?: string | null;
}



export type ApprovalListServiceType = {
    getApprovalList: (app: number, status: boolean, submitted: boolean) => Promise<IUserAccessRequest[]>;
    getCorruptedList: () => Promise<IAppUserLogin[]>;
    setAccess: (data: IUserAccessUpdate) => Promise<IUserAccessRequest>;
    updateCorrputedRecord: (data: IAppUserLogin) => Promise<IAppUserLogin> ;
    getCorruptedUserDetail: (request: IUserHistoryRequest) => Promise<IUserDetailForm> ;
    getUsers: () => Promise<IViewUser[]> ;
    deleteViewUser: (user: IViewUser) => Promise<Boolean> ;
    purgeUser: (user_id: number) => Promise<Boolean>;
}
