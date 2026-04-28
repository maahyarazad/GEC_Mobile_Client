import React, {
    useState,
    useImperativeHandle,
    forwardRef,
    ChangeEvent,
    FormEvent,
    useEffect,
} from "react";
import { IUserDetailForm } from "../../@types/ApprovalList";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { Dropdown , DropdownChangeEvent} from 'primereact/dropdown';
import MembershipShipRecordTable from "./MemberShipRecordTable";
import {IMembership, IOldUserMembership} from '../../../src/@types/ApprovalList'


export interface UserDetailFormData {
    remark: string;
    firstName: string;
    middleName: string;
    lastName: string;
    cardNumber: string;
    cardValidDate: string;
    birthday: string;
    gender: string;
    honorific: string;
    membership?: IMembership | null;
    old_user_membership?: IOldUserMembership[];
}



export interface UserDetailFormRef {
    getData: () => { 
        data: UserDetailFormData; 
        isValid: boolean; 
    };
    setData: (data: Partial<UserDetailFormData>) => void;
    reset: () => void;
}

interface UserDetailFormProps {
    onSubmit?: (data: UserDetailFormData) => void;
    activate: boolean;
    initialData: IUserDetailForm;
}

const formatDateForInput = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ""; // fallback for invalid date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const UserDetailForm = forwardRef<UserDetailFormRef, UserDetailFormProps>(
    ({ onSubmit, activate = false, initialData  }, ref) => {
        
        const [formData, setFormData] = useState<UserDetailFormData>({
            remark:  "",
            firstName: initialData?.first_name || "",
            middleName: initialData?.middle_name || "",
            lastName: initialData?.last_name ||"",
            cardNumber: initialData?.card_number ||"",
            cardValidDate: formatDateForInput(initialData?.card_number) || "",
            birthday: formatDateForInput(initialData?.birthdate) || "",
            gender: initialData?.gender || "",
            honorific: initialData?.honorifics || "",
            membership: initialData.membership,
            old_user_membership: initialData.old_user_membership,
        });


        // Validation state
    const [errors, setErrors] = useState<Partial<Record<keyof UserDetailFormData, string>>>({});

    const validate = (): boolean => {
      const newErrors: Partial<Record<keyof UserDetailFormData, string>> = {};

      if(activate){
        
          if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
          if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
          if (!formData.gender) newErrors.gender = "Gender is required";
          if (!formData.birthday) newErrors.birthday = "Birthday is required";
          if (!formData.cardValidDate) newErrors.cardValidDate = "Valid Card Date is required";
      }
      if (!formData.remark) newErrors.remark = "Remark is required";
      

    //   if (!formData.remark.trim()) newErrors.remark = "Remark is required";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

        const handleChange = (
            e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | DropdownChangeEvent,
            field: keyof UserDetailFormData
        ) => {
            const value =
                "value" in e ? e.value : e.target.value; // e.value for Dropdown, e.target.value for inputs
            setFormData((prev) => ({ ...prev, [field]: value }));

             // Validate field on change
            setErrors((prev) => ({ ...prev, [field]: "" }));
        };

        const handleSubmit = (e: FormEvent) => {
            e.preventDefault();
            if (onSubmit) onSubmit(formData);
        };


        useEffect(() => {
            
            setFormData((prev) => ({
                ...prev,
                gender: initialData?.gender?.toUpperCase() ?? "M", // default to "M" if undefined
            }));
        }, [initialData?.gender]);


        // ✅ Expose formData and helper functions to parent
        useImperativeHandle(ref, () => ({
     getData: () => {
        const isValid = validate(); // Run validation here
        return { data: formData, isValid }; // return both
    },
      setData: (data) => setFormData((prev) => ({ ...prev, ...data })),
      reset: () => {
        setFormData({
          remark: "",
          firstName: "",
          middleName: "",
          lastName: "",
          cardNumber: "",
          cardValidDate: "",
          birthday: "",
          gender: "",
          honorific: "",
        });
        setErrors({});
      },
    }));

        return (
            <>
            <div>
                 
                 <MembershipShipRecordTable data={initialData?.membership!}/>
               

            </div>
             <form
                    onSubmit={handleSubmit}
                    className="p-fluid grid w-full mt-2"
                >
                    <h3 className="">User Details 
                        <span style={{color: 'red'}}> *</span>
                    </h3>
                    {/* Remark */}
                    <div className="col-12">
                        <label htmlFor="remark" className="font-semibold mb-2 block">
                            Remark
                        </label>
                        <InputTextarea
                            id="remark"
                            rows={2}
                            value={formData.remark}
                            onChange={(e) => handleChange(e, "remark")}
                            className={errors.remark ? "p-invalid" : ""}
                        />
                        {errors.remark && (
                            <small className="p-error block">{errors.remark}</small>
                        )}
                    </div>

                    {activate && (
                        <>

                       
                            {/* Honorific + First Name */}
                            <div className="col-12 md:col-6">
                                <label htmlFor="honorific" className="font-semibold mb-2 block">
                                    Honorific
                                </label>
                                <InputText
                                    id="honorific"
                                    value={formData.honorific}
                                    onChange={(e) => handleChange(e, "honorific")}
                                    className={errors.honorific ? "p-invalid" : ""}
                                />
                                {errors.honorific && (
                                    <small className="p-error block">{errors.honorific}</small>
                                )}
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="firstName" className="font-semibold mb-2 block">
                                    First Name
                                                            <span style={{color: 'red'}}> *</span>
                                </label>
                                <InputText
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleChange(e, "firstName")}
                                    className={errors.firstName ? "p-invalid" : ""}
                                />
                                {errors.firstName && (
                                    <small className="p-error block">{errors.firstName}</small>
                                )}
                            </div>

                            {/* Middle + Last Name */}
                            <div className="col-12 md:col-6">
                                <label htmlFor="middleName" className="font-semibold mb-2 block">
                                    Middle Name
                                </label>
                                <InputText
                                    id="middleName"
                                    value={formData.middleName}
                                    onChange={(e) => handleChange(e, "middleName")}
                                    className={errors.middleName ? "p-invalid" : ""}
                                />
                                {errors.middleName && (
                                    <small className="p-error block">{errors.middleName}</small>
                                )}
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="lastName" className="font-semibold mb-2 block">
                                    Last Name
                                                            <span style={{color: 'red'}}> *</span>
                                </label>
                                <InputText
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleChange(e, "lastName")}
                                    className={errors.lastName ? "p-invalid" : ""}
                                />
                                {errors.lastName && (
                                    <small className="p-error block">{errors.lastName}</small>
                                )}
                            </div>

                            {/* Card Number + Gender */}
                            <div className="col-12 md:col-6">
                                <label htmlFor="cardNumber" className="font-semibold mb-2 block">
                                    Card Number
                                </label>
                                <InputText
                                    id="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={(e) => handleChange(e, "cardNumber")}
                                    className={errors.cardNumber ? "p-invalid" : ""}
                                />
                                {errors.cardNumber && (
                                    <small className="p-error block">{errors.cardNumber}</small>
                                )}
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="gender" className="font-semibold mb-2 block">
                                    Gender
                                </label>
                                <Dropdown
                                    id="gender"
                                    value={formData.gender}
                                    options={[
                                        { label: 'Male', value: 'M' },
                                        { label: 'Female', value: 'F' }
                                    ]}
                                    onChange={(e) => handleChange(e, "gender")}
                                    placeholder="Select Gender"
                                    className={errors.gender ? "p-invalid" : ""}
                                />
                                {errors.gender && (
                                    <small className="p-error block">{errors.gender}</small>
                                )}
                            </div>

                            {/* Birthday + Card Valid Date */}
                            <div className="col-12 md:col-6">
                                <label htmlFor="birthday" className="font-semibold mb-2 block">
                                    Birthday
                                                            <span style={{color: 'red'}}> *</span>
                                </label>
                                <InputText
                                    id="birthday"
                                    type="date"
                                    value={formData.birthday}
                                    onChange={(e) => handleChange(e, "birthday")}
                                    className={errors.birthday ? "p-invalid" : ""}
                                />
                                {errors.birthday && (
                                    <small className="p-error block">{errors.birthday}</small>
                                )}
                            </div>
                            <div className="col-12 md:col-6">
                                <label htmlFor="cardValidDate" className="font-semibold mb-2 block">
                                    Card Valid Date
                                                            <span style={{color: 'red'}}> *</span>
                                </label>
                                <InputText
                                    id="cardValidDate"
                                    type="date"
                                    value={formData.cardValidDate}
                                    onChange={(e) => handleChange(e, "cardValidDate")}
                                    className={errors.cardValidDate ? "p-invalid" : ""}
                                />
                                {errors.cardValidDate && (
                                    <small className="p-error block">{errors.cardValidDate}</small>
                                )}
                            </div>
                        </>
                    )}
                </form>
            </>
        );
    }
);
