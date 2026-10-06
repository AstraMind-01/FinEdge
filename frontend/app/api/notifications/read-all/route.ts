import { NextRequest, NextResponse } from "next/server";

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8084";
const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8080";

export async function PATCH(request: NextRequest) {
  const username = "alex_demo";

  // Try backend
  for (const baseUrl of [`${GATEWAY_URL}/api/v1/notifications`, `${NOTIFICATION_SERVICE_URL}/api/v1/notifications`]) {
    try {
      const res = await fetch(`${baseUrl}/read-all?username=${username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        return NextResponse.json({ success: true, source: "backend" });
      }
    } catch (e) {
      continue;
    }
  }

  // Frontend handles localStorage update
  return NextResponse.json({ success: true, source: "local" });
}
