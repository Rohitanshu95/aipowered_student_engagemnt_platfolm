import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobDesc: {
        type: String,
        required: true
    },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: String,
        explanation: String,
        category: String
    }],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 25
    },
    feedback: {
        type: String,
        enum: ["Poor", "Good", "Excellent"],
        default: "Poor"
    },
    status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending"
    }
}, { timestamps: true });

const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
