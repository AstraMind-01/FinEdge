import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username = "alex_demo", purpose, targetIdentifier } = body;

    if (!purpose) {
      return NextResponse.json({ success: false, error: "OTP purpose is required." }, { status: 400 });
    }

    const payload = JSON.stringify({ username, purpose, targetIdentifier });

    // Try Gateway (port 8080) then fallback to Auth Service directly (port 8081)
    let backendRes = await fetch("http://localhost:8080/api/v1/otp/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    }).catch(() => null);

    if (!backendRes || !backendRes.ok) {
      backendRes = await fetch("http://localhost:8081/api/v1/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.ok ? 200 : backendRes.status });
  } catch (err: any) {
    console.error("OTP Generate Proxy Error:", err);
    return NextResponse.json({ success: false, error: "Failed to connect to OTP service." }, { status: 500 });
  }
}
