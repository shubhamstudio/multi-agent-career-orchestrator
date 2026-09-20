import "dotenv/config"
import { connectDB } from "./configs/db.js"
import app from "./app.js"

const PORT = process.env.PORT || 6004

app.listen(PORT , ()=>{
    console.log(`Roadmap-service Started on ${PORT}`)
    connectDB()
    
})
