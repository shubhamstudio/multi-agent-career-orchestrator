import serverless from "serverless-http"
import app from "../app.js"
import { connectDB } from "../config/db.js"

const handler = serverless(app)

export default async function resumeFunction(req, res) {
    await connectDB()
    return handler(req, res)
}
