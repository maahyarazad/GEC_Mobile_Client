import React, { useEffect, useRef, useState } from 'react'
import { ConfirmDialog } from 'primereact/confirmdialog'
import './GuestList.css'
import { useNavigate, useParams } from 'react-router-dom'
import { StorageService } from '../../../services/Storage/Storage.service'
import { Toolbar } from 'primereact/toolbar'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { IExpertEvent, IExpertGuest, IExpertTableEvent } from '../../../@types/Expert'
import { Toast } from 'primereact/toast'
import { ExpertService } from '../../../services/Expert/Expert.service'
import { Checkbox } from 'primereact/checkbox'
import RemarkComponent from '../../../components/Expert/GuestRemark'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Props {

}

//Functional Component
const GuestList: React.FC<Props> = () => {
    const canRead = StorageService.hasPrivilege(87, 'read')
    const canAdd = StorageService.hasPrivilege(87, 'add')
    const canEdit = StorageService.hasPrivilege(87, 'edit')
    const canDelete = StorageService.hasPrivilege(87, 'delete')
    const canModify = canAdd || canEdit || canDelete

    const toast = useRef<Toast>(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [guestList, setGuestList] = useState<IExpertGuest[]>();
    const [title, setTitle] = useState<string>();

    const { eventId } = useParams();

    let fetchGuests = async () => {
        if (eventId) {
            setIsLoading(true);

            const result = await ExpertService.fetchExpertEventGuests(eventId)
            .then(result => {
            if (result.success && result.data) {
                setGuestList(result.data)
                setTitle(result.message)

                result.data.forEach(guest => {
                    if (guest.paymentStatus == "PENDING") {
                        setTimeout(fetchGuests, 3000);
                        return
                    }
                })
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
    }

    useEffect(() => {
        fetchGuests();
    }, [])

    const refreshRowData = (newData: IExpertGuest) => {
        console.log('updating row with new data: ', newData)
        let result = guestList;
        if (!result || result.length == 0) return;
        result = result?.map(guest => {
            return guest.id != newData.id ?  guest : newData;
        })
        setGuestList(result)
    }

    /***** Handle user actions - START *****/

    const handleEventGuests  = (event: IExpertTableEvent) => {
        navigate(`guests/${event.id}`, {state: {}})
    }
    
    const handleEventLink  = (event: IExpertEvent) => {
        navigate(`detail/${event.id}`, {state: {}})
    }


    // const cols = [
    //     { field: "firstname", header: 'firstname'}

    // ]

    // const exportColumns = cols.map(col => {
    //     firstname: col.header
    // })

    const handleExportExcel = () => {
        import("xlsx").then(xlsx => {
            // const workSheet = xlsx.utils.json_to_sheet(guestList);
            // const workBook = { Sheets: {data: workSheet}, SheetNames: ["data"]}
            // const excelBuffer = xlsx.write(workBook, {
            //     bookType: "xlsx",
            //     type: "array"
            // });
            // import("file-saver").then(FileSaver => {
            //     let EXCEL_TYPE="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
            //     let fileName = "guests"
            //     let EXCEL_EXTENSION = ".xlsx";
            //     const data = new Blob([excelBuffer], {
            //         type: EXCEL_TYPE
            //     })
            //     FileSaver.saveAs(data, fileName + "_export_"+new Date().getTime()+EXCEL_EXTENSION)
            // })
        })
    }

    const handleExportPDF = () => {
                const doc = new jsPDF('l', "in");

                let data: any[] = []
                guestList?.forEach(guest => {
                    data.push(['', guest.datepaid ? 'Paid' : '', guest.firstname + ' ' + guest.lastname, guest.mobile, guest.whatsapp, guest.email, guest.referedBy, guest.remarks])
                })

                autoTable(doc, {
                    head: [["Attendance", "Paid", "Name", "Mobile", "Whatsapp", "Email", "Referred By", "Remarks"]],
                    body: data
                });

                // autoTable(doc, {
                //     head: [["Name"]],
                //     body: [["Vince"]]
                // });
                doc.save("guests.pdf")
    }
    
    /***** Handle user actions - END *****/
    
    
    /***** Custom Components - END *****/
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
                    <h3 className="m-0 mt-2 ml-4">{title}</h3>
            </div>
        </>
    }

    const rightToolbarContent = () => {
        return <>
            <div className="flex gap-2">
                {/* <Button onClick={handleExportExcel}
                    type="button"
                    className='p-button-secondary text-xs'
                    icon={'pi pi-file-excel'}
                    label="Export Excel" /> */}
                <Button onClick={handleExportPDF}
                    type="button"
                    className='p-button-secondary text-xs'
                    icon={'pi pi-file-pdf'}
                    label="Export PDF" />
            </div>
        </>
    }

    const nameTemplate = (rowData: IExpertGuest) => {
        return <>{rowData.firstname + ' ' + rowData.lastname}</>
    }

    const datePaidTemplate = (rowData: IExpertGuest) => {
        const isPaid = !!rowData.datepaid
        return <>
            <Checkbox checked={isPaid} disabled></Checkbox>
        </>
    }

    const remarksTemplate = (rowData: IExpertGuest) => {
        const cb = () => { refreshRowData(rowData); }
        return <RemarkComponent guest={rowData} callback={cb} toast={toast}/>
    }

    /***** Custom Components - END *****/

    return (<>
        <div className="grid">
            <div className="col-12 ">
                <Toolbar className='p-2 m-0' right={rightToolbarContent} left={leftToolbarContent} />
            </div>

            <div className="col-12 partner-table-container">
                <DataTable
                    id="expert-events-table"
                    loading={isLoading}
                    value={guestList}
                    className="text-xs"
                    dataKey="id"
                    stripedRows
                    sortField="dateSubmitted" sortOrder={-1}
                    paginator rows={10}
                    globalFilterFields={['name', 'positionOptions']}
                    filterDisplay="row"
                >
                    <Column body={datePaidTemplate} header="Paid"></Column>
                    <Column body={nameTemplate} header="Name"></Column>
                    <Column field="mobile" header="Mobile"></Column>
                    <Column field="email" header="Email"></Column>
                    <Column field="whatsapp" header="WhatsApp"></Column>
                    <Column field="origin" header="Origin"></Column>
                    <Column field="dateCreated" header="Date Registered"></Column>
                    <Column field="referedBy" header="Referered By"></Column>
                    <Column body={remarksTemplate} header="Remarks"></Column>
                </DataTable>
            </div>
            <Toast position="bottom-right" ref={toast} />
            <ConfirmDialog />

        </div>
    </>)
}

export default GuestList