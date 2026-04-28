import {
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";

import { PartnerContact } from "./DTO_Interfaces";

export interface ContactTableRef {
    getSelected: () => number[];
    setSelected: (ids: number[]) => void;
    clearSelection: () => void;
}

interface ContactTableProps {
    contactList: PartnerContact[];
    onChangeSelected?: (ids: number[]) => void;
}

const thStyle = {
    padding: "10px",
    fontWeight: 600,
};

const tdStyle = {
    padding: "10px",
    verticalAlign: "middle",
};

const ContactTable = forwardRef<ContactTableRef, ContactTableProps>(
    ({ contactList, onChangeSelected }, ref) => {
        const [selected, setSelected] = useState<number[]>([]);

        const updateSelection = (ids: number[]) => {
            setSelected(ids);
            onChangeSelected?.(ids);
        };


        const toggleSelect = (id: number) => {
            setSelected((prev) => {
                const updated = prev.includes(id)
                    ? prev.filter((x) => x !== id)
                    : [...prev, id];

                onChangeSelected?.(updated); // 👈 always fresh
                return updated;
            });
        };

        const toggleSelectAll = () => {
            const allSelected = selected.length === contactList.length;
            const updated = allSelected ? [] : contactList.map(c => c.id);
            
            setSelected(updated);
            onChangeSelected?.(updated);
        };

        useImperativeHandle(ref, () => ({
            getSelected: () => selected,
            setSelected: (ids: number[]) => updateSelection(ids),
            clearSelection: () => updateSelection([]),
        }));

        return (
            <div>
                <button type="button" onClick={toggleSelectAll}>Select All</button>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "14px",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                textAlign: "left",
                                background: "#f5f5f5",
                                borderBottom: "2px solid #ddd",
                            }}
                        >
                            <th style={thStyle}>Select</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Division</th>
                            <th style={thStyle}>Language</th>
                        </tr>
                    </thead>

                    <tbody>
                        {contactList.map((c, index) => (
                            <tr
                                key={c.id}
                                style={{
                                    borderBottom: "1px solid #eee",
                                    background: index % 2 === 0 ? "#fff" : "#fafafa", // zebra striping
                                }}
                            >
                                <td style={tdStyle}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(c.id)}
                                        onChange={() => toggleSelect(c.id)}
                                    />
                                </td>

                                <td style={tdStyle}>
                                    {c.salutation} {c.firstName} {c.secondName}
                                </td>

                                <td style={tdStyle}>{c.email}</td>
                                <td style={tdStyle}>{c.division}</td>
                                <td style={tdStyle}>{c.language}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
);

export default ContactTable;