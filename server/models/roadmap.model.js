import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: String },
    isCompleted: { type: Boolean, default: false },
    order: { type: Number }
});

const phaseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    topics: [{ type: String }],
    order: { type: Number }
});

const roadmapSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    stackName: {
        type: String,
        required: true
    },
    planType: {
        type: String,
        enum: ["Monthly", "Weekly"],
        default: "Monthly"
    },
    syllabus: [phaseSchema], // High-level view
    dailyPlan: [stepSchema],  // Granular view
    progress: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Active", "Completed", "On-Hold"],
        default: "Active"
    }
}, { timestamps: true });

const Roadmap = mongoose.model("Roadmap", roadmapSchema);
export default Roadmap;
