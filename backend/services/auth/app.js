import "dotenv/config"
import dns from "dns"
import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.route.js"
import { requireInternalServiceKey } from "../../shared/middleware/internalServiceAuth.js"

if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()))
}

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(requireInternalServiceKey)

app.get("/", (req, res) => {
    res.send("Hello from Auth-service")
})

app.use("/", authRouter)

export default app
