import moment from "moment";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import {
  DataTable,
  DataTableRowClickEvent,
  DataTableRowReorderEvent,
} from "primereact/datatable";
import { Image } from "primereact/image";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IApp, IAppBanner } from "../../../@types/AppInfo";
import { AppInfoService } from "../../../services/AppInfo/AppInfo.service";
import { SERVER_URL } from "../../../utils/constants/constants";
import "./AppBanner.css";
import { ContentLabel } from "../AddBanner/AddBanner";
import AppListDropdown from "../../../components/Applist/AppListDropdown";
import { DropdownChangeEvent } from "primereact/dropdown";
import { StorageService } from "../../../services/Storage/Storage.service";

interface Props {}

interface LocationProps {
  app: IApp;
}

//Functional Component
const AppBanner: React.FC<Props> = () => {
  const canRead: boolean = StorageService.hasPrivilege(77, 'read')
  const canAdd: boolean = StorageService.hasPrivilege(77, 'add')
  const canEdit: boolean = StorageService.hasPrivilege(77, 'edit')
  const canDelete: boolean = StorageService.hasPrivilege(77, 'delete')
  const canModify: boolean = canAdd || canEdit || canDelete

  const location = useLocation();
  const app = (location.state as LocationProps)?.app;
  const [bannerList, setBannerList] = useState<IAppBanner[]>();
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef<Toast>(null);
  const [selectedApp, setSelectedApp] = useState<IApp | null>(app);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    //Fetch
    const getBanners = async () => {
      try {
        setIsLoading(true);
        const response = await AppInfoService.getBanners({
          id: selectedApp!.id,
          status: 0,
        });
        
        const success: boolean = response.success;
        const data: IAppBanner[] = response.data;
        if (success && isMounted) {
          setBannerList(data);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    getBanners();

    return () => {
      isMounted = false;
    };
  }, [selectedApp]);

  const handleAdd = () => {
    navigate("add", {
      state: {
        app: app,
      },
    });
  };

  const renderDateCreatedBody = (rowData: IAppBanner) => {
    return moment(rowData.date_created).format("DD-MMM, YYYY");
  };

  const renderDateModBody = (rowData: IAppBanner) => {
    return moment(rowData.date_modified).format("DD-MMM, YYYY");
  };

  const renderBannerImage = (rowData: IAppBanner) => {
    return (
      <Image
        imageClassName="border-round-lg"
        src={`${SERVER_URL}/banners/${rowData.banner_image}`}
        alt="Image"
        width="100"
        height="70"
        preview
      />
    );
  };

  const rowClass = () => {
    return "banner-list";
  };

  const handleRowClick = (e: DataTableRowClickEvent) => {
    navigate("add", {
      state: {
        app: app,
        banner_id: e.data.id,
      },
    });
  };

  const renderStatus = (e: IAppBanner) => {
    let color = ``;

    switch (e.status) {
      case 0:
        color = `bg-red-300`;
        break;
      case 1:
        color = `bg-green-300`;
        break;
    }

    return (
      <div className="flex align-items-center">
        <div
          className={`border-circle mr-1 ${color}`}
          style={{ width: 10, height: 10 }}
        ></div>
        {!!e.status ? "Online" : "Offline"}
      </div>
    );
  };

  const renderAction = (e: IAppBanner) => {
    let value: ContentLabel = "None";
    let color: string = "";

    switch (e.withLink) {
      case 0:
        value = "None";
        color = "bg-red-300";
        break;
      case 1:
        value = "URL";
        color = "bg-green-300";
        break;
      case 2:
        value = "App Link";
        color = "bg-blue-300";
        break;
      case 3:
        value = "Pop-up";
        color = "bg-purple-300";
        break;
    }

    return (
      <div className="flex align-items-center">
        <div
          className={`border-circle mr-1 ${color}`}
          style={{ width: 10, height: 10 }}
        ></div>
        {value}
      </div>
    );
  };

  const handleReorderRow = async (
    e: DataTableRowReorderEvent<IAppBanner[]>
  ) => {
    try {
      setIsLoading(true);

      //Find the changed rows, get the banner ID
      let _bannerOrder: { id: number; order_id: number }[] = [];

      if (bannerList) {
        bannerList.forEach((left: IAppBanner, index: number) => {
          if (left.id != e.value[index].id) {
            _bannerOrder.push({ id: e.value[index].id, order_id: index + 1 });
          }
          console.log(
            `ID: ${left.id} - ${e.value[index].id} | ORDER ID: ${left.order_id} - ${e.value[index].order_id}`
          );
        });
      }

      const response = await AppInfoService.reorderBanner({
        app_id: app.id,
        list: _bannerOrder,
      });
      if (response.success) {
        if (toastRef && toastRef.current)
          toastRef.current.show({
            summary: "Success",
            detail: "Banner Reordered Successfully",
            severity: "success",
          });
        setBannerList(e.value);
      } else {
        if (toastRef && toastRef.current)
          toastRef.current.show({
            summary: "Failed",
            detail: "Banner Reordering Unsuccessful",
            severity: "error",
          });
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectedApp = (e: DropdownChangeEvent) => {
    setSelectedApp(e.value);
  };

  const renderTableHeader = () => {
    return (
      <div className="flex justify-content-between">
        <div className="w-2">
          <AppListDropdown
            dropdownChange={handleSelectedApp}
            selectedApp={selectedApp}
          />
        </div>
        { canAdd && <Button
          iconPos="left"
          icon="pi pi-plus"
          onClick={handleAdd}
          className="font-bold text-xs p-button-success"
          label="Add Banner"
        /> }
      </div>
    );
  };

  const renderURLLinks = (e: IAppBanner) => {
    return `${e.url_link.replace(/%28/g, "(").replace(/%29/g, ")")}`;
  };

  return (
    <>
      <div className="page-container">
        <div className="grid">
          <div className="col-12 text-center font-bold text-lg lg:col-6 lg:text-left">
            {selectedApp!.name} Banners
          </div>
          <div className="col-12 lg:col-6 text-right"></div>
        </div>
        <DataTable
          loading={isLoading}
          reorderableRows
          onRowReorder={handleReorderRow}
          value={bannerList}
          rowClassName={rowClass}
          onRowClick={handleRowClick}
          className="text-xs"
          header={renderTableHeader}
        >
          <Column rowReorder></Column>
          <Column field="name" header="Name"></Column>
          <Column
            field="banner_image"
            body={renderBannerImage}
            header="Image"
          ></Column>
          <Column field="withLink" body={renderAction} header="Action"></Column>
          <Column field="url_link" body={renderURLLinks} header="URL"></Column>
          <Column
            field="date_created"
            body={renderDateCreatedBody}
            header="Date Created"
          ></Column>
          <Column
            field="date_modified"
            body={renderDateModBody}
            header="Date Modified"
          ></Column>
          <Column field="status" body={renderStatus} header="Status"></Column>
        </DataTable>
        <Toast ref={toastRef} position={"bottom-right"} />
      </div>
    </>
  );
};

export default AppBanner;
