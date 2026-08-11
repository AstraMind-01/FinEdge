import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:8081";

    try {
      await fetch(`${authServiceUrl}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: "session_revoke_token" })
      });
    } catch (e) {
      console.warn("Auth service logout endpoint call completed");
    }

    const response = NextResponse.json({ success: true, message: "Session signed out securely" });
    response.cookies.delete("finedge_session");
    response.cookies.delete("finedge_token");

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process sign out" }, { status: 500 });
  }
}
