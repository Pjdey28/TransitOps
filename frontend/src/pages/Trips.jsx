import React, { useState, useEffect } from "react";
import { request } from "../services/api";
import { Card, Table } from "../components/ui/Shared";

export default function Trips({ notify, auth }) {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({});

  const canEdit = ["Fleet Manager", "Driver"].includes(auth.role);

  const load = async () => {
    const [t, v, d] = await Promise.all([request("/trips"), request("/vehicles"), request("/drivers")]);
    setTrips(t); setVehicles(v); setDrivers(d);
  };

  useEffect(() => { load().catch((err) => notify(err.message)); }, []);

  const submit = async (e, isDraft) => {
    e.preventDefault();
    try {
      await request("/trips", { method: "POST", body: JSON.stringify({ ...form, isDraft }) });
      await load();
      notify(isDraft ? "Draft saved" : "Trip dispatched");
    } catch (err) {
      notify(err.message);
    }
  };

  const dispatchDraft = async (id) => {
    try {
      await request(`/trips/${id}/dispatch`, { method: "PATCH" });
      await load();
      notify("Trip dispatched");
    } catch (err) {
      notify(err.message);
    }
  };

  const complete = async (id) => {
    const finalOdometer = prompt("Final odometer?");
    const fuelConsumed = prompt("Fuel consumed?");
    if (!finalOdometer) return;
    
    await request(`/trips/${id}/complete`, {
      method: "PATCH", body: JSON.stringify({ finalOdometer, fuelConsumed })
    });
    await load();
    notify("Trip completed");
  };

  return (
    <Card title="Trip Management">
      {canEdit && (
        <form className="form">
          <input placeholder="Source" required onChange={(e) => setForm({...form, source: e.target.value})} />
          <input placeholder="Destination" required onChange={(e) => setForm({...form, destination: e.target.value})} />
          <select required onChange={(e) => setForm({...form, vehicle: e.target.value})}>
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} ({v.status})</option>)}
          </select>
          <select required onChange={(e) => setForm({...form, driver: e.target.value})}>
            <option value="">Select Driver</option>
            {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.status})</option>)}
          </select>
          <input placeholder="Cargo Weight" type="number" required onChange={(e) => setForm({...form, cargoWeight: e.target.value})} />
          
          <div className="actions" style={{ marginBottom: 0, marginTop: "10px" }}>
            <button type="button" onClick={(e) => submit(e, true)}>Save Draft</button>
            <button type="button" onClick={(e) => submit(e, false)}>Dispatch Now</button>
          </div>
        </form>
      )}
      
      <div className="table">
        <div className="row head">
          <span>Route</span><span>Vehicle</span><span>Driver</span><span>Status</span><span>Action</span>
        </div>
        {trips.map(t => (
          <div className="row" key={t._id}>
            <span>{t.source} to {t.destination}</span>
            <span>{t.vehicle?.name}</span>
            <span>{t.driver?.name}</span>
            <span>{t.status}</span>
            <span>
              {t.status === "Draft" && canEdit && <button onClick={() => dispatchDraft(t._id)}>Dispatch</button>}
              {t.status === "Dispatched" && canEdit && <button onClick={() => complete(t._id)}>Complete</button>}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}