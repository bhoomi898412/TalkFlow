import express from "express";
import ChatMessage from "../models/chatMessage.js";
import Meeting from "../models/meeting.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/meeting/:meetingId", async (req, res) => {     //ek meeting ki chat
  try {
    const messages = await ChatMessage.find({
      meetingId: req.params.meetingId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    // get all meetings created by user
    const meetings = await Meeting.find({
      userId: req.params.userId,
    }).sort({ date: -1 });

    // extract only meeting ids
    const meetingIds = meetings.map((meeting) => meeting.meetingId);

    const chatMeetingIds = await ChatMessage.distinct("meetingId", {
      meetingId: { $in: meetingIds },
    });

    const host = await User.findById(req.params.userId);   //extracting user details

    const chatMeetings = meetings     //Sirf wahi meetings rakho jisme chats hui he.
      .filter((meeting) => chatMeetingIds.includes(meeting.meetingId))
      .map((meeting) => ({
        _id: meeting._id,
        meetingId: meeting.meetingId,
        userId: meeting.userId,
        hostName: host?.fullname || "Unknown host",
        date: meeting.date,
      }));

    res.json(chatMeetings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;