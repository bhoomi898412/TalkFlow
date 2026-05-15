import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingId: String,
  userId: String,
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Meeting", meetingSchema);