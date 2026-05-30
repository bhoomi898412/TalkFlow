import express from "express";
import SupportTicket from "../models/supportTicket.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    if (!userId || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const ticket = await SupportTicket.create({
      userId,
      subject,
      message,
    });

    res.status(201).json({
      message: "Support request submitted successfully",
      ticket,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;