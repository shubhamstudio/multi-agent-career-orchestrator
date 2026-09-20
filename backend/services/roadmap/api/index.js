import app from "../app.js"
import { connectDB } from "../configs/db.js"

export default async function roadmapFunction(req, res) {
    if (!await connectDB()) {
        return res.status(503).json({ message: "Roadmap database is temporarily unavailable" })
    }

    return app(req, res)
}
