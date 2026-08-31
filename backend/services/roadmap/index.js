import express from "express"
import "dotenv/config"
import { connectDB } from "./configs/db.js"
import roadmapRouter from "./routes/roadmap.route.js"
import dns from "dns";
dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()));

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 6004

app.use("/",roadmapRouter)

app.listen(PORT , ()=>{
    console.log(`Roadmap-service Started on ${PORT}`)
    connectDB()
    
})
