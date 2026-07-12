import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
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

export default function Analytics({ notify }) {
  const [reports, setReports] = useState([]);
  const [trips, setTrips] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    Promise.all([request("/reports"), request("/trips"), request("/dashboard")])
      .then(([repData, tripData, dashData]) => {
        setReports(repData);
        setTrips(tripData);
        setDashboard(dashData);
      })
      .catch((err) => notify(err.message));
  }, [notify]);

  if (!dashboard || reports.length === 0) return <p className="muted">Compiling analytics...</p>;

  // --- KPI Calculations ---
  const totalOpCost = reports.reduce((sum, r) => sum + (r.operationalCost || 0), 0);
  
  // Calculate average fuel efficiency (ignoring 0s to prevent skewed data)
  const activeVehiclesWithFuel = reports.filter(r => r.fuelEfficiency > 0);
  const avgFuelEff = activeVehiclesWithFuel.length 
    ? (activeVehiclesWithFuel.reduce((sum, r) => sum + r.fuelEfficiency, 0) / activeVehiclesWithFuel.length).toFixed(1)
    : 0;
    
  const avgRoi = reports.length 
    ? (reports.reduce((sum, r) => sum + r.roi, 0) / reports.length).toFixed(1) 
    : 0;

  // --- Chart 1: Monthly Revenue (Aggregating trips by month) ---
  const monthlyDataMap = trips.reduce((acc, trip) => {
    if(trip.status === "Completed" && trip.revenue) {
      // Get short month name (e.g., "Jul")
      const month = new Date(trip.createdAt).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + trip.revenue;
    }
    return acc;
  }, {});
  
  const revenueChartData = Object.keys(monthlyDataMap).map(month => ({
    name: month,
    Revenue: monthlyDataMap[month]
  }));

  // --- Chart 2: Top Costliest Vehicles (Horizontal Bar) ---
  const costliestVehicles = [...reports]
    .sort((a, b) => b.operationalCost - a.operationalCost)
    .slice(0, 3) // Take top 3
    .map(v => ({
      name: v.regNo.split("-").pop() || v.vehicle, // Shorten name for chart
      Cost: v.operationalCost
    }));

  return (
    <>
      <div className="kpis" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <Kpi title="Avg Fuel Efficiency" value={`${avgFuelEff} km/l`} color="#3b82f6" />
        <Kpi title="Fleet Utilization" value={`${dashboard.fleetUtilization}%`} color="#14b8a6" />
        <Kpi title="Total Operational Cost" value={`₹${totalOpCost.toLocaleString("en-IN")}`} color="#f59e0b" />
        <Kpi title="Average Vehicle ROI" value={`${avgRoi}%`} color="#10b981" />
      </div>
      
      <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
        ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </p>

      <div className="two">
        <Card title="Monthly Revenue">
          <ResponsiveContainer height={300}>
            <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.05)" }} contentStyle={{ borderRadius: "8px" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Costliest Vehicles">
          <ResponsiveContainer height={300}>
            <BarChart data={costliestVehicles} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.05)" }} contentStyle={{ borderRadius: "8px" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Cost" fill="#f87171" radius={[0, 4, 4, 0]} barSize={24}>
                {costliestVehicles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#f87171", "#fb923c", "#3b82f6"][index % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}