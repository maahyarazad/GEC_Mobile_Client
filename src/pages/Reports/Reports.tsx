import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Column } from "primereact/column";
import {
  DataTable,
  DataTableRowClickEvent,
  DataTableRowExpansionTemplate,
} from "primereact/datatable";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toolbar } from "primereact/toolbar";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { IApp } from "../../@types/AppInfo";
import {
  BaseTransaction,
  IDateRange,
  IDropdown,
  IReportTransactionCardholder,
  ITableConfig,
  Outlet,
  ReportEntitiesSupported,
} from "../../@types/Reports";
import { IStandardResponse } from "../../@types/Response";
import AppListDropdown from "../../components/Applist/AppListDropdown";
import reports_model from "../../model/reports.model";
import { AppInfoContext } from "../../services/AppInfo/AppInfo.context";
import "./Reports.css";
import { Nullable } from "primereact/ts-helpers";

interface Props {}

// Functional Component
const Reports: React.FC<Props> = () => {
  const monthsBefore = (count: number) => {
    const currentDate = new Date();
    if (count === 0) {
      currentDate.setMonth(0);
      currentDate.setDate(1);
    } else {
      currentDate.setMonth(currentDate.getMonth() - count);
    }
    return currentDate;
  };
  const { appList } = useContext(AppInfoContext);
  const [expandedRows, setExpandedRows] = useState<ReportEntitiesSupported[]>(
    []
  );
  const [expandedRows2, setExpandedRows2] = useState<Outlet[]>([]);
  const [selectedReport, setSelectedReport] = useState<IDropdown>(
    reports_model[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [resultList, setResultList] = useState<ReportEntitiesSupported[]>([]);
  const [selectedApp, setSelectedApp] = useState<IApp | null>(null);

  const [dateRange, setDateRange] = useState<IDateRange>({
    startDate: monthsBefore(0),
    endDate: new Date(),
  });

  useEffect(() => {
    let isMounted = true;
    setSelectedApp(appList[0]);

    return () => {
      isMounted = false;
    };
  }, [appList]);

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const _selectedApp: IApp =
          selectedApp != undefined ? selectedApp : appList[0];

        if (
          selectedReport != undefined &&
          selectedReport.service != undefined &&
          dateRange != undefined
        ) {
          const response: any = await selectedReport.service(
            dateRange,
            _selectedApp.id
          );
          if (isMounted) {
            setExpandedRows([]);
            setExpandedRows2([]);
            setResultList(response);
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, [selectedReport, dateRange, selectedApp]);

  const handleSelectReport = (data: DropdownChangeEvent) => {
    setSelectedReport(reports_model[data.value]);
  };

  const handleStartDateChange = (value: Nullable<Date>) => {
    setDateRange({ ...dateRange, startDate: value });
  };

  const handleEndDateChange = (value:  Nullable<Date>) => {
    setDateRange({ ...dateRange, endDate: value });
  };

  const handleSelectedApp = (data: DropdownChangeEvent) => {
    console.log("App: ", data.value);
    setSelectedApp(data.value);
  };

  const headerTempplate = () => {
    return (
      <>
        <div className="grid-nogutter">
          <div className="col-12">
            <div className=" w-25rem p-3">
              <Dropdown
                className="w-full"
                options={reports_model}
                optionValue="value"
                optionLabel="label"
                value={selectedReport.value}
                defaultValue={0}
                onChange={handleSelectReport}
              />
            </div>
          </div>

          <div className="p-3 pt-0 col-12 grid-nogutter flex">
            <InputText
              placeholder="Search"
              style={{ height: "2.7rem" }}
              className="col-3 mr-2 px-3"
            />
            <div className="col-3 mr-2">
              <AppListDropdown
                dropdownChange={handleSelectedApp}
                selectedApp={selectedApp}
              />
            </div>
            <Calendar
              className="p-0 m-0 mr-2"
              style={{ height: "100%" }}
              onChange={(e) => handleStartDateChange(e.value)}
              value={dateRange.startDate as Date}
            />
            <Calendar
              className="p-0 m-0"
              style={{ height: "100%" }}
              onChange={(e) => handleEndDateChange(e.value)}
              value={dateRange.endDate as Date}
            />
            <div>
              {/* { !!dateRange && !!dateRange.startDate && dateRange.startDate.toString()} */}
            </div>
          </div>
          {!!selectedReport && !!selectedReport.expand && (
            <div className="bg-gray-400 col-12 p-3 m-0 font-bold text-lg">
              Partners
            </div>
          )}
        </div>
      </>
    );
  };

  const rowExpansionTemplate = (
    data: ReportEntitiesSupported,
    options: any
  ) => {
    return (
      <div style={{ margin: 0, padding: 5 }}>
        <div className="bg-gray-200 p-3 font-bold text-lg">Outlets</div>
        <DataTable
          value={data.outlets}
          className="report-table text-xs m-0 p-0"
          // tableStyle={{backgroundColor: "green"}}
          sortField={"outlet_name"}
          sortOrder={1}
          rowGroupMode={"subheader"}
          // expandableRowGroups
          expandedRows={expandedRows2}
          onRowToggle={(e: { data: Outlet[] }) => setExpandedRows2(e.data)}
          rowExpansionTemplate={rowExpansionTemplate2}
        >
          {!!partner_col &&
            partner_col.map((x, _) => {
              return (
                <Column
                  key={_}
                  sortable={x.sort}
                  expander={x.expander}
                  style={{ width: x.width, textAlign: "left" }}
                  header={x.header}
                  field={x.field}
                />
              );
            })}
        </DataTable>
      </div>
    );
  };

  const rowExpansionTemplate2 = (data: Outlet) => {
    return (
      <div>
        <div className="bg-gray-200 p-3 font-bold text-lg">
          {`Transactions (${data.transactions.length})`}
        </div>
        <DataTable value={data.transactions} className="test text-xs m-0 p-0">
          {!!selectedReport &&
            !!selectedReport.columns &&
            selectedReport.columns.map((column, k) => {
              return (
                <Column key={k} header={column.header} field={column.field} />
              );
            })}
        </DataTable>
      </div>
    );
  };

  const calculateTotal = (data: ReportEntitiesSupported, key: string) => {
    console.log(data);
    if (!!data && !!data.outlets) {
      return data.outlets.reduce((acc, curr) => {
        return (
          acc +
          curr.transactions.reduce((acc2, curr2) => {
            return acc2 + curr2[key];
          }, 0)
        );
      }, 0);
    }
    return 0;
  };

  const main_col: ITableConfig[] = [
    {
      header: "",
      field: "",
      expander: true,
      width: "5%",
    },
    {
      header: "Main Name",
      field: "main_name",
      width: "15%",
      sort: true,
    },
    {
      header: "Bill Overall",
      field: "total",
      width: "10%",
      sort: true,
    },
    {
      header: "Paid Overall",
      field: "paid",
      width: "10%",
      sort: true,
    },
    {
      header: "Savings Overall",
      field: "discount",
      width: "60%",
      sort: true,
    },
  ];

  const partner_col: ITableConfig[] = [
    {
      header: "",
      field: "",
      expander: true,
      width: "5%",
    },
    {
      header: "Outlet Name",
      field: "outlet_name",
      width: "15%",
    },
    {
      header: "Bill Overall",
      field: "total",
      width: "10%",
      sort: true,
    },
    {
      header: "Paid Overall",
      field: "paid",
      width: "10%",
      sort: true,
    },
    {
      header: "Savings Overall",
      field: "discount",
      width: "60%",
      sort: true,
    },
  ];

  const onRowToggle = (event: { data: ReportEntitiesSupported[] }) => {
    setExpandedRows(event.data);
  };

  return (
    <div className="page-container w-full">
      <div className="text-2xl font-bold mb-3">Reports</div>

      <DataTable
        header={headerTempplate}
        loading={isLoading}
        value={resultList}
        className="reports-table text-xs bg-blue-200"
        dataKey="transaction_code"
        sortField={selectedReport.expand ? "main_name" : "transaction_date"}
        sortOrder={selectedReport.expand ? 1 : -1}
        expandedRows={expandedRows}
        onRowToggle={onRowToggle}
        rowExpansionTemplate={rowExpansionTemplate}
        onRowClick={(e: DataTableRowClickEvent) => {
          setExpandedRows(e.data as ReportEntitiesSupported[]);
        }}
      >
        {!!selectedReport.expand === false &&
        !!selectedReport &&
        !!selectedReport.columns
          ? selectedReport.columns.map((x, _) => {
              return (
                <Column
                  key={_}
                  sortable={x.sort}
                  expander={x.expander}
                  header={x.header}
                  field={x.field}
                />
              );
            })
          : main_col.map((item, _) => {
              return (
                <Column
                  key={_}
                  body={item.body}
                  sortable={item.sort}
                  expander={item.expander}
                  style={{ width: item.width, textAlign: "left" }}
                  header={item.header}
                  field={item.field}
                />
              );
            })}
      </DataTable>
    </div>
  );
};

export default Reports;
