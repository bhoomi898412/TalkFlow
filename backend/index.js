import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

const app = express();

// middleware
app.use(cors());
app.use(express.json());

import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

import meetingRoutes from "./routes/meetingRoutes.js";
app.use("/api/meeting", meetingRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// server start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});