import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { MdClose, MdCheck } from "react-icons/md";
import { IPCategory } from "../../../../@types/Partner";

// react-icons' IconType isn't assignable to this project's JSX types, so we
// alias each icon through a compatible signature (same pattern as Navbar.tsx).
type RIIcon = React.FC<{
  size?: number;
  className?: string;
  title?: string;
  onClick?: React.MouseEventHandler<SVGElement>;
}>;
const IconClose = MdClose as unknown as RIIcon;
const IconCheck = MdCheck as unknown as RIIcon;

interface Props {
  visible: boolean;
  mode: "add" | "edit";
  value: IPCategory;
  submitted: boolean;
  saving: boolean;
  onChange: (value: IPCategory) => void;
  onHide: () => void;
  onSave: () => void;
}

// Presentational Add / Edit category form. Extracted out of PartnerCategory so
// the page owns the data/save logic while this component only renders the form.
const CategoryFormDialog: React.FC<Props> = ({
  visible,
  mode,
  value,
  submitted,
  saving,
  onChange,
  onHide,
  onSave,
}) => {
  const footer = (
    <>
      <Button
        label="Cancel"
        icon={<IconClose className="mr-1" size={16} />}
        className="p-button-text text-xs"
        onClick={onHide}
      />
      <Button
        label="Save"
        icon={<IconCheck className="mr-1" size={16} />}
        className="p-button-success text-xs"
        onClick={onSave}
        loading={saving}
      />
    </>
  );

  return (
    <Dialog
      visible={visible}
      header={mode === "edit" ? "Edit Category" : "Add Category"}
      modal
      className="p-fluid"
      style={{ width: "32rem" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      footer={footer}
      onHide={onHide}
    >
      <div className="field mt-3">
        <label htmlFor="pcategory_en" className="text-sm font-bold">
          Category (English)
        </label>
        <InputText
          id="pcategory_en"
          className="text-sm"
          value={value.pcategory_en}
          onChange={(e) => onChange({ ...value, pcategory_en: e.target.value })}
          autoFocus
        />
        {submitted && value.pcategory_en.trim() === "" && (
          <small className="p-error">English name is required.</small>
        )}
      </div>
      <div className="field mt-3">
        <label htmlFor="pcategory_de" className="text-sm font-bold">
          Kategorie (German)
        </label>
        <InputText
          id="pcategory_de"
          className="text-sm"
          value={value.pcategory_de}
          onChange={(e) => onChange({ ...value, pcategory_de: e.target.value })}
        />
        {submitted && value.pcategory_de.trim() === "" && (
          <small className="p-error">German name is required.</small>
        )}
      </div>
    </Dialog>
  );
};

export default CategoryFormDialog;
