import "dotenv/config"

import express from "express"
import { connectDB } from "./config/db.js"
import resumeRouter from "./routes/resume.route.js"
import dns from "dns"
dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()))

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 6002

app.get("/", (req, res) => {
    res.send("Hello from Resume-service")
})

// The gateway already removes the /api/resume prefix before forwarding.
app.use("/", resumeRouter)

app.listen(PORT, () => {
    console.log(`Resume-service Started on ${PORT}`)
    connectDB()
})
