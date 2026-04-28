import React from 'react'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import './ProspectList.css'
import { useNavigate } from 'react-router-dom'
import { StorageService } from '../../../services/Storage/Storage.service'
import { Toolbar } from 'primereact/toolbar'
import { Button } from 'primereact/button'

interface Props {

}

//Functional Component
const PartnerList: React.FC<Props> = () => {
    const canRead = StorageService.hasPrivilege(87, 'read')
    const canAdd = StorageService.hasPrivilege(87, 'add')
    const canEdit = StorageService.hasPrivilege(87, 'edit')
    const canDelete = StorageService.hasPrivilege(87, 'delete')
    const canModify = canAdd || canEdit || canDelete

    const navigate = useNavigate();

    const leftToolbarContent = () => {
        return <>
            <div className='text-lg pl-2 font-bold'>
               Prospect Partner Listing
            </div>
        </>
    }

    const rightToolbarContent = () => {
        return <>
            <div className="flex gap-2">
                <Button onClick={()=>{navigate('/prospects/new')}}
                    className='p-button-success text-xs'
                    icon={'pi pi-plus'}
                    label="New Prospect" />
            </div>
        </>
    }

    return (<>
        <div className="grid">
            <div className="col-12 ">
                <Toolbar className='p-2 m-0' right={rightToolbarContent} left={leftToolbarContent} />
            </div>
           
            <div className="col-12 partner-table-container">
               
            </div>
            <ConfirmDialog />
        </div>
    </>)
}

export default PartnerList