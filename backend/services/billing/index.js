import express from "express"
import "dotenv/config"
import { connectDB } from "./configs/db.js"
import billingRouter from "./routes/billing.route.js"
import dns from "dns";
dns.setServers(process.env.DNS_SERVERS.split(",").map((server) => server.trim()));

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 6005

app.get("/",(req,res)=>{
    res.send("Hello from Billing-service")
})

app.use("/",billingRouter)

app.listen(PORT , ()=>{
    console.log(`Billing-service Started on ${PORT}`)
    connectDB()
    
})
