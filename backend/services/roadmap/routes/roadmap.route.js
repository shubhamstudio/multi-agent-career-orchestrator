import express from "express"
import { deleteRoadmap, generateRoadmap, getAllRoadmap, getRoadmapbyId, updateRoadmapProgress } from "../controllers/roadmap.controller.js"

const roadmapRouter = express.Router()

roadmapRouter.post("/generate" , generateRoadmap)

roadmapRouter.get("/all" ,getAllRoadmap )

roadmapRouter.get("/:id",getRoadmapbyId)

roadmapRouter.patch("/:id/topics/:topicId/progress", updateRoadmapProgress)

roadmapRouter.delete("/:id", deleteRoadmap)

export default roadmapRouter
