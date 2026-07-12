import React, { useState, useEffect } from "react";
import { request } from "../services/api";
import { Card, Form, Table } from "../components/ui/Shared";

export default function Vehicles({ notify, auth }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ type: "Van", region: "West" });
  const canEdit = auth.role === "Fleet Manager";

  const load = async () => setRows(await request("/vehicles"));
  useEffect(() => { load().catch((err) => notify(err.message)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await request("/vehicles", { method: "POST", body: JSON.stringify(form) });
      setForm({ type: "Van", region: "West" });
      await load();
      notify("Vehicle registered");
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <Card title="Vehicle Registry">
      {canEdit && (
        <Form onSubmit={submit}>
          <input placeholder="Reg No" required onChange={(e) => setForm({...form, regNo: e.target.value})} />
          <input placeholder="Name" required onChange={(e) => setForm({...form, name: e.target.value})} />
          <select required onChange={(e) => setForm({...form, type: e.target.value})}>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Bus">Bus</option>
          </select>
          <input placeholder="Max Load (kg)" type="number" required onChange={(e) => setForm({...form, maxLoad: e.target.value})} />
          <input placeholder="Odometer" type="number" required onChange={(e) => setForm({...form, odometer: e.target.value})} />
          <input placeholder="Acquisition Cost" type="number" required onChange={(e) => setForm({...form, acquisitionCost: e.target.value})} />
          <select required onChange={(e) => setForm({...form, region: e.target.value})}>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </Form>
      )}
      <Table rows={rows} fields={["regNo", "name", "type", "maxLoad", "odometer", "status"]} />
    </Card>
  );
}