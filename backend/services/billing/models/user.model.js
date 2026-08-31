import mongoose from "mongoose"

const billingUserSchema = new mongoose.Schema({
    interviewCoin: {
        type: Number,
        default: 150,
    },
    creditedPayments: {
        type: [String],
        default: [],
        select: false,
    },
})

let authConnection
let BillingUser

const getAuthMongoUrl = () => {
    if (process.env.AUTH_MONGODB_URL) return process.env.AUTH_MONGODB_URL

    const mongoUrl = new URL(process.env.MONGODB_URL)
    mongoUrl.pathname = `/${process.env.AUTH_MONGODB_DATABASE || "auth"}`
    return mongoUrl.toString()
}

export const getBillingUserModel = async () => {
    if (!authConnection) {
        authConnection = mongoose.createConnection(getAuthMongoUrl())
        authConnection.on("error", (error) => {
            console.error("Auth database connection error", error.message)
        })
    }

    await authConnection.asPromise()
    if (!BillingUser) {
        BillingUser = authConnection.model("BillingUser", billingUserSchema, "users")
    }

    return BillingUser
}
