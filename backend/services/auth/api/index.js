import serverless from "serverless-http"
import app from "../app.js"
import { connectDB } from "../configs/db.js"

const handler = serverless(app)

export default async function authFunction(req, res) {
    await connectDB()
    return handler(req, res)
}
