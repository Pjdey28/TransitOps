import React, { useState, useEffect } from "react";
import { request } from "../services/api";
import { Card, Form, Table } from "../components/ui/Shared";

export default function Settings({ notify, auth }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ role: "Driver" });
  
  const canEdit = auth.role === "Fleet Manager";

  const load = async () => setUsers(await request("/users"));
  
  useEffect(() => { 
    if (canEdit) load().catch((err) => notify(err.message)); 
  }, [canEdit]);

  const changeRole = async (id, newRole) => {
    try {
      await request(`/users/${id}/role`, { 
        method: "PATCH", 
        body: JSON.stringify({ role: newRole }) 
      });
      await load();
      notify("Role updated");
    } catch (err) {
      notify(err.message);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await request("/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ role: "Driver" }); // Reset form
      document.getElementById("createUserForm").reset();
      await load();
      notify("User account created successfully");
    } catch (err) {
      notify(err.message);
    }
  };

  if (!canEdit) return <p className="muted">You do not have permission to view Settings.</p>;

  return (
    <>
      <Card title="Create New User">
        <Form onSubmit={createUser}>
          <input id="createUserForm" placeholder="Full Name" required onChange={(e) => setForm({...form, name: e.target.value})} />
          <input placeholder="Email Address" type="email" required onChange={(e) => setForm({...form, email: e.target.value})} />
          <input placeholder="Temporary Password" type="password" minLength={6} required onChange={(e) => setForm({...form, password: e.target.value})} />
          <select required value={form.role || "Driver"} onChange={(e) => setForm({...form, role: e.target.value})}>
            <option value="Fleet Manager">Fleet Manager</option>
            <option value="Safety Officer">Safety Officer</option>
            <option value="Financial Analyst">Financial Analyst</option>
            <option value="Driver">Driver</option>
          </select>
        </Form>
      </Card>

      <div style={{ marginTop: "24px" }}>
        <Card title="RBAC & User Directory">
          <div className="table">
            <div className="row head">
              <span>Name</span><span>Email</span><span>Current Role</span><span>Change Role</span>
            </div>
            {users.map(u => (
              <div className="row" key={u._id}>
                <span>{u.name}</span>
                <span>{u.email}</span>
                <span>{u.role}</span>
                <span>
                  {u.email !== auth.email ? (
                    <select 
                      value={u.role} 
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      style={{ minHeight: "32px", padding: "0 8px" }}
                    >
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Driver">Driver</option>
                      <option value="Safety Officer">Safety Officer</option>
                      <option value="Financial Analyst">Financial Analyst</option>
                    </select>
                  ) : (
                    <span className="muted">Current User</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}