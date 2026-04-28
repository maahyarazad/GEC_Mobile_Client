import { Button } from "primereact/button";
import "./MemberDetailEdit.css";
import { Toast } from "primereact/toast";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { StorageService } from "../../../services/Storage/Storage.service";
import { useForm, SubmitHandler, FieldErrors  } from 'react-hook-form';
import LoadingSpinner from "../../../components/LoadingSpinner";
import { IExpertMember } from "../../../@types/Expert";
import { DevTool } from "@hookform/devtools";
import { ExpertService } from "../../../services/Expert/Expert.service";

const ExpertEventDetailEdit: React.FC = () => {
  const canRead: boolean = StorageService.hasPrivilege(87, 'read')
  const canAdd: boolean = StorageService.hasPrivilege(87, 'add')
  const canEdit: boolean = StorageService.hasPrivilege(87, 'edit')
  const canDelete: boolean = StorageService.hasPrivilege(87, 'delete')
  const canModify: boolean = canAdd || canEdit || canDelete

  // variables for boolean flags
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditMemberCode, setIsEditMemberCode] = useState(false);
  const [isEditBesucherCode, setIsEditBesucherCode] = useState(false);


  const { memberId } = useParams();
  let dateNow = new Date(Date.now());
  dateNow.setHours(7, 0,  0)
  let dateToday = new Date()
  dateToday.setHours(0, 0, 0)


  let generateEmptyData = (): IExpertMember => {
    return {
      id: 0,
      firstname: '',
      lastname: '',
      memberCode: '',
      besucherCode: '',
      status: 0
    }
  }

  let resetDefaultValues = (member: IExpertMember) => {
    let data: IExpertMember = member
    setValue("id", member.id) // Changes to Edit
    reset(data)
  }

  let fetchDetails = async (): Promise<IExpertMember | undefined> => {
    setIsLoading(true);
    if (memberId) {
      await ExpertService.fetchExpertMember(memberId)
      .then(result => {
        if (result.success && result.data) {
          setValue("id", result.data.id) // Changes to Edit
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

	// variables for data
  // TODO: change to month ahead
  const dateYearAhead = new Date(Date.now());
  dateYearAhead.setFullYear(dateYearAhead.getFullYear() + 1);
  
  // variables for form
  const {register, handleSubmit, formState, control, watch, getValues, setValue, reset} = useForm<IExpertMember>({defaultValues: generateEmptyData()});
  const { errors, isDirty, isValid, isSubmitting } = formState;
  const onSubmit: SubmitHandler<IExpertMember> = async (data) => {
    console.log('submit: ', data)

    // If admin is making new Expert Member
    if (!getValues('id')) {       // Save new Expert Member
      const result = await ExpertService.createExpertMember(data)
      .then(result => {
        console.log('result: ', result)
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
      await ExpertService.editExpertMember(data)
      .then(result => {
        if (result.success && result.data) {
          toast.current!.show({
            severity: "success",
            summary: "Saved",
            detail: "Edit Expert Member successfully saved",
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
  }

  const onError = (errors: FieldErrors<IExpertMember>) => {
    toast.current!.show({
      severity: "error",
      summary: "Saving failed",
      detail: "Failed to save Member",
    });
  }



  /***** useEffects - START *****/
  useEffect(() => {
    if (memberId) {
      fetchDetails();   // fetch details
    }
  }, [])

  useEffect(() => {
    if (!!getValues('id')) setIsEditMode(true)
  }, [watch("id")])
  /***** useEffects - START *****/


  /***** helper functions - START *****/
  /***** helper functions - END *****/


  /***** Handle user actions - START *****/
  const handleGenerateMemberCode = function () {
    const firstname = getValues('firstname').toUpperCase();
    const lastname = getValues('lastname').substring(0, 4).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    const newCode = `${firstname}_${lastname}_${randomStr}`
    setValue("memberCode", newCode)
  }

  const handleGenerateBesucherCode = function () {
    const randomStr = Math.random().toString(36).slice(2, 6).toUpperCase()
    const newCode = `${getValues('firstname')}_${getValues('lastname')}_${randomStr}`
    setValue("besucherCode", newCode)
  }
  
  const handleToggleIsEditMemberCode = function () {
    setIsEditMemberCode(!isEditMemberCode)
  }

  const handleToggleIsEditBesucherCode = function () {
    setIsEditBesucherCode(!isEditBesucherCode)
  }
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
        {isEditMode ? "Edit" : "New"} Expert Member
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
        {errors.firstname?.message && <p>{errors.firstname?.message}</p>}
        {errors.lastname?.message && <p>{errors.lastname?.message}</p>}
        {errors.memberCode?.message && <p>{errors.memberCode?.message}</p>}
        {errors.besucherCode?.message && <p>{errors.besucherCode?.message}</p>}
      </ul>
    )
  }
  
  /***** Custom Components - END *****/

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

          <label className="mt-4 mb-2 block">First Name</label>
          <InputText className="w-full" id="title" autoFocus {...register('firstname', { required: "First Name is required." })}/>
          <p className="error">{errors.firstname?.message}</p>

          <label className="mt-4 mb-2 block">Last Name</label>
          <InputText className="w-full" id="title" {...register('lastname', { required: "Last Name is required." })}/>
          <p className="error">{errors.lastname?.message}</p>

          <label className="mt-4 mb-2 block">Member Code</label>
          <InputText className="w-full" id="title" disabled={!isEditMemberCode} maxLength={50} autoFocus {...register('memberCode', { required: "Member Code is required." })}/>
          <div className="flex justify-content-between  w-full">
            <Button className="p-button-secondary p-0 mt-2 text-xs" type="button" text onClick={handleGenerateMemberCode} label="Generate New Member Code" />
            <Button className="p-button-secondary p-0 mt-2 text-xs" type="button" text onClick={handleToggleIsEditMemberCode} label="Modify" />
          </div>
          <p className="error">{errors.memberCode?.message}</p>

          <label className="mt-4 mb-2 block">Besucher Code</label>
          <InputText className="w-full" id="title" disabled={!isEditBesucherCode} autoFocus {...register('besucherCode', { required: "Besucher Code is required.", maxLength: 50 })}/>
          <div className="flex justify-content-between  w-full">
            <Button className="p-button-secondary p-0 mt-2 text-xs" type="button" text onClick={handleGenerateBesucherCode} label="Generate New Besucher Code" />
            <Button className="p-button-secondary p-0 mt-2 text-xs" type="button" text onClick={handleToggleIsEditBesucherCode} label="Modify" />
          </div>
          <p className="error">{errors.besucherCode?.message}</p>

          <label className="mt-4 mb-2 hidden">Status</label>
          <InputText className="w-full" type="hidden" {...register(`status`)}/>

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
