import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/apiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

await connectDB();

app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
// Note: Auth routes (login/register) would be added here similarly under /api/auth

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));