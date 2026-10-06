import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Server-side Razorpay payment signature verification
// Uses HMAC-SHA256 with RAZORPAY_KEY_SECRET (never exposed to client)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      metadata,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { verified: false, error: "Missing required Razorpay payment fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { verified: false, error: "Razorpay secret not configured on server" },
        { status: 500 }
      );
    }

    // Razorpay signature verification:
    // generated_signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error("Razorpay signature verification FAILED", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json(
        { verified: false, error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    // Payment verified — generate transaction record
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    console.log("Razorpay payment VERIFIED", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      transactionId,
      metadata,
    });

    return NextResponse.json({
      verified: true,
      transactionId,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "SUCCESS",
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { verified: false, error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
