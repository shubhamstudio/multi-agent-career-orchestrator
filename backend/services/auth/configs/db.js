import mongoose from "mongoose"

let connectionPromise

export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return true
    }

    if (!process.env.MONGODB_URL) {
        console.error("Mongo DB found an error: MONGODB_URL is not configured")
        return false
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGODB_URL, {
            // A serverless request must not spend its entire Vercel runtime budget
            // waiting for an unreachable database.
            serverSelectionTimeoutMS: 8_000,
            connectTimeoutMS: 8_000,
            maxPoolSize: 5,
            minPoolSize: 0,
        })
            .then(() => {
                console.log("Connection Successful")
                return true
            })
            .catch((error) => {
                console.error(`Mongo DB found an error: ${error.message}`)
                connectionPromise = undefined
                return false
            })
    }

    return connectionPromise
}
