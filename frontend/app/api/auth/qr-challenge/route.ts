import { NextResponse } from "next/server";
import crypto from "crypto";

interface QrChallengeRecord {
  challengeId: string;
  expiresAt: number;
  status: "PENDING" | "APPROVED" | "EXPIRED";
}

const activeChallenges = new Map<string, QrChallengeRecord>();

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action = "GENERATE", challengeId } = body || {};

    if (action === "GENERATE") {
      const id = `qr_ch_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const record: QrChallengeRecord = {
        challengeId: id,
        expiresAt: Date.now() + 60 * 1000, // 60 seconds
        status: "PENDING",
      };

      activeChallenges.set(id, record);

      return NextResponse.json({
        success: true,
        challengeId: id,
        expiresInSeconds: 60,
        qrPayload: `finedge://auth/qr-challenge?id=${id}&expires=${record.expiresAt}`,
      });
    }

    if (action === "VERIFY") {
      if (!challengeId) {
        return NextResponse.json({ error: "Challenge ID is required." }, { status: 400 });
      }

      const record = activeChallenges.get(challengeId);
      if (!record || Date.now() > record.expiresAt || record.status === "EXPIRED") {
        activeChallenges.delete(challengeId);
        return NextResponse.json({ error: "QR Challenge expired or invalid. Please refresh QR Code." }, { status: 400 });
      }

      record.status = "APPROVED";
      activeChallenges.delete(challengeId);

      return NextResponse.json({
        success: true,
        authenticated: true,
        token: `qr_token_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
        user: { name: "Soumya", username: "soumya", email: "datebong59@gmail.com" },
        message: "QR Challenge verified successfully.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "QR Challenge failed." }, { status: 500 });
  }
}
