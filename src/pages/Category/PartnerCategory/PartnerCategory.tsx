import "./PartnerCategory.css";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Toolbar } from "primereact/toolbar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  IPCategory,
  ICategoryOffer,
  ICategoryPartner,
  ICategoryWithOffers,
} from "../../../@types/Partner";
import { PartnerService } from "../../../services/Partner/Partner.service";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { StorageService } from "../../../services/Storage/Storage.service";
import CategoryFormDialog from "./components/CategoryFormDialog";
import PartnersDialog from "./components/PartnersDialog";
import PartnerOffersTagsDialog from "./components/PartnerOffersTagsDialog";
import {
  MdArrowBack,
  MdAdd,
  MdClose,
  MdEdit,
  MdDelete,
  MdWarningAmber,
  MdGroups,
} from "react-icons/md";

// react-icons' IconType isn't assignable to this project's JSX types, so we
// alias each icon through a compatible signature (same pattern as Navbar.tsx).
type RIIcon = React.FC<{
  size?: number;
  className?: string;
  title?: string;
  onClick?: React.MouseEventHandler<SVGElement>;
}>;
const IconBack = MdArrowBack as unknown as RIIcon;
const IconAdd = MdAdd as unknown as RIIcon;
const IconClose = MdClose as unknown as RIIcon;
const IconEdit = MdEdit as unknown as RIIcon;
const IconDelete = MdDelete as unknown as RIIcon;
const IconWarning = MdWarningAmber as unknown as RIIcon;
const IconPartners = MdGroups as unknown as RIIcon;

interface Props {}

const emptyCategory: IPCategory = {
  id: 0,
  pcategory_en: "",
  pcategory_de: "",
};

// Group the flat `/category-offer` rows by their category id.
const groupByCategory = (rows: ICategoryOffer[]) => {
  return rows.reduce<Record<number, ICategoryOffer[]>>((acc, row) => {
    (acc[row.category_id] ??= []).push(row);
    return acc;
  }, {});
};

// Collapse a category's flat rows into one entry per partner, de-duplicating the
// crossed tag/offer rows into distinct tag and offer lists and computing the
// availability aggregates shown in the partners table.
const buildPartners = (rows: ICategoryOffer[]): ICategoryPartner[] => {
  const byPartner = new Map<
    number,
    {
      partner_id: number;
      partner_title: string;
      tags: Map<number, ICategoryPartner["tags"][number]>;
      offers: Map<number, ICategoryPartner["offers"][number]>;
    }
  >();

  rows.forEach((r) => {
    let p = byPartner.get(r.partner_id);
    if (!p) {
      p = {
        partner_id: r.partner_id,
        partner_title: r.partner_title,
        tags: new Map(),
        offers: new Map(),
      };
      byPartner.set(r.partner_id, p);
    }
    // A tag row may be blank (partner has no matching special tag).
    if (r.specialtags_id != null && (r.en_tag || r.de_tag)) {
      p.tags.set(r.specialtags_id, {
        specialtags_id: r.specialtags_id,
        en_tag: r.en_tag,
        de_tag: r.de_tag,
      });
    }
    if (r.offer_id != null) {
      p.offers.set(r.offer_id, {
        offer_id: r.offer_id,
        en_offername: r.en_offername,
        de_offername: r.de_offername,
        avail_count: r.avail_count,
        isHotpick: r.isHotpick,
      });
    }
  });

  return Array.from(byPartner.values()).map((p) => {
    const offers = Array.from(p.offers.values());
    return {
      partner_id: p.partner_id,
      partner_title: p.partner_title,
      tags: Array.from(p.tags.values()),
      offers,
      offerCount: offers.length,
      totalAvail: offers.reduce((sum, o) => sum + (o.avail_count || 0), 0),
    };
  });
};

