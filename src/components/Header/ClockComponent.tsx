import React, { useEffect, useState } from "react";

function ClockComponent() {
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const formatted = now.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      });

      setDateTime(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>{dateTime}</>
  );
}

export default ClockComponent;