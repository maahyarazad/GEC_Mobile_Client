import {
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { PartnerContact } from "./DTO_Interfaces";

export type ContactRole = "recipient" | "cc";

export interface ContactSelection {
    recipients: number[];
    cc: number[];
}

export interface ContactTableRef {
    getSelection: () => ContactSelection;
    clearSelection: () => void;
}

interface ContactTableProps {
    contactList: PartnerContact[];
    onChangeSelected?: (selection: ContactSelection) => void;
}

const ContactTable = forwardRef<ContactTableRef, ContactTableProps>(
    ({ contactList, onChangeSelected }, ref) => {
        const [recipients, setRecipients] = useState<number[]>([]);
        const [cc, setCc] = useState<number[]>([]);

        const notify = (nextRecipients: number[], nextCc: number[]) => {
            onChangeSelected?.({ recipients: nextRecipients, cc: nextCc });
        };

        // Reset the selection whenever a different contact list is loaded
        // (e.g. when another partner is opened).
        useEffect(() => {
            setRecipients([]);
            setCc([]);
            notify([], []);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [contactList]);

        // A contact belongs to at most one list; assigning to one removes it
        // from the other.
        const assign = (id: number, role: ContactRole | "none") => {
            const nextRecipients =
                role === "recipient"
                    ? Array.from(new Set([...recipients, id]))
                    : recipients.filter((x) => x !== id);
            const nextCc =
                role === "cc"
                    ? Array.from(new Set([...cc, id]))
                    : cc.filter((x) => x !== id);

            setRecipients(nextRecipients);
            setCc(nextCc);
            notify(nextRecipients, nextCc);
        };

        const selectAllRecipients = () => {
            const allIds = contactList.map((c) => c.id);
            setRecipients(allIds);
            setCc([]);
            notify(allIds, []);
        };

        const clearSelection = () => {
            setRecipients([]);
            setCc([]);
            notify([], []);
        };

        useImperativeHandle(ref, () => ({
            getSelection: () => ({ recipients, cc }),
            clearSelection,
        }));

        const roleOf = (id: number): ContactRole | null =>
            recipients.includes(id) ? "recipient" : cc.includes(id) ? "cc" : null;

        // ── Column templates ──────────────────────────────────────────────

        const statusBody = (c: PartnerContact) => {
            const role = roleOf(c.id);
            if (role === "recipient") return <Tag value="Recipient" severity="success" />;
            if (role === "cc") return <Tag value="CC" severity="info" />;
            return <span className="text-color-secondary">—</span>;
        };

        const nameBody = (c: PartnerContact) =>
            [c.salutation, c.firstName, c.secondName].filter(Boolean).join(" ");

        const actionBody = (c: PartnerContact) => {
            const role = roleOf(c.id);
            return (
                <div
                    className="flex gap-2"
                    style={{ transform: "scale(0.8)", transformOrigin: "left center" }}
                >
                    <Button
                        type="button"
                        label="Recipient"
                        icon="pi pi-user"
                        size="small"
                        outlined={role !== "recipient"}
                        onClick={() =>
                            assign(c.id, role === "recipient" ? "none" : "recipient")
                        }
                    />
                    <Button
                        type="button"
                        label="CC"
                        icon="pi pi-users"
                        size="small"
                        severity="info"
                        outlined={role !== "cc"}
                        onClick={() => assign(c.id, role === "cc" ? "none" : "cc")}
                    />
                </div>
            );
        };

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
                        onClick={selectAllRecipients}
                    />
                    <Button
                        type="button"
                        label="Clear"
                        icon="pi pi-filter-slash"
                        size="small"
                        outlined
                        severity="secondary"
                        onClick={clearSelection}
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
);

export default ContactTable;
