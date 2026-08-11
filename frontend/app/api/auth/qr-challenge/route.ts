import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";

export type QrStatus = 
  | "WAITING_FOR_SCAN"
  | "SCANNED"
  | "AWAITING_APPROVAL"
  | "AUTHENTICATING"
  | "AUTHENTICATED"
  | "EXPIRED"
  | "CANCELLED"
  | "REJECTED";

export interface QrChallengeRecord {
  challengeId: string;
  nonce: string;
  status: QrStatus;
  createdAt: number;
  expiresAt: number;
  desktopSessionId: string;
  authenticatedUserId?: string;
  userEmail?: string;
  token?: string;
}

const challengeStore = new Map<string, QrChallengeRecord>();

function getTransporter() {
  const userEmail = process.env.SMTP_USERNAME || "datebong59@gmail.com";
  const pass = process.env.SMTP_PASSWORD || "ydakfxlxxfkkqgiy";

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: userEmail, pass: pass },
  });
}

// Cleanup expired challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, rec] of challengeStore.entries()) {
    if (now > rec.expiresAt + 60000) {
      challengeStore.delete(id);
    }
  }
}, 5 * 60 * 1000);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action = "GENERATE", challengeId, userIdentifier, pin } = body || {};

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // ─── 1. GENERATE CHALLENGE ────────────────────────────────────────────────
    if (action === "GENERATE") {
      const id = `qr_ch_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
      const nonce = crypto.randomBytes(16).toString("hex");
      const desktopSessionId = `dsess_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

      const record: QrChallengeRecord = {
        challengeId: id,
        nonce,
        status: "WAITING_FOR_SCAN",
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 1000, // 60 seconds
        desktopSessionId,
      };

      challengeStore.set(id, record);

      const mobileAuthUrl = `${baseUrl}/qr-auth/${id}`;

      return NextResponse.json({
        success: true,
        challengeId: id,
        nonce,
        status: record.status,
        expiresInSeconds: 60,
        expiresAt: record.expiresAt,
        mobileAuthUrl,
      });
    }

    // ─── 2. CHECK STATUS (DESKTOP POLLING) ──────────────────────────────────
    if (action === "STATUS") {
      if (!challengeId) {
        return NextResponse.json({ error: "Challenge ID is required." }, { status: 400 });
      }

      const record = challengeStore.get(challengeId);
      if (!record) {
        return NextResponse.json({ status: "EXPIRED", error: "Challenge expired or invalid." }, { status: 404 });
      }

      if (Date.now() > record.expiresAt && record.status !== "AUTHENTICATED") {
        record.status = "EXPIRED";
      }

      const remainingSeconds = Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000));

      return NextResponse.json({
        success: true,
        challengeId: record.challengeId,
        status: record.status,
        expiresInSeconds: remainingSeconds,
        token: record.status === "AUTHENTICATED" ? record.token : undefined,
        user: record.status === "AUTHENTICATED" ? {
          name: "Soumya",
          username: "soumya",
          email: record.userEmail || "datebong59@gmail.com",
        } : undefined,
      });
    }

    // ─── 3. MOBILE SCAN INITIALIZATION ───────────────────────────────────────
    if (action === "MOBILE_SCAN") {
      if (!challengeId) {
        return NextResponse.json({ error: "Challenge ID is required." }, { status: 400 });
      }

      const record = challengeStore.get(challengeId);
      if (!record || Date.now() > record.expiresAt || record.status === "EXPIRED") {
        if (record) record.status = "EXPIRED";
        return NextResponse.json({ status: "EXPIRED", error: "QR Code expired. Please refresh QR code on desktop." }, { status: 400 });
      }

      if (record.status === "WAITING_FOR_SCAN") {
        record.status = "SCANNED";
        setTimeout(() => {
          if (record.status === "SCANNED") {
            record.status = "AWAITING_APPROVAL";
          }
        }, 500);
      }

      return NextResponse.json({
        success: true,
        challengeId: record.challengeId,
        status: record.status,
        expiresAt: record.expiresAt,
        remainingSeconds: Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000)),
      });
    }

    // ─── 4. MOBILE APPROVAL ─────────────────────────────────────────────────
    if (action === "MOBILE_APPROVE") {
      if (!challengeId) {
        return NextResponse.json({ error: "Challenge ID is required." }, { status: 400 });
      }

      const record = challengeStore.get(challengeId);
      if (!record || Date.now() > record.expiresAt || record.status === "EXPIRED") {
        if (record) record.status = "EXPIRED";
        return NextResponse.json({ error: "QR Code has expired. Please refresh QR code on desktop." }, { status: 400 });
      }

      if (record.status === "AUTHENTICATED") {
        return NextResponse.json({ error: "This QR challenge has already been used." }, { status: 400 });
      }

      // Verify PIN / Credentials (accepts demo PIN 1234 or 123456 or password)
      if (pin && pin !== "1234" && pin !== "123456" && pin !== "Password123!" && pin.length < 4) {
        return NextResponse.json({ error: "Invalid Security PIN. Try '1234' for demo." }, { status: 400 });
      }

      record.status = "AUTHENTICATED";
      record.authenticatedUserId = "usr_soumya_01";
      record.userEmail = userIdentifier && userIdentifier.includes("@") ? userIdentifier : "datebong59@gmail.com";
      record.token = `qr_jwt_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;

      // Send Security Alert Email
      try {
        const transporter = getTransporter();
        await transporter.sendMail({
          from: `"FinEdge Security" <${process.env.SMTP_USERNAME || "datebong59@gmail.com"}>`,
          to: record.userEmail,
          subject: "Security Alert: Successful QR Passwordless Sign-In",
          html: `
            <div style="font-family: Arial; padding: 20px; background: #0b0f19; color: #ffffff;">
              <h3 style="color: #2DD4BF;">✅ QR Code Sign-In Approved</h3>
              <p>A passwordless sign-in was approved via smartphone on <strong>${new Date().toLocaleString("en-IN")}</strong>.</p>
              <p style="color: #cbd5e1; font-size: 12px;">If you did not authorize this login, lock your account immediately.</p>
            </div>
          `,
        });
      } catch (e) {}

      return NextResponse.json({
        success: true,
        status: "AUTHENTICATED",
        message: "Sign-in approved successfully! Desktop session logged in.",
      });
    }

    // ─── 5. MOBILE REJECTION ────────────────────────────────────────────────
    if (action === "MOBILE_REJECT") {
      if (!challengeId) {
        return NextResponse.json({ error: "Challenge ID is required." }, { status: 400 });
      }

      const record = challengeStore.get(challengeId);
      if (record) {
        record.status = "REJECTED";
      }

      return NextResponse.json({
        success: true,
        status: "REJECTED",
        message: "Sign-in request rejected.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "QR Challenge failed." }, { status: 500 });
  }
}
