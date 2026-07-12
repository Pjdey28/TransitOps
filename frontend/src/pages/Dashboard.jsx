import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { request } from "../services/api";
import { Card } from "../components/ui/Shared";

function Kpi({ title, value, color }) {
  return (
    <motion.div className="card kpi" style={{ borderLeft: `4px solid ${color || 'transparent'}` }} whileHover={{ y: -4 }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
      <strong>{value}</strong>
    </motion.div>
  );
}

export default function Dashboard({ notify }) {
  const [data, setData] = useState(null);
  const [trips, setTrips] = useState([]);
  
  const [fType, setFType] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fRegion, setFRegion] = useState("");

  useEffect(() => {
    Promise.all([request("/dashboard"), request("/trips")])
      .then(([dashData, tripData]) => {
        setData(dashData);
        setTrips(tripData.slice(0, 5));
      })
      .catch((err) => notify(err.message));
  }, [notify]);

  const filteredVehicles = useMemo(() => {
    if (!data) return [];
    return data.vehicleData.filter(v => {
      const matchType = fType ? v.type === fType : true;
      const matchStatus = fStatus ? v.status === fStatus : true;
      const matchRegion = fRegion ? v.region === fRegion : true;
      return matchType && matchStatus && matchRegion;
    });
  }, [data, fType, fStatus, fRegion]);

  if (!data) return <p className="muted">Loading dashboard...</p>;

  const activeVehicles = filteredVehicles.filter(v => v.status === "On Trip").length;
  const availableVehicles = filteredVehicles.filter(v => v.status === "Available").length;
  const inShop = filteredVehicles.filter(v => v.status === "In Shop").length;
  const utilization = filteredVehicles.length ? Math.round((activeVehicles / filteredVehicles.length) * 100) : 0;

  const pie = ["Available", "On Trip", "In Shop", "Retired"].map((status) => ({
    name: status,
    value: filteredVehicles.filter((v) => v.status === status).length
  }));

  const COLORS = ["#14b8a6", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <>
      <div className="actions card" style={{ padding: "12px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        <select onChange={(e) => setFType(e.target.value)}>
          <option value="">Vehicle Type: All</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Bus">Bus</option>
        </select>
        <select onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Status: All</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
        </select>
        <select onChange={(e) => setFRegion(e.target.value)}>
          <option value="">Region: All</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
      </div>

      <div className="kpis" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "10px" }}>
        <Kpi title="Active Vehicles" value={activeVehicles} color="#3b82f6" />
        <Kpi title="Available Vehicles" value={availableVehicles} color="#14b8a6" />
        <Kpi title="In Maintenance" value={inShop} color="#f59e0b" />
        <Kpi title="Active Trips" value={data.activeTrips} color="#3b82f6" />
        <Kpi title="Pending Trips" value={data.pendingTrips} color="#94a3b8" />
        <Kpi title="Drivers On Duty" value={data.driversOnDuty} color="#3b82f6" />
        <Kpi title="Fleet Utilization" value={`${utilization}%`} color="#14b8a6" />
      </div>

      <div className="two" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <Card title="Recent Trips">
          <div className="table">
            <div className="row head" style={{ minWidth: "100%" }}>
              <span>Route</span><span>Vehicle</span><span>Driver</span><span>Status</span>
            </div>
            {trips.map(t => (
              <div className="row" key={t._id} style={{ minWidth: "100%" }}>
                <span>{t.source} &rarr; {t.destination}</span>
                <span>{t.vehicle?.name || "-"}</span>
                <span>{t.driver?.name || "-"}</span>
                <span>
                  <div style={{
                    display: "inline-block", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                    background: t.status === 'Dispatched' ? '#3b82f620' : t.status === 'Completed' ? '#14b8a620' : '#94a3b820',
                    color: t.status === 'Dispatched' ? '#3b82f6' : t.status === 'Completed' ? '#14b8a6' : '#94a3b8'
                  }}>
                    {t.status}
                  </div>
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Vehicle Status">
          <ResponsiveContainer height={250}>
            <PieChart>
              <Pie data={pie} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={4} stroke="none">
                {pie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}