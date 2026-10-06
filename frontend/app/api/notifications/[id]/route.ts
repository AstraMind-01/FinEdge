import { NextRequest, NextResponse } from "next/server";

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8084";
const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8080";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try backend
  for (const baseUrl of [`${GATEWAY_URL}/api/v1/notifications`, `${NOTIFICATION_SERVICE_URL}/api/v1/notifications`]) {
    try {
      const res = await fetch(`${baseUrl}/${id}/read`, {
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try backend
  for (const baseUrl of [`${GATEWAY_URL}/api/v1/notifications`, `${NOTIFICATION_SERVICE_URL}/api/v1/notifications`]) {
    try {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        return NextResponse.json({ success: true, source: "backend" });
      }
    } catch (e) {
      continue;
    }
  }

  return NextResponse.json({ success: true, source: "local" });
}
