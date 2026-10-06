import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Razorpay Webhook Handler
// Validates X-Razorpay-Signature header using HMAC-SHA256 with webhook secret
// Handles payment.captured, payment.failed, payment.authorized events
export async function POST(request: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const receivedSignature = request.headers.get("x-razorpay-signature");

    if (!receivedSignature) {
      return NextResponse.json(
        { success: false, error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    // Validate webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== receivedSignature) {
      console.error("Webhook signature verification FAILED");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payment = event.payload?.payment?.entity;

    console.log(`Razorpay Webhook: ${eventType}`, {
      paymentId: payment?.id,
      orderId: payment?.order_id,
      amount: payment?.amount,
      status: payment?.status,
    });

    switch (eventType) {
      case "payment.captured":
        // Payment successfully captured — this confirms the payment
        console.log("✅ Payment CAPTURED:", payment?.id);
        break;

      case "payment.authorized":
        // Payment authorized but not yet captured (auto-capture handles this)
        console.log("🔄 Payment AUTHORIZED:", payment?.id);
        break;

      case "payment.failed":
        // Payment failed — could update transaction status
        console.log("❌ Payment FAILED:", payment?.id, payment?.error_description);
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true, event: eventType });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    // Return 200 even on error to prevent Razorpay retries for parsing issues
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
