import razorpay from "../configs/razorpay.js";
import Billing from "../models/billing.model.js";
import { getBillingUserModel } from "../models/user.model.js";
import crypto from "crypto"
import redis from "../../../shared/redis/redis.js";



const PLANS = {
    starter: {
        amount: 199,
        interviewCoins: 300,
    },
};

const syncSessionCoinBalance = async (sessionId, interviewCoin) => {
    if (!sessionId) return

    try {
        const sessionKey = `session:${sessionId}`
        const session = await redis.get(sessionKey)
        if (!session) return

        const sessionData = JSON.parse(session)
        sessionData.interviewCoin = interviewCoin
        await redis.set(sessionKey, JSON.stringify(sessionData), "KEEPTTL")
    } catch (error) {
        console.error("Unable to refresh the billing session balance", error.message)
    }
}

export const createOrder = async (req, res) => {
    try {
        const { planId } = req.body
        const userId = req.headers["x-user-id"]
        const plan = PLANS[planId]

        if (!plan) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan",
            });
        }

        const order = await razorpay.orders.create({
            amount: plan.amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        })

        await Billing.create({
            userId,
            amount: plan.amount,
            interviewCoins: plan.interviewCoins,
            razorpayOrderId: order.id,
            status: "created",
        })

        return res.status(201).json({
            success: true,
            order,
            keyId: process.env.RAZORPAY_KEY_ID,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const BillingUser = await getBillingUserModel()

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body

        const payment = await Billing.findOne({
            razorpayOrderId: razorpay_order_id,
            userId: req.headers["x-user-id"],
        })
        if(!payment){
             return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
        }

        const genSign = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex")

        const expectedSignature = Buffer.from(genSign, "utf8")
        const receivedSignature = Buffer.from(razorpay_signature || "", "utf8")
        const isValidSignature = expectedSignature.length === receivedSignature.length
          && crypto.timingSafeEqual(expectedSignature, receivedSignature)

        if(!isValidSignature){
            payment.status = "failed";
            await payment.save()
            return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
        }

    const creditedUser = await BillingUser.findOneAndUpdate(
      {
        _id: payment.userId,
        creditedPayments: { $ne: razorpay_payment_id },
      },
      {
        $inc: { interviewCoin: payment.interviewCoins },
        $addToSet: { creditedPayments: razorpay_payment_id },
      },
      { returnDocument: "after" },
    )

    const user = creditedUser || await BillingUser.findById(payment.userId)
    if (!user) {
      return res.status(409).json({
        success: false,
        message: "Payment was verified, but the user account could not be credited",
      })
    }

    payment.status = "paid"
    payment.razorpayPaymentId = razorpay_payment_id
    payment.razorpaySignature = razorpay_signature
    await payment.save()

    await syncSessionCoinBalance(req.headers["x-session-id"], user.interviewCoin)

    return res.status(200).json({
      success: true,
      message: "Payment successful",
      interviewCoin: user?.interviewCoin,
    });
    } catch (error) {

        console.log(error);

    if (req.body?.razorpay_order_id) {
      await Billing.findOneAndUpdate(
        {
          razorpayOrderId: req.body.razorpay_order_id,
        },
        {
          status: "failed",
        }
      );
    }

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });

    }
}
