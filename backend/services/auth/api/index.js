import serverless from "serverless-http"
import app from "../app.js"
import { connectDB } from "../configs/db.js"

const handler = serverless(app)

export default async function authFunction(req, res) {
    if (!await connectDB()) {
        return res.status(503).json({ message: "Authentication database is temporarily unavailable" })
    }

    return handler(req, res)
}
