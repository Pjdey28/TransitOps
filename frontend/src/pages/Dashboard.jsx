import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { request } from "../services/api";
import { Card } from "../components/ui/Shared";

function Kpi({ title, value }) {
  return (
    <motion.div className="card kpi" whileHover={{ y: -4 }}>
      <p>{title}</p>
      <strong>{value}</strong>
    </motion.div>
  );
}

export default function Dashboard({ notify }) {
  const [data, setData] = useState(null);
  
  // Filter states
  const [fType, setFType] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fRegion, setFRegion] = useState("");

  useEffect(() => {
    request("/dashboard")
      .then(setData)
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

  // Recalculate KPIs based on filtered vehicles
  const activeVehicles = filteredVehicles.filter(v => v.status === "On Trip").length;
  const availableVehicles = filteredVehicles.filter(v => v.status === "Available").length;
  const inShop = filteredVehicles.filter(v => v.status === "In Shop").length;
  const utilization = filteredVehicles.length ? Math.round((activeVehicles / filteredVehicles.length) * 100) : 0;

  const pie = ["Available", "On Trip", "In Shop", "Retired"].map((status) => ({
    name: status,
    value: filteredVehicles.filter((v) => v.status === status).length
  }));

  return (
    <>
      <div className="actions card" style={{ padding: "12px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        <select onChange={(e) => setFType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
        </select>
        <select onChange={(e) => setFStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="In Shop">In Shop</option>
        </select>
        <select onChange={(e) => setFRegion(e.target.value)}>
          <option value="">All Regions</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
      </div>

      <div className="kpis">
        <Kpi title="Active Vehicles" value={activeVehicles} />
        <Kpi title="Available Vehicles" value={availableVehicles} />
        <Kpi title="In Maintenance" value={inShop} />
        <Kpi title="Fleet Utilization" value={`${utilization}%`} />
      </div>

      <div className="two">
        <Card title="Filtered Fleet Status">
          <ResponsiveContainer height={280}>
            <PieChart>
              <Pie data={pie} dataKey="value" innerRadius={72} outerRadius={104} paddingAngle={4} stroke="none">
                {pie.map((_, i) => <Cell key={i} fill={["#14b8a6", "#6366f1", "#f59e0b", "#ef4444"][i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}