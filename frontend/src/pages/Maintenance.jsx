import React, { useState, useEffect } from "react";
import { request } from "../services/api";
import { Card, Form } from "../components/ui/Shared";

export default function Maintenance({ notify, auth }) {
  const [rows, setRows] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({});

  const canEdit = auth.role === "Fleet Manager";

  const load = async () => {
    const [m, v] = await Promise.all([request("/maintenance"), request("/vehicles")]);
    setRows(m);
    setVehicles(v);
  };

  useEffect(() => { load().catch(err => notify(err.message)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await request("/maintenance", { method: "POST", body: JSON.stringify(form) });
    await load();
    notify("Maintenance started");
  };

  const close = async (id) => {
    await request(`/maintenance/${id}/close`, { method: "PATCH" });
    await load();
    notify("Maintenance closed");
  };

  return (
    <Card title="Maintenance Workflow">
      {canEdit && (
        <Form onSubmit={submit}>
          <select required onChange={(e) => setForm({...form, vehicle: e.target.value})}>
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
          <input placeholder="Service Title" required onChange={(e) => setForm({...form, title: e.target.value})} />
          <input placeholder="Cost" type="number" required onChange={(e) => setForm({...form, cost: e.target.value})} />
          <input type="date" required onChange={(e) => setForm({...form, date: e.target.value})} />
        </Form>
      )}

      <div className="table">
        <div className="row head">
          <span>Vehicle</span><span>Title</span><span>Cost</span><span>Status</span><span>Action</span>
        </div>
        {rows.map((r) => (
          <div className="row" key={r._id}>
            <span>{r.vehicle?.name}</span>
            <span>{r.title}</span>
            <span>₹{r.cost}</span>
            <span>{r.status}</span>
            <span>{r.status === "Active" && canEdit && <button onClick={() => close(r._id)}>Close</button>}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}