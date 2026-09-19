import "dotenv/config"

import dns from "dns"
import express from "express"
import billingRouter from "./routes/billing.route.js"
import { requireInternalServiceKey } from "../../shared/middleware/internalServiceAuth.js"

// Preserve local DNS overrides without replacing Vercel's managed resolver.
if (process.env.DNS_SERVERS && !process.env.VERCEL) {
    dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()))
}

const app = express()

app.use(express.json())
app.use(requireInternalServiceKey)

app.get("/", (_req, res) => {
    res.send("Hello from Billing-service")
})

app.use("/", billingRouter)

export default app
