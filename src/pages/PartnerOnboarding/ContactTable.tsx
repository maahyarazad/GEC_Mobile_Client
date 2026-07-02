import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { PartnerContact } from "./DTO_Interfaces";

export type ContactRole = "recipient" | "cc";

interface ContactTableProps {
    contactList: PartnerContact[];
    recipients: PartnerContact[];
    cc: PartnerContact[];
    onAdd: (contact: PartnerContact, role: ContactRole) => void;
    onSelectAllRecipients: () => void;
    onClear: () => void;
}

export default function ContactTable({
    contactList,
    recipients,
    cc,
    onAdd,
    onSelectAllRecipients,
    onClear,
}: ContactTableProps) {
    const isRecipient = (id: number) => recipients.some((c) => c.id === id);
    const isCc = (id: number) => cc.some((c) => c.id === id);

    // ── Column templates ──────────────────────────────────────────────

    const statusBody = (c: PartnerContact) => {
        const tags: JSX.Element[] = [];
        if (isRecipient(c.id))
            tags.push(<Tag key="recipient" value="Recipient" severity="success" />);
        if (isCc(c.id)) tags.push(<Tag key="cc" value="CC" severity="info" />);
        if (tags.length === 0)
            return <span className="text-color-secondary">—</span>;
        return <div className="flex gap-1 flex-wrap">{tags}</div>;
    };

    const nameBody = (c: PartnerContact) =>
        [c.salutation, c.firstName, c.secondName].filter(Boolean).join(" ");

    const actionBody = (c: PartnerContact) => (
        <div
            className="flex gap-2"
            style={{ transform: "scale(0.8)", transformOrigin: "left center" }}
        >
            <Button
                type="button"
                label="Recipient"
                icon="pi pi-user"
                size="small"
                outlined={!isRecipient(c.id)}
                disabled={isRecipient(c.id)}
                onClick={() => onAdd(c, "recipient")}
            />
            <Button
                type="button"
                label="CC"
                icon="pi pi-users"
                size="small"
                severity="info"
                outlined={!isCc(c.id)}
                disabled={isCc(c.id)}
                onClick={() => onAdd(c, "cc")}
            />
        </div>
    );

    const header = (
        <div className="flex justify-content-between align-items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">
                {recipients.length} recipient(s) · {cc.length} CC
            </span>
            <div
                className="flex gap-2"
                style={{ transform: "scale(0.8)", transformOrigin: "right center" }}
            >
                <Button
                    type="button"
                    label="Select All as Recipients"
                    icon="pi pi-check"
                    size="small"
                    outlined
                    onClick={onSelectAllRecipients}
                />
                <Button
                    type="button"
                    label="Clear"
                    icon="pi pi-filter-slash"
                    size="small"
                    outlined
                    severity="secondary"
                    onClick={onClear}
                />
            </div>
        </div>
    );

    return (
        <div>
            <DataTable
                value={contactList}
                dataKey="id"
                header={header}
                size="small"
                style={{ fontSize: 13 }}
                stripedRows
                emptyMessage="No contacts found"
            >
                <Column header="Status" body={statusBody} style={{ width: 120 }} />
                <Column field="firstName" header="Name" body={nameBody} />
                <Column field="email" header="Email" />
                <Column field="division" header="Division" />
                <Column field="language" header="Language" style={{ width: 120 }} />
                <Column header="Action" body={actionBody} style={{ width: 240 }} />
            </DataTable>
        </div>
    );
}
