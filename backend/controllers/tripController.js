import { Trip, Vehicle, Driver } from "../models/index.js";

const isExpired = (date) => new Date(date) < new Date(new Date().toDateString());

export const getTrips = async (req, res) => {
  const trips = await Trip.find().populate("vehicle").populate("driver").sort({ createdAt: -1 });
  res.json(trips);
};

export const createTrip = async (req, res) => {
  const { vehicle, driver, cargoWeight, isDraft } = req.body;
  const selectedVehicle = await Vehicle.findById(vehicle);
  const selectedDriver = await Driver.findById(driver);

  if (!selectedVehicle || !selectedDriver) return res.status(404).json({ message: "Not found" });
  if (Number(cargoWeight) > selectedVehicle.maxLoad) return res.status(400).json({ message: "Capacity exceeded" });

  // If dispatching immediately, check availability
  if (!isDraft) {
    if (["Retired", "In Shop", "On Trip"].includes(selectedVehicle.status)) return res.status(400).json({ message: "Vehicle unavailable" });
    if (selectedDriver.status === "Suspended" || selectedDriver.status === "On Trip") return res.status(400).json({ message: "Driver unavailable" });
    if (isExpired(selectedDriver.licenseExpiry)) return res.status(400).json({ message: "License expired" });
  }

  const trip = await Trip.create({ 
    ...req.body, 
    status: isDraft ? "Draft" : "Dispatched" 
  });
  
  if (!isDraft) {
    selectedVehicle.status = "On Trip";
    selectedDriver.status = "On Trip";
    await selectedVehicle.save();
    await selectedDriver.save();
  }

  res.status(201).json(await trip.populate(["vehicle", "driver"]));
};

export const dispatchTrip = async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip || trip.status !== "Draft") return res.status(404).json({ message: "Invalid trip" });

  const selectedVehicle = await Vehicle.findById(trip.vehicle);
  const selectedDriver = await Driver.findById(trip.driver);

  if (["Retired", "In Shop", "On Trip"].includes(selectedVehicle.status)) return res.status(400).json({ message: "Vehicle unavailable" });
  if (selectedDriver.status === "Suspended" || selectedDriver.status === "On Trip") return res.status(400).json({ message: "Driver unavailable" });

  trip.status = "Dispatched";
  await trip.save();

  selectedVehicle.status = "On Trip";
  selectedDriver.status = "On Trip";
  await selectedVehicle.save();
  await selectedDriver.save();

  res.json(await trip.populate(["vehicle", "driver"]));
};

export const completeTrip = async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });

  trip.status = "Completed";
  trip.finalOdometer = req.body.finalOdometer;
  trip.fuelConsumed = req.body.fuelConsumed;
  await trip.save();

  await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "Available", odometer: req.body.finalOdometer });
  await Driver.findByIdAndUpdate(trip.driver, { status: "Available" });

  res.json(await trip.populate(["vehicle", "driver"]));
};

export const cancelTrip = async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) return res.status(404).json({ message: "Trip not found" });

  trip.status = "Cancelled";
  await trip.save();

  await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "Available" });
  await Driver.findByIdAndUpdate(trip.driver, { status: "Available" });

  res.json(await trip.populate(["vehicle", "driver"]));
};