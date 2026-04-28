import moment from 'moment'
import { Column } from 'primereact/column'
import { DataTable, DataTableStateEvent,  } from 'primereact/datatable'
import { Dropdown, DropdownChangeEvent,  } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { PaginatorTemplate } from 'primereact/paginator'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import React, { EventHandler, ReactEventHandler, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IEventList } from '../../../@types/Event'
import { EventService } from '../../../services/Event/Event.services'
import './EventList.css'

interface Props {

}

//Functional Component
const EventList: React.FC<Props> = () => {
    const [appEventList, setAppEventList] = useState<IEventList[]>([])
    const [webEventList, setWebEventList] = useState<IEventList[]>([])
    const [rows2, setRows2] = useState(10);
    const [first2, setFirst2] = useState(0);
    const toastRef = useRef<Toast>(null)
    const navigate = useNavigate();
    
    useEffect(() => {
      let isMounted = true;

        const getAllWebEvents = async () => {
            try {

                const response = await EventService.getAllWebEvents();
                if(isMounted){
                    setWebEventList(response)
                }
                // console.log(response)
                
            } catch (err) {
                alert('Error occured while fetching events.')
            }
        }

        const getAllAppEvents = async () => {
            try {

                const response = await EventService.getAllAppEvents();
                if(isMounted){
                    setAppEventList(response.reverse())
                }
                // console.log(response)
                
            } catch (err) {
                alert('Error occured while fetching events.')
            }
        }
        

        getAllWebEvents();
        // getAllAppEvents();
    
      return () => {
        isMounted = false;
      }
    }, [])
    
    const onCustomPage2 = (event: DataTableStateEvent) => {
        setFirst2(event.first);
        setRows2(event.rows);
    }

    const renderToolbarLeft = () => {
        return <>
            <div className='font-bold white-space-nowrap overflow-hidden text-overflow-ellipsis'>
                <span className='text-lg'>Event List</span>
            </div>
        </>
    }
    
    const columnTimeBody = (e: IEventList) => {
        const timeDate = new Date('2022-11-23T12:00:00.000Z');
        console.log("TIME DATE: ", timeDate.toUTCString())
        const newTimeDate = new Date(`${timeDate.toUTCString()}+4`)
        console.log(newTimeDate.toUTCString())

        return <>
            {/* {e.eventTime} */}
            
            {moment(e.eventTime).format('LLL')}
            {/* {moment(e.eventTime).format("LLL")} */}
        </>
    }

    const template2: any = {
        layout: 'RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink',
        'RowsPerPageDropdown': (options: any) => {
            const dropdownOptions = [
                { label: 10, value: 10 },
                { label: 20, value: 20 },
                { label: 50, value: 50 }
            ];

            return (
                <React.Fragment>
                    <span className="mx-1" style={{ color: 'var(--text-color)', userSelect: 'none' }}>Items per page: </span>
                    <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />
                </React.Fragment>
            );
        },
        'CurrentPageReport': (options: any) => {
            return (
                <span style={{ color: 'var(--text-color)', userSelect: 'none', width: '120px', textAlign: 'center' }}>
                    {options.first} - {options.last} of {options.totalRecords}
                </span>
            )
        },
        
    };

    const rowClass = () => { 
        return {
            "event-item": true,
        }
    }

    const handleOnSelect = (rowData: IEventList) => {

        return <>
            <Link to={'detail'} state={{id: rowData.id}}>{rowData.eventName}</Link>
        </>
    }

    const onSelectWebEvent = async (e: DropdownChangeEvent) => {
        // const sample: IEventList = e.value
        console.log('value is ', e.value)

        try {
            if(toastRef && toastRef.current){

            
            const response = await EventService.migrateEvent(e.value);
            if(!response){
                
                    toastRef.current.show({
                        severity: 'error',
                        summary: "Migration Failed",
                        detail: "Could not migrate event to App"
                    })
                    return;
            }
            
                toastRef.current.show({
                    severity: 'success',
                    summary: "Migration Success",
                    detail: "Event migrated to App"
                })
            }
        } catch (err) {
            if(toastRef && toastRef.current)
            toastRef.current.show({
                severity: 'error',
                summary: "Migration Failed",
                detail: "Could not migrate event to App"
            })
            
        }
        
    }

    const renderHeader = () => {
        return <>
            <div className='flex gap-2'>
                <span className="w-3 p-input-icon-left flex gap-2 partner-list">
                    
                    <InputText className='text-xs w-full' 
                                // value={globalFilterValue} 
                                // onChange={onGlobalFilterChange} 
                                placeholder="Event Search" />
                </span>
            {/* <MultiSelect 
                        // disabled={selectedApp===null || selectedApp === undefined} 
                        maxSelectedLabels={2}
                        className='w-4 text-left'
                        dataKey='id' 
                        filter 
                        placeholder='Select Event to Migrate to App' 
                        // value={selectedPartners}
                        options={webEventList} 
                        // panelFooterTemplate={partnerMultiFooter} 
                        onChange={onSelectWebEvent} 
                        // onChange={onSelectWebEvent} 
                        panelClassName={'w-30rem partner-list'}
                        optionLabel={'eventName'} 
                        optionValue={'id'}/> */}
                        
                        {/* <Dropdown
                            className='w-4 text-left'
                            dataKey='id' 
                            filter 
                            placeholder='Select Event to Migrate to App' 
                            onChange={onSelectWebEvent} 
                            options={webEventList}
                            optionLabel={'eventName'} 
                            optionValue={'id'}
                        /> */}
            </div>
        </>
    }

    return (<>
       <Toolbar left={renderToolbarLeft}/>
       <div className='events-table-container'>
            <DataTable  
                        header={renderHeader}
                        rowClassName={rowClass}
                        value={webEventList}
                        paginator 
                        paginatorTemplate={template2} 
                        first={first2} 
                        rows={rows2} 
                        onPage={onCustomPage2} 
                        responsiveLayout="scroll">
                <Column header="Event Name" 
                        field='eventName'
                        body={handleOnSelect}
                        className='w-3'>
                </Column>
                <Column header="Short Description" 
                        field='eventDescription'
                        className='w-4'>
                </Column>
                <Column header="Location" 
                        field='eventPlace'
                        className='w-3'>        
                </Column>
                <Column header="Date & Time" 
                        field='eventTime' 
                        className='w-2'
                        body={columnTimeBody}>
                </Column>
            </DataTable>
            <Toast ref={toastRef} position={'bottom-right'}/>
       </div>
        
    </>)
}

export default EventList