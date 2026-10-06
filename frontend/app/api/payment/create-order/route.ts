import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Razorpay order creation - server-side only
// The RAZORPAY_KEY_SECRET is NEVER sent to the client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", type, metadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay credentials not configured on server" },
        { status: 500 }
      );
    }

    // Create Razorpay order via REST API (no SDK dependency issues)
    const amountInPaise = Math.round(amount * 100);
    const receiptId = `finedge_${type || "PAY"}_${Date.now()}`;

    const orderPayload = {
      amount: amountInPaise,
      currency,
      receipt: receiptId,
      notes: {
        type: type || "PAYMENT",
        ...(metadata || {}),
      },
    };

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!razorpayRes.ok) {
      const errData = await razorpayRes.json().catch(() => ({}));
      console.error("Razorpay order creation failed:", errData);
      return NextResponse.json(
        {
          success: false,
          error: errData?.error?.description || "Failed to create Razorpay order",
        },
        { status: razorpayRes.status }
      );
    }

    const order = await razorpayRes.json();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      key_id: keyId, // Public key - safe to send to client for Checkout
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
