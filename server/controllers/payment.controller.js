import razorpay from "../services/razorpay.service.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";


// ===============================
// CREATE RAZORPAY ORDER
// ===============================

export const createOrder = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body;

        if (!planId || !amount || !credits) {
            return res.status(400).json({
                message: "Invalid plan data",
            });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            userId: req.userId,
            planId,
            amount,
            credits,
            razorpayOrderId: order.id,
            status: "created",
        });

        return res.status(200).json(order);

    } catch (error) {
        console.error("Create Order Error:", error);

        return res.status(500).json({
            message: "Failed to create Razorpay order",
            error: error.message,
        });
    }
};


// ===============================
// VERIFY RAZORPAY PAYMENT
// ===============================

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Missing payment details",
            });
        }

        // Create signature body
        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;

        // Generate expected signature
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        // Compare signatures
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature",
            });
        }

        // Find payment
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found",
            });
        }

        // Prevent duplicate credit
        if (payment.status === "paid") {
            return res.status(200).json({
                success: true,
                message: "Payment already processed",
            });
        }

        // Update payment
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = "paid";

        await payment.save();

        // Add credits to user
        const updatedUser = await User.findByIdAndUpdate(
            payment.userId,
            {
                $inc: {
                    credits: payment.credits,
                },
            },
            {
                new: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and credits added",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Verify Payment Error:", error);

        return res.status(500).json({
            message: "Failed to verify payment",
            error: error.message,
        });
    }
};