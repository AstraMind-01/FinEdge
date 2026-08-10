import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { verificationToken } = body;

    if (!verificationToken) {
      return NextResponse.json({ success: false, error: "Verification token is required for resend." }, { status: 400 });
    }

    // Call Spring Boot backend API Gateway / auth-service
    const backendRes = await fetch("http://localhost:8080/api/v1/otp/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationToken }),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.ok ? 200 : backendRes.status });
  } catch (err: any) {
    console.error("OTP Resend Proxy Error:", err);
    return NextResponse.json({ success: false, error: "Failed to connect to OTP resend service." }, { status: 500 });
  }
}
