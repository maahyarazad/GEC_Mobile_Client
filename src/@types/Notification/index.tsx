export interface INotification {
  title: string;
  body: string;
  app_id: number;
  path: string;
  id: number | string;
}

export interface ITestNotification extends  INotification{
    user_list: Array<IUser>;
}

export interface ITestRecipient {
  user_id: number;
  userPushToken: string;
  name: string;
}

export interface ISentNotifications {
  app_id: number,
  admin_id: number,
  title: string,
  body: string,
  recipients_count: number
}


export interface IUser {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
}


export type NotificationServiceType = {
  sendTestNotification: (data: ITestNotification) => Promise<any>;
  sendNotification: (data: INotification) => Promise<any>;
  getTestRecipients: () => Promise<ITestRecipient[]>;
  getSentNotifications: () => Promise<ISentNotifications[]>;
  searchUser: (user: string) => Promise<ITestRecipient[]>;
  addTestRecipient: (user_id: number) => Promise<any>;
  removeTestRecipient: (user_id: number) => Promise<any>;
};
