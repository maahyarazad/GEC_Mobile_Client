import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { MdClose, MdCheck, MdDelete, MdUndo, MdAdd } from "react-icons/md";
import {
  ICategoryPartner,
  IPartnerTag,
  IPartnerOffer,
  IPartnerOffersTagsUpdate,
} from "../../../../@types/Partner";
import { PartnerService } from "../../../../services/Partner/Partner.service";

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
const IconDelete = MdDelete as unknown as RIIcon;
const IconUndo = MdUndo as unknown as RIIcon;
const IconAdd = MdAdd as unknown as RIIcon;

interface Props {
  visible: boolean;
  partner: ICategoryPartner | null;
  toast: React.RefObject<Toast>;
  onHide: () => void;
  onSaved: () => void; // reload the parent after a successful save
}

// Local editable copies keep the original values so we can compute what actually
// changed and mark rows staged for deletion without mutating the source.
type EditableTag = IPartnerTag & { removed: boolean };
type EditableOffer = IPartnerOffer & { removed: boolean };

// Edits a partner's offers and tags in one place. Name edits and removals are
// staged and committed together via updatePartnerOffersTags (rolled back on any
// failure). Adding a tag is immediate: it hits createPartnerSpecialTag (its own
// transaction) so the new tag is persisted right away and shown in the list.
const PartnerOffersTagsDialog: React.FC<Props> = ({
  visible,
  partner,
  toast,
  onHide,
  onSaved,
}) => {
  const [tags, setTags] = useState<EditableTag[]>([]);
  const [offers, setOffers] = useState<EditableOffer[]>([]);
  const [saving, setSaving] = useState(false);
  // New-tag form state.
  const [newEnTag, setNewEnTag] = useState("");
  const [newDeTag, setNewDeTag] = useState("");
  const [creating, setCreating] = useState(false);
  // Authoritative "original" tags used to diff name edits. Seeded on open and
  // extended when a tag is created so subsequent edits to it can still be saved.
  const originalTags = useRef<Map<number, IPartnerTag>>(new Map());

  // Re-seed the editable copies every time the dialog opens for a partner.
  useEffect(() => {
    if (visible && partner) {
      setTags(partner.tags.map((t) => ({ ...t, removed: false })));
      setOffers(partner.offers.map((o) => ({ ...o, removed: false })));
      originalTags.current = new Map(
        partner.tags.map((t) => [t.specialtags_id, t])
      );
      setNewEnTag("");
      setNewDeTag("");
    }
  }, [visible, partner]);

  // Tags that would remain after the current staging.
  const activeTagCount = tags.filter((t) => !t.removed).length;

  // Immediately create a new special tag and link it to the partner via the
  // dedicated transaction endpoint, then show it in the list.
  const createTag = () => {
    const en_tag = newEnTag.trim();
    const de_tag = newDeTag.trim();
    if (!en_tag || !partner) return;
    setCreating(true);
    PartnerService.createPartnerSpecialTag(partner.partner_id, en_tag, de_tag)
      .then((created) => {
        originalTags.current.set(created.specialtags_id, created);
        setTags((prev) => [{ ...created, removed: false }, ...prev]);
        setNewEnTag("");
        setNewDeTag("");
        toast.current?.show({
          severity: "success",
          summary: "Tag Added",
          detail: "The tag has been created",
        });
        // Refresh the parent so category/partner aggregates reflect the new tag.
        onSaved();
      })
      .catch((err) => {
        console.log(err);
        toast.current?.show({
          severity: "error",
          summary: "Server Error",
          detail: "Something went wrong while creating the tag",
        });
      })
      .finally(() => setCreating(false));
  };

  const setTagField = (
    id: number,
    field: "en_tag" | "de_tag",
    value: string
  ) => {
    setTags((prev) =>
      prev.map((t) => (t.specialtags_id === id ? { ...t, [field]: value } : t))
    );
  };

  const setOfferField = (
    id: number,
    field: "en_offername" | "de_offername",
    value: string
  ) => {
    setOffers((prev) =>
      prev.map((o) => (o.offer_id === id ? { ...o, [field]: value } : o))
    );
  };

  const toggleTagRemoved = (id: number) => {
    const target = tags.find((t) => t.specialtags_id === id);
    // Guard: at least one tag must always remain. Block removing the last one.
    if (target && !target.removed && activeTagCount <= 1) {
      toast.current?.show({
        severity: "warn",
        summary: "At least one tag required",
        detail: "A partner must keep at least one tag",
      });
      return;
    }
    setTags((prev) =>
      prev.map((t) =>
        t.specialtags_id === id ? { ...t, removed: !t.removed } : t
      )
    );
  };

  const toggleOfferRemoved = (id: number) => {
    setOffers((prev) =>
      prev.map((o) => (o.offer_id === id ? { ...o, removed: !o.removed } : o))
    );
  };

  // Build the batched payload: rows staged for deletion go to `remove`; the rest
  // whose name fields changed go to `update`.
  const payload = useMemo<IPartnerOffersTagsUpdate | null>(() => {
    if (!partner) return null;

    const originalTag = originalTags.current;
    const originalOffer = new Map(
      partner.offers.map((o) => [o.offer_id, o])
    );

    const tagRemove = tags.filter((t) => t.removed).map((t) => t.specialtags_id);
    const tagUpdate = tags
      .filter((t) => {
        if (t.removed) return false;
        const o = originalTag.get(t.specialtags_id);
        return o && (o.en_tag !== t.en_tag || o.de_tag !== t.de_tag);
      })
      .map(({ specialtags_id, en_tag, de_tag }) => ({
        specialtags_id,
        en_tag,
        de_tag,
      }));

    const offerRemove = offers.filter((o) => o.removed).map((o) => o.offer_id);
    const offerUpdate = offers
      .filter((o) => {
        if (o.removed) return false;
        const orig = originalOffer.get(o.offer_id);
        return (
          orig &&
          (orig.en_offername !== o.en_offername ||
            orig.de_offername !== o.de_offername)
        );
      })
      .map(({ offer_id, en_offername, de_offername, avail_count, isHotpick }) => ({
        offer_id,
        en_offername,
        de_offername,
        avail_count,
        isHotpick,
      }));

    return {
      partner_id: partner.partner_id,
      tags: { update: tagUpdate, remove: tagRemove },
      offers: { update: offerUpdate, remove: offerRemove },
    };
  }, [partner, tags, offers]);

  const hasChanges =
    !!payload &&
    (payload.tags.update.length > 0 ||
      payload.tags.remove.length > 0 ||
      payload.offers.update.length > 0 ||
      payload.offers.remove.length > 0);

  const save = () => {
    if (!payload || !hasChanges) return;
    setSaving(true);
    PartnerService.updatePartnerOffersTags(payload)
      .then((success) => {
        if (success) {
          toast.current?.show({
            severity: "success",
            summary: "Saved",
            detail: "The partner's offers and tags have been updated",
          });
          onSaved();
          onHide();
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Save Failed",
            detail: "The changes could not be saved",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.current?.show({
          severity: "error",
          summary: "Server Error",
          detail: "Something went wrong while saving",
        });
      })
      .finally(() => setSaving(false));
  };

  const removeActionTemplate = (removed: boolean, onToggle: () => void) => (
    <div className="flex justify-content-center">
      {removed ? (
        <IconUndo
          size={18}
          title="Undo remove"
          className="pressable text-primary"
          onClick={onToggle}
        />
      ) : (
        <IconDelete
          size={18}
          title="Remove"
          className="pressable text-red-500"
          onClick={onToggle}
        />
      )}
    </div>
  );

  const nameEditor = (value: string, disabled: boolean, onChange: (v: string) => void) => (
    <InputText
      className="text-xs w-full"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  const footer = (
    <>
      <Button
        label="Cancel"
        icon={<IconClose className="mr-1" size={16} />}
        className="p-button-text text-xs"
        onClick={onHide}
      />
      <Button
        label="Save Changes"
        icon={<IconCheck className="mr-1" size={16} />}
        className="p-button-success text-xs"
        onClick={save}
        loading={saving}
        disabled={!hasChanges}
      />
    </>
  );

  return (
    <Dialog
      visible={visible}
      header={
        partner ? `Offers & Tags — ${partner.partner_title}` : "Offers & Tags"
      }
      modal
      style={{ width: "60rem" }}
      breakpoints={{ "960px": "95vw" }}
      footer={footer}
      onHide={onHide}
    >
      <div className="flex flex-column gap-4 pt-2">
        <div className="flex flex-column gap-2">
          <label className="text-sm font-bold">Tags</label>
          <div className="flex gap-2 align-items-center">
            <InputText
              className="text-xs w-full"
              value={newEnTag}
              onChange={(e) => setNewEnTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTag()}
              placeholder="New tag (English)"
            />
            <InputText
              className="text-xs w-full"
              value={newDeTag}
              onChange={(e) => setNewDeTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createTag()}
              placeholder="New tag (German)"
            />
            
            <span style={{ cursor: newEnTag.trim() && !creating ? "pointer" : "not-allowed", opacity: newEnTag.trim() && !creating ? 1 : 0.5, display:'flex', minWidth: 100, border: "1px solid", borderRadius: 5, padding: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--primary)', color:'white' }}
                    onClick={() => newEnTag.trim() && !creating && createTag() }>
                {creating ? (
                  <i className="pi pi-spin pi-spinner" style={{ fontSize: 18 }} />
                ) : (
                  <IconAdd size={24} title="Add tag" />
                )}
                Add Tag
            </span>
          </div>
          <DataTable
            value={tags}
            dataKey="specialtags_id"
            emptyMessage="No tags for this partner"
            scrollable
            scrollHeight="220px"
            className="w-full text-xs"
            rowClassName={(row: EditableTag) => (row.removed ? "opacity-50" : "")}
            showGridlines
          >
            <Column
              header="Tag (English)"
              headerClassName={"py-2 px-2"}
              bodyClassName={"py-2 px-2"}
              body={(row: EditableTag) =>
                nameEditor(row.en_tag ?? "", row.removed, (v) =>
                  setTagField(row.specialtags_id, "en_tag", v)
                )
              }
            />
            <Column
              header="Tag (German)"
              headerClassName={"py-2 px-2"}
              bodyClassName={"py-2 px-2"}
              body={(row: EditableTag) =>
                nameEditor(row.de_tag ?? "", row.removed, (v) =>
                  setTagField(row.specialtags_id, "de_tag", v)
                )
              }
            />
            <Column
              header=""
              headerClassName={"py-2 px-2"}
              bodyClassName={"py-2 px-2"}
              body={(row: EditableTag) =>
                removeActionTemplate(row.removed, () =>
                  toggleTagRemoved(row.specialtags_id)
                )
              }
              style={{ width: "4rem", textAlign: "center" }}
            />
          </DataTable>
        </div>

        <div className="flex flex-column gap-2">
          <label className="text-sm font-bold">Offers</label>
          <DataTable
            value={offers}
            dataKey="offer_id"
            emptyMessage="No offers for this partner"
            scrollable
            scrollHeight="220px"
            className="w-full text-xs"
            rowClassName={(row: EditableOffer) =>
              row.removed ? "opacity-50" : ""
            }
            showGridlines
          >
            <Column
              header="Offer (English)"
              headerClassName={"py-2 px-2"}
              bodyClassName={"py-2 px-2"}
              body={(row: EditableOffer) =>
                nameEditor(row.en_offername ?? "", row.removed, (v) =>
                  setOfferField(row.offer_id, "en_offername", v)
                )
              }
            />
            <Column
              header="Offer (German)"
              headerClassName={"py-2 px-2"}
              bodyClassName={"py-2 px-2"}
              body={(row: EditableOffer) =>
                nameEditor(row.de_offername ?? "", row.removed, (v) =>
                  setOfferField(row.offer_id, "de_offername", v)
                )
              }
            />
            <Column
              header="Avail."
              headerClassName={"py-2 px-2"}
              bodyClassName={"py-2 px-2"}
              body={(row: EditableOffer) => (
                <div className="flex gap-1 align-items-center justify-content-center">
                  <span>{row.avail_count}</span>
                  {!!row.isHotpick && <Tag value="Hot" severity="warning" />}
                </div>
              )}
              style={{ width: "7rem", textAlign: "center" }}
            />
            <Column
              header=""
              headerClassName={"py-2 px-2"}
              bodyClassName={"py-2 px-2"}
              body={(row: EditableOffer) =>
                removeActionTemplate(row.removed, () =>
                  toggleOfferRemoved(row.offer_id)
                )
              }
              style={{ width: "4rem", textAlign: "center" }}
            />
          </DataTable>
        </div>
      </div>
    </Dialog>
  );
};

export default PartnerOffersTagsDialog;
