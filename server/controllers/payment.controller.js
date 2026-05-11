import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto"

export const createOrder = async (req,res) => {
    try {
        console.log("Backend: Received Order Request Body:", req.body);
        const {planId, amount, credits} = req.body;
        
        if (amount === undefined || credits === undefined) {
            return res.status(400).json({ message: "Missing amount or credits in request body" });
        }

        const parsedAmount = parseInt(amount, 10);
        const parsedCredits = parseInt(credits, 10);

        if (isNaN(parsedAmount) || isNaN(parsedCredits)) {
            return res.status(400).json({ message: "Invalid amount or credits format" });
        }

        // Verify Razorpay setup
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay keys are missing in environment variables");
            return res.status(500).json({ message: "Payment gateway configuration error - Keys Missing" });
        }

        console.log(`Backend: Initializing Razorpay order: User=${req.userId}, Amount=${parsedAmount}, Credits=${parsedCredits}`);
        
        const options = {
            amount: Math.round(parsedAmount * 100), // convert to paise and ensure it's an integer
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        console.log("Backend: Razorpay Options:", options);

        let order;
        try {
            order = await razorpay.orders.create(options);
        } catch (rzpError) {
            console.error("Backend: Razorpay SDK Error:", rzpError);
            return res.status(500).json({ 
                success: false, 
                message: "Razorpay SDK failed to create order", 
                error: rzpError.message || rzpError 
            });
        }

        if (!order || !order.id) {
            console.error("Backend: Razorpay order creation failed - No order ID returned");
            throw new Error("Failed to generate Razorpay order ID");
        }

        console.log(`Backend: Order created successfully: ${order.id}`);

        try {
            await Payment.create({
                userId: req.userId,
                planId,
                amount: parsedAmount,
                credits: parsedCredits,
                razorpayOrderId: order.id,
                status: "created",
            });
        } catch (dbError) {
            console.error("Backend: Database Error saving Payment:", dbError);
            return res.status(500).json({ 
                success: false, 
                message: "Order created in Razorpay but failed to save in database", 
                error: dbError.message || dbError 
            });
        }

        return res.json(order);

    } catch (error) {
        console.error("Razorpay Order Creation Error (Global Catch):", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error during order creation",
            error: error
        });
    }
};


export const verifyPayment = async (req,res) => {
    try {
        const {razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature} = req.body

      const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

     const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    // Update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(payment.userId, {
      $inc: { credits: payment.credits }
    },{new:true});

    res.json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });

    } catch (error) {
         return res.status(500).json({message:`failed to verify Razorpay payment ${error}`})
    }
}