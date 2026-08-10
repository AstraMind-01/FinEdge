// Razorpay Checkout Utility Module
// Handles order creation, checkout modal, and payment verification
// The RAZORPAY_KEY_SECRET is NEVER used here — only server-side API routes use it

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  key_id: string;
}

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyResult {
  verified: boolean;
  transactionId?: string;
  paymentId?: string;
  orderId?: string;
  status?: string;
  verifiedAt?: string;
  error?: string;
}

export interface PaymentMetadata {
  type: "TRANSFER" | "BILL_PAYMENT" | "RECHARGE";
  sourceAccountId?: string;
  destinationAccountId?: string;
  billerName?: string;
  billerCategory?: string;
  mobileNumber?: string;
  operator?: string;
  description?: string;
}

/**
 * Helper to dynamically load Razorpay Checkout script if not already in DOM
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Step 1: Create Razorpay order via server-side API route
 * The server uses RAZORPAY_KEY_SECRET (never exposed to client)
 */
export async function createRazorpayOrder(
  amount: number,
  type: string,
  metadata?: Record<string, string>
): Promise<RazorpayOrder> {
  const res = await fetch("/api/payment/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "INR", type, metadata }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to create Razorpay order");
  }

  return {
    orderId: data.orderId,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
    status: data.status,
    key_id: data.key_id,
  };
}

/**
 * Step 2: Open Razorpay Checkout modal
 * Uses the public key_id from the order response (safe to use client-side)
 */
export async function openRazorpayCheckout(
  order: RazorpayOrder,
  metadata: PaymentMetadata,
  userInfo: { name: string; email: string; phone: string }
): Promise<RazorpayPaymentResult> {
  // Ensure Razorpay SDK is loaded
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || typeof window === "undefined" || !(window as any).Razorpay) {
    throw new Error("Razorpay Checkout SDK failed to load. Please check network connection.");
  }

  return new Promise((resolve, reject) => {
    const typeLabels: Record<string, string> = {
      TRANSFER: "Fund Transfer",
      BILL_PAYMENT: "Bill Payment",
      RECHARGE: "Mobile Recharge",
    };

    // Sanitize phone number to standard 10 digits for Razorpay SDK prefill
    const cleanPhone = userInfo.phone.replace(/[^0-9]/g, "").slice(-10) || "9876543210";

    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: "FinEdge Banking",
      description: `${typeLabels[metadata.type] || "Payment"} — ${metadata.description || "FinEdge Transaction"}`,
      order_id: order.orderId,
      prefill: {
        name: userInfo.name || "FinEdge User",
        email: userInfo.email || "user@finedge.bank",
        contact: cleanPhone,
      },
      theme: {
        color: "#F0B429",
        backdrop_color: "rgba(0, 0, 0, 0.7)",
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled by user"));
        },
        confirm_close: true,
        escape: true,
      },
      handler: (response: RazorpayPaymentResult) => {
        resolve(response);
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        const errDesc =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment failed";
        reject(new Error(errDesc));
      });

      rzp.open();
    } catch (err: any) {
      reject(new Error(err.message || "Failed to initialize Razorpay modal"));
    }
  });
}

/**
 * Step 3: Verify payment signature server-side
 * The server uses HMAC-SHA256 with RAZORPAY_KEY_SECRET (never exposed to client)
 */
export async function verifyPayment(
  paymentResult: RazorpayPaymentResult,
  metadata: PaymentMetadata
): Promise<RazorpayVerifyResult> {
  const res = await fetch("/api/payment/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: paymentResult.razorpay_order_id,
      razorpay_payment_id: paymentResult.razorpay_payment_id,
      razorpay_signature: paymentResult.razorpay_signature,
      metadata,
    }),
  });

  const data = await res.json();
  return data;
}

/**
 * Full Razorpay payment lifecycle:
 * 1. Create order on server
 * 2. Open Checkout modal for user
 * 3. Verify signature on server
 * Returns verified transaction details or throws on failure
 */
export async function executeRazorpayPayment(
  amount: number,
  metadata: PaymentMetadata,
  userInfo: { name: string; email: string; phone: string }
): Promise<RazorpayVerifyResult> {
  // Step 1: Create order
  const order = await createRazorpayOrder(amount, metadata.type, {
    sourceAccountId: metadata.sourceAccountId || "",
    description: metadata.description || "",
  });

  // Step 2: Open Checkout
  const paymentResult = await openRazorpayCheckout(order, metadata, userInfo);

  // Step 3: Verify payment
  const verification = await verifyPayment(paymentResult, metadata);

  if (!verification.verified) {
    throw new Error(verification.error || "Payment verification failed");
  }

  return verification;
}
