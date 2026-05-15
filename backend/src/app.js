import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import connectToSocket from "./controllers/socketManager.js";

import authRoutes from "./routes/authRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

connectToSocket(server);

app.use(cors());

app.use(express.json({ limit: "40kb" }));

app.use(express.urlencoded({
  limit: "40kb",
  extended: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/meeting", meetingRoutes);

app.get("/home", (req, res) => {
  return res.json({ hello: "world" });
});

mongoose.connect(process.env.MONGO_URL)
.then(() => {

  console.log("MongoDB Connected ✅");

  server.listen(5000, () => {
    console.log("Server running on port 5000");
  });

})
.catch((err) => console.log(err));