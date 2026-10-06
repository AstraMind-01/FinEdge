import { NextRequest, NextResponse } from "next/server";

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8084";
const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  const username = "alex_demo";

  // Try backend
  for (const baseUrl of [`${GATEWAY_URL}/api/v1/notifications`, `${NOTIFICATION_SERVICE_URL}/api/v1/notifications`]) {
    try {
      const res = await fetch(`${baseUrl}/preferences?username=${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ ...data, source: "backend" });
      }
    } catch (e) {
      continue;
    }
  }

  // Frontend handles localStorage preferences
  return NextResponse.json({
    preferences: null,
    dnd: null,
    source: "local",
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const username = "alex_demo";

    // Try backend
    for (const baseUrl of [`${GATEWAY_URL}/api/v1/notifications`, `${NOTIFICATION_SERVICE_URL}/api/v1/notifications`]) {
      try {
        const res = await fetch(`${baseUrl}/preferences?username=${username}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          return NextResponse.json({ success: true, source: "backend" });
        }
      } catch (e) {
        continue;
      }
    }

    // Frontend handles localStorage persistence
    return NextResponse.json({ success: true, source: "local" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
