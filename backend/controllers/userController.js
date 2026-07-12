import { User } from "../models/index.js";

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
};

export const updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id, 
    { role: req.body.role }, 
    { new: true }
  ).select("-password");
  res.json(user);
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields are required" });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email is already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    
    // Do not return a token here, because the Fleet Manager is creating this for someone else
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Failed to create user" });
  }
};