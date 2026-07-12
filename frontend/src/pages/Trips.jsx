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

  const cancel = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this trip?")) return;
    try {
      await request(`/trips/${id}/cancel`, { method: "PATCH" });
      await load();
      notify("Trip cancelled");
    } catch (err) {
      notify(err.message);
    }
  };

  const availableVehicles = vehicles.filter(v => v.status === "Available");
  const availableDrivers = drivers.filter(d => d.status === "Available");
  const selectedVehicleData = availableVehicles.find(v => v._id === form.vehicle);
  const cargoWeightNum = Number(form.cargoWeight) || 0;
  const capacityExceeded = selectedVehicleData && cargoWeightNum > selectedVehicleData.maxLoad;
  const excessWeight = capacityExceeded ? cargoWeightNum - selectedVehicleData.maxLoad : 0;

  return (
    <Card title="Trip Management">
      {canEdit && (
        <form className="form">
          <input placeholder="Source" required onChange={(e) => setForm({...form, source: e.target.value})} />
          <input placeholder="Destination" required onChange={(e) => setForm({...form, destination: e.target.value})} />
          <select required onChange={(e) => setForm({...form, vehicle: e.target.value})}>
            <option value="">Select Vehicle</option>
            {availableVehicles.map(v => <option key={v._id} value={v._id}>{v.name} ({v.maxLoad}kg)</option>)}
          </select>
          <select required onChange={(e) => setForm({...form, driver: e.target.value})}>
            <option value="">Select Driver</option>
            {availableDrivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <input placeholder="Cargo Weight (kg)" type="number" required onChange={(e) => setForm({...form, cargoWeight: e.target.value})} />
          <input placeholder="Planned Distance (km)" type="number" required onChange={(e) => setForm({...form, plannedDistance: e.target.value})} />

          {capacityExceeded && (
            <div style={{ color: "#ef4444", border: "1px solid #ef4444", padding: "12px", borderRadius: "8px", marginTop: "10px", gridColumn: "span 4", background: "rgba(239, 68, 68, 0.05)" }}>
              <p style={{ margin: 0, fontSize: "13px" }}>Vehicle Capacity: <strong>{selectedVehicleData.maxLoad} kg</strong></p>
              <p style={{ margin: "4px 0", fontSize: "13px" }}>Cargo Weight: <strong>{cargoWeightNum} kg</strong></p>
              <strong style={{ display: "block", marginTop: "8px", fontSize: "14px" }}>
                ❌ Capacity exceeded by {excessWeight} kg — dispatch blocked
              </strong>
            </div>
          )}

          <div className="actions" style={{ marginBottom: 0, marginTop: "10px", gridColumn: "span 4" }}>
            <button type="button" onClick={(e) => submit(e, true)} disabled={capacityExceeded} style={{ opacity: capacityExceeded ? 0.5 : 1, cursor: capacityExceeded ? "not-allowed" : "pointer" }}>Save Draft</button>
            <button type="button" onClick={(e) => submit(e, false)} disabled={capacityExceeded} style={{ opacity: capacityExceeded ? 0.5 : 1, cursor: capacityExceeded ? "not-allowed" : "pointer" }}>Dispatch Now</button>
          </div>
        </form>
      )}
      
      <div className="table" style={{ marginTop: "24px" }}>
        <div className="row head">
          <span>Route</span><span>Vehicle</span><span>Driver</span><span>Status</span><span>Action</span>
        </div>
        {trips.map(t => (
          <div className="row" key={t._id}>
            <span>{t.source} to {t.destination}</span>
            <span>{t.vehicle?.name}</span>
            <span>{t.driver?.name}</span>
            <span>{t.status}</span>
            <span style={{display: 'flex', gap: '8px'}}>
              {t.status === "Draft" && canEdit && <button onClick={() => dispatchDraft(t._id)}>Dispatch</button>}
              {t.status === "Dispatched" && canEdit && (
                <>
                  <button onClick={() => complete(t._id)}>Complete</button>
                  <button onClick={() => cancel(t._id)} style={{background: '#ef4444'}}>Cancel</button>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}