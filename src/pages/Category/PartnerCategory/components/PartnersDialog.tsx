import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { MdClose, MdEdit, MdDelete } from "react-icons/md";
import {
  ICategoryPartner,
  ICategoryWithOffers,
} from "../../../../@types/Partner";

// react-icons' IconType isn't assignable to this project's JSX types, so we
// alias each icon through a compatible signature (same pattern as Navbar.tsx).
type RIIcon = React.FC<{
  size?: number;
  className?: string;
  title?: string;
  onClick?: React.MouseEventHandler<SVGElement>;
}>;
const IconClose = MdClose as unknown as RIIcon;
const IconEdit = MdEdit as unknown as RIIcon;
const IconDelete = MdDelete as unknown as RIIcon;

interface Props {
  visible: boolean;
  category: ICategoryWithOffers | null;
  canEdit: boolean;
  canDelete: boolean;
  onHide: () => void;
  onEditPartner: (partner: ICategoryPartner) => void;
  onRemovePartner: (partner: ICategoryPartner) => void;
}

// Lists the partners of a category with their offer/availability aggregates and
// the per-partner Edit (offers & tags) / Remove actions. Owns its own search.
const PartnersDialog: React.FC<Props> = ({
  visible,
  category,
  canEdit,
  canDelete,
  onHide,
  onEditPartner,
  onRemovePartner,
}) => {
  const [filter, setFilter] = useState("");

  // Reset the search each time the dialog opens for a category.
  useEffect(() => {
    if (visible) setFilter("");
  }, [visible, category?.id]);

  const filteredPartners = useMemo<ICategoryPartner[]>(() => {
    const list = category?.partners ?? [];
    const term = filter.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (p) =>
        p.partner_title?.toLowerCase().includes(term) ||
        String(p.partner_id).includes(term)
    );
  }, [category, filter]);

  const partnerActionTemplate = (partner: ICategoryPartner) => (
    <div className="flex gap-3 justify-content-center align-items-center">
      {canEdit && (
        <IconEdit
          size={20}
          title="Edit offers & tags"
          className="pressable text-primary"
          onClick={() => onEditPartner(partner)}
        />
      )}
      {canDelete && (
        <IconDelete
          size={20}
          title="Remove from category"
          className="pressable text-red-500"
          onClick={() => onRemovePartner(partner)}
        />
      )}
    </div>
  );

  const footer = (
    <Button
      label="Close"
      icon={<IconClose className="mr-1" size={16} />}
      className="p-button-text text-xs"
      onClick={onHide}
    />
  );

  return (
    <Dialog
      visible={visible}
      header={category ? `Partners — ${category.pcategory_en}` : "Partners"}
      modal
      style={{ width: "56rem" }}
      breakpoints={{ "960px": "90vw", "641px": "95vw" }}
      footer={footer}
      onHide={onHide}
    >
      <div className="flex flex-column gap-3 pt-2">
        <span className="p-input-icon-right">
          <IconClose
            onClick={() => setFilter("")}
            className="text-sm pressable"
          />
          <InputText
            className="text-xs w-full"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search partners by name or id"
          />
        </span>

        <DataTable
          value={filteredPartners}
          dataKey="partner_id"
          emptyMessage="No partners in this category"
          scrollable
          scrollHeight="380px"
          className="w-full text-xs"
          showGridlines
        >
          <Column
            field="partner_title"
            header="Partner"
            headerClassName={"py-2 px-2"}
            bodyClassName={"py-2 px-2"}
          />
          <Column
            field="offerCount"
            header="Available Offers"
            headerClassName={"py-2 px-2"}
            bodyClassName={"py-2 px-2"}
            style={{ width: "9rem", textAlign: "center" }}
          />
          <Column
            field="totalAvail"
            header="Total Avail in the Past Year"
            headerClassName={"py-2 px-2"}
            bodyClassName={"py-2 px-2"}
            style={{ width: "12rem", textAlign: "center" }}
          />
          <Column
            header="Actions"
            headerClassName={"py-2 px-2"}
            bodyClassName={"py-2 px-2"}
            body={partnerActionTemplate}
            style={{ width: "8rem", textAlign: "center" }}
          />
        </DataTable>
      </div>
    </Dialog>
  );
};

export default PartnersDialog;
