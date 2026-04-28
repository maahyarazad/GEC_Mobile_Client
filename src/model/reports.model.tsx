import { IDateRange, IDropdown } from "../@types/Reports"
import { IStandardResponse } from "../@types/Response"
import { ReportsService } from "../services/Reports/Reports.service"

const reports_model: IDropdown [] = [
    
    {
        label: "Transaction by Cardholder",
        value: 0,
        service: async (range, app) => {
            try{

                const response: IStandardResponse = await ReportsService.getTransactionByCardholder(range, app)
                return response.data;
            }catch (err){

            }
        },
        columns: [
            {
                header: "Cardholder Name",
                field: 'full_name',
                sort: true
            },
            {
                header: "Transaction Code",
                field: 'transaction_code'
            },
            {
                header: "Date & Time",
                field: 'transaction_date',
                sort: true
            },
            {
                header: "Main Branch",
                field: 'main_name'
            },
            {
                header: "Partner/Outlet Name",
                field: 'outlet_name'
            },
            {
                header: "Savings",
                field: 'discount',
                sort: true
            },
            {
                header: "Actual Paid Amount",
                field: 'paid',
                sort: true
            },
            {
                header: "Total Bill Amount",
                field: 'total',
                sort: true
            }
        ],
        expand: false
    },
    {
        label: "Transaction by Merchant Partner/Outlet",
        value: 1,
        service: async (range, app) => {
            try{

                const response: IStandardResponse = await ReportsService.getTransactionByMerchant(range, app)
                return response.data;
            }catch (err){

            }
            
        },
        columns: [
            {
                header: "",
                field: "",
                expander: true
            },
            {
                header: "Transaction Code",
                field: 'transaction_code'
            },
            {
                header: "Date & Time",
                field: 'transaction_date'
            },
            {
                header: "Total Bill Amount ",
                field: 'total',
                sort: true
            },
            {
                header: "Savings Amount",
                field: 'discount'
            },
            {
                header: "Actual Paid Amount",
                field: 'paid'
            },
        ],
        expand: true
    }
]

export default reports_model