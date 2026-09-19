import serverless from "serverless-http"
import app from "../app.js"

const handler = serverless(app)

export default function gatewayFunction(req, res) {
    return handler(req, res)
}
