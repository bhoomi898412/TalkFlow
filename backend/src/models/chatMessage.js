import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model("ChatMessage", chatMessageSchema);