import app from "../app.js"

export default function gatewayFunction(req, res) {
    return app(req, res)
}
