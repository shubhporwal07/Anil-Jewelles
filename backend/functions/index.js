const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// Initialize Razorpay with environment variables
// Keys are loaded from functions/.env file
function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a Razorpay order
 * Called from frontend before opening the payment popup
 */
exports.createOrder = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to make a payment."
    );
  }

  const { amount, cartItems } = data;

  // Validate amount
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid payment amount."
    );
  }

  try {
    const razorpay = getRazorpayInstance();

    // Amount must be in paise (₹100 = 10000 paise)
    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: context.auth.uid,
        userEmail: context.auth.token.email || "",
      },
    });

    // Save order to Firestore
    await db.collection("orders").doc(order.id).set({
      orderId: order.id,
      userId: context.auth.uid,
      userEmail: context.auth.token.email || "",
      amount: amount,
      amountInPaise: amountInPaise,
      currency: "INR",
      status: "created",
      cartItems: cartItems || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create payment order. Please try again."
    );
  }
});

/**
 * Verify Razorpay payment signature
 * Called from frontend after successful payment
 */
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to verify payment."
    );
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing payment verification data."
    );
  }

  try {
    // Create the expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Verify signature
    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      // Update order status in Firestore
      await db.collection("orders").doc(razorpay_order_id).update({
        status: "paid",
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Payment verified successfully!",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      };
    } else {
      // Update order status as failed
      await db.collection("orders").doc(razorpay_order_id).update({
        status: "failed",
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      throw new functions.https.HttpsError(
        "invalid-argument",
        "Payment verification failed. Invalid signature."
      );
    }
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error("Error verifying payment:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to verify payment. Please contact support."
    );
  }
});
