import express from "express";
import { protect, authorize } from "../middleware/middleware.js";
import { getTrips, createTrip, completeTrip,cancelTrip,dispatchTrip } from "../controllers/tripController.js";
import { getDashboardStats, getReports } from "../controllers/analyticsController.js";
import { getMaintenance, createMaintenance, closeMaintenance, getFuelLogs, createFuelLog, getExpenses, createExpense } from "../controllers/operationsController.js";
import { Driver, Vehicle } from "../models/index.js";
import { getUsers, updateUserRole } from "../controllers/userController.js";
import {createVehicle, getVehicles} from "../controllers/vehicleController.js";

const router = express.Router();

// Dashboard & Analytics
router.get("/dashboard", protect, getDashboardStats);
router.get("/reports", protect, getReports);

// Vehicles
router.get("/vehicles", protect, getVehicles);
router.post("/vehicles", protect, authorize("Fleet Manager"), createVehicle);
router.put("/vehicles/:id", protect, authorize("Fleet Manager"), async (req, res) => {
  res.json(await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete("/vehicles/:id", protect, authorize("Fleet Manager"), async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: "Vehicle deleted" });
});

// Add to Driver Routes:rs
router.get("/drivers", protect, async (req, res) => res.json(await Driver.find().sort({ createdAt: -1 })));
router.post("/drivers", protect, authorize("Fleet Manager", "Safety Officer"), async (req, res) => res.status(201).json(await Driver.create(req.body)));
router.put("/drivers/:id", protect, authorize("Fleet Manager", "Safety Officer"), async (req, res) => {
  res.json(await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete("/drivers/:id", protect, authorize("Fleet Manager", "Safety Officer"), async (req, res) => {
  await Driver.findByIdAndDelete(req.params.id);
  res.json({ message: "Driver deleted" });
});
// Drive
// Trips
router.get("/trips", protect, getTrips);
router.post("/trips", protect, authorize("Fleet Manager", "Driver"), createTrip);
router.patch("/trips/:id/complete", protect, authorize("Fleet Manager", "Driver"), completeTrip);
router.patch("/trips/:id/cancel", protect, authorize("Fleet Manager", "Driver"), cancelTrip);
router.patch("/trips/:id/dispatch", protect, authorize("Fleet Manager", "Driver"), dispatchTrip);
// Maintenance
router.get("/maintenance", protect, getMaintenance);
router.post("/maintenance", protect, authorize("Fleet Manager"), createMaintenance);
router.patch("/maintenance/:id/close", protect, authorize("Fleet Manager"), closeMaintenance);

// Fuel Logs (Financial Analyst added per RBAC requirements)
router.get("/fuel", protect, getFuelLogs);
router.post("/fuel", protect, authorize("Fleet Manager", "Financial Analyst"), createFuelLog);

// Expenses
router.get("/expenses", protect, getExpenses);
router.post("/expenses", protect, authorize("Fleet Manager", "Financial Analyst"), createExpense);

router.get("/users", protect, authorize("Fleet Manager"), getUsers);
router.patch("/users/:id/role", protect, authorize("Fleet Manager"), updateUserRole);
export default router;