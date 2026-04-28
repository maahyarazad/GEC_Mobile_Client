import { ReactNode } from "react";
import { IApp } from "../AppInfo";
import { IStandardResponse } from "../Response";

export interface IDropdown {
  label: string;
  value: number;
  service?:
    | ((range: IDateRange, app: number) => Promise<any>)
    | (() => Promise<any>);
  columns?: ITableConfig[];
  expand?: boolean;
}

export interface ITableConfig {
  header: string;
  field: string;
  expander?: boolean;
  sort?: boolean;
  width?: number | string;
  body?: (data: any) => ReactNode;
}

export interface BaseTransaction {
  [key: string]: any;
  transaction_code: string;
  transaction_date: Date;
  outlet_name: string;
  main_name: string | null;
  discount: number;
  total: number;
  paid: number;
}

export interface Outlet {
  outlet_name: string;
  discount: number;
  total: number;
  paid: number;
  transactions: BaseTransaction[];
}

export interface IReportTransactionMerchant {
  main_name: string;
  discount: number;
  total: number;
  paid: number;
  outlets: Outlet[];
}

export interface IReportTransactionCardholder {
  full_name?: string;
}

export interface IDateRange {
  startDate: Date | Date[] | undefined | null;
  endDate: Date | Date[] | undefined | null;
}

export type ReportsServiceType = {
  getTransactionByMerchant: (range: IDateRange, app: number) => Promise<any>;
  getTransactionByCardholder: (
    range: IDateRange,
    app: number
  ) => Promise<IStandardResponse>;
};

export type ReportEntitiesSupported = IReportTransactionCardholder &
  IReportTransactionMerchant;
