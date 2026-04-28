import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IMembership } from "../../@types/ApprovalList";
import moment from "moment";
interface MembershipTableProps {
  data: IMembership | IMembership[] | null | undefined;
    //type: string
}

const MembershipShipRecordTable: React.FC<MembershipTableProps> = ({ data}) => {
  // Normalize data → always an array for DataTable
  const normalizedData = Array.isArray(data)
    ? data
    : data
    ? [data]
    : [];

    const columnStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "130px",
  }

  const headerStyle: React.CSSProperties = {
    ...columnStyle,
    fontWeight: 600,
    backgroundColor: "#f8f9fa",
  };

  const renderCell = (value: any): JSX.Element =>  (
    <div title={value} style={columnStyle}>
        {value}
    </div>
    );

     const renderBody = (field: string) => (rowData: any) => renderCell(rowData?.[field]);

  return (
    <div>
      <h3>Membership History</h3>
      <DataTable
        style={{ fontSize: 14,  overflow: "auto" , maxHeight: '30dvh'}}
        value={normalizedData}
        showGridlines
        stripedRows
        responsiveLayout="scroll"
        emptyMessage="No membership records found"
        rowClassName={(rowData) => {
            const recordDate = new Date(rowData?.time!);
            const now = new Date();

            const sameYear = recordDate.getFullYear() === now.getFullYear();
            const futureYear = recordDate.getFullYear() > now.getFullYear();
            const sameOrFutureMonth =
                sameYear && recordDate.getMonth() >= now.getMonth();

            return {
                'active-row': futureYear || sameOrFutureMonth,
            };
        }}

      >
        <Column headerStyle={headerStyle} field="id" header="ID" body={renderBody("id")} />
        <Column headerStyle={headerStyle} field="usrId" header="User ID" body={renderBody("usrId")} />
        <Column
          field="time"
          header="Time"
          style={columnStyle}
          headerStyle={headerStyle} 
          body={(rowData) =>
            renderCell(moment(rowData?.time).format("D-MMM, Y h:mm:ss A"))
          }

        />
        <Column headerStyle={headerStyle} field="duration" header="Duration" body={renderBody("duration")} />
        <Column headerStyle={headerStyle} field="package" header="Package" body={renderBody("package")} />
        <Column headerStyle={headerStyle} field="payment" header="Payment" body={renderBody("payment")} />
        <Column headerStyle={headerStyle} field="status" header="Status" body={renderBody("status")} />
        <Column headerStyle={headerStyle} field="token" header="Token" body={renderBody("token")} />
        <Column headerStyle={headerStyle} field="title" header="Title" body={renderBody("title")} />
        <Column headerStyle={headerStyle} field="first_name" header="First Name" body={renderBody("first_name")} />
        <Column headerStyle={headerStyle} field="name" header="Name" body={renderBody("name")} />
        <Column headerStyle={headerStyle} field="place" header="Place" body={renderBody("place")} />
        <Column headerStyle={headerStyle} field="zip" header="Zip" body={renderBody("zip")} />
        <Column headerStyle={headerStyle} field="mobile" header="Mobile" body={renderBody("mobile")} />
        <Column headerStyle={headerStyle} field="address" header="Address" body={renderBody("address")} />
        <Column headerStyle={headerStyle} field="company" header="Company" body={renderBody("company")} />
        <Column headerStyle={headerStyle} field="_first_name" header="_First Name" body={renderBody("_first_name")} />
        <Column headerStyle={headerStyle} field="_name" header="_Name" body={renderBody("_name")} />
        <Column headerStyle={headerStyle} field="paid" header="Paid" body={renderBody("paid")} />
        <Column headerStyle={headerStyle} field="conveyed" header="Conveyed" body={renderBody("conveyed")} />
        <Column headerStyle={headerStyle} field="reminder" header="Reminder" body={renderBody("reminder")} />
        <Column headerStyle={headerStyle} field="manual" header="Manual" body={renderBody("manual")} />
        <Column headerStyle={headerStyle} field="cardnumber" header="Card Number" body={renderBody("cardnumber")} />
      </DataTable>
    </div>
  );
};

export default MembershipShipRecordTable;
