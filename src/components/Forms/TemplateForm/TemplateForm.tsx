import { DevTool } from "@hookform/devtools";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner";
import { useForm, SubmitHandler, FieldErrors  } from 'react-hook-form';
import { FC, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog } from "primereact/confirmdialog";

// Change values below for Form Specifics
import './TemplateForm.css'
import { StorageService } from '../../../services/Storage/Storage.service'
import { ITemplate } from "../../../@types/Template";
import { TemplateService } from "../../../services/Template/Template.service";


interface IProps {
  propData?: ITemplate;
  toast:  RefObject<Toast>,
  callback: Function
}

const ProspectDetailsEdit: FC<IProps> = ({propData, toast, callback}) => {
  // variable for imports
  const navigate = useNavigate();

  // ROLE
  const ADMIN_APP_ID = 87
  const canRead: boolean = StorageService.hasPrivilege(ADMIN_APP_ID, 'read')
  const canAdd: boolean = StorageService.hasPrivilege(ADMIN_APP_ID, 'add')
  const canEdit: boolean = StorageService.hasPrivilege(ADMIN_APP_ID, 'edit')
  const canDelete: boolean = StorageService.hasPrivilege(ADMIN_APP_ID, 'delete')
  const canModify: boolean = canAdd || canEdit || canDelete
  
  const generateEmptyObjectData = ():ITemplate => {
    return {
      id: undefined,
      title: ''
    }
  }
  
  
  // variables for boolean flags
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

	// variables for data
  const { paramId } = useParams();
	const [defaultValues, setDefaultValues] = useState<ITemplate>(generateEmptyObjectData());
	const [formData, setFormData] = useState<ITemplate>(generateEmptyObjectData());


  // variables for form
  const {register, handleSubmit, formState, control, watch, getValues, setValue, reset} = useForm({defaultValues: generateEmptyObjectData()});
  const { errors, isDirty, isValid, isSubmitting } = formState;

  const onSubmit: SubmitHandler<ITemplate> = async (data) => {
    setIsLoading(true);
    if (!getValues('id')) {         // Save form
      await handleSave(data)
    } else {                        // Edit form
      await handleUpdate(data)
    }
    setTimeout(() => setIsLoading(false), 500);
  }

  const onError = (errors: FieldErrors<ITemplate>) => {
    toast.current!.show({
      severity: "error",
      summary: "Saving failed",
      detail: "Failed to save Member",
    });
  }

  /***** useEffects - START *****/

  useEffect(() => {
    if (paramId) {
      fetchDetails();   // fetch details
    }
  }, [])

  useEffect(() => {
    if (!!getValues('id')) setIsEditMode(true)
  }, [watch("id")])

  // assigns values for editMode
  useLayoutEffect(() => {
    if (propData || defaultValues.id) {        // edit mode
      const _prospect = propData ?? defaultValues
      setIsEditMode(true);
      
      toast.current!.show({
        severity: "error",
        summary: "Edit Mode",
        detail: "Something is wrong with the data",
      });
      setIsLoading(true);
      setDefaultValues(_prospect)
      setFormData(_prospect)
    }
		else {							                      // new mode
			setIsEditMode(false);
      if (!defaultValues) setDefaultValues(generateEmptyObjectData())
      setFormData(generateEmptyObjectData())
		}
  }, [defaultValues])

  /***** useEffects - END *****/


  /***** helper functions - START *****/

  let resetDefaultValues = (member: ITemplate) => {
    let data: ITemplate = member
    setValue("id", member.id) // Changes to Edit
    reset(data)
  }

  let fetchDetails = async (): Promise<ITemplate | undefined> => {
    setIsLoading(true);
    if (paramId) {
      await TemplateService.fetchTemplate(paramId)
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

  /***** helper functions - END *****/


  /***** Handle user actions - START *****/
  const handleSave = async (data: ITemplate) => {
    await TemplateService.createTemplate(data)
    .then(result => {
      if (!result.success || !result.data) {
        toast.current!.show({
          severity: "error",
          summary: "Something went wrong",
          detail: result.message,
        });
      }
      else {
        setValue("id", result.data?.id) // Change to Edit
        setDefaultValues(result.data)
        setFormData(result.data)
        toast.current!.show({
          severity: "success",
          summary: "Saved",
          detail: "Successfully saved",
        });
        resetDefaultValues(result.data)
      }
    }).catch(err => {
      toast.current!.show({
        severity: "error",
        summary: "Something went wrong",
        detail: err,
      });
    })
  };

  const handleUpdate = async (data: ITemplate) => {
    await TemplateService.editTemplate(data)
    .then(result => {
      if (result.success && result.data) {
        toast.current!.show({
          severity: "success",
          summary: "Saved",
          detail: "Edit successfully saved",
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
  };
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
        {isEditMode ? "Edit" : "New"} Template
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

  // List all errors here
  const errorList = () => {
    return (
      <ul>
        {errors.title?.message && <p>{errors.title?.message}</p>}
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

      <form className="col-12"   onSubmit={handleSubmit(onSubmit, onError)} noValidate>

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
          <InputText className="w-full" id="title" autoFocus {...register('title', { required: "Title is required." })}/>
          <p className="error">{errors.title?.message}</p>

          <br></br>
          <br></br>
          <br></br>
          <br></br>

          {errorList()}
          {SaveButton()}
        </div>
      </form>

      <DevTool control={control} />

      {isLoading && <LoadingSpinner/>}
      <Toast position="bottom-right" ref={toast} />
      <ConfirmDialog />
    </div>
  );
};

export default ProspectDetailsEdit;
