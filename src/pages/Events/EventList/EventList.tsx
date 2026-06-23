import moment from 'moment'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { FilterMatchMode } from 'primereact/api'
import { Tooltip } from 'primereact/tooltip'
import { Toast } from 'primereact/toast'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IEventList } from '../../../@types/Event'
import { EventService } from '../../../services/Event/Event.services'
import './EventList.css'

interface Props {}

const EventList: React.FC<Props> = () => {
    const [webEventList, setWebEventList] = useState<IEventList[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [globalFilterValue, setGlobalFilterValue] = useState('')
    const [filters, setFilters] = useState({
        global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS },
    })
    const toastRef = useRef<Toast>(null)

    useEffect(() => {
        let isMounted = true

        const getAllWebEvents = async () => {
            try {
                const response = await EventService.getAllWebEvents();
                debugger;
                if (isMounted) setWebEventList(response)
            } catch (err) {
                if (toastRef.current) {
                    toastRef.current.show({
                        severity: 'error',
                        summary: 'Failed to load events',
                        detail: 'An error occurred while fetching events.',
                    })
                }
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        getAllWebEvents()

        return () => {
            isMounted = false
        }
    }, [])

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFilters(prev => ({ ...prev, global: { value, matchMode: FilterMatchMode.CONTAINS } }))
        setGlobalFilterValue(value)
    }

    const eventNameTemplate = (rowData: IEventList) => (
        <Link className="event-name-link" to={'detail'} state={{ id: rowData.id }}>
            {rowData.eventName}
        </Link>
    )

    // Short description shown truncated to keep row heights consistent; full text
    // is revealed on hover via a tooltip. The Tooltip is rendered alongside the
    // target inside the cell body so it reliably attaches to DataTable rows.
    const descriptionTemplate = (rowData: IEventList) => (
        <>
            <Tooltip target=".event-desc" className="custom-tooltip" autoHide={false} position='right'/>
            <span className="event-desc" data-pr-tooltip={rowData.eventDescription} data-pr-position="right">
                {rowData.eventDescription}
            </span>
        </>
    )

    const timeTemplate = (rowData: IEventList) => moment(rowData.eventTime).format('LLL')

    const tableHeader = (
        <div className="events-table-header">
            <span className="events-table-header__count">
                {webEventList.length} event{webEventList.length !== 1 ? 's' : ''}
            </span>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search events…" />
            </IconField>
        </div>
    )

    return (
        <div className="events-page">
            <Toast ref={toastRef} position="bottom-right" />

            <div className="events-page__header">
                <div>
                    <h2 className="events-page__title">Event List</h2>
                    <p className="events-page__subtitle">Web events available for the application</p>
                </div>
            </div>

            <div className="events-table-wrapper">
                <DataTable
                    id="events-table"
                    loading={isLoading}
                    value={webEventList}
                    className="text-xs"
                    dataKey="id"
                    stripedRows
                    paginator
                    rows={20}
                    rowsPerPageOptions={[10, 20, 50]}
                    filters={filters}
                    globalFilterFields={['eventName', 'eventShortDesc', 'eventPlace']}
                    header={tableHeader}
                    scrollable
                    scrollHeight="flex"
                    emptyMessage="No events found"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                >
                    <Column header="Event Name" field="eventName" body={eventNameTemplate} style={{ minWidth: '12rem' }} />
                    <Column header="Short Description" field="eventShortDesc" body={descriptionTemplate} style={{ width: '20rem', maxWidth: '20rem' }} />
                    <Column header="Location" field="eventPlace" style={{ minWidth: '10rem' }} />
                    <Column header="Date & Time" field="eventTime" body={timeTemplate} sortable style={{ minWidth: '13rem' }} />
                </DataTable>
            </div>
        </div>
    )
}

export default EventList
