import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "To Do", "Completed"],
        default: "Pending"
    },
    source: {
        type: String,
        enum: ["Manual", "Roadmap"],
        default: "Manual"
    },
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap"
    },
    week: {
        type: Number
    },
    day: {
        type: Number
    }
}, { timestamps: true });

const UserTask = mongoose.model("UserTask", taskSchema);
export default UserTask;
