import { Vehicle, Driver, Trip, Fuel, Maintenance, Expense } from "../models/index.js";

export const getDashboardStats = async (req, res) => {
  const vehicles = await Vehicle.find();
  const drivers = await Driver.find();
  const trips = await Trip.find();

  res.json({
    activeVehicles: vehicles.filter((v) => v.status === "On Trip").length,
    availableVehicles: vehicles.filter((v) => v.status === "Available").length,
    vehiclesInMaintenance: vehicles.filter((v) => v.status === "In Shop").length,
    activeTrips: trips.filter((t) => t.status === "Dispatched").length,
    pendingTrips: trips.filter((t) => t.status === "Draft").length,
    driversOnDuty: drivers.filter((d) => d.status === "On Trip").length,
    fleetUtilization: vehicles.length
      ? Math.round((vehicles.filter((v) => v.status === "On Trip").length / vehicles.length) * 100)
      : 0,
    vehicleData: vehicles // Send vehicle data for charts
  });
};

export const getReports = async (req, res) => {
  const vehicles = await Vehicle.find();
  const trips = await Trip.find();
  const fuel = await Fuel.find();
  const maintenance = await Maintenance.find();
  const expenses = await Expense.find();

  const rows = vehicles.map((v) => {
    const vehicleTrips = trips.filter((t) => String(t.vehicle) === String(v._id));
    const vehicleFuel = fuel.filter((f) => String(f.vehicle) === String(v._id));
    const vehicleMaintenance = maintenance.filter((m) => String(m.vehicle) === String(v._id));
    const vehicleExpenses = expenses.filter((e) => String(e.vehicle) === String(v._id));

    const totalFuel = vehicleFuel.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenance = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalExpenses = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);
    const revenue = vehicleTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const distance = vehicleFuel.reduce((sum, f) => sum + (f.distance || 0), 0);
    const liters = vehicleFuel.reduce((sum, f) => sum + (f.liters || 0), 0);

    return {
      vehicle: v.name,
      regNo: v.regNo,
      fuelEfficiency: liters ? Number((distance / liters).toFixed(2)) : 0,
      operationalCost: totalFuel + totalMaintenance + totalExpenses,
      roi: Number((((revenue - totalFuel - totalMaintenance) / Math.max(v.acquisitionCost, 1)) * 100).toFixed(2))
    };
  });

  res.json(rows);
};