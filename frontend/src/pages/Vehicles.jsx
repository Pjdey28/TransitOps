import React, { useState, useEffect } from "react";
import { request } from "../services/api";
import { Card, Form, Table } from "../components/ui/Shared";

export default function Vehicles({ notify, auth }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const canEdit = auth.role === "Fleet Manager";

  const load = async () => setRows(await request("/vehicles"));
  useEffect(() => { load().catch((err) => notify(err.message)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await request("/vehicles", { method: "POST", body: JSON.stringify(form) });
      setForm({});
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
          <input placeholder="Reg No" onChange={(e) => setForm({...form, regNo: e.target.value})} />
          <input placeholder="Name" onChange={(e) => setForm({...form, name: e.target.value})} />
          <input placeholder="Capacity" type="number" onChange={(e) => setForm({...form, maxLoad: e.target.value})} />
        </Form>
      )}
      <Table rows={rows} fields={["regNo", "name", "type", "maxLoad", "status"]} />
    </Card>
  );
}