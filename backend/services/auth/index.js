import express from "express"
import "dotenv/config"

import dns from "dns";
dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()));

import { connectDB } from "./configs/db.js"
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
const app = express()
const PORT = process.env.PORT || 5001

app.use(express.json())
app.use(cookieParser())


app.get("/", (req, res) => {
    res.send("Hello from Auth-service")
})

app.use("/", authRouter)

app.listen(PORT, () => {
    console.log(`Auth-service Started on ${PORT}`);
    connectDB()
})
