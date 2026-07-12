import { Maintenance, Fuel, Expense, Vehicle } from "../models/index.js";

// --- Maintenance ---
export const getMaintenance = async (req, res) => {
  res.json(await Maintenance.find().populate("vehicle").sort({ createdAt: -1 }));
};

export const createMaintenance = async (req, res) => {
  const log = await Maintenance.create(req.body);
  await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: "In Shop" });
  res.status(201).json(await log.populate("vehicle"));
};

export const closeMaintenance = async (req, res) => {
  const log = await Maintenance.findById(req.params.id);
  if (!log) return res.status(404).json({ message: "Maintenance record not found" });

  log.status = "Closed";
  await log.save();

  const vehicle = await Vehicle.findById(log.vehicle);
  if (vehicle.status !== "Retired") {
    vehicle.status = "Available";
    await vehicle.save();
  }
  res.json(await log.populate("vehicle"));
};

// --- Fuel ---
export const getFuelLogs = async (req, res) => {
  res.json(await Fuel.find().populate("vehicle").sort({ createdAt: -1 }));
};

export const createFuelLog = async (req, res) => {
  res.status(201).json(await Fuel.create(req.body));
};

// --- Expenses ---
export const getExpenses = async (req, res) => {
  res.json(await Expense.find().populate("vehicle").sort({ createdAt: -1 }));
};

export const createExpense = async (req, res) => {
  res.status(201).json(await Expense.create(req.body));
};