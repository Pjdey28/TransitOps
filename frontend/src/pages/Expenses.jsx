import React from "react";
import SimpleCreate from "../components/ui/SimpleCreate";

export default function Expenses({ notify }) {
  return (
    <SimpleCreate 
      notify={notify} 
      title="Expenses" 
      listPath="/expenses" 
      createPath="/expenses" 
      fields={["vehicle", "type", "amount", "date"]} 
    />
  );
}