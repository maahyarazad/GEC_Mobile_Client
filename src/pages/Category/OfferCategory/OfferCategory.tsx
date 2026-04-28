import React, { useEffect, useRef, useState } from "react";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { useNavigate } from "react-router-dom";
import { IOCategory } from "../../../@types/Offer";
import { OfferService } from "../../../services/Offer/Offer.services";
import { ColorPicker } from "primereact/colorpicker";

import "./OfferCategory.css";
import { StorageService } from "../../../services/Storage/Storage.service";

interface Props {}

//Functional Component
const OfferCategory: React.FC<Props> = () => {
  const canRead = StorageService.hasPrivilege(76, 'read')
  const canAdd = StorageService.hasPrivilege(76, 'add')
  const canEdit = StorageService.hasPrivilege(76, 'edit')
  const canDelete = StorageService.hasPrivilege(76, 'delete')
  const canModify = canAdd || canEdit || canDelete

  const navigate = useNavigate();
  const [categoryList, setCategoryList] = useState<IOCategory[]>([]);
  const [prevCategoryList, setPrevCategoryList] = useState<IOCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IOCategory[]>([]);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [updateList, setUpdateList] = useState<IOCategory[]>([]);
  const [removeList, setRemoveList] = useState<IOCategory[]>([]);
  const [addList, setAddList] = useState<IOCategory[]>([]);
  const toast = useRef<Toast>(null);
  const [filterValue, setFilterValue] = useState("");
  const [filters, setFilters] = useState<any>();
  const [color, setColor] = useState("");

  const columns: { field: string; header: string }[] = [
    { field: "category_en", header: "Category (English)" },
    { field: "category_de", header: "Kategorie (German)" },
    { field: "color", header: "Color" },
    { field: "initials", header: "Initials" },
  ];

  useEffect(() => {
    initFilters();

    //get all partner categories
    OfferService.getAllCategories()
      .then((result) => {
        setCategoryList(result);
        setPrevCategoryList(eval(JSON.stringify(result)));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    setShowActionButtons(hasListChanged);
  }, [categoryList]);

  const leftToolbarContent = () => {
    return (
      <div className="text-lg pl-2 font-bold">Manage Offer Categories</div>
    );
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
    const value = val;
    let _filters = { ...filters };
    _filters["global"].value = value;

    setFilters(_filters);
  };

  const onFilterChange = (e: any) => {
    const value = e.target.value;
    setFilterValue(value);
  };

  const clearFilter = () => {
    initFilters();
  };

  const rightToolbarContent = () => {
    if (canAdd || canEdit || canDelete) {
      return (
        <div className="flex gap-2">
          <Button
            disabled={!showActionButtons}
            onClick={handleRevert}
            className="p-button-secondary text-xs"
            icon="pi pi-refresh"
            label="Revert"
          />
          <Button
            disabled={!showActionButtons}
            className="p-button-success text-xs"
            onClick={handleUpdate}
            icon="pi pi-save"
            label="Update"
          />
        </div>
      );
    }
  };

  const tableHeaderTemplate = () => {
    return (
      <>
        <div className="flex justify-content-between p-0 m-0">
          <div>
            <span className="p-input-icon-left">
              <i className="pi pi-search ml-2" />
              <InputText
                className="text-xs w-15rem pl-4"
                value={filterValue}
                onChange={onFilterChange}
                placeholder="Search"
              />
              <i
                onClick={clearFilter}
                className="pi pi-times text-sm pressable"
              />
            </span>
          </div>
          <div className="flex gap-2">
            { canDelete && <Button
              onClick={removeRow}
              disabled={
                selectedCategory == undefined || selectedCategory.length <= 0
              }
              className="text-xs p-button-danger m-0 p-0 h-2rem w-2rem"
              icon="pi pi-minus text-sm font-bold"
            /> }
            { canAdd && <Button
              onClick={addRow}
              className="text-xs p-button-success m-0 p-0 h-2rem w-2rem"
              icon="pi pi-plus text-sm font-bold"
            /> }
          </div>
        </div>
      </>
    );
  };

  const handleSelection = (value: IOCategory[]) => {
    setSelectedCategory(value as IOCategory[]);
  };

  const textEditor = (options: any) => {
    return (
      <>
        <div className="w-full flex relative align-items-center">
          <InputText
            className="text-xs w-full"
            value={options.value != undefined ? options.value : ""}
            onChange={(e) => {
              options.editorCallback(e.target.value);
            }}
          />
        </div>
      </>
    );
  };

  const colorPickerEditor = (options: any) => {
    return (
      <>
        <div className="w-full flex relative align-items-center">
          <InputText
            className="text-xs w-full pl-6"
            value={options.value}
            onChange={(e) => {
              options.editorCallback(e.target.value);
            }}
          />
          <ColorPicker
            className="absolute left-0 ml-1"
            value={options.value}
            onChange={(e) =>
              options.editorCallback(`#${e.value!.toString().toUpperCase()}`)
            }
          />
        </div>
      </>
    );
  };

  const cellEditor = (options: any) => {
    switch (options.field) {
      case "category_en":
      case "category_de":
      case "initials":
        return textEditor(options);

      case "color":
        return colorPickerEditor(options);
    }
  };

  const onCellEditComplete = (e: any) => {
    let { field, newValue, rowData, originalEvent: event } = e;
    console.log(newValue);

    if (newValue != undefined && newValue.trim().length > 0) {
      rowData[field] = newValue;
    } else return event.preventDefault();

    setShowActionButtons(hasListChanged);
  };

  const hasListChanged = () => {
    if (JSON.stringify(categoryList) !== JSON.stringify(prevCategoryList)) {
      return true;
    }
    return false;
  };

  const handleRevert = () => {
    const revert = () => {
      setCategoryList(eval(JSON.stringify(prevCategoryList)));
      setShowActionButtons(false);
      setUpdateList([]);
      setRemoveList([]);
    };

    confirmDialog({
      message: "Are you sure you want to revert your changes?",
      header: "Revert Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: revert,
      acceptClassName: "text-xs p-button-success",
      reject: () => {},
      rejectClassName: "text-xs p-button-danger",
    });
  };

  const addRow = () => {
    const maxId = Math.max(...categoryList.map((category) => category.id), 0);
    const newCategory: IOCategory = {
      id: maxId + 1,
      category_en: "",
      category_de: "",
      color: "#000000",
      initials: "",
    };
    setCategoryList([...categoryList, newCategory]);
  };

  const removeRow = () => {
    let _remove: IOCategory | undefined;
    const _filteredList = categoryList.filter((category) => {
      _remove = selectedCategory.find(
        (selected) => selected.id === category.id
      );
      //Remove List
      if (_remove != undefined) {
        const _toRemove = prevCategoryList.find(
          (prev) => prev.id === _remove!.id
        );
        _toRemove != undefined && removeList.push(_toRemove);
      }
      return !_remove;
    });

    setCategoryList(_filteredList);
    setSelectedCategory([]);
  };

  const handleUpdate = () => {
    if (toast.current != undefined)
      if (isRowEmpty()) {
        toast.current!.show({
          severity: "warn",
          summary: "Empty Row(s)",
          detail: "Row(s) cannot be empty!",
        });
      } else {
        const update = () => {
          let _addList: IOCategory[];
          let _updateList: IOCategory | undefined;

          //Add List
          _addList = categoryList.filter((category) => {
            return !prevCategoryList.find((prev) => prev.id === category.id);
          });
          _addList != undefined &&
            _addList.map((category) => addList.push(category));

          prevCategoryList.map((prev) => {
            _updateList = categoryList.find(
              (category) =>
                category.id === prev.id &&
                JSON.stringify(category) !== JSON.stringify(prev)
            );
            _updateList != undefined && updateList.push(_updateList);
          });

          OfferService.updateCategory(updateList, addList, removeList)
            .then((result) => {
              if (result) {
                toast.current!.show({
                  severity: "success",
                  summary: "Update Successful",
                  detail: "Categories has been updated",
                });
                setUpdateList([]);
                setAddList([]);
                setRemoveList([]);
                setShowActionButtons(false);
                setPrevCategoryList(eval(JSON.stringify(categoryList)));
              } else {
                toast.current!.show({
                  severity: "error",
                  summary: "Update Failed",
                  detail: "Categories was not updated",
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        };

        confirmDialog({
          message: "Are you sure you want to revert your changes?",
          header: "Revert Confirmation",
          icon: "pi pi-exclamation-triangle",
          accept: update,
          acceptClassName: "text-xs p-button-success",
          reject: () => {},
          rejectClassName: "text-xs p-button-danger",
        });
      }
  };

  const isRowEmpty = () => {
    if (
      categoryList.some(
        ({ category_en, category_de, color, initials }) =>
          category_en == undefined ||
          category_en.trim() === "" ||
          category_de == undefined ||
          category_de.trim() === "" ||
          color == undefined ||
          color.trim() === "" ||
          initials == undefined ||
          initials.trim() === ""
      )
    )
      return true;

    return false;
  };

  const cellColorPicker = (rowData: IOCategory) => {
    return <div>{rowData.color}</div>;
  };

  return (
    <>
      <div className="page-container grid">
        <div className="col-12 text-left">
          <Button
            icon={"pi pi-arrow-left text-xs"}
            className="p-button-secondary text-xs"
            onClick={() => {
              navigate(-1);
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
            <DataTable
              columnResizeMode="fit"
              globalFilterFields={[
                "category_en",
                "category_de",
                "color",
                "initials",
              ]}
              emptyMessage="No categories found!"
              onSelectionChange={(e) => handleSelection(e.value)}
              scrollable
              scrollHeight="flex"
              header={tableHeaderTemplate}
              selection={selectedCategory}
              className="w-full text-xs"
              responsiveLayout="scroll"
              selectionMode="checkbox"
              value={categoryList}
              filterDisplay="menu"
              filters={filters}
              showGridlines
            >
              { canModify ? <Column
                selectionMode="multiple"
                style={{ maxWidth: "6%", justifyContent: "center" }}
              ></Column> : <Column></Column> }
              {/* <Column field='id' header="ID" className='p-0 px-2' style={{maxWidth: '6%'}}></Column> */}
              {columns.map(({ field, header }) => {
                return (
                  <Column
                    key={field}
                    field={field}
                    headerClassName={"p-0 px-2"}
                    bodyClassName={"p-0 px-2"}
                    header={header}
                    editor={cellEditor}
                    onCellEditComplete={onCellEditComplete}
                  />
                );
              })}
            </DataTable>
          </div>
        </div>
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

export default OfferCategory;
