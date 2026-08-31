import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connection Successful")
    } catch (error) {
        console.error(`Mongo DB found an error: ${error.message}`)
    }
}