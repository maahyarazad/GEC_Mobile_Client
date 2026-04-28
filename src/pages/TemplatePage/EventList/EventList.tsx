import React, { useEffect, useRef, useState } from 'react'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import './EventList.css'
import { useNavigate } from 'react-router-dom'
import { StorageService } from '../../../services/Storage/Storage.service'
import { Toolbar } from 'primereact/toolbar'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { InputText } from 'primereact/inputtext'
import { Column } from 'primereact/column'
import { IExpertEvent, IExpertTableEvent, IResponseExpertEvents } from '../../../@types/Expert'
import { Toast } from 'primereact/toast'
import { ExpertService } from '../../../services/Expert/Expert.service'
import { Checkbox } from 'primereact/checkbox'

interface Props {

}

//Functional Component
const EventList: React.FC<Props> = () => {
    const canRead = StorageService.hasPrivilege(87, 'read')
    const canAdd = StorageService.hasPrivilege(87, 'add')
    const canEdit = StorageService.hasPrivilege(87, 'edit')
    const canDelete = StorageService.hasPrivilege(87, 'delete')
    const canModify = canAdd || canEdit || canDelete

    const toast = useRef<Toast>(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [eventsList, setEventsList] = useState<IExpertTableEvent[] | undefined>();

    let fetchEvents = async () => {
        const result = await ExpertService.fetchExpertEventList()
        .then(result => {
          if (result.success && result.data) {
            setEventsList(result.data)
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
        fetchEvents();
    }, [])
    
    const leftToolbarContent = () => {
        return <>
            <div className='text-lg pl-2 font-bold'>
               Experts Event List
            </div>
        </>
    }

    const rightToolbarContent = () => {
        return <>
            <div className="flex gap-2">
                <Button onClick={()=>{navigate('/experts/members')}}
                    className='p-button-secondary text-xs'
                    icon={'pi pi-sliders-h'}
                    label="Manage Circle Members"/>
                <Button onClick={()=>{navigate('/experts/detail')}}
                    className='p-button-success text-xs'
                    icon={'pi pi-plus'}
                    label="New Experts Event" />
            </div>
        </>
    }

    const handleEventGuests  = (event: IExpertTableEvent) => {
        navigate(`guests/${event.id}`, {state: {}})
    }

    const registeredTemplate = (rowData: IExpertTableEvent) => {
        console.log('rowData.registeredCount: ', rowData.registeredCount)
        return <a className='partner-table-link text-blue-700 text-xs' onClick={()=> handleEventGuests(rowData)}>{rowData.registeredCount}</a> 
    }

    const availableSlotsTemplate = (rowData: IExpertTableEvent) => {
        return <a className='partner-table-link text-blue-700 text-xs' onClick={()=> handleEventGuests(rowData)}>{rowData.maxAttendees - rowData.registeredCount}</a> 
    }

    const handleEventLink  = (event: IExpertEvent) => {
        navigate(`detail/${event.id}`, {state: {}})
    }

    const titleColumnBodyTemplate = (rowData: IExpertEvent) => {
        return <div>
            <a className='partner-table-link text-blue-700 text-xs' onClick={()=> handleEventLink(rowData)}>{rowData.title}</a> 
        </div>
    }

    let handleToggleIsPublished = async (event: IExpertEvent) => {
        setIsLoading(true)
        const status = event.status == "0" ? "1" : "0";

       const result = await ExpertService.updateExpertEventStatus(event.id as string, status as string)
       .then(result => {
            if (result.success && result.data) {
                const newEventValues = result.data

                if (eventsList) {
                    const newEventsList = eventsList.map((event: IExpertTableEvent) => {
                        if (event.id == newEventValues.id) {
                            console.log('updating this value. event.id: ', event)
                            return newEventValues;
                        } else {
                            return event;
                        }
                    })
                    console.log('new values: ', newEventsList)

                    setEventsList(newEventsList)
                    toast.current!.show({
                        severity: "success",
                        summary: "Saved",
                        detail: "Event successfully updated",
                    });
                }
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

    const actionTemplate = (rowData: IExpertEvent) => {
        return <Checkbox type="checkbox" checked={rowData.status == '1' ? true : false }
            onClick={() => handleToggleIsPublished(rowData)}/>
    }

    return (<>
        <div className="grid">
            <div className="col-12 ">
                <Toolbar className='p-2 m-0' right={rightToolbarContent} left={leftToolbarContent} />
            </div>
           
            <div className="col-12 partner-table-container">
                <DataTable
                    id="expert-events-table"
                    loading={isLoading}
                    value={eventsList}
                    className="text-xs"
                    dataKey="id"
                    stripedRows
                    sortField="dateSubmitted" sortOrder={-1}
                    paginator rows={10}
                    globalFilterFields={['name', 'positionOptions']}
                    filterDisplay="row"
                >
                    <Column field="title" header="Title" body={titleColumnBodyTemplate} ></Column>
                    <Column body={registeredTemplate} header="Registered" ></Column>
                    <Column body={availableSlotsTemplate} header="Status" ></Column>
                    <Column field="place" header="Location"></Column>
                    <Column field="eventTime" header="Schedule"></Column>
                    <Column field="registrationStart" header="Registration Start"></Column>
                    <Column field="registrationEnd" header="Registration End"></Column>
                    <Column body={actionTemplate} header="Published" ></Column>
                </DataTable>
            </div>
            <Toast position="bottom-right" ref={toast} />
            <ConfirmDialog />

        </div>
    </>)
}

export default EventList