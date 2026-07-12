import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { User, Vehicle, Driver, Trip, Maintenance, Fuel, Expense } from "./models/index.js";

dotenv.config();

async function seed() {
  try {
    await connectDB();
    console.log("Clearing existing data...");

    await Promise.all([
      User.deleteMany(),
      Vehicle.deleteMany(),
      Driver.deleteMany(),
      Trip.deleteMany(),
      Maintenance.deleteMany(),
      Fuel.deleteMany(),
      Expense.deleteMany()
    ]);

    const password = await bcrypt.hash("password", 10);

    console.log("Seeding Users...");
    await User.insertMany([
      { name: "Fleet Manager", email: "fleet@transitops.com", password, role: "Fleet Manager" },
      { name: "Driver User", email: "driver@transitops.com", password, role: "Driver" },
      { name: "Safety Officer", email: "safety@transitops.com", password, role: "Safety Officer" },
      { name: "Finance Analyst", email: "finance@transitops.com", password, role: "Financial Analyst" }
    ]);

    console.log("Seeding Vehicles...");
    const van = await Vehicle.create({
      regNo: "MH-12-VA-0505",
      name: "Van-05",
      type: "Van",
      maxLoad: 500,
      odometer: 42000,
      acquisitionCost: 800000,
      region: "West",
      status: "Available"
    });

    await Vehicle.create({
      regNo: "KA-01-TR-2210",
      name: "Truck-22",
      type: "Truck",
      maxLoad: 3000,
      odometer: 93000,
      acquisitionCost: 2200000,
      region: "South",
      status: "Available"
    });

    console.log("Seeding Drivers...");
    await Driver.create({
      name: "Alex",
      licenseNo: "DLX-77881",
      licenseCategory: "LMV",
      licenseExpiry: "2027-05-20",
      contact: "9876543210",
      safetyScore: 94,
      status: "Available"
    });

    console.log("Seeding Fuel Logs...");
    await Fuel.create({
      vehicle: van._id,
      liters: 30,
      cost: 3150,
      distance: 280,
      date: new Date()
    });

    console.log("Seed complete! 🌱");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();