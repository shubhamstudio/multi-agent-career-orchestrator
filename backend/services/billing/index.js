import app from "./app.js"
import { connectDB } from "./configs/db.js"
const PORT = process.env.PORT || 6005

app.listen(PORT , ()=>{
    console.log(`Billing-service Started on ${PORT}`)
    connectDB()
    
})
