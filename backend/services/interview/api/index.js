import serverless from "serverless-http"
import app from "../app.js"
import { connectDB } from "../config/db.js"

const handler = serverless(app)

export default async function interviewFunction(req, res) {
    if (!await connectDB()) {
        return res.status(503).json({ message: "Interview database is temporarily unavailable" })
    }

    return handler(req, res)
}
