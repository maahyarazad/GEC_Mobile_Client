export interface IApp {
  id: number;
  name: string;
  package_name?: string;
  applink_scheme?: string;
  date_created?: Date;
  status: number;
  pending?: number;
}

export interface IAppBanner {
  id: number;
  order_id: number;
  name: string;
  banner_image: string;
  withLink: number;
  url_link: string;
  status: number;
  date_created?: Date;
  date_modified?: Date;
  date_start: Date | undefined;
  date_end: Date | undefined;
  corporate: boolean;
  member: boolean;
}

interface IAppBannerSwap {
  id: number;
  order_id: number;
}

export type AppInfoServiceType = {
  getAppList: () => Promise<IApp[]>;
  getAppListByPartner: (id: number) => Promise<IApp[]>;
  createBanner: (data: FormData) => Promise<boolean>;
  getBanners: (data: { id: number; status: number }) => Promise<any>;
  getOneBanner: (id: number) => Promise<IAppBanner>;
  editBanner: (data: FormData) => Promise<any>;
  reorderBanner: (data: {
    app_id: number;
    list: IAppBannerSwap[];
  }) => Promise<any>;
};
