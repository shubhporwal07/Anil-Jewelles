const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL, // Production frontend URL
    ].filter(Boolean); // Remove undefined/null

    // Allow requests from any localhost port, or if origin matches allowed Origins
    if (!origin || origin.match(/^http:\/\/localhost:\d+$/) || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Anil Jewellers Payment Server is running" });
});

/**
 * POST /api/create-order
 * Creates a Razorpay order for the given amount and cart items
 */
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, cartItems } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }

    // Amount must be in paise (₹100 = 10000 paise)
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        source: "anil-jewellers-web",
        itemCount: cartItems ? cartItems.length : 0,
      },
    });

    console.log(`✅ Order created: ${order.id} | ₹${amount}`);

    res.json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Failed to create payment order." });
  }
});

/**
 * POST /api/verify-payment
 * Verifies the Razorpay payment signature after successful payment
 */
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification data." });
    }

    // Create the expected signature using HMAC SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Verify signature
    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      console.log(`✅ Payment verified: ${razorpay_payment_id}`);
      res.json({
        success: true,
        message: "Payment verified successfully!",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      console.error("❌ Payment verification failed: Invalid signature");
      res.status(400).json({ error: "Payment verification failed. Invalid signature." });
    }
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment." });
  }
});

/**
 * POST /api/subscribe
 * Sends a welcome email to the subscriber
 */
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Configure your real SMTP server here (e.g., Gmail)
    let transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your email provider (sendgrid, mailgun, etc.)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: '"Anil Jewellers" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: "Thank You for Subscribing! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #0f172a; text-align: center;">Welcome to Anil Jeweller's!</h2>
          <p>Hi there,</p>
          <p>Thank you for subscribing to our newsletter! We are thrilled to have you with us.</p>
          <p>You'll be the first to know about our latest collections, exclusive offers, and artisanal jewelry releases.</p>
          <br/>
          <p>Best regards,<br/><strong>The Anil Jeweller's Team</strong></p>
        </div>
      `,
    });

    console.log("✅ Subscription email successfully sent to %s", email);

    res.json({ success: true, message: "Subscription successful!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send subscription email. Check server credentials." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   ANIL JEWELLER'S - Payment Server          ║
  ║   Running on http://localhost:${PORT}          ║
  ║   Razorpay Key: ${process.env.RAZORPAY_KEY_ID}  ║
  ╚══════════════════════════════════════════════╝
  `);
});
