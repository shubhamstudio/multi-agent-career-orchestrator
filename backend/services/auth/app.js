import "dotenv/config"
import dns from "dns"
import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.route.js"
import { requireInternalServiceKey } from "../../shared/middleware/internalServiceAuth.js"

// Local custom DNS can help a developer machine, but Vercel's managed DNS
// resolver is required for reliable MongoDB SRV lookups in serverless functions.
if (process.env.DNS_SERVERS && !process.env.VERCEL) {
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
