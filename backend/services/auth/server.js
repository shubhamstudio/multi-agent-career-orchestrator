import "dotenv/config"
import { connectDB } from "./configs/db.js"
import app from "./app.js"

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
    console.log(`Auth-service Started on ${PORT}`);
    connectDB()
})
