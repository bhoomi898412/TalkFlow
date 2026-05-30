import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import connectToSocket from "./controllers/socketManager.js";

import authRoutes from "./routes/authRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import futureMeetingRoutes from "./routes/futureMeetingRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";

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
app.use("/api/chat", chatRoutes);
app.use("/api/future-meetings", futureMeetingRoutes);
app.use("/api/support", supportRoutes);

app.get("/home", (req, res) => {
  return res.json({ hello: "world" });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
.then(() => {

  console.log("MongoDB Connected ✅");

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

})
.catch((err) => console.log(err));