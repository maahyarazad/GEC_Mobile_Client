import moment from "moment";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { IEventList, IGuestList } from "../../../@types/Event";
import { IDropdown, ITableConfig } from "../../../@types/Reports";
import { EventService } from "../../../services/Event/Event.services";
import "./GuestList.css";
import { StorageService } from "../../../services/Storage/Storage.service";

interface Props {}

const TABLE_COLUMNS: ITableConfig[] = [
  {
    header: "#",
    field: "#",
  },
  {
    header: "First Name",
    field: "first_name",
  },
  {
    header: "Last Name",
    field: "last_name",
  },
  {
    header: "Mobile Number",
    field: "mobile",
  },
  {
    header: "Whatsapp",
    field: "whatsapp",
  },
  {
    header: "Email Address",
    field: "email",
  },
  {
    header: "Access Types",
    field: "access_type",
  },
  {
    header: "With Card",
    field: "with_card",
  },
  {
    header: "Origin",
    field: "origin",
  },
  {
    header: "Has Guest",
    field: "has_guest",
  },
  {
    header: "Referred By",
    field: "referred_by",
  },
  {
    header: "Date Registered",
    field: "date_created",
  },
  {
    header: "Date Updated",
    field: "date_updated",
  },
  {
    header: "Remarks",
    field: "remarks",
  },
  {
    header: "Contacted",
    field: "is_done",
  },
];

