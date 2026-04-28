import "./OfferList.css";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppInfoContext } from "../../services/AppInfo/AppInfo.context";
import { OfferService } from "../../services/Offer/Offer.services";
import { IOffer } from "../../@types/Offer";
import { IPartner } from "../../@types/Partner";

import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { IApp } from "../../@types/AppInfo";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import LoadingSpinner from "../../components/LoadingSpinner";
import { StorageService } from "../../services/Storage/Storage.service";

interface Props {
  // loading: boolean;
}

interface LocationProp {
  partner: IPartner;
}

interface ICustomOffer {
  id: number;
  allowInApps: any[];
  offerName: string;
  usedOffers: number;
  stockQty: number;
  minValue: number;
  remainingQty: number;
  startDate: Date | string;
  endDate: string;
  status: number;
  app: string;
}

//Functional Component
const OfferList: React.FC<Props> = () => {
  // const canRead = StorageService.hasPrivilege(76, 'read');
  // const canAdd = StorageService.hasPrivilege(76, 'add');
  // const canEdit = StorageService.hasPrivilege(76, 'edit');
  // const canDelete = StorageService.hasPrivilege(76, 'delete');
  const canRead = true;
  const canAdd = true;
  const canEdit = true;
  const canDelete = true;

  
  const canModify = canAdd || canEdit || canDelete

  const [loading, setLoading] = useState(false);
  const [customOfferList, setCustomOfferList] = useState<ICustomOffer[]>();
  const [selectedOffers, setSelectedOffers] = useState<ICustomOffer[]>([]);
  const [globalFilterField, setGlobalFilterField] = useState<string>("");
  const [filters, setFilters] = useState<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationProp;
  // const [partner, setPartner] = useState<IPartner>()
  const { appList } = useContext(AppInfoContext);
  const [selectedApp, setSelectedApp] = useState<IApp>();
  const [modAppList, setModAppList] = useState<IApp[]>();
  const [offerStatus, setOfferStatus] = useState(0);
  const [showActivateButton, setShowActivateButton] = useState(false);
  const [showDeactivateButton, setShowDeactivateButton] = useState(false);
  const [app, setApp] = useState("");
  const toast = useRef<Toast>(null);
  const [offerListCopy, setOfferListCopy] = useState<IOffer[]>();

  useEffect(() => {
    initFilters();
    // setPartner(state.partner)
    getOffers();
  }, []);

  useLayoutEffect(() => {
    if (filters != undefined) {
      let _status = { ...filters };

      switch (offerStatus) {
        case 0:
          _status["status"].value = null;
          break;
        case 1:
          _status["status"].value = 1;
          break;
        case 2:
          _status["status"].value = 0;
          break;
      }

      setFilters(_status);
    }
  }, [offerStatus]);

  useEffect(() => {
    if (selectedOffers != undefined) {
      if (selectedOffers.some((offer) => offer.status === 1)) {
        setShowDeactivateButton(true);
      } else {
        setShowDeactivateButton(false);
      }

      if (selectedOffers.some((offer) => offer.status === 0)) {
        setShowActivateButton(true);
      } else {
        setShowActivateButton(false);
      }
    }
  }, [selectedOffers]);

  const getOffers = () => {
    if (state.partner != undefined) {
      setLoading(true);
      OfferService.getOffersByPartner(state.partner.id)
        .then((result) => {
          let offerList = result;

          setOfferListCopy(offerList);
          const newOfferList: ICustomOffer[] = [];

          offerList.map((offer) => {
            const _offerName = `${offer.premium_en}
                                        ${
                                          offer.freebie_en != undefined &&
                                          offer.freebie_en !== ""
                                            ? ` ${offer.freebie_en}`
                                            : ""
                                        } on
                                        ${offer.prodname_en}`;

            const _availCount =
              offer.avail_count != undefined ? offer.avail_count : 0;

            const _offer: ICustomOffer = {
              id: offer.id != undefined ? offer.id : 0,
              offerName: _offerName,
              usedOffers: _availCount,
              allowInApps: [],
              minValue: offer.min_value,
              stockQty: offer.stock_qty,
              remainingQty:
                offer.stock_qty != 0 ? offer.stock_qty - _availCount : 0,
              startDate: new Date(offer.date_start as Date).toString(),
              // startDate: new Date(offer.date_start as Date).toLocaleString(),
              // startDate: formatDate(offer.date_start as Date),
              endDate: new Date(offer.date_end as Date).toString(),
              app: offer.app || "",
              status: offer.status != undefined ? offer.status : 0,
            };
            newOfferList.push(_offer);
          });

          setLoading(false);
          setCustomOfferList(newOfferList);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };

  const initFilters = () => {
    if (selectedApp == undefined) {
      const _appList = [...appList];
      const defaultApp: IApp = { id: 0, name: "All", status: 1 };
      _appList.unshift(defaultApp);
      setModAppList(_appList);
      setSelectedApp(defaultApp);
    }
    setFilters({
      offerName: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
      status: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
      allowInApps: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
    });

    setGlobalFilterField("");
  };

  const formatDate = (date: Date) => {
    const zDate = new Date(date);
    return zDate.toUTCString();
  };

  const rowClass = (data: ICustomOffer) => {
    return {
      "text-gray-400": data.status === 0 || new Date(data.endDate) < new Date(),
      "bg-gray-200": data.status === 0 || new Date(data.endDate) < new Date(),
      "bg-orange-100":
        data.stockQty > 0 && data.stockQty - data.usedOffers <= 0,
    };
  };

  const onFiltersChange = (e: any) => {
    const value = e.target.value;
    const _filter = { ...filters };
    _filter["offerName"].value = value;

    setFilters(_filter);
    setGlobalFilterField(value);
  };

  const handleOfferLink = (offer: ICustomOffer) => {
    navigate(`../offer/${offer.id}`, { state: { partner: state.partner } });
  };

  const offerColumnBodyTemplate = (rowData: ICustomOffer) => {
    return (
      <>
        <div>
          { canRead ? <a
            className="partner-table-link text-xs"
            onClick={() => handleOfferLink(rowData)}
          >
            {new Date(rowData.endDate) < new Date() ? `[EXPIRED] ` : ""}
            {rowData.offerName}
          </a> :
          <p
            className="text-xs"
          >
            {new Date(rowData.endDate) < new Date() ? `[EXPIRED] ` : ""}
            {rowData.offerName}
          </p> }
        </div>
      </>
    );
  };

  const handleAppSelect = (e: { value: IApp }) => {
    if (filters != undefined) {
      let _selectedApp = { ...filters };

      _selectedApp["allowInApps"].value = ` ${
        e.value.id !== 0 ? e.value.id : ""
      }`;

      setFilters(_selectedApp);
      setSelectedApp(e.value);
    }
  };

  const updateCurrentList = (filteredOfferList: IOffer[], status: number) => {
    if (customOfferList != undefined && offerListCopy != undefined) {
      filteredOfferList.map((offer) => {
        const _customOffer = customOfferList.find(
          (customOffer) => customOffer.id === offer.id
        );
        const _newOfferList = offerListCopy.find(
          (customOffer) => customOffer.id === offer.id
        );
        if (_customOffer != undefined && _newOfferList != undefined) {
          _customOffer.status = status;
          _newOfferList.status = status;
        }
      });

      setCustomOfferList(customOfferList);
      setOfferListCopy(offerListCopy);
      setSelectedOffers([]);
    }
  };

  const handleActivateOffer = () => {
    const _status = 1;
    if (offerListCopy != undefined) {
      const _offersActivate: IOffer[] = offerListCopy.filter((offer) => {
        return selectedOffers.some(
          (selected) => selected.id === offer.id && offer.status === 0
        );
      });

      if (_offersActivate.length > 0) {
        OfferService.updateStatus(_offersActivate, _status)
          .then((result) => {
            displayMessage(result);
            updateCurrentList(_offersActivate, _status);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        toast.current!.show({
          severity: "info",
          summary: "Update Unsuccessful",
          detail: "Offer already active",
        });
      }
    }
  };

  const handleDeactivateOffer = () => {
    const _status = 0;
    if (offerListCopy != undefined) {
      const _offersDeactivate: IOffer[] = offerListCopy.filter((offer) => {
        return selectedOffers.some(
          (selected) => selected.id === offer.id && offer.status === 1
        );
      });

      OfferService.updateStatus(_offersDeactivate, 0)
        .then((result) => {
          displayMessage(result);
          updateCurrentList(_offersDeactivate, _status);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const displayMessage = (success: boolean) => {
    if (!success)
      return toast.current!.show({
        severity: "error",
        summary: "Update Unsuccessful",
        detail: "Offer Status change failed!",
      });

    return toast.current!.show({
      severity: "success",
      summary: "Update Successful",
      detail: "Offer Status updated!",
    });
  };

  const onChangeStatus = (status: number) => {
    switch (status) {
      case 0:
        confirmDialog({
          header: "Deactivate Offer Confirmation",
          icon: "pi pi-exclamation-triangle",
          message: "Are you sure you want to deactivate selected offer(s)?",
          className: "text-xs",
          accept: handleDeactivateOffer,
          acceptClassName: "p-button-success text-xs",
          reject: () => {},
          rejectClassName: "p-button-danger text-xs",
        });
        break;
      case 1:
        confirmDialog({
          header: "Activate Offer Confirmation",
          icon: "pi pi-exclamation-triangle",
          message: "Are you sure you want to activate selected offer(s)?",
          className: "text-xs",
          accept: handleActivateOffer,
          acceptClassName: "p-button-success text-xs",
          reject: () => {},
          rejectClassName: "p-button-danger text-xs",
        });
        break;
    }
  };

  const remainingQtyColumnBodyTemplate = (rowData: ICustomOffer) => {
    return (
      <>
        {rowData.stockQty > 0 ? (
          <div className="text-right w-full">{`${
            rowData.remainingQty
          }/${rowData.remainingQty + rowData.usedOffers}`}</div>
        ) : (
          <div className="text-right w-full">{`Unlimited`}</div>
        )}
      </>
    );
  };

  const appColumnBodyTemplate = (rowData: ICustomOffer) => {
    return (
      <>
        {// rowData.app.split("|").join("\n")
        rowData.app.split("|").map((scope, index) => {
          return (
            <>
              {scope} <br></br>
            </>
          );
        })}
      </>
    );
  };

  const headerTemplate = () => {
    return (
      <>
        <div className="flex justify-content-between ">
          <div className="flex gap-2">
            <span className="p-input-icon-left p-input-icon-right ">
              
              <InputText
                className="text-xs"
                value={globalFilterField}
                onChange={onFiltersChange}
                placeholder="Search Offer"
              />
              <i
                onClick={initFilters}
                className={`pi pi-times pressable text-xs ${
                  globalFilterField == undefined || globalFilterField == ""
                    ? "hidden"
                    : "block"
                }`}
              />
            </span>
            <Dropdown
              className="offer-list w-10rem text-left"
              panelClassName="text-xs"
              value={selectedApp}
              options={modAppList}
              onChange={handleAppSelect}
              optionLabel={"name"}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2">
              { canEdit && <Button
                disabled={!showActivateButton}
                onClick={() => onChangeStatus(1)}
                className="p-button-success text-xs p-0 m-0 w-5rem"
                label="Activate"
              /> }
              { canEdit && <Button
                disabled={!showDeactivateButton}
                onClick={() => onChangeStatus(0)}
                className="p-button-danger text-xs p-0 m-0 w-5rem"
                label="Deactivate"
              /> }
            </div>
            <div className="flex">
              <Dropdown
                value={offerStatus}
                className="offer-list w-8rem text-left"
                panelClassName="text-xs"
                options={[
                  { label: "All", value: 0 },
                  { label: "Active", value: 1 },
                  { label: "Inactive", value: 2 },
                ]}
                optionLabel={"label"}
                optionValue={"value"}
                onChange={(e) => {
                  setOfferStatus(e.value);
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="grid relative">
        <div className="col-12 offer-table-container relative">
          {loading && <LoadingSpinner className="m-2" />}
          <DataTable
            style={{ fontSize: 10 }}
            editMode="cell"
            columnResizeMode="fit"
            filters={filters}
            showGridlines
            filterDisplay={"menu"}
            value={customOfferList}
            globalFilterFields={["offerName", "status"]}
            rowClassName={rowClass}
            dataKey={"id"}
            header={headerTemplate}
            scrollable
            scrollHeight="flex"
            responsiveLayout="scroll"
            selectionMode="checkbox"
            selection={selectedOffers}
            onSelectionChange={(e) => {
              
              setSelectedOffers(e.value as ICustomOffer[]);
            }}
          >
            { canModify && <Column
              selectionMode="multiple"
              style={{ maxWidth: "6%", justifyContent: "center" }}
            ></Column> }
            <Column
              field="offerName"
              body={offerColumnBodyTemplate}
              header="Offer Name"
              className="text-xs font-bold"
              sortable
            ></Column>
            <Column
              field="usedOffers"
              header="Used Offers"
              className="text-xs"
              sortable
              style={{ maxWidth: "10%" }}
            ></Column>
            <Column
              field="minValue"
              header="Min. Value"
              className="text-xs"
              sortable
              style={{ maxWidth: "10%" }}
            ></Column>
            <Column
              field="app"
              body={appColumnBodyTemplate}
              header="Scope"
              className="text-xs"
              sortable
              style={{ maxWidth: "10%" }}
            ></Column>
            <Column
              field="remainingQty"
              body={remainingQtyColumnBodyTemplate}
              header="Remaining Offers"
              className="text-xs "
              sortable
              style={{ maxWidth: "12%" }}
            ></Column>
            <Column
              field="startDate"
              header="Start Date/Time"
              className="text-xs"
              style={{ maxWidth: "14%" }}
            ></Column>
            <Column
              field="endDate"
              header="End Date/Time"
              className="text-xs"
              style={{ maxWidth: "14%" }}
            ></Column>
          </DataTable>
        </div>
        <Toast
          ref={toast}
          position="bottom-right"
          className="text-left text-xs"
        />
        <ConfirmDialog />
      </div>
    </>
  );
};

export default OfferList;
