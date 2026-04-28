import { IProspect } from "../Prospect";
import { IReportTransactionCardholder } from "../Reports";

 export interface IStandardResponse {
    success: boolean;
    data?: IReportTransactionCardholder[] ;
    title?: string;
    message?: string;
 }

 export interface IProspectResponse {
   success: boolean;
   data?: IProspect;
   title?: string;
   message?: string;
 }
 
 export interface IProspectsResponse {
  success: boolean;
  data?: IProspect[];
  title?: string;
  message?: string;
}
