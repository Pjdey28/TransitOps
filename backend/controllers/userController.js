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