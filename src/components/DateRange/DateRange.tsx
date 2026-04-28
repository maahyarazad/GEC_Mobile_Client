import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Calendar } from "primereact/calendar";
import { IDateRange } from "../../@types/Reports";
import moment from "moment";
import { Nullable } from "primereact/ts-helpers";

interface Props {
  onChange: (range: IDateRange) => void;
  value: IDateRange;
  disabled: boolean
}

function DateRange({ onChange, value, disabled = false }: Props) {
  const [state, setState] = useState<IDateRange>({
    startDate: value.startDate,
    endDate: value.endDate,
  });
  const [dateReset, setDateReset] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setState(value);

    return () => {
      isMounted = false;
    };
  }, [value.startDate, value.endDate]);

  const handleDateChange = (op: "start" | "end", value: Nullable<Date>) => {
    switch (op) {
      case "start":
        onChange({ ...state, startDate: value });
        break;
      case "end":
        onChange({ ...state, endDate: value });
        break;
    }
  };

  const reset = () => {
    setDateReset(true);
  };

  return (
    <div className="flex gap-2 pb-3">
      <div>
        <div>Date Start</div>
        <Calendar
          value={moment(state.startDate as Date).toDate()}
          onChange={(e) => handleDateChange("start", e.value)}
          showTime
          showButtonBar
          hideOnDateTimeSelect
          hourFormat="12"
          disabled={disabled}
        />
      </div>
      <div>
        <div>Date End</div>
        <Calendar
          value={new Date(state.endDate as Date)}
          onChange={(e) => handleDateChange("end", e.value)}
          showTime
          showButtonBar
          hideOnDateTimeSelect
          hourFormat="12"
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default DateRange;
