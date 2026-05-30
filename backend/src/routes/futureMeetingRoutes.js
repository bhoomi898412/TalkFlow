import express from "express";
import FutureMeeting from "../models/futureMeeting.js";

const router = express.Router();

router.post("/save", async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledDate,
      scheduledTime,
      meetingId,
      userId,
    } = req.body;

    if (
      !title ||
      !description ||
      !scheduledDate ||
      !scheduledTime ||
      !meetingId ||
      !userId
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const futureMeeting = await FutureMeeting.create({
      title,
      description,
      scheduledDate,
      scheduledTime,
      meetingId,
      userId,
    });

    res.status(201).json({
      message: "Future meeting saved successfully",
      futureMeeting,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const meetings = await FutureMeeting.find({
      userId: req.params.userId,
    }).sort({ scheduledDate: 1, scheduledTime: 1 });

    res.status(200).json(meetings);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;