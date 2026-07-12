import React, { useState, useEffect } from "react";
import { request } from "../services/api";
import { Card } from "../components/ui/Shared";

export default function Settings({ notify, auth }) {
  const [users, setUsers] = useState([]);
  
  // Only Fleet Managers have access to user management
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

  if (!canEdit) return <p className="muted">You do not have permission to view Settings.</p>;

  return (
    <Card title="RBAC & User Management">
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
              {u.email !== auth.email && (
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
              )}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}