import express from "express"
import { createVoiceToken, getAllInterviews, getInterview, startInterview, submitAnswer, transcribeAudio } from "../controllers/interview.controller.js"
import { audioUpload } from "../middleware/audioUpload.js"

const interviewRouter = express.Router()

interviewRouter.post("/start",startInterview)

interviewRouter.post("/answer",submitAnswer)

interviewRouter.post("/transcribe", audioUpload.single("audio"), transcribeAudio)

interviewRouter.post("/voice/token", createVoiceToken)

interviewRouter.get("/all",getAllInterviews)

interviewRouter.get("/:id",getInterview)


export default interviewRouter
