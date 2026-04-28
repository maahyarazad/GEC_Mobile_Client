import { FilterMatchMode } from 'primereact/api'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Toolbar } from 'primereact/toolbar'
import React, { useContext, useEffect, useState } from 'react'
import { IApp } from '../../../@types/AppInfo'
import { IPartner } from '../../../@types/Partner'
import { PartnerService } from '../../../services/Partner/Partner.service'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import './PartnerList.css'
import { useNavigate } from 'react-router-dom'
import { AppInfoContext } from '../../../services/AppInfo/AppInfo.context'
import AppListDropdown from '../../../components/Applist/AppListDropdown'
import { InputNumber } from 'primereact/inputnumber'
import { StorageService } from '../../../services/Storage/Storage.service'

interface Props {

}

//Functional Component
const PartnerList: React.FC<Props> = () => {

    // const canRead = StorageService.hasPrivilege(76, 'read')
    // const canAdd = StorageService.hasPrivilege(76, 'add')
    // const canEdit = StorageService.hasPrivilege(76, 'edit')
    // const canDelete = StorageService.hasPrivilege(76, 'delete')
    const canRead = true;
    const canAdd = true;
    const canEdit = true;
    const canDelete = true;

    const canModify = canAdd || canEdit || canDelete

    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [partnerList, setPartnerList] = useState<IPartner[]>()
    const [selectedApp, setSelectedApp] = useState<IApp | null>(null)
    const [selectedPartners, setSelectedPartners] = useState<IPartner[] | null>()
    const [prevPartners, setPrevPartners] = useState<IPartner[] | null>()
    const [refinePrevPartners, setRefinePrevPartners] = useState<{id: number, op: number}[]>()
    const [modifiedPartners, setModifiedPartners] = useState<{id: number, op: number}[] | null>()
    const { appList } = useContext(AppInfoContext)
    const navigate = useNavigate();

    useEffect(() => {
        populate(); 
        initFilter();
    }, [])

    useEffect(()=>{
        setSelectedApp(appList != undefined ? appList[1] : '') // set default to GEC
    }, [appList])
    
    useEffect(() => {
        if(selectedApp !== null && selectedApp !== undefined){
        PartnerService.getPartnersByApp(selectedApp.id)
        .then(result => {
            const prevPartners = result.map(partner => { return  {id: partner.id, op: 0} })
            setSelectedPartners(result)
            setPrevPartners(result)
            setRefinePrevPartners(prevPartners);
        }).catch(err=>{
            console.log(err)
        })

        PartnerService.getAllPartnersByApp(selectedApp.id)
        .then(result=>{
            setPartnerList(result)
        })
    }
    }, [selectedApp])

    useEffect(() => {
      
        if(refinePrevPartners !== null && refinePrevPartners !== undefined && 
            selectedPartners !== null && selectedPartners !== undefined &&
            selectedApp !== null && selectedApp !== undefined){
            
        let modified;
        const refineSelectedPartner = selectedPartners.map(partner =>{ return {id: partner.id, op: 0}})
        
        // Find added entries
         modified = refineSelectedPartner.filter( partner => {
            return !refinePrevPartners.some( prev => partner.id === prev.id)
         })
        // Add indicator
        modified.map((newPartner)=>{
            return newPartner.op = 1;
        })

        //Find & Join removed entry
        modified = modified.concat(refinePrevPartners.filter( prev => {
            return !selectedPartners.some( partner => partner.id === prev.id)
         }))

            setModifiedPartners(modified)
        }

      
    }, [selectedPartners])
    


    const populate = async () => {

        setLoading(false)
    }
    

    const initFilter = () => {
        setFilters({
            'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
        });
        setGlobalFilterValue('');
    }

    
    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value;
        let _filter1 = { ...filters };
        _filter1['global'].value = value;
        
        setFilters(_filter1);
        setGlobalFilterValue(value);
    }
    
    const clearFilter = async () => {
        setLoading(true)
        await initFilter();
        setSelectedApp(null);
        setSelectedPartners(null);
        setLoading(false)
    }
    
    const onSelectApp = async (e: any) => {
        setSelectedApp(e.value)
    }
    
    const onSelectPartners = async (e: {value: IPartner[]}) => {
        setSelectedPartners(e.value.reverse())
    }

    const confirmRevert = () => {
        confirmDialog({
            message: 'Are you sure you want to revert your changes?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => handleRevert(),
            reject: () => {},
        })
    }

    const confirmUpdate = () => {
        confirmDialog({
            message: 'Are you sure you want to update the records?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => handleUpdate(),
            reject: () => {},
        })
    }
    
    const handleUpdate = () => {
        if(selectedApp !== null && selectedApp !== undefined &&
            modifiedPartners !== null && modifiedPartners !== undefined &&
            prevPartners !== null && prevPartners !== undefined){
                const data = { changes: modifiedPartners, app_id: selectedApp.id}
                PartnerService.updateAssignedPartners(data)

                setPrevPartners(prevPartners)
                setModifiedPartners(null)
        }
    }

    const handleRevert = () => {
        if(refinePrevPartners !== null && refinePrevPartners !== undefined){
            setSelectedPartners(prevPartners)
        }
    }
    
    const leftToolbarContent = () => {
        return <>
            <div className='text-lg pl-2 font-bold'>
               Partner Listing
            </div>
        </>
    }
    const rightToolbarContent = () => {
        return <>
            <div className="flex gap-2">
                { canRead && <Button onClick={()=>{navigate('/category/partner')}} 
                        className='p-button-secondary text-xs' 
                        icon={'pi pi-sliders-h'} 
                        label={ canModify ? "Manage Partner Categories" : "Partner Categories"} />
                }
                
                { canEdit && <Button disabled={modifiedPartners === null || modifiedPartners === undefined || modifiedPartners.length === 0 } 
                        className='p-button-secondary bg-gray-500 border-gray-500 text-xs' 
                        icon={'pi pi-refresh'} 
                        onClick={confirmRevert} 
                        label="Revert" /> }

                { canEdit && <Button disabled={modifiedPartners === null || modifiedPartners === undefined || modifiedPartners.length === 0 } 
                        className='p-button-success text-xs' 
                        onClick={confirmUpdate} 
                        icon={'pi pi-save'} 
                        label="Update" /> }
            </div>
        </>
    }

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex gap-2 partner-list">
                    <i className="pi pi-search" style={{marginLeft: '0.5rem'}}/>
                    <InputText className='text-xs'
                                style={{paddingLeft: '2rem'}}
                                value={globalFilterValue} 
                                onChange={onGlobalFilterChange} 
                                placeholder="Partner Search" />
                    <div className="w-12rem">
                        <AppListDropdown dropdownChange={onSelectApp} selectedApp={selectedApp}/>
                    </div>
                    <MultiSelect disabled={selectedApp===null || selectedApp === undefined} 
                                maxSelectedLabels={2}
                                className='w-12rem text-left'
                                dataKey='id' 
                                filter 
                                placeholder='Select Partners' 
                                value={selectedPartners}
                                options={partnerList} 
                                panelFooterTemplate={partnerMultiFooter} 
                                onChange={onSelectPartners} 
                                panelClassName={'w-30rem partner-list'}
                                optionLabel={'title'} />
                </span>
                    <div className='flex align-items-center'>
                        <div className='mr-4'>
                            {
                                selectedPartners != undefined &&
                                    <label className='text-sm'>
                                        # of Partners w/ Active Offer(s): {selectedPartners!.filter(partner => 
                                        {
                                            return partner.active_offer_count != undefined && partner.active_offer_count > 0
                                        }   
                                        ).length}
                                    </label>
                            }
                        </div>
                        
                        <Button type="button" 
                            icon="pi pi-filter-slash" 
                            label="Clear" 
                            className="p-button-outlined text-xs py-1 m-1" 
                            onClick={clearFilter} />
                    </div>
                    
            </div>
        )
    }

    const partnerMultiFooter = () => {
        return <>
                <div className='bg-gray-200 py-2 px-4 text-sm flex justify-content-between'>
                   <span> <strong>{ selectedPartners !== null && 
                                selectedPartners !== undefined ? 
                                selectedPartners.length : 0 }</strong> partner(s) selected</span>
                   <span> <strong>Total Partners: { partnerList != undefined ? partnerList.length : 0 }</strong></span>
                </div>
            </>
    }

    const handlePartnerLink  = (partner: IPartner) => {
        navigate('detail', {state: {app: selectedApp, partner: partner}})
    }

    const partnerColumnBodyTemplate = (rowData: IPartner) => {
        return <>
            <div>
               <a className='partner-table-link text-blue-700 text-xs' onClick={()=> handlePartnerLink(rowData)}>{rowData.title}</a> 
            </div>
        </>
    }

    const mainBranchColumnBodyTemplate = (rowData: IPartner) => {
        return <>
            {rowData.main_branch != undefined ? rowData.main_branch : `---`}
        </>
    }
    const pinColumnBodyTemplate = (rowData: IPartner) => {
        return <>
            {rowData.merchant_pin != undefined ? rowData.merchant_pin.toString().padStart(6, "0") : `---`}
        </>
    }


    const header = renderHeader();

    return (<>
        <div className="grid">
            <div className="col-12 ">
                <Toolbar className='p-2 m-0' right={rightToolbarContent} left={leftToolbarContent}>
                    
                </Toolbar>
            </div>
           
            <div className="col-12 partner-table-container">
                <DataTable style={{fontSize: 10}} 
                            value={selectedPartners ? selectedPartners : []}  
                            globalFilterFields={['pcategory_en', 'title']} 
                            filterDisplay={'menu'} 
                            columnResizeMode='fit'  
                            scrollHeight='flex' 
                            filters={filters} 
                            loading={loading} 
                            header={header} 
                            dataKey={'id'} 
                            showGridlines 
                            scrollable 
                            responsiveLayout='scroll'>

                    <Column field="title" body={partnerColumnBodyTemplate} header="Partner/Outlet Name" sortable></Column>
                    <Column field="main_branch" body={mainBranchColumnBodyTemplate} style={{maxWidth: '20%'}} header="Main Branch" sortable></Column>
                    <Column field="merchant_pin" body={pinColumnBodyTemplate} header="PIN" style={{maxWidth: '10%'}} ></Column>
                    <Column field="active_offer_count" header="Active Partner Offers" style={{maxWidth: '15%'}} sortable ></Column>
                    <Column field="pcategory_en" header="Category" style={{maxWidth: '15%'}}></Column>

                </DataTable>
            </div>
            <ConfirmDialog />
        </div>
    </>)
}

export default PartnerList