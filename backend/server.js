import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"],
      required: true
    }
  },
  { timestamps: true }
);

const vehicleSchema = new mongoose.Schema(
  {
    regNo: { type: String, unique: true, required: true },
    name: String,
    type: String,
    maxLoad: Number,
    odometer: Number,
    acquisitionCost: Number,
    region: String,
    status: {
      type: String,
      enum: ["Available", "On Trip", "In Shop", "Retired"],
      default: "Available"
    }
  },
  { timestamps: true }
);

const driverSchema = new mongoose.Schema(
  {
    name: String,
    licenseNo: { type: String, unique: true },
    licenseCategory: String,
    licenseExpiry: Date,
    contact: String,
    safetyScore: Number,
    status: {
      type: String,
      enum: ["Available", "On Trip", "Off Duty", "Suspended"],
      default: "Available"
    }
  },
  { timestamps: true }
);

const tripSchema = new mongoose.Schema(
  {
    source: String,
    destination: String,
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    cargoWeight: Number,
    plannedDistance: Number,
    revenue: Number,
    status: {
      type: String,
      enum: ["Draft", "Dispatched", "Completed", "Cancelled"],
      default: "Draft"
    },
    finalOdometer: Number,
    fuelConsumed: Number
  },
  { timestamps: true }
);

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    title: String,
    cost: Number,
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active"
    },
    date: Date
  },
  { timestamps: true }
);

const fuelSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    liters: Number,
    cost: Number,
    distance: Number,
    date: Date
  },
  { timestamps: true }
);

const expenseSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    type: String,
    amount: Number,
    date: Date
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
const Driver = mongoose.model("Driver", driverSchema);
const Trip = mongoose.model("Trip", tripSchema);
const Maintenance = mongoose.model("Maintenance", maintenanceSchema);
const Fuel = mongoose.model("Fuel", fuelSchema);
const Expense = mongoose.model("Expense", expenseSchema);

function tokenFor(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token provided" });

  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function allow(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

function isExpired(date) {
  return new Date(date) < new Date(new Date().toDateString());
}
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      token: tokenFor(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  res.json({
    token: tokenFor(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

app.get("/api/dashboard", auth, async (req, res) => {
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
      : 0
  });
});

app.get("/api/vehicles", auth, async (req, res) => {
  res.json(await Vehicle.find().sort({ createdAt: -1 }));
});

app.post("/api/vehicles", auth, allow("Fleet Manager"), async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ message: "Registration number must be unique" });
  }
});

app.put("/api/vehicles/:id", auth, allow("Fleet Manager"), async (req, res) => {
  res.json(await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete("/api/vehicles/:id", auth, allow("Fleet Manager"), async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: "Vehicle deleted" });
});

app.get("/api/drivers", auth, async (req, res) => {
  res.json(await Driver.find().sort({ createdAt: -1 }));
});

app.post("/api/drivers", auth, allow("Fleet Manager", "Safety Officer"), async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch {
    res.status(400).json({ message: "License number must be unique" });
  }
});

