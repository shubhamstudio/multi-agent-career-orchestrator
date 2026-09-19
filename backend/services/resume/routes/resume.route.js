import express from "express"

import { generateResume, getResume, processResume } from "../controllers/resume.controller.js"

const resumeRouter = express.Router()


resumeRouter.post("/process", processResume)
resumeRouter.post("/generate", generateResume)

resumeRouter.get("/get-resume", getResume)

export default resumeRouter;
