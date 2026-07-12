import React, { useState, useEffect } from "react";
import { request } from "../services/api";
import { Card, Form, Table } from "../components/ui/Shared";

export default function Drivers({ notify, auth }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ licenseCategory: "LMV", status: "Available" });
  
  // RBAC: Only Fleet Manager and Safety Officer can edit
  const canEdit = ["Fleet Manager", "Safety Officer"].includes(auth.role);

  const load = async () => setRows(await request("/drivers"));
  useEffect(() => { load().catch((err) => notify(err.message)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await request("/drivers", { method: "POST", body: JSON.stringify(form) });
      await load();
      setForm({ licenseCategory: "LMV", status: "Available" }); 
      notify("Driver added");
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <Card title="Driver Management">
      {canEdit && (
        <Form onSubmit={submit}>
          <input placeholder="Name" required onChange={(e) => setForm({...form, name: e.target.value})} />
          <input placeholder="License No." required onChange={(e) => setForm({...form, licenseNo: e.target.value})} />
          <select required value={form.licenseCategory || "LMV"} onChange={(e) => setForm({...form, licenseCategory: e.target.value})}>
            <option value="LMV">LMV (Light Motor Vehicle)</option>
            <option value="HMV">HMV (Heavy Motor Vehicle)</option>
            <option value="Transport">Transport</option>
          </select>
          <input type="date" required onChange={(e) => setForm({...form, licenseExpiry: e.target.value})} title="License Expiry Date" />
          <input placeholder="Contact Number" required onChange={(e) => setForm({...form, contact: e.target.value})} />
          
          <input placeholder="Safety Score (0-100)" type="number" min="0" max="100" required onChange={(e) => setForm({...form, safetyScore: e.target.value})} />
        </Form>
      )}
      <Table rows={rows} fields={["name", "licenseNo", "licenseCategory", "licenseExpiry", "contact", "safetyScore", "status"]} />
    </Card>
  );
}