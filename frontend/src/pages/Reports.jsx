import React, { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import { request } from "../services/api";
import { Card, Table } from "../components/ui/Shared";

export default function Reports({ notify }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    request("/reports")
      .then(setRows)
      .catch((err) => notify(err.message));
  }, [notify]);

  const exportCsv = () => {
    const headers = ["vehicle", "regNo", "fuelEfficiency", "operationalCost", "roi"];
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => r[h]).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "transitops-report.csv";
    a.click();
  };

  return (
    <Card title="Reports & Analytics">
      <div className="actions">
        <button onClick={exportCsv}><Download size={16} /> Export CSV</button>
        <button onClick={() => window.print()}><FileText size={16} /> Export PDF</button>
      </div>
      <Table rows={rows} fields={["vehicle", "regNo", "fuelEfficiency", "operationalCost", "roi"]} />
    </Card>
  );
}