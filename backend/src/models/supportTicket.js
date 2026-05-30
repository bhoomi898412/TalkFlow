import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "open",
  },
} , { timestamps: true });

export default mongoose.model("SupportTicket", supportTicketSchema);