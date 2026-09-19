import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import { isAuth } from "./middleware/isAuth.js"
import { proxyWithHeaders } from "./utils/proxyWithHeaders.js"
import { createUploadAuthorization, handleBlobUpload } from "./controllers/blobUpload.controller.js"

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}))

app.use(morgan("dev"))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Hello from Gateway")
})

app.post("/api/uploads/authorization/:kind", isAuth, createUploadAuthorization)
app.post("/api/uploads/:kind", express.json(), handleBlobUpload)
app.use("/api/auth", proxyWithHeaders(process.env.AUTH_SERVICE_URL, { parseReqBody: false }))
app.use("/api/resume", isAuth, proxyWithHeaders(process.env.RESUME_SERVICE_URL))
app.use("/api/interview", isAuth, proxyWithHeaders(process.env.INTERVIEW_SERVICE_URL))
app.use("/api/roadmap", isAuth, proxyWithHeaders(process.env.ROADMAP_SERVICE_URL))
app.use("/api/billing", isAuth, proxyWithHeaders(process.env.BILLING_SERVICE_URL))
app.get("/api/me", isAuth, getCurrentUser)

export default app