//Functional Component
const PartnerCategory: React.FC<Props> = () => {
  const canRead = StorageService.hasPrivilege(76, "read");
  const canAdd = StorageService.hasPrivilege(76, "add");
  const canEdit = StorageService.hasPrivilege(76, "edit");
  const canDelete = StorageService.hasPrivilege(76, "delete");

  const navigate = useNavigate();
  const [categoryList, setCategoryList] = useState<ICategoryWithOffers[]>([]);
  const toast = useRef<Toast>(null);
  const [filterValue, setFilterValue] = useState("");
  const [filters, setFilters] = useState<any>();

  // Add / Edit category form dialog state
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [category, setCategory] = useState<IPCategory>(emptyCategory);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Partners dialog state (opened from the first table)
  const [partnersDialog, setPartnersDialog] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  // Offers & tags dialog state (opened from a partner's Edit action)
  const [offersTagsDialog, setOffersTagsDialog] = useState(false);
  const [activePartnerId, setActivePartnerId] = useState<number | null>(null);

  // Derive the active category / partner from the list so they stay fresh after
  // a reload rather than pointing at a stale snapshot.
  const activeCategory = useMemo<ICategoryWithOffers | null>(
    () => categoryList.find((c) => c.id === activeCategoryId) ?? null,
    [categoryList, activeCategoryId]
  );
  const activePartner = useMemo<ICategoryPartner | null>(
    () =>
      activeCategory?.partners.find(
        (p) => p.partner_id === activePartnerId
      ) ?? null,
    [activeCategory, activePartnerId]
  );

  const columns: { field: string; header: string }[] = [
    { field: "pcategory_en", header: "Category (English)" },
    { field: "pcategory_de", header: "Kategorie (German)" },
  ];

  useEffect(() => {
    initFilters();
    loadCategories();
  }, []);

  // Fetch categories together with the `/category-offer` rows and build the
  // hierarchical category -> partner -> {tags, offers} structure. Categories
  // with no active offers still appear (empty partner list).
  const loadCategories = () => {
    Promise.all([
      PartnerService.getAllCategories(),
      PartnerService.getCategoryOffers(),
    ])
      .then(([categories, rows]) => {
        const grouped = groupByCategory(rows);
        const merged: ICategoryWithOffers[] = categories.map((c) => {
          const partners = buildPartners(grouped[c.id] ?? []);
          return {
            ...c,
            partners,
            totalAvail: partners.reduce((sum, p) => sum + p.totalAvail, 0),
          };
        });
        setCategoryList(merged);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const leftToolbarContent = () => {
    return <div className="text-lg font-bold">Manage Partner Categories</div>;
  };

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    setFilterValue("");
  };

  useEffect(() => {
    if (filters != undefined) filterTable(filterValue);
  }, [filterValue]);

  const filterTable = (val: string) => {
    let _filters = { ...filters };
    _filters["global"].value = val;
    setFilters(_filters);
  };

  const onFilterChange = (e: any) => {
    setFilterValue(e.target.value);
  };

  const clearFilter = () => {
    initFilters();
  };

  const rightToolbarContent = () => {
    if (canAdd) {
      return (
        <div className="flex gap-2">
          <Button
            className="p-button-success text-xs"
            onClick={openNew}
            icon={<IconAdd className="mr-1" size={16} />}
            label="Add Category"
          />
        </div>
      );
    }
  };

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-content-between p-0 m-0">
        <div>
          <span className="p-input-icon-left p-input-icon-right">
            <InputText
              className="text-xs w-15rem"
              value={filterValue}
              onChange={onFilterChange}
              placeholder="Search"
            />
            <IconClose onClick={clearFilter} className="text-sm pressable" />
          </span>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Category create / edit / delete (unchanged behaviour, upsert endpoint)
  // ---------------------------------------------------------------------------

  // Compute the next id for a brand-new category (backend upsert requires an id).
  const nextId = () => {
    return Math.max(0, ...categoryList.map((c) => c.id)) + 1;
  };

  const openNew = () => {
    setCategory({ ...emptyCategory });
    setDialogMode("add");
    setSubmitted(false);
    setCategoryDialog(true);
  };

  const openEdit = (row: IPCategory) => {
    setCategory({
      id: row.id,
      pcategory_en: row.pcategory_en,
      pcategory_de: row.pcategory_de,
    });
    setDialogMode("edit");
    setSubmitted(false);
    setCategoryDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setCategoryDialog(false);
  };

  const isValid = () => {
    return (
      category.pcategory_en.trim().length > 0 &&
      category.pcategory_de.trim().length > 0
    );
  };

  const saveCategory = () => {
    setSubmitted(true);
    if (!isValid()) return;

    const isEdit = dialogMode === "edit";
    const payload: IPCategory = {
      ...category,
      id: isEdit ? category.id : nextId(),
      pcategory_en: category.pcategory_en.trim(),
      pcategory_de: category.pcategory_de.trim(),
    };

    // Leverage the backend upsert endpoint: edits go in `update`, new records
    // go in `add`. Both are handled by INSERT ... ON DUPLICATE KEY UPDATE.
    const update = isEdit ? [payload] : [];
    const add = isEdit ? [] : [payload];

    setSaving(true);
    PartnerService.updateCategory(update, add, [])
      .then((success) => {
        if (success) {
          toast.current?.show({
            severity: "success",
            summary: isEdit ? "Category Updated" : "Category Added",
            detail: isEdit
              ? "The category has been updated"
              : "A new category has been added",
          });
          setCategoryDialog(false);
          loadCategories();
        } else {
          toast.current?.show({
            severity: "error",
            summary: isEdit ? "Update Failed" : "Add Failed",
            detail: "The category could not be saved",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.current?.show({
          severity: "error",
          summary: "Server Error",
          detail: "Something went wrong while saving the category",
        });
      })
      .finally(() => setSaving(false));
  };

  const confirmDelete = (row: IPCategory) => {
    confirmDialog({
      message: `Are you sure you want to delete "${row.pcategory_en}"?`,
      header: "Delete Confirmation",
      icon: <IconWarning size={22} />,
      accept: () => deleteCategory(row),
      acceptClassName: "text-xs p-button-danger",
      acceptLabel: "Delete",
      reject: () => {},
      rejectClassName: "text-xs p-button-secondary",
      rejectLabel: "Cancel",
    });
  };

  const deleteCategory = (row: IPCategory) => {
    PartnerService.deleteCategory(row.id)
      .then((success) => {
        if (success) {
          toast.current?.show({
            severity: "success",
            summary: "Category Deleted",
            detail: "The category has been removed",
          });
          loadCategories();
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Delete Failed",
            detail: "The category could not be removed",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.current?.show({
          severity: "error",
          summary: "Server Error",
          detail: "Something went wrong while deleting the category",
        });
      });
  };

  // ---------------------------------------------------------------------------
  // Partners dialog (view a category's partners; edit their offers/tags)
  // ---------------------------------------------------------------------------

  const openPartners = (row: ICategoryWithOffers) => {
    setActiveCategoryId(row.id);
    setPartnersDialog(true);
  };

  const hidePartners = () => {
    setPartnersDialog(false);
    setActiveCategoryId(null);
  };

  const openOffersTags = (partner: ICategoryPartner) => {
    setActivePartnerId(partner.partner_id);
    setOffersTagsDialog(true);
  };

  const hideOffersTags = () => {
    setOffersTagsDialog(false);
    setActivePartnerId(null);
  };

  // Removing a partner from a category detaches its offers (offer_category ->
  // NULL) via the existing category-offer endpoint.
  const confirmRemovePartner = (partner: ICategoryPartner) => {
    if (!activeCategory) return;
    confirmDialog({
      message: `Remove "${partner.partner_title}" from "${activeCategory.pcategory_en}"?`,
      header: "Remove Partner",
      icon: <IconWarning size={22} />,
      accept: () => removePartner(partner),
      acceptClassName: "text-xs p-button-danger",
      acceptLabel: "Remove",
      reject: () => {},
      rejectClassName: "text-xs p-button-secondary",
      rejectLabel: "Cancel",
    });
  };

  const removePartner = (partner: ICategoryPartner) => {
    if (!activeCategory) return;
    PartnerService.updateCategoryOffers(activeCategory.id, [], [
      partner.partner_id,
    ])
      .then((success) => {
        if (success) {
          toast.current?.show({
            severity: "success",
            summary: "Partner Removed",
            detail: "The partner has been removed from this category",
          });
          loadCategories();
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Remove Failed",
            detail: "The partner could not be removed",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.current?.show({
          severity: "error",
          summary: "Server Error",
          detail: "Something went wrong while removing the partner",
        });
      });
  };

  // ---------------------------------------------------------------------------
  // Cell / column templates
  // ---------------------------------------------------------------------------

  const partnersCountTemplate = (row: ICategoryWithOffers) => {
    return <span>{row.partners.length}</span>;
  };

  const actionBodyTemplate = (row: ICategoryWithOffers) => (
    <div className="flex gap-3 justify-content-center align-items-center">
      <IconPartners
        size={24}
        title="View partners"
        className="pressable text-primary"
        onClick={() => openPartners(row)}
      />
      {canEdit && (
        <IconEdit
          size={24}
          title="Edit"
          className="pressable text-primary"
          onClick={() => openEdit(row)}
        />
      )}
      {canDelete && (
        <IconDelete
          size={24}
          title="Delete"
          className="pressable text-red-500"
          onClick={() => confirmDelete(row)}
        />
      )}
    </div>
  );

  return (
    <>
      <div className="page-container grid">
        <div className="col-12 text-left">
          <Button
            icon={<IconBack className="mr-1" size={16} />}
            className="p-button-secondary text-xs"
            onClick={() => {
              navigate("/partner");
            }}
            label="Back"
          />
        </div>
        <div className="col-12">
          <Toolbar
            className="p-2 m-0"
            left={leftToolbarContent}
            right={rightToolbarContent}
          />
        </div>
        <div className="col-12">
          <div className="w-full partner-category-table-container">
            {canRead && (
              <DataTable
                columnResizeMode="fit"
                globalFilterFields={["pcategory_en", "pcategory_de"]}
                emptyMessage="No categories found!"
                scrollable
                scrollHeight="flex"
                header={tableHeaderTemplate}
                className="w-full"
                value={categoryList}
                filterDisplay="menu"
                filters={filters}
                showGridlines
              >
                {columns.map(({ field, header }) => {
                  return (
                    <Column
                      key={field}
                      field={field}
                      headerClassName={"py-2 px-2"}
                      bodyClassName={"py-2 px-2"}
                      header={header}
                    />
                  );
                })}
                <Column
                  header="Partners"
                  headerClassName={"py-2 px-2"}
                  bodyClassName={"py-2 px-2"}
                  body={partnersCountTemplate}
                  style={{ width: "6rem", textAlign: "center" }}
                />
                <Column
                  field="totalAvail"
                  header="Total Avail in the Past Year"
                  headerClassName={"py-2 px-2"}
                  bodyClassName={"py-2 px-2"}
                  style={{ width: "15rem", textAlign: "center" }}
                />
                <Column
                  header="Actions"
                  headerClassName={"py-2 px-2"}
                  bodyClassName={"py-2 px-2"}
                  body={actionBodyTemplate}
                  style={{ width: "10rem", textAlign: "center" }}
                />
              </DataTable>
            )}
          </div>
        </div>

        {/* Add / Edit category dialog (extracted component) */}
        <CategoryFormDialog
          visible={categoryDialog}
          mode={dialogMode}
          value={category}
          submitted={submitted}
          saving={saving}
          onChange={setCategory}
          onHide={hideDialog}
          onSave={saveCategory}
        />

        {/* Partners dialog (extracted component) */}
        <PartnersDialog
          visible={partnersDialog}
          category={activeCategory}
          canEdit={canEdit}
          canDelete={canDelete}
          onHide={hidePartners}
          onEditPartner={openOffersTags}
          onRemovePartner={confirmRemovePartner}
        />

        {/* Offers & tags editor for a single partner */}
        <PartnerOffersTagsDialog
          visible={offersTagsDialog}
          partner={activePartner}
          toast={toast}
          onHide={hideOffersTags}
          onSaved={loadCategories}
        />

        <ConfirmDialog />
        <Toast
          ref={toast}
          className="text-xs text-left"
          position="bottom-right"
        />
      </div>
    </>
  );
};

export default PartnerCategory;