//Functional Component
const GuestList: React.FC<Props> = () => {
  const canEdit: boolean = StorageService.hasPrivilege(81, 'edit')

  const [eventList, setEventList] = useState<IEventList[]>();
  const [selectedEvent, setSelectedEvent] = useState<IEventList | undefined>();
  const [guestList, setGuestList] = useState<IGuestList[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, forceRefresh] = useState(false);
  const toastRef = useRef<Toast>(null);
  const [selectedGuest, setSelectedGuest] = useState<IGuestList>();

  useEffect(() => {
    let isMounted = true;

    const getEvents = async () => {
      try {
        setIsLoading(true);

        const response = await EventService.getAllWebEvents();
        if (response.length) {
          if (isMounted) {
            setEventList(response);
            setSelectedEvent(response[0]);
          }
        }
      } catch (error) {
        alert(error);
      } finally {
        setIsLoading(false);
      }
    };

    getEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const getGuestList = async () => {
      try {
        setIsLoading(true);

        if (!!selectedEvent) {
          const response = await EventService.getGuestList(selectedEvent.id);
          if (isMounted) {
            setGuestList(response);
          }
        }
      } catch (error) {
        alert(error);
      } finally {
        setIsLoading(false);
      }
    };

    getGuestList();

    return () => {
      isMounted = false;
    };
  }, [selectedEvent, refresh]);

  //   useEffect(() => {
  //     let isMounted = true;

  //     return () => {
  //       isMounted = false;
  //     };
  //   }, [guestList]);

  const handleEventChange = (data: DropdownChangeEvent) => {
    setSelectedEvent(data.value);
  };

  const headerTemplate = () => {
    return (
      <>
        <div className="flex justify-content-between">
          <Dropdown
            className="w-6"
            value={selectedEvent}
            onChange={handleEventChange}
            options={eventList}
            optionLabel="eventName"
          />
          <Button
            onClick={() => forceRefresh(!refresh)}
            severity="success"
            icon="pi pi-refresh"
            label="Refresh"
          />
          {/* <Dropdown className='w-6' value={selectedEvent} onChange={handleEventChange} options={eventList} optionLabel='eventName' /> */}
        </div>
      </>
    );
  };

  const dateBody = (rowData: any, key: string) => {
    return moment(rowData[`${key}`]).format("DD-MMM, YYYY h:m A");
  };

  const toggleDone = async (id: number, checked: boolean) => {
    if (!!toastRef.current)
      try {
        const data = {
          id,
          is_done: checked,
        };

        const response = await EventService.updateGuest(data);

        if (response && guestList) {
          const _guestList = guestList.map((guest, _) => {
            if (guest.id === id) {
              guest.is_done = checked;
            }
            return guest;
          });
          setGuestList(_guestList);

          return toastRef.current.show({
            summary: "Successfully Updated",
            detail: "Guest Data has been updated",
            severity: "success",
          });
        }

        return toastRef.current.show({
          summary: "Update Failed",
          detail: "Guest Data was not updated",
          severity: "error",
        });
      } catch (error) {
        toastRef.current.show({
          summary: "Update Failed",
          detail: "Guest Data was not updated",
          severity: "error",
        });
      }
  };

  const checkboxBody = (rowData: IGuestList) => {
    return (
      <Checkbox
        onChange={(value) => {
          toggleDone(rowData.id, !!value.checked);
        }}
        checked={!!rowData.is_done}
        disabled={!canEdit}
        ></Checkbox>
    );
  };

  const cellEditor = (data: ColumnEditorOptions) => {
    console.log(data);
    return (
      <InputTextarea
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          data.editorCallback!(e.target.value);
        }}
        value={data.value}
        disabled={!canEdit}
      ></InputTextarea>
    );
  };

  const onCellEditComplete = async (value: ColumnEvent) => {
    if (toastRef.current)
      try {
        const data = {
          id: value.rowData.id,
          remarks: value.newValue,
        };

        const response = await EventService.updateGuest(data);

        if (response && !!guestList) {
          const _guestList = guestList.map((guest, _) => {
            if (guest.id === value.rowData.id) {
              guest.remarks = value.newValue;
            }
            return guest;
          });
          setGuestList(_guestList);
          //   forceRefresh(new Date());

          return toastRef.current.show({
            summary: "Successfully Updated",
            detail: "Guest Data has been updated",
            severity: "success",
          });
        } else {
          return toastRef.current.show({
            summary: "Update Failed",
            detail: "Guest Data was not updated",
            severity: "error",
          });
        }
      } catch (error) {
        return toastRef.current.show({
          summary: "Update Failed",
          detail: "Guest Data was not updated",
          severity: "error",
        });
      }
  };

  const yesBodyTemplate = (rowData: any, key: string) => {
    return !!rowData[key] ? (
      <i
        className="pi pi-check"
        style={{ color: "green", fontWeight: "bolder" }}
      />
    ) : (
      <></>
    );
  };

  const rowClass = (data: IGuestList) => {
    return {
        'surface-500': data.status === 0
    };
  };

  return (
    <div className="page-container">
      <div className="text-2xl font-bold mb-3">Event Guest Call List</div>

      <DataTable
        loading={isLoading}
        value={guestList}
        className="text-xs"
        rowClassName={rowClass}
        editMode="cell"
        stripedRows
        selectionMode="single"
        selection={selectedGuest}
        onSelectionChange={(e) => {
          setSelectedGuest(e.value as IGuestList);
        }}
        header={headerTemplate}
      >
        {TABLE_COLUMNS.map((x: ITableConfig, _: number) => {
          switch (x.field) {
            case "date_created":
            case "date_updated":
              return (
                <Column
                  key={_}
                  body={(e) => dateBody(e, x.field)}
                  header={x.header}
                  field={x.field}
                  sortable
                />
              );
            case "is_done":
              return (
                <Column
                  sortable
                  key={_}
                  body={checkboxBody}
                  header={x.header}
                  field={x.field}
                />
              );
            case "remarks":
              return (
                <Column
                  key={_}
                  header={x.header}
                  field={x.field}
                  editor={(options) => cellEditor(options)}
                  onCellEditComplete={onCellEditComplete}
                />
              );
            case "has_guest":
            case "with_card":
              return (
                <Column
                  sortable
                  key={_}
                  body={(e) => yesBodyTemplate(e, x.field)}
                  header={x.header}
                  field={x.field}
                />
              );
            default:
              return (
                <Column sortable key={_} header={x.header} field={x.field} />
              );
          }
        })}
      </DataTable>
      <Toast ref={toastRef} position="bottom-right" />
    </div>
  );
};

export default GuestList;
