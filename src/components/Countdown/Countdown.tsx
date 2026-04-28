import moment from "moment";
import React, { useEffect, useState } from "react";
import "./Countdown.css";
import { IDateRange } from "../../@types/Reports";

interface Props {
  value: IDateRange;
  size?: number;
}

export const Countdown: React.FC<Props> = ({ value, size = 16 }) => {
  const [timeDifference, setTimeDifference] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // console.log(endDate);
    getDiff();
    const interval = setInterval(() => {
      if (isMounted) {
        if (!getDiff()) {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [value.endDate, value.startDate, timeDifference]);

  const getDiff = () => {
    const date1 = moment(new Date());
    const date2 = moment(value.endDate as Date);
    const diff = date2.diff(date1, "seconds");

    setTimeDifference(diff);
    if (diff < 0) {
      return 0;
    }
  };

  const displayTimeLeft = () => {
    const hours = Math.floor(timeDifference / 3600);
    const minutes = Math.floor((timeDifference % 3600) / 60);
    const seconds = (timeDifference % 3600) % 60;

    if (timeDifference <= 0) {
      return (
        <div className="font-bold text-red-500" style={{ fontSize: size }}>
          EXPIRED
        </div>
      );
    }

    if (!!value.startDate && value.startDate > new Date()) {
      return (
        <div className="font-bold text-orange-300" style={{ fontSize: size }}>
          NOT YET STARTED
        </div>
      );
    }

    return (
      <div>
        <label className="font-bold" style={{ fontSize: size }}>
          {`${hours} Hours, ` + `${minutes} Minutes, ` + `${seconds} Seconds`}
        </label>{" "}
        remaining
      </div>
    );
  };

  return <div>{displayTimeLeft()}</div>;
};
