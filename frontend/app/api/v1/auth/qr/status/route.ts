import { NextResponse } from "next/server";
import { challengeStore, QrStatusCode } from "../../../../auth/qr-challenge/route";

function jsonCorsResponse(data: any, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return NextResponse.json(data, { ...init, headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const challengeId = url.searchParams.get("challengeId") || url.searchParams.get("challenge") || "";

  if (!challengeId) {
    return jsonCorsResponse({ success: false, code: "INVALID", status: "INVALID", error: "Challenge ID is required." }, { status: 400 });
  }

  const record = challengeStore.get(challengeId);
  if (!record) {
    return jsonCorsResponse({ success: false, code: "NOT_FOUND", status: "EXPIRED", error: "Challenge expired or invalid." }, { status: 404 });
  }

  if (Date.now() > record.expiresAt && record.status !== "LOGIN_APPROVED" && record.status !== "LOGIN_COMPLETED") {
    record.status = "EXPIRED";
  }

  const remainingSeconds = Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000));

  return jsonCorsResponse({
    success: true,
    code: record.status === "EXPIRED" ? "EXPIRED" : (record.status === "LOGIN_APPROVED" || record.status === "LOGIN_COMPLETED") ? "ALREADY_USED" : "VALID",
    challengeId: record.challengeId,
    status: record.status,
    expiresInSeconds: remainingSeconds,
    token: (record.status === "LOGIN_APPROVED" || record.status === "LOGIN_COMPLETED") ? record.token : undefined,
    user: (record.status === "LOGIN_APPROVED" || record.status === "LOGIN_COMPLETED") ? {
      name: "Soumya",
      username: "soumya",
      email: record.userEmail || "datebong59@gmail.com",
    } : undefined,
  });
}

export async function POST(req: Request) {
  return GET(req);
}
