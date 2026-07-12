import React, { useState, useEffect } from "react";
import { request } from "../../services/api";
import { Card, Form, Table } from "./Shared";

export default function SimpleCreate({ notify, title, listPath, createPath, fields }) {
  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({});

  const load = async () => {
    const [items, vehicleRows] = await Promise.all([request(listPath), request("/vehicles")]);
    setRows(items);
    setVehicles(vehicleRows);
  };

  useEffect(() => { load().catch((err) => notify(err.message)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await request(createPath, { method: "POST", body: JSON.stringify(form) });
    await load();
    notify(`${title} saved`);
  };

  return (
    <Card title={title}>
      <Form onSubmit={submit}>
        {fields.map((field) =>
          field === "vehicle" ? (
            <select key={field} required onChange={(e) => setForm({...form, [field]: e.target.value})}>
              <option value="">Select Vehicle</option>
              {vehicles.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          ) : field === "date" ? (
            <input key={field} type="date" required onChange={(e) => setForm({...form, [field]: e.target.value})} />
          ) : (
            <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} required onChange={(e) => setForm({...form, [field]: e.target.value})} />
          )
        )}
      </Form>
      <Table rows={rows.map((r) => ({ ...r, vehicle: r.vehicle?.name }))} fields={fields} />
    </Card>
  );
}