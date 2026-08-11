import { NextRequest, NextResponse } from "next/server";

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8084";
const GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
  const username = "alex_demo"; // Default authenticated user

  // Try backend notification service via gateway first, then direct
  for (const baseUrl of [`${GATEWAY_URL}/api/v1/notifications`, `${NOTIFICATION_SERVICE_URL}/api/v1/notifications`]) {
    try {
      const res = await fetch(`${baseUrl}?username=${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ notifications: data, source: "backend" });
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback: return empty (frontend uses localStorage as primary)
  return NextResponse.json({ notifications: [], source: "local" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Attempt to persist to backend notification service
    for (const baseUrl of [`${GATEWAY_URL}/api/v1/notifications`, `${NOTIFICATION_SERVICE_URL}/api/v1/notifications`]) {
      try {
        const res = await fetch(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientUsername: "alex_demo",
            title: body.title,
            message: body.description,
            type: mapTypeToBackend(body.type),
            category: body.category,
            priority: body.priority,
            transactionRef: body.referenceId,
            actionLink: body.actionLink,
            actionLabel: body.actionLabel,
            sourceEvent: body.sourceEvent,
            metadata: body.metadata ? JSON.stringify(body.metadata) : null,
          }),
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          return NextResponse.json({ success: true, source: "backend" });
        }
      } catch (e) {
        continue;
      }
    }

    // Backend unavailable — frontend handles localStorage persistence
    return NextResponse.json({ success: true, source: "local" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function mapTypeToBackend(type: string): string {
  switch (type) {
    case 'transaction': return 'TRANSACTION_SUCCESS';
    case 'security': return 'SECURITY';
    case 'approval': return 'APPROVAL_BENEFICIARY';
    case 'update': return 'UPDATE_ACCOUNT';
    case 'offer': return 'OFFER_PROMOTION';
    default: return 'TRANSACTION_SUCCESS';
  }
}
