import mongoose from "mongoose";

const futureMeetingsSchema = new mongoose.Schema({
    title: {
        type : String,
        required: true,
    },
    description: {
        type : String,
        required: true,
    },
    scheduledDate: {
        type : Date,
        required: true,
    },
    scheduledTime: {
        type : String,
        required: true,
    },
    meetingId: {
        type : String,
        required: true,
    },
    userId: {
        type : String,
        required: true,
    },
});

export default mongoose.model("FutureMeeting", futureMeetingsSchema);