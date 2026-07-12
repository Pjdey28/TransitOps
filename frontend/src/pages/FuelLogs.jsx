import React from "react";
import SimpleCreate from "../components/ui/SimpleCreate";

export default function FuelLogs({ notify }) {
  return (
    <SimpleCreate 
      notify={notify} 
      title="Fuel Logs" 
      listPath="/fuel" 
      createPath="/fuel" 
      fields={["vehicle", "liters", "cost", "distance", "date"]} 
    />
  );
}