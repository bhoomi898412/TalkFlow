import express from "express";
import Meeting from "../models/meeting.js";

const router = express.Router();

// save meeting
router.post("/save", async (req, res) => {

  try {

    const { meetingId, userId } = req.body;

    const existingMeeting = await Meeting.findOne({
        meetingId,
        userId
    });

    let meeting;

    if (!existingMeeting) {
      meeting = await Meeting.create({
        meetingId,
        userId
      });
    } else {
      meeting = existingMeeting;
    }

    res.status(201).json({
      message: "Meeting saved",
      meeting
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }

});

router.get("/:userId", async (req, res) => {

  try {
    const meetings = await Meeting.find({
      userId: req.params.userId
    }).sort({ date: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }

});

export default router;