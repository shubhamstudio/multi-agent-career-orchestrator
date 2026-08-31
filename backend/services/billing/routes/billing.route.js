import express from "express"
import { createOrder, verifyPayment } from "../controllers/billing.controller.js"

const billingRouter = express.Router()


billingRouter.post("/create",createOrder)
billingRouter.post("/verify",verifyPayment)

export default billingRouter