app.put("/api/drivers/:id", auth, allow("Fleet Manager", "Safety Officer"), async (req, res) => {
  res.json(await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete("/api/drivers/:id", auth, allow("Fleet Manager", "Safety Officer"), async (req, res) => {
  await Driver.findByIdAndDelete(req.params.id);
  res.json({ message: "Driver deleted" });
});

app.get("/api/trips", auth, async (req, res) => {
  const trips = await Trip.find()
    .populate("vehicle")
    .populate("driver")
    .sort({ createdAt: -1 });

  res.json(trips);
});

app.post("/api/trips", auth, allow("Fleet Manager", "Driver"), async (req, res) => {
  const { vehicle, driver, cargoWeight } = req.body;

  const selectedVehicle = await Vehicle.findById(vehicle);
  const selectedDriver = await Driver.findById(driver);

  if (!selectedVehicle) return res.status(404).json({ message: "Vehicle not found" });
  if (!selectedDriver) return res.status(404).json({ message: "Driver not found" });

  if (["Retired", "In Shop", "On Trip"].includes(selectedVehicle.status)) {
    return res.status(400).json({ message: "Vehicle is not available for dispatch" });
  }

  if (selectedDriver.status === "Suspended" || selectedDriver.status === "On Trip") {
    return res.status(400).json({ message: "Driver is not available for dispatch" });
  }

  if (isExpired(selectedDriver.licenseExpiry)) {
    return res.status(400).json({ message: "Driver license is expired" });
  }

  if (Number(cargoWeight) > selectedVehicle.maxLoad) {
    return res.status(400).json({ message: "Cargo weight exceeds vehicle capacity" });
  }

  const trip = await Trip.create({
    ...req.body,
    status: "Dispatched"
  });

  selectedVehicle.status = "On Trip";
  selectedDriver.status = "On Trip";
  await selectedVehicle.save();
  await selectedDriver.save();

  res.status(201).json(await trip.populate(["vehicle", "driver"]));
});

app.patch("/api/trips/:id/complete", auth, allow("Fleet Manager", "Driver"), async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });

  trip.status = "Completed";
  trip.finalOdometer = req.body.finalOdometer;
  trip.fuelConsumed = req.body.fuelConsumed;
  await trip.save();

  await Vehicle.findByIdAndUpdate(trip.vehicle, {
    status: "Available",
    odometer: req.body.finalOdometer
  });

  await Driver.findByIdAndUpdate(trip.driver, { status: "Available" });

  res.json(await trip.populate(["vehicle", "driver"]));
});

app.patch("/api/trips/:id/cancel", auth, allow("Fleet Manager", "Driver"), async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });

  trip.status = "Cancelled";
  await trip.save();

  await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "Available" });
  await Driver.findByIdAndUpdate(trip.driver, { status: "Available" });

  res.json(await trip.populate(["vehicle", "driver"]));
});

app.get("/api/maintenance", auth, async (req, res) => {
  res.json(await Maintenance.find().populate("vehicle").sort({ createdAt: -1 }));
});

app.post("/api/maintenance", auth, allow("Fleet Manager"), async (req, res) => {
  const log = await Maintenance.create(req.body);
  await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: "In Shop" });
  res.status(201).json(await log.populate("vehicle"));
});

app.patch("/api/maintenance/:id/close", auth, allow("Fleet Manager"), async (req, res) => {
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
});

app.get("/api/fuel", auth, async (req, res) => {
  res.json(await Fuel.find().populate("vehicle").sort({ createdAt: -1 }));
});

app.post("/api/fuel", auth, allow("Fleet Manager", "Financial Analyst"), async (req, res) => {
  res.status(201).json(await Fuel.create(req.body));
});

app.get("/api/expenses", auth, async (req, res) => {
  res.json(await Expense.find().populate("vehicle").sort({ createdAt: -1 }));
});

app.post("/api/expenses", auth, allow("Fleet Manager", "Financial Analyst"), async (req, res) => {
  res.status(201).json(await Expense.create(req.body));
});

app.get("/api/reports", auth, async (req, res) => {
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
});

async function seed() {
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

  await User.insertMany([
    { name: "Fleet Manager", email: "fleet@transitops.com", password, role: "Fleet Manager" },
    { name: "Driver User", email: "driver@transitops.com", password, role: "Driver" },
    { name: "Safety Officer", email: "safety@transitops.com", password, role: "Safety Officer" },
    { name: "Finance Analyst", email: "finance@transitops.com", password, role: "Financial Analyst" }
  ]);

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

  await Driver.create({
    name: "Alex",
    licenseNo: "DLX-77881",
    licenseCategory: "LMV",
    licenseExpiry: "2027-05-20",
    contact: "9876543210",
    safetyScore: 94,
    status: "Available"
  });

  await Fuel.create({
    vehicle: van._id,
    liters: 30,
    cost: 3150,
    distance: 280,
    date: new Date()
  });

  console.log("Seed complete");
  process.exit();
}

if (process.argv.includes("--seed")) {
  seed();
} else {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}