import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    duration: {
        type: String,
        required: true,
    },

    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    article: {
        type: String,
        default: "",
    },
},
    {
        _id: false,
    })

const resourceSchema = new mongoose.Schema({
    type: { type: String, enum: ["official-docs", "article", "course", "project"], default: "official-docs" },
    title: { type: String, required: true },
    url: { type: String, required: true },
}, { _id: false })

const topicSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    section: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
    prerequisites: { type: [String], default: [] },
    resources: { type: [resourceSchema], default: [] },
    type: { type: String, enum: ["required", "optional"], default: "required" },
    status: { type: String, enum: ["locked", "available", "in-progress", "completed"], default: "locked" },
    priority: { type: Boolean, default: false },
    aiReason: { type: String, default: "" },
}, { _id: false })

const edgeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
}, { _id: false })

const roadmapSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    title: {
        type: String,
        required: true,
    },

    targetPackage: {
        type: String,
        required: true,
    },

    duration: {
        type: String,
        required: true,
    },

    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        required: true,
    },

    templateSlug: { type: String, default: "legacy-generated" },

    templateVersion: { type: Number, default: 0 },

    nodes: { type: [topicSchema], default: [] },

    edges: { type: [edgeSchema], default: [] },

    // Retained only so roadmaps saved by the previous generator remain readable.
    modules: {
        type: [moduleSchema],
        default: [],
    },

}, { timestamps: true })


roadmapSchema.index({ userId: 1, createdAt: -1 })

const Roadmap = mongoose.model("Roadmap",roadmapSchema)

export default Roadmap
