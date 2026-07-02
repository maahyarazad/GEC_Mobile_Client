import "./PartnerDetails.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { TabMenu } from "primereact/tabmenu";
import OfferList from "../../OfferList"; import PartnerDetailsEdit from "../PartnerDetailsEdit";
import { PartnerService } from "../../../services/Partner/Partner.service";
import { IPartner, IPCategory } from "../../../@types/Partner";
import { IApp } from "../../../@types/AppInfo";
import { IOffer } from "../../../@types/Offer";
import { OfferService } from "../../../services/Offer/Offer.services";
import { Toast } from "primereact/toast";
import { StorageService } from "../../../services/Storage/Storage.service";

interface Props {}

interface LocationProps {
  partner: IPartner;
  app: IApp;
}

//Functional Component
const PartnerDetails: React.FC<Props> = () => {
    // const canRead = StorageService.hasPrivilege(76, 'read')
    // const canAdd = StorageService.hasPrivilege(76, 'add')
    // const canEdit = StorageService.hasPrivilege(76, 'edit')
    // const canDelete = StorageService.hasPrivilege(76, 'delete')
    const canRead = true;
    const canAdd = true;
    const canEdit = true;
    const canDelete = true;

    
  const canModify = canAdd || canEdit || canDelete
  
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();
  const [partner, setPartner] = useState<IPartner>();
  const [offerList, setOfferList] = useState<IOffer[]>();
  const [pCategories, setPCategories] = useState<IPCategory[]>();
  const [loading, setLoading] = useState(false);
  const state = location.state as LocationProps;
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const hasInit = useRef(false);

  const items = [
    { label: "Offers", icon: "pi pi-fw pi-ticket text-sm", path: "offerlist" },
    { label: "Details", icon: "pi pi-fw pi-align-left text-sm" },
  ];

  useEffect(() => {
    if (state != undefined) {
      setPartner(state.partner);
      getAllCategories();
    } else {
      navigate("../");
    }

  }, []);

  const getAllCategories = () => {
    setLoading(true);
    PartnerService.getAllCategories()
      .then((result) => {
        setPCategories(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // useEffect(()=>{

  // },[partner])

  const leftToolbarContent = () => {
    return (
      <>
        <div className="font-bold partner-breadcrumb white-space-nowrap overflow-hidden text-overflow-ellipsis">
          {/* <span className='text-gray-500 text-sm'>{app != undefined && app.name }</span> */}
          {/* <i className='pi pi-fw pi-angle-right'></i> */}
          <span className="text-base ">
            {partner != undefined && partner.title}
          </span>
        </div>
      </>
    );
  };

  const rightToolbarContent = () => {
    return (
      <>
        <div className="flex gap-2">
          <Button
            className="p-button-secondary text-xs"
            onClick={() => navigate("/category/offer")}
            icon={"pi pi-fw pi-sliders-h"}
            label={ canModify ? "Manage Offer Categories" : "Offer Categories" }
          />
          { canAdd && <Button
            className="p-button-success text-xs"
            onClick={handleNewOffer}
            icon={"pi pi-fw pi-plus"}
            label="New Offer"
          /> }
        </div>
      </>
    );
  };

  const handleNewOffer = () => {
    navigate("../create-offer", { state: { partner: partner } });
  };

  const handleTabChange = (e: any) => {
    setActiveIndex(e.index);
  };

  // Refetch the latest partner data so the UI reflects saved changes.
  const refetchPartner = useCallback(() => {
    if (!partner?.id) return;
    PartnerService.getPartner(partner.id)
      .then((result) => setPartner(result))
      .catch((err) => console.log(err));
  }, [partner?.id]);

  // Called after a successful partner-details update: return to the
  // OfferList tab and refresh the partner data.
  const handleDetailsUpdated = useCallback(() => {
    setActiveIndex(0);
    refetchPartner();
  }, [refetchPartner]);

  // Memoize the tab content so the active tab isn't remounted on every
  // parent re-render (the previous inline component was a new type each render).
  const partnerDetailContent = useMemo(() => {
    if (partner != undefined && pCategories != undefined) {
      switch (activeIndex) {
        case 0:
          return <OfferList />;
        case 1:
          return (
            <PartnerDetailsEdit
              toast={toast}
              partnerService={PartnerService}
              partner={partner}
              categories={pCategories}
              onUpdateSuccess={handleDetailsUpdated}
            />
          );
      }
    }
    return <></>;
  }, [activeIndex, partner, pCategories, handleDetailsUpdated]);

  return (
    <>
      <div className="page-container grid">
        <div className="col-12 text-left">
          <Button
            icon={"pi pi-arrow-left text-xs"}
            className="p-button-secondary text-xs"
            onClick={() => {
              navigate(-1);
            }}
            label="Back"
          />
        </div>
        <div className="col-12 text-left">
          <Toolbar
            className="p-3"
            left={leftToolbarContent}
            right={rightToolbarContent}
          />
        </div>
        <div className="col-12">
          <TabMenu
            className="text-xs"
            activeIndex={activeIndex}
            onTabChange={handleTabChange}
            model={items}
          />
          <div className="partner-detail-container">
            {partnerDetailContent}
          </div>
        </div>
        <Toast
          ref={toast}
          className="text-left text-xs"
          position="bottom-right"
        />
      </div>
    </>
  );
};

export default PartnerDetails;
