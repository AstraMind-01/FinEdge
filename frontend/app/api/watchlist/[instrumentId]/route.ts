import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ instrumentId: string }> }
) {
  try {
    const params = await props.params;
    const instrumentId = params.instrumentId;
    const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:8080";
    const accountServiceUrl = process.env.ACCOUNT_SERVICE_URL || "http://localhost:8082";

    try {
      await fetch(`${gatewayUrl}/api/v1/watchlist/${instrumentId}`, { method: "DELETE" });
    } catch (e) {
      await fetch(`${accountServiceUrl}/api/v1/watchlist/${instrumentId}`, { method: "DELETE" }).catch(() => {});
    }

    return NextResponse.json({ success: true, removedId: instrumentId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
