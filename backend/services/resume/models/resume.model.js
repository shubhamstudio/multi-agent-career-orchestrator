import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  company: { type: String, default: "" },
  role: { type: String, default: "" },
  duration: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  techStack: { type: String, default: "" },
  github: { type: String, default: "" },
  description: { type: String, default: "" },
}, { _id: false });

const educationSchema = new mongoose.Schema({
  college: { type: String, default: "" },
  degree: { type: String, default: "" },
  branch: { type: String, default: "" },
  cgpa: { type: String, default: "" },
  year: { type: String, default: "" },
}, { _id: false });

const sourceFileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  pathname: { type: String, required: true },
  filename: { type: String, default: "" },
  contentType: { type: String, default: "application/pdf" },
  uploadedAt: { type: Date, default: Date.now },
  processedAt: { type: Date, default: Date.now },
  extractedText: { type: String, default: "" },
  analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const resumeSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    extractedText: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    scoreHistory: {
      type: [{ score: { type: Number, required: true }, analyzedAt: { type: Date, default: Date.now } }],
      default: [],
    },

    sourceFile: {
      type: sourceFileSchema,
      default: undefined,
    },

    sourceFiles: {
      type: [sourceFileSchema],
      default: [],
    },

    summary: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    skills: {
      type: [String],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    suggestedRole: {
      type: String,
      default: "",
    },

    recommendations: {
      type: [String],
      default: [],
    },
},{timestamps:true})


const Resume = mongoose.model("Resume" , resumeSchema)

export default Resume
