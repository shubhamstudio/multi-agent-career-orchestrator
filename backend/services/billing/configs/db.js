import mongoose from "mongoose";

let connectionPromise;

export const connectDB=async () => {
    if (mongoose.connection.readyState === 1) {
        return true;
    }

    if (!process.env.MONGODB_URL) {
        console.error("MongoDb error: MONGODB_URL is not configured");
        return false;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 8_000,
            connectTimeoutMS: 8_000,
            maxPoolSize: 5,
            minPoolSize: 0,
        })
            .then(() => {
                console.log("Connected DB");
                return true;
            })
            .catch((error) => {
                console.error("MongoDb error", error);
                connectionPromise = undefined;
                return false;
            });
    }

    return connectionPromise;
}
