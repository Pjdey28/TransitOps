import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"], required: true }
}, { timestamps: true });

const vehicleSchema = new mongoose.Schema({
  regNo: { type: String, unique: true, required: true },
  name: String,
  type: String,
  maxLoad: Number,
  odometer: Number,
  acquisitionCost: Number,
  region: String,
  status: { type: String, enum: ["Available", "On Trip", "In Shop", "Retired"], default: "Available" }
}, { timestamps: true });

const driverSchema = new mongoose.Schema({
  name: String,
  licenseNo: { type: String, unique: true },
  licenseCategory: String,
  licenseExpiry: Date,
  contact: String,
  safetyScore: Number,
  status: { type: String, enum: ["Available", "On Trip", "Off Duty", "Suspended"], default: "Available" }
}, { timestamps: true });

const tripSchema = new mongoose.Schema({
  source: String,
  destination: String,
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  cargoWeight: Number,
  plannedDistance: Number,
  revenue: Number,
  status: { type: String, enum: ["Draft", "Dispatched", "Completed", "Cancelled"], default: "Draft" },
  finalOdometer: Number,
  fuelConsumed: Number
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export const Driver = mongoose.model("Driver", driverSchema);
export const Trip = mongoose.model("Trip", tripSchema);