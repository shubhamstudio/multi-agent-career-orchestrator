import "dotenv/config"
import { connectDB } from "./config/db.js"
import app from "./app.js"

const PORT = process.env.PORT || 6003

app.listen(PORT , ()=>{
    console.log(`Interview-service Started on ${PORT}`)
    connectDB()
})
