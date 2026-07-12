import express from "express";
import { protect, authorize } from "../middleware/middleware.js";
import {
  getTrips,
  createTrip,
  completeTrip,
  cancelTrip,
  dispatchTrip
} from "../controllers/tripController.js";
import {
  getDashboardStats,
  getReports
} from "../controllers/analyticsController.js";
import {
  getMaintenance,
  createMaintenance,
  closeMaintenance,
  getFuelLogs,
  createFuelLog,
  getExpenses,
  createExpense
} from "../controllers/operationsController.js";
import {
  Driver,
  Vehicle,
  Maintenance,
  Fuel,
  Expense,
  Trip,
  User
} from "../models/index.js";
import { getUsers, updateUserRole } from "../controllers/userController.js";
import { createVehicle, getVehicles } from "../controllers/vehicleController.js";

const router = express.Router();

// Dashboard & Analytics
router.get("/dashboard", protect, getDashboardStats);
router.get("/reports", protect, getReports);

// Vehicles
router.get("/vehicles", protect, authorize("Fleet Manager", "Financial Analyst", "Driver"), getVehicles);
router.post("/vehicles", protect, authorize("Fleet Manager"), createVehicle);

router.put("/vehicles/:id", protect, authorize("Fleet Manager"), async (req, res) => {
  const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json(updated);
});

router.delete("/vehicles/:id", protect, authorize("Fleet Manager"), async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: "Vehicle deleted" });
});

// Drivers
router.get("/drivers", protect, authorize("Fleet Manager", "Safety Officer"),async (req, res) => {
  res.json(await Driver.find().sort({ createdAt: -1 }));
});

router.post("/drivers", protect, authorize("Fleet Manager", "Safety Officer"), async (req, res) => {
  const driver = await Driver.create(req.body);
  res.status(201).json(driver);
});

router.put("/drivers/:id", protect, authorize("Fleet Manager", "Safety Officer"), async (req, res) => {
  const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json(updated);
});

router.delete("/drivers/:id", protect, authorize("Fleet Manager", "Safety Officer"), async (req, res) => {
  await Driver.findByIdAndDelete(req.params.id);
  res.json({ message: "Driver deleted" });
});

// Trips
router.get("/trips", protect, authorize("Fleet Manager", "Driver", "Safety Officer"), getTrips);
router.post("/trips", protect, authorize("Fleet Manager", "Driver"), createTrip);
router.patch("/trips/:id/complete", protect, authorize("Fleet Manager", "Driver"), completeTrip);
router.patch("/trips/:id/cancel", protect, authorize("Fleet Manager", "Driver"), cancelTrip);
router.patch("/trips/:id/dispatch", protect, authorize("Fleet Manager", "Driver"), dispatchTrip);

router.delete("/trips/:id", protect, authorize("Fleet Manager", "Driver"), async (req, res) => {
  await Trip.findByIdAndDelete(req.params.id);
  res.json({ message: "Trip deleted" });
});

// Maintenance
router.get("/maintenance", protect, authorize("Fleet Manager"), getMaintenance);
router.post("/maintenance", protect, authorize("Fleet Manager"), createMaintenance);
router.patch("/maintenance/:id/close", protect, authorize("Fleet Manager"), closeMaintenance);

router.put("/maintenance/:id", protect, authorize("Fleet Manager"), async (req, res) => {
  const updated = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("vehicle");

  res.json(updated);
});

router.delete("/maintenance/:id", protect, authorize("Fleet Manager"), async (req, res) => {
  await Maintenance.findByIdAndDelete(req.params.id);
  res.json({ message: "Maintenance record deleted" });
});

// Fuel Logs
router.get("/fuel", protect,authorize("Financial Analyst"), getFuelLogs);
router.post("/fuel", protect, authorize("Financial Analyst"), createFuelLog);

router.put("/fuel/:id", protect, authorize("Financial Analyst"), async (req, res) => {
  const updated = await Fuel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("vehicle");

  res.json(updated);
});

router.delete("/fuel/:id", protect, authorize("Financial Analyst"), async (req, res) => {
  await Fuel.findByIdAndDelete(req.params.id);
  res.json({ message: "Fuel log deleted" });
});

// Expenses
router.get("/expenses", protect,authorize("Financial Analyst"), getExpenses);
router.post("/expenses", protect, authorize("Financial Analyst"), createExpense);

router.put("/expenses/:id", protect, authorize("Financial Analyst"), async (req, res) => {
  const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("vehicle");

  res.json(updated);
});

router.delete("/expenses/:id", protect, authorize("Financial Analyst"), async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Expense deleted" });
});

// Users / Settings
router.get("/users", protect, authorize("Fleet Manager"), getUsers);
router.patch("/users/:id/role", protect, authorize("Fleet Manager"), updateUserRole);

router.delete("/users/:id", protect, authorize("Fleet Manager"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

export default router;