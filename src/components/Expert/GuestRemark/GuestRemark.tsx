import { FC, useEffect, useRef } from "react"
import { IExpertGuest } from "../../../@types/Expert";
import { FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ExpertService } from "../../../services/Expert/Expert.service";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";


interface Props {
    guest: IExpertGuest,
    toast:  React.RefObject<Toast>,
    callback: Function
}

const RemarkComponent: FC<Props> = ({guest, toast, callback}) => {

    const {register, handleSubmit, formState, control, watch, getValues, setValue, reset} = useForm<IExpertGuest>({defaultValues: guest});
    const { isDirty, 
        isSubmitting } = formState;

    const onSubmit: SubmitHandler<IExpertGuest> = async (data) => {
        const result = await ExpertService.editExpertEventGuest(data)
        .then(result => {
        if (result.success && result.data) {
            toast.current!.show({
            severity: "success",
            summary: "Saved",
            detail: result.message,
            });
            reset(result.data);
            callback(result.data);
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

    const onError = (errors: FieldErrors<IExpertGuest>) => {
        console.log('Error occured on submit. ', errors)
    }

    useEffect(()=>{
        return ()=> {
            console.log('before mount.')
        }
     },[])

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="flex gap-2 flex-wrap" >
                <InputTextarea id="title" autoFocus {...register('remarks', { required: "Title is required." })}/>
                { isDirty && <Button
                    disabled={!isDirty || isSubmitting}
                    label="Save"
                    type="submit"
                    className={`p-button-success`}
                /> }
            </form>
        </>
    );
}

export default RemarkComponent