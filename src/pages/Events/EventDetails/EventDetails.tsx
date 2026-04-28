import moment from "moment";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IEventDetail, IEventDetailEn } from "../../../@types/Event";
import { EventService } from "../../../services/Event/Event.services";
import "./EventDetails.css";
import { StorageService } from "../../../services/Storage/Storage.service";

interface Props {}

interface Event {
  id: number;
}

//Functional Component
const EventDetails: React.FC<Props> = () => {
  const canRead: boolean = StorageService.hasPrivilege(80, 'read')
  const canAdd: boolean = StorageService.hasPrivilege(80, 'add')
  const canEdit: boolean = StorageService.hasPrivilege(80, 'edit')
  const canDelete: boolean = StorageService.hasPrivilege(80, 'delete')
  const canModify: boolean = canAdd || canEdit || canDelete

  const navigate = useNavigate();
  const location = useLocation();
  const toastRef = useRef<Toast>(null);
  const eventId = location.state as Event;
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [eventDetail, setEventDetail] = useState<IEventDetail>();
  const [eventDetailCopy, setEventDetailCopy] = useState<IEventDetail>();

  useEffect(() => {
    setHasChanged(
      JSON.stringify(eventDetail) !== JSON.stringify(eventDetailCopy)
    );
  }, [eventDetail]);

  useEffect(() => {
    let isMounted = true;

    const getEvent = async () => {
      try {
        const response = await EventService.getEvent(eventId.id);
        if (isMounted) {
          setEventDetail(response);
          setEventDetailCopy(response);
        }
      } catch (err) {
        alert("Cannot get event details");
        navigate(-1);
      }
    };

    getEvent();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderToolbarLeft = () => {
    return (
      <>
        <div className="text-xl font-bold">Event Detail Translation</div>
      </>
    );
  };

  const renderToolbarRight = () => {
    return (
      <>
        { canModify && <Button
          disabled={!hasChanged}
          icon={"pi pi-save"}
          className="p-button-success text-xs"
          loading={isLoading}
          onClick={handleUpdate}
          label="Update"
        /> }
      </>
    );
  };

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    if (eventDetail) {
      setEventDetail({
        ...eventDetail,
        eventName_en: e.target.value ? e.target.value : null,
      });
    }
  };

  const handleChangeShort = (e: ChangeEvent<HTMLInputElement>) => {
    if (eventDetail) {
      setEventDetail({
        ...eventDetail,
        eventShortDesc_en: e.target.value ? e.target.value : null,
      });
    }
  };

  const handleChangeDesc = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (eventDetail) {
      setEventDetail({
        ...eventDetail,
        eventDescription_en: e.target.value ? e.target.value : null,
      });
    }
  };

  const handleUpdate = async () => {
    if (!eventDetail || !toastRef || !toastRef.current) {
      return;
    }

    setIsLoading(true);

    const data: IEventDetailEn = {
      id: eventId.id,
      eventName_en: eventDetail.eventName_en || null,
      eventShortDesc_en: eventDetail.eventShortDesc_en || null,
      eventDescription_en: eventDetail.eventDescription_en || null,
    };

    try {
      const response = await EventService.updateEvent(data);
      if (response) {
        setEventDetailCopy(eventDetail);
        setHasChanged(false);
        toastRef.current.show({
          severity: "success",
          summary: "Update Successful",
          detail: "Event Details has been saved",
        });
      } else {
        toastRef.current.show({
          severity: "error",
          summary: "Update Failed",
          detail: "Event Details was not saved",
        });
      }
    } catch (err) {
      console.log(err);
      alert("Problem occured while saving");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="page-container">
        <Button
          icon={"pi pi-arrow-left text-xs"}
          className="p-button-secondary text-xs mb-3"
          onClick={() => {
            navigate(-1);
          }}
          label="Back"
        />
        {eventDetail && (
          <div className="grid">
            <div className="col-12">
              <Toolbar left={renderToolbarLeft} right={renderToolbarRight} />
            </div>
            <div className="col-12 lg:col-6">
              <div className="bg-red-100 p-3 border-round font-bold text-lg">
                GERMAN
              </div>

              <div className="my-3">
                <label>Event Name</label>
                <div>
                  <InputText
                    className="w-full mt-2"
                    disabled={true}
                    value={eventDetail.eventName}
                  />
                </div>
              </div>
              <div className="my-3">
                <label>Short Description</label>
                <div>
                  <InputText
                    className="w-full mt-2"
                    disabled={true}
                    value={eventDetail.eventShortDesc}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label>Description</label>
                <div>
                  <InputTextarea
                    className="w-full mt-2 text-gray-500"
                    rows={15}
                    contentEditable={false}
                    value={eventDetail.eventDescription}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 lg:col-6">
              <div className="bg-blue-100 p-3 border-round font-bold text-lg">
                ENGLISH
              </div>

              <div className="my-3">
                <label>Event Name</label>
                <div>
                  <InputText
                    className="w-full mt-2"
                    value={
                      eventDetail.eventName_en ? eventDetail.eventName_en : ""
                    }
                    onChange={handleChangeName}
                    disabled={!(canAdd || canEdit)}
                  />
                </div>
              </div>
              <div className="my-3">
                <label>Short Description</label>
                <div>
                  <InputText
                    className="w-full mt-2"
                    onChange={handleChangeShort}
                    value={
                      eventDetail.eventShortDesc_en
                        ? eventDetail.eventShortDesc_en
                        : ""
                    }
                    disabled={!(canAdd || canEdit)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label>Description</label>
                <div>
                  <InputTextarea
                    className="w-full mt-2"
                    onChange={handleChangeDesc}
                    rows={15}
                    value={
                      eventDetail.eventDescription_en
                        ? eventDetail.eventDescription_en
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div>Event Date & Time</div>
              <div className="mt-2">
                {eventDetail.eventTime
                  ? moment(eventDetail.eventTime).format("LLL")
                  : ""}
              </div>
            </div>
            <div className="col-12">
              <div>Event Place</div>
              <div className="mt-2">
                {eventDetail.eventPlace ? eventDetail.eventPlace : ""}
              </div>
            </div>
            <div className="col-12 flex gap-4">
              <div className="flex gap-2">
                <Checkbox checked={eventDetail.membercard > 0} 
                  disabled={!(canAdd || canEdit)}/>
                <div>Member Card</div>
              </div>
              <div className="flex gap-2">
                <Checkbox checked={eventDetail.corporatecard > 0} 
                  disabled={!(canAdd || canEdit)}/>
                <div>Corporate Card</div>
              </div>
            </div>
            {/* <div className="col-12 my-4">
                    <div className="grid">
                        <div className="col-6">
                            <div>
                                Event Date & Time
                            </div>
                            <div className='mt-2'>
                                {
                                    eventDetail.eventTime ? 
                                    moment(eventDetail.eventTime).format('LLL') : ''
                                }
                            </div>
                            
                        </div>
                        <div className="col-6">
                            <div>
                                Event Place
                            </div>
                            <div className='mt-2'>
                                {
                                    eventDetail.eventPlace ? 
                                    eventDetail.eventPlace : ''
                                }
                            </div>
                        </div>
                    </div>
                </div> */}
            <div className="col-12 mb-3 text-right lg:hidden">
              {canModify && <Button
                className="p-button-success w-4"
                icon={"pi pi-save"}
                disabled={!hasChanged}
                onClick={handleUpdate}
                loading={isLoading}
                label="Update"
              />}
            </div>
          </div>
        )}
        <Toast ref={toastRef} />
      </div>
    </>
  );
};

export default EventDetails;
