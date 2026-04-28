import "./LinkSelector.css";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { IApp } from "../../@types/AppInfo";
import { EventService } from "../../services/Event/Event.services";
import { PartnerService } from "../../services/Partner/Partner.service";

const PATH_TYPES = [
  {
    label: "Partner",
    value: "partner",
  },
  {
    label: "Event",
    value: "event",
  },
];

export type PathEnum = "event" | "partner";

interface Props {
  show: boolean;
  selectedApp: IApp | null;
  setPath: Dispatch<SetStateAction<PathEnum>>;
  setValue: Dispatch<SetStateAction<string | number>>;
  path: PathEnum;
  value: number | string;
}

const LinkSelector: React.FC<Props> = ({
  show,
  selectedApp,
  setPath,
  setValue,
  path,
  value,
}) => {
  const [valueList, setValueList] = useState<any>();
  const [valueLabel, setValueLabel] = useState("title");
  const [selectedValue, setSelectedValue] = useState<any>();

  useEffect(() => {
    let isMounted = true;

    const getType = async (selectedPathType: PathEnum) => {
      if (!selectedApp) return;
      let _valueList;
      let _selectedValue;

      switch (selectedPathType) {
        case "event":
          _valueList = await EventService.getAllWebEvents();
          if (isMounted) {
            setValueList(_valueList);
            setValueLabel("eventName");
          }
          break;
        case "partner":
          _valueList = await PartnerService.getAllPartnersByApp(selectedApp.id);
          if (isMounted) {
            setValueList(_valueList);
            setValueLabel("title");
          }
          break;
      }

      // search for valueList the selected value
      if (_valueList && value) {
        for (let i = 0; i<_valueList.length; i++) {
          if (_valueList[i].id === value) {
            setSelectedValue(_valueList[i])
            i=_valueList.length
          }
        }
      }
    };

    if (!!selectedApp && !!path) {
      getType(path);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedApp, path]);

  const onSelectPath = (path: DropdownChangeEvent) => {
    setPath(path.value);
  };

  const onSelectValue = (value: DropdownChangeEvent) => {
    setSelectedValue(value.value)
    setValue(value.value);
  };

  return (
    <div
      className={`${!!show ? "flex w-full" : "hidden"} mb-3`}
      style={{ gap: 8 }}
    >
      <div className="" style={{ flex: 1 }}>
        <label className="block mb-2">Path</label>
        <div className="w-full">
          <Dropdown
            className={"w-full"}
            options={PATH_TYPES}
            value={path}
            onChange={onSelectPath}
          />
        </div>
      </div>
      <div className="" style={{ flex: 1 }}>
        <label className="block mb-2">Value</label>
        <div className="w-full">
          <Dropdown
            filter
            className="w-full"
            options={valueList}
            value={selectedValue}
            optionValue={"id"}
            optionLabel={valueLabel}
            onChange={onSelectValue}
          />
        </div>
      </div>
    </div>
  );
};

export default LinkSelector;
