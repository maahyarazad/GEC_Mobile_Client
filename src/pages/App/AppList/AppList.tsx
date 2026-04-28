import moment from "moment";
import { Column } from "primereact/column";
import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import React, { useEffect, useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { IApp } from "../../../@types/AppInfo";
import { AppInfoService } from "../../../services/AppInfo/AppInfo.service";
import "./AppList.css";
import useAPI from "../../../hooks/useAPI";
import { config } from "../../../utils/constants/constants";

interface Props { }

//Functional Component
const BannerAppList: React.FC<Props> = () => {
    const [appList, setAppList] = useState<IApp[]>();
    const navigator = useNavigate();
    const pathname = window.location.pathname;
    const request = useAPI(config.BASE_URL2);
    const [destination, setDestination] = useState<string>("");

    useEffect(() => {
        let isMount = true;

        const getApps = async () => {
            try {
                const response = await AppInfoService.getAppList();

                const response2 = await request.get("/user/count/pending-approval");

                response.forEach((app) => {
                    app.pending = 0;
                    response2.data.forEach(
                        (res2: { pending: number; app_id: number }) => {
                            if (app.id === res2.app_id) {
                                app.pending = res2.pending;
                            }
                        }
                    );
                });

                if (isMount) {
                    setAppList(response);
                }
            } catch (err) {
                console.log(err);
                alert("Something went wrong");
            }
        };

        getApps();
        getDestination();

        return () => {
            isMount = false;
        };
    }, [pathname]);

    const getDestination = () => {
        const keyword = pathname.split("/").pop();
        
        switch (keyword) {

            case "requests":
                setDestination("list");
                break;
            case "apps":
                setDestination("banners");
                break;
            default:
                  setDestination("requests/list");
                break;
        }
    };

    const renderTableDateBody = (rowData: IApp) => {
        return moment(rowData.date_created).format("LL");
    };

    const rowClass = (data: IApp) => {
        return "banner-list";
    };

    const handleRowClick = (e: DataTableRowClickEvent) => {
        
        navigator(destination, {
            state: {
                app: e.data,
            },
        });
    };

    return (
        <>
            <div className="page-container">
                {appList != undefined && (
                    <DataTable
                        className="text-xs"
                        value={appList}
                        rowClassName={rowClass}
                        onRowClick={handleRowClick}
                    >
                        <Column field="id" sortable header="App ID"></Column>
                        <Column field="name" sortable header="App Name"></Column>
                        <Column
                            field="date_created"
                            body={renderTableDateBody}
                            sortable
                            header="Date Created"
                        ></Column>
                        {(destination === "list" || destination === "requests/list") && (
                            <Column field="pending" sortable header="Pending"></Column>
                        )}
                    </DataTable>
                )}
            </div>
        </>
    );
};

export default BannerAppList;
