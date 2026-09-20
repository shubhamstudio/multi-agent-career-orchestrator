import "dotenv/config"

import { connectDB } from "./config/db.js"
import app from "./app.js"

const PORT = process.env.PORT || 6002

app.listen(PORT, () => {
    console.log(`Resume-service Started on ${PORT}`)
    connectDB()
})
