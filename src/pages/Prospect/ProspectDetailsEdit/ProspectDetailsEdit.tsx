import { Button } from "primereact/button";
import "./ProspectDetailsEdit.css";
import { Toast } from "primereact/toast";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { IProspect } from "../../../@types/Prospect";
import { MultiSelect } from "primereact/multiselect";
import { StorageService } from "../../../services/Storage/Storage.service";
import { Dropdown } from "primereact/dropdown";
import { IPCategory, IPContact } from "../../../@types/Partner";
import { Controller, useForm, SubmitHandler  } from 'react-hook-form';
import LoadingSpinner from "../../../components/LoadingSpinner";
import { ProspectService } from "../../../services/Prospect/Prospect.service";
import { IStandardResponse } from "../../../@types/Response";

interface IProps {
  prop_prospect?: IProspect;
}

const ProspectDetailsEdit: React.FC<IProps> = ({prop_prospect}) => {


  const generateEmptyContact = ():IPContact => {
    return {
      id: 0,
      partnerId: 0,
      usrId: 0,
      division: '',
      salutation: '',
      firstName: '',
      secondName: '',
      email: '',
      phone: '',
      mobile: '',
      fax: '',
      language: '',
    }
  }

  const generateEmptyProspectData = ():IProspect => {
    let emptyContact = generateEmptyContact()
    return {
      id: undefined,
      title: '',
      website: '',
      address: '',
      contacts: [generateEmptyContact()]
    }
  }
  
  // variable for imports
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  
  // variables for boolean flags
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [disableSave, setDisableSave] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

	// variables for data
	const [defaultValues, setDefaultValues] = useState<IProspect>(generateEmptyProspectData());
	const [formData, setFormData] = useState<IProspect>(generateEmptyProspectData());
  const [selectedPartnerCategory, setSelectedPartnerCategory] = useState<IPCategory>();
  const [categories, setCategories] = useState<IPCategory[]>();

  
  // variables for form
  const {register, handleSubmit, formState: {errors}} = useForm({defaultValues: generateEmptyProspectData()});
  const onSubmit: SubmitHandler<IProspect> = async (data) => {
    console.log('submit', data)
    setIsLoading(true);
    // If user is making new Prospect
    if (true) {
      await handleSave(data)
    } else {
      await handleUpdate(data)
    }
    setTimeout(() => setIsLoading(false), 500);
  }

  // Initial values
  useEffect(() => {
    setCategories(StorageService.retrievePartnerCategories())
  }, []);

  /***** useEffects - START *****/
  // useEffect to assign initial value
  // assigns values for editMode
  useLayoutEffect(() => {
    if (prop_prospect || defaultValues.id) {        // edit mode
      const _prospect = prop_prospect ?? defaultValues
      setIsEditMode(true);
      // TODO: fetch data
      // TODO: assign data to setProspect
      
      toast.current!.show({
        severity: "error",
        summary: "Edit Mode",
        detail: "Something is wrong with the data",
      });
      setIsLoading(true);
      setDefaultValues(_prospect)
      setFormData(_prospect)
    }
		else {							// new mode
			setIsEditMode(false);
      if (!defaultValues) setDefaultValues(generateEmptyProspectData())
      setFormData(generateEmptyProspectData())
		}
  }, [defaultValues])
  
  // useEffect for hasChanges
  useLayoutEffect(() => {
    if (true) {       // same as initial data
      setHasChanges(false)
    } else {          // data has changes
      setHasChanges(true)
    }
  }, [formData])

  // useEffect for disableSave
  useLayoutEffect(() => {
    if (true) {       // has changes
      setDisableSave(false)
    } else {          // same as initial data
      setDisableSave(true)
    }
  }, [hasChanges])
  /***** useEffects - START *****/


  /***** helper functions - START *****/
  const toastError = (error: any) => {
    toast.current!.show({
      severity: "error",
      summary: "Bad Request",
      detail: error.message,
    });
  }
  /***** helper functions - END *****/


  /***** Handle user actions - START *****/
  const handleSave = async (data: IProspect) => {
    const result = await ProspectService.createProspect(data);

    if (!result.success) {
      toastError(result)
    } else {
      console.log(result)
      if (!result  || !result.data) {
        toast.current!.show({
          severity: "error",
          summary: "Something went wrong",
          detail: "Could not determine if data has been saved.",
        });
        return;
      }
      else {
      toast.current!.show({
        severity: "success",
        summary: "Saved",
        detail: "New prospect successfully saved",
      });

      // Change to edit mode
      console.log('change dit mode', isEditMode)
      setDefaultValues(result.data)
      setFormData(result.data)
      console.log('change dit mode', isEditMode)
    }
    }

    // TODO: disable all or change to Update

  };

  const handleUpdate = async (data: IProspect) => {
  };

  const handleAddAnotherContact = () => {
    const _contacts = formData.contacts
    _contacts.push(generateEmptyContact())
    setFormData(prevFormData => ({...prevFormData, contacts: _contacts}))
  }
  /***** Handle user actions - END *****/


  /***** Custom Components - START *****/
  const SaveButton = (classes: string = '') => {
    return (
      <Button
        disabled={disableSave}
        // onClick={}
        icon={`pi pi-save`}
        label="Save"
        type="submit"
        className={"p-button-success text-xs " + classes}
      />
    )
  }

  const leftContents = () => {
    return (
      <div className="pl-2 font-bold text-2xl">
        {isEditMode ? "Edit" : "New"} Prospect
      </div>
    );
  };

  const rightContents = () => {
    return (
      <div className="flex gap-2 justify-content-end">
        <div>
          {SaveButton()}
        </div>
      </div>
    );
  };

  const contactPersonEl = (person: IPContact, index: number) => {
    return (
      <div key={index}>
        <hr></hr>
        <label className="mt-4 mb-2 block">First Name</label>
        <InputText className="w-full" {...register(`contacts.${index}.firstName`)}/>

        <label className="mt-4 mb-2 block">Last Name</label>
        <InputText className="w-full" {...register(`contacts.${index}.secondName`)}/>

        <label className="mt-4 mb-2 block">Job Title</label>
        <InputText className="w-full" {...register(`contacts.${index}.division`)}/>

        <label className="mt-4 mb-2 block">Mobile Number</label>
        <InputText className="w-full" {...register(`contacts.${index}.mobile`)}/>

        <label className="mt-4 mb-2 hidden">Phone Number</label>
        <InputText className="w-full" type="hidden" {...register(`contacts.${index}.phone`)}/>

        <label className="mt-4 mb-2 block">Email</label>
        <InputText className="w-full" {...register(`contacts.${index}.email`)}/>

        <label className="mt-4 mb-2 hidden">salutation</label>
        <InputText className="w-full" type="hidden" {...register(`contacts.${index}.salutation`)}/>
        
        <label className="mt-4 mb-2 hidden">division</label>
        <InputText className="w-full" type="hidden" {...register(`contacts.${index}.division`)}/>
        
        <label className="mt-4 mb-2 hidden">Fax</label>
        <InputText className="w-full" type="hidden" {...register(`contacts.${index}.fax`)}/>
        
        <label className="mt-4 mb-2 hidden">Language</label>
        <InputText className="w-full" type="hidden" {...register(`contacts.${index}.language`)}/>

        <br></br>
        <br></br>
      </div>
    );
  };

  // List all errors here
  const errorList = () => {
    const _errors = errors;
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

      <form className="col-12"   onSubmit={handleSubmit(onSubmit)}>

        <div className="col-12">
          <Toolbar
            left={leftContents}
            right={rightContents}
            className="p-2 m-0"
          />
        </div>

        <div className="col-12">

          <label className="mt-4 mb-2 block">Company Name *</label>
          <InputText className="w-full" id="title" autoFocus {...register('title', { required: "Company name is required." })}/>
          <p>{errors.title?.message}</p>

          <label className="mt-4 mb-2 block">Industry</label>
          <Dropdown
            value={selectedPartnerCategory}
            panelClassName="text-xs"
            className="w-full "
            onChange={(e: { value: IPCategory }) => {
              setSelectedPartnerCategory(e.value);
            }}
            placeholder="Select an Industry"
            options={categories}
            optionLabel="pcategory_en"
          />

          <label className="mt-4 mb-2 block">Website URL</label>
          <InputText className="w-full" {...register('website')}/>

          <label className="mt-4 mb-2 block">Office Address</label>
          <InputText className="w-full" {...register('address')}/>

          <br></br>
          <br></br>
          <br></br>

          <h3>Contact Persons</h3>
          { formData?.contacts?.map((person, index) => {
            return contactPersonEl(person, index)
          }) }

          <Button label="Add another contact person" text type="button" className="mt-4 w-full text-center block" onClick={() => {console.log('clicked'); handleAddAnotherContact()}}></Button>

          <br></br>
          <br></br>
          <br></br>
          <br></br>

          {errorList()}
          {SaveButton("w-full")}
        </div>
      </form>

      {isLoading && <LoadingSpinner/>}
      <Toast position="bottom-right" ref={toast} />
      <ConfirmDialog />
    </div>
  );
};

export default ProspectDetailsEdit;
