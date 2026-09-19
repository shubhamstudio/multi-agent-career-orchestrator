import "dotenv/config"
import dns from "dns"
import express from "express"
import interviewRouter from "./routes/interview.route.js"
import { requireInternalServiceKey } from "../../shared/middleware/internalServiceAuth.js"

if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()))
}

const app = express()

app.use(express.json())
app.use(requireInternalServiceKey)

app.get("/", (req, res) => {
    res.send("Hello from Interview-service")
})

app.use("/", interviewRouter)

export default app
