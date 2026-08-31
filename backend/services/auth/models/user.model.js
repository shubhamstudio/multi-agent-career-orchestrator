import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    headline: { type: String, default: "" },
    currentRole: { type: String, default: "" },
    targetRole: { type: String, default: "" },
    experienceLevel: {
        type: String,
        enum: ["", "Student", "Entry level", "Mid level", "Senior", "Lead / Manager"],
        default: ""
    },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    careerGoal: { type: String, default: "" },
    interviewCoin: {
        type: Number,
        default: 150
    },
    creditedPayments: {
        type: [String],
        default: [],
        select: false
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User;
