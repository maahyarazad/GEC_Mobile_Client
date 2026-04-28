import React, { useEffect, useRef, useState } from 'react'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import './MemberList.css'
import { useNavigate } from 'react-router-dom'
import { StorageService } from '../../../services/Storage/Storage.service'
import { Toolbar } from 'primereact/toolbar'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { Column } from 'primereact/column'
import { IExpertMember, IExpertTableEvent } from '../../../@types/Expert'
import { Toast } from 'primereact/toast'
import { ExpertService } from '../../../services/Expert/Expert.service'
import { Checkbox } from 'primereact/checkbox'

interface Props {

}

//Functional Component
const MemberList: React.FC<Props> = () => {
    const canRead = StorageService.hasPrivilege(86, 'read')
    const canAdd = StorageService.hasPrivilege(86, 'add')
    const canEdit = StorageService.hasPrivilege(86, 'edit')
    const canDelete = StorageService.hasPrivilege(86, 'delete')
    const canModify = canAdd || canEdit || canDelete

    const toast = useRef<Toast>(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [tableList, setTableList] = useState<IExpertMember[] | undefined>();
    const [isMemberCodeShown, setIsMemberCodeShown] = useState(true);

    let fetchTableList = async () => {
        const result = await ExpertService.fetchExpertMembers()
        .then(result => {
        if (result.success && result.data) {
            setTableList(result.data)
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
    }

    useEffect(() => {
        fetchTableList();
    }, [])

    const leftToolbarContent = () => {
        return <>
            <div className='text-lg pl-2 font-bold flex'>
                <Button
                icon={"pi pi-arrow-left text-xs"}
                className="p-button-secondary text-xs"
                onClick={() => {
                    navigate(-1);
                }}
                label="Back"
                />
                    <h3 className="m-0 mt-2 ml-4">Experts List</h3>
            </div>
        </>
    }

    const rightToolbarContent = () => {
        return <>
            <div className="flex gap-2">
                <Button type="button" icon={`pi ${isMemberCodeShown ? "pi-eye" : "pi-eye-slash"}`}
                    className="mr-1 p-button-secondary"
                    onClick={() => {setIsMemberCodeShown(!isMemberCodeShown)}}
                    label={isMemberCodeShown ? "Show Member Code" : "Hide Member Code"}/>
                <Button onClick={()=>{navigate('/experts/member/detail')}}
                    className='p-button-success text-xs'
                    icon={'pi pi-plus'}
                    label="New Expert Circle Member" />
            </div>
        </>
    }

    /* Handle User Actions - START */

    const handleMemberLink = (member: IExpertMember) => {
        navigate(`../member/detail/${member.id}`, {state: {}})
    }

    /* Handle User Actions - END */

    /* Cell Templates - START */
    const nameColumnBodyTemplate = (rowData: IExpertMember) => {
        return <div>
            <a className='partner-table-link text-blue-700 text-xs' onClick={()=> handleMemberLink(rowData)}>{rowData.firstname +' '+rowData.lastname}</a> 
        </div>
    }

    const memberCodeTemplate = (rowData: IExpertMember) => {
        return <>
            <InputText type={isMemberCodeShown ? 'password' : 'text'} value={rowData.memberCode} disabled={true} />
        </>
    }
    
    const actionTemplate = (rowData: IExpertMember) => {
        return <></>
    }

    /* Cell Templates - END */


    return (<>
        <div className="grid">
            <div className="col-12 ">
                <Toolbar className='p-2 m-0' right={rightToolbarContent} left={leftToolbarContent} />
            </div>
           
            <div className="col-12 partner-table-container">
                <DataTable
                    id="expert-events-table"
                    loading={isLoading}
                    value={tableList}
                    className="text-xs"
                    dataKey="id"
                    stripedRows
                    paginator rows={25}
                    filterDisplay="row"
                >
                    <Column field="firstname" header="Name" body={nameColumnBodyTemplate} ></Column>
                    <Column field="memberCode" header="Member Code" body={memberCodeTemplate} ></Column>
                    <Column field="besucherCode" header="Besucher Code" ></Column>
                    <Column field="" header="Actions"></Column>
                </DataTable>
            </div>
            <Toast position="bottom-right" ref={toast} />
            <ConfirmDialog />

        </div>
    </>)
}

export default MemberList