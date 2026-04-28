import { Button } from "primereact/button";
import "./ExpertEventDetailEdit.css";
import { Toast } from "primereact/toast";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { StorageService } from "../../../services/Storage/Storage.service";
import { Dropdown } from "primereact/dropdown";
import { Controller, useForm, SubmitHandler, FieldErrors  } from 'react-hook-form';
import LoadingSpinner from "../../../components/LoadingSpinner";
import { IStandardResponse } from "../../../@types/Response";
import { IExpertEvent } from "../../../@types/Expert";
import moment from "moment";
import { Calendar } from "primereact/calendar";
import { DevTool } from "@hookform/devtools";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { ExpertService } from "../../../services/Expert/Expert.service";

const ExpertEventDetailEdit: React.FC = () => {
  let renderCount = 0;
  const canRead: boolean = StorageService.hasPrivilege(87, 'read')
  const canAdd: boolean = StorageService.hasPrivilege(87, 'add')
  const canEdit: boolean = StorageService.hasPrivilege(87, 'edit')
  const canDelete: boolean = StorageService.hasPrivilege(87, 'delete')
  const canModify: boolean = canAdd || canEdit || canDelete

  const { eventId } = useParams();
  let dateNow = new Date(Date.now());
  dateNow.setHours(7, 0,  0)
  let dateToday = new Date()
  dateToday.setHours(0, 0, 0)


  let generateEmptyProspectData = (): IExpertEvent => {
    return {
      id: 0,
      title: '',
      shortDescription: '',
      description: '',
      place: '',
      eventTime: dateNow,
      startDesk: dateToday,
      endDesk: undefined,
      amountPerPerson: 50,
      maxAttendees: 50,
      desktopBG: "https://www.german-emirates-club.com/uploads/files/user/GEC%20Experts%20For%20Eventwebsite%201.png",
      mobileBG: '',
      desktopFG: '',
      status: '0'
    }
  }

  let resetDefaultValues = (event: IExpertEvent) => {
    let data: IExpertEvent = event
    data.eventTime = moment(data.eventTime).toDate()
    data.startDesk = moment(data.startDesk).toDate()
    data.endDesk = moment(data.endDesk).toDate()
    setValue("id", event.id) // Changes to Edit
    reset(data)
  }

  let fetchDetails = async (): Promise<IExpertEvent | undefined> => {
    setIsLoading(true);
    if (eventId) {
      const result = await ExpertService.fetchExpertEvent(eventId)
      .then(result => {
        if (result.success && result.data) {
          setValue("id", result.data.id) // Changes to Edit
          setIsPublished(result.data.status == '1' ? true : false)
          resetDefaultValues(result.data)
        }
        else {
          toast.current!.show({
            severity: "error",
            summary: "Failed to fetch data",
            detail: result.message,
          });
        }
      }).catch(err => {
        toast.current!.show({
          severity: "error",
          summary: "Something went wrong",
          detail: err,
        });
      })
      .finally(() => {
        setIsLoading(false);
      })
    } else {
      setIsLoading(false);
      return undefined;
    }
  }

  // variable for imports
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  
  // variables for boolean flags
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

	// variables for data
  // TODO: change to month ahead
  const dateYearAhead = new Date(Date.now());
  dateYearAhead.setFullYear(dateYearAhead.getFullYear() + 1);
  
  const [isPublished, setIsPublished] = useState(false);
  
  // variables for form
  const {register, handleSubmit, formState, control, watch, getValues, setValue, reset} = useForm<IExpertEvent>({defaultValues: generateEmptyProspectData()});
  const { errors, isDirty, isValid, isSubmitting } = formState;
  const onSubmit: SubmitHandler<IExpertEvent> = async (data) => {
    // If user is making new Prospect
    if (!getValues('id')) {       // Save new event
      const result = await ExpertService.createExpertEvent(data)
      .then(result => {
        if (result.success && result.data) {
          setValue("id", result.data?.id) // Change to Edit
          toast.current!.show({
            severity: "success",
            summary: "Saved",
            detail: "New event successfully saved",
          });
          resetDefaultValues(result.data)
        }
        else {
          toast.current!.show({
            severity: "error",
            summary: "Failed to save",
            detail: result.message,
          });
        }
      }).catch(err => {
        toast.current!.show({
          severity: "error",
          summary: "Something went wrong",
          detail: err,
        });
      })
    } else {
      const result = await ExpertService.editExpertEvent(data)
      .then(result => {
        if (result.success && result.data) {
          toast.current!.show({
            severity: "success",
            summary: "Saved",
            detail: "Edit event successfully saved",
          });
          resetDefaultValues(result.data)
        }
        else {
          toast.current!.show({
            severity: "error",
            summary: "Failed to save",
            detail: result.message,
          });
        }
      }).catch(err => {
        toast.current!.show({
          severity: "error",
          summary: "Something went wrong",
          detail: err,
        });
      })
    }
    // TODO: setDefaultValues(result)
  }

  const onError = (errors: FieldErrors<IExpertEvent>) => {
    console.log('Error occured on submit. ', errors)
  }

  useEffect(() => {
    if (eventId) {
      fetchDetails();   // fetch details
    }
  }, [])

  useEffect(() => {
    setValue("status", isPublished ? "1" : "0", { shouldDirty: true })
  }, [isPublished])

  useEffect(() => {
    setValue('endDesk', watch('eventTime'))
  }, [watch("eventTime")])

  useEffect(() => {
    if (!!getValues('id')) setIsEditMode(true)
  }, [watch("id")])



  /***** useEffects - START *****/
  /***** useEffects - START *****/


  /***** helper functions - START *****/
  /***** helper functions - END *****/


  /***** Handle user actions - START *****/
  /***** Handle user actions - END *****/


  /***** Custom Components - START *****/
  const SaveButton = (isFormHeader: boolean = false) => {
    return (
      <div className={isFormHeader ? "action-buttons--header-group" : "action-buttons--form-group"}>
        <Button
          disabled={!isDirty || isSubmitting}
          label="Save"
          type="submit"
          className={"p-button-success"}
        />
        <Button
          label="Reset" type="button" link
          className={"p-button-secondary p-button-text"}
          onClick={() => reset()}/>
      </div>
    )
  }

  const leftContents = () => {
    return (
      <div className="pl-2 font-bold text-2xl">
        {isEditMode ? "Edit" : "New"} Experts Event
      </div>
    );
  };

  const rightContents = () => {
    return (
      <div className="flex gap-2 justify-content-end">
        <div>
          {SaveButton(true)}
        </div>
      </div>
    );
  };

  const errorList = () => {       // List all errors here
    return (
      <ul>
        {errors.title?.message && <p>{errors.title?.message}</p>}
        {errors.eventTime?.message && <p>{errors.eventTime?.message}</p>}
      </ul>
    )
  }
  
  /***** Custom Components - END *****/

  renderCount++;
  return (
    <div className="page-container grid text-xs offer-details">
      <div className="col-12">
        <Button
          icon={"pi pi-arrow-left text-xs"}
          className="p-button-secondary text-xs"
          onClick={() => {
            navigate(-1);
          }}
          label="Back"
        />
      </div>

      <form className="col-12" onSubmit={handleSubmit(onSubmit, onError)} noValidate>

        <div className="col-12">
          <Toolbar
            left={leftContents}
            right={rightContents}
            className="p-2 m-0"
          />
        </div>
        {errorList()}

        <div className="col-12">

          <label className="mt-4 mb-2 block">Expert Title *</label>
          <InputText className="w-full" id="title" autoFocus {...register('title', { required: "Title is required." })}/>
          <p className="error">{errors.title?.message}</p>

          <label className="mt-4 mb-2 block">Short Description</label>
          <InputText className="w-full" {...register(`shortDescription`)}/>

          <label className="mt-4 mb-2 block">Event Description</label>
          <InputText className="w-full" {...register(`description`)}/>

          <label className="mt-4 mb-2 block">Event Location</label>
          <InputText className="w-full" {...register(`place`)}/>

          <label className="mt-4 mb-2 block">Event Date and Time *</label>
          <Calendar
            className="w-full"
            id="time24"
            dateFormat="d-M, yy"
            showButtonBar
            showTime
            value={watch("eventTime")}
            minDate={dateToday}
            {...register(`eventTime`, {
              valueAsDate: true,
              required: "Date of event is required"
            })}
          />
          <p className="error">{errors.eventTime?.message}</p>

          <label className="mt-4 mb-2 block">Registration Start</label>
          <Calendar
            className="w-full"
            id="time24"
            dateFormat="d-M, yy"
            showButtonBar
            showTime
            value={watch("startDesk")}
            minDate={dateToday}
            maxDate={watch("eventTime")}
            {...register(`startDesk`, {
              valueAsDate: true
            })}
          />

          <label className="mt-4 mb-2 block">Registration End</label>
          <Calendar
            className="w-full"
            id="time24"
            dateFormat="d-M, yy"
            showButtonBar
            showTime
            value={watch("endDesk")}
            minDate={dateToday}
            maxDate={watch("eventTime")}
            {...register(`endDesk`, {
              valueAsDate: true
            })}
          />
          
          <label className="mt-4 mb-2 block">Amount Per Person</label>
          <InputText id="amount" className="w-full"
            type="number"
            min="0"
            {...register(`amountPerPerson`, {
            valueAsNumber: true
          })}/>
          
          <label className="mt-4 mb-2 block">Maximum Attendees</label>
          <InputText className="w-full"
          type="number"
          min="1"
          {...register(`maxAttendees`, {
            valueAsNumber: true
          })}/>
          
          <label className="mt-4 mb-2 block">Desktop Background Image URL</label>
          <InputText className="w-full" {...register(`desktopBG`)}/>

          <label className="mt-4 mb-2 block">Mobile Background Image URL</label>
          <InputText className="w-full" {...register(`mobileBG`)}/>

          <label className="mt-4 mb-2 block">Foreground Image URL</label>
          <InputText className="w-full" {...register(`desktopFG`)}/>

          <label className="mt-4 mb-2 hidden">Status</label>
          <InputText className="w-full" type="hidden" {...register(`status`)}/>

          <br></br>
          <br></br>
          <div className="align-items-center flex">
            <Checkbox
              id="isPublished"
              checked={isPublished}
              disabled={ watch("title") === "" || watch("eventTime") === null}
              onClick={() => {
                setIsPublished(!isPublished)
              }}></Checkbox>
            <label className="mt-2 mb-2 ml-2" htmlFor="isPublished">Publish</label>
          </div>
          <br></br>
          <br></br>
          <br></br>


          {errorList()}
          {SaveButton(false)}
        </div>
      </form>

      <DevTool control={control} />

      {isSubmitting && <LoadingSpinner/>}
      <Toast position="bottom-right" ref={toast} />
      <ConfirmDialog />
    </div>
  );
};

export default ExpertEventDetailEdit;
