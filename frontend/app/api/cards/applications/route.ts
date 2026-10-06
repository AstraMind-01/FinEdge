import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:8080";
    const accountServiceUrl = process.env.ACCOUNT_SERVICE_URL || "http://localhost:8082";

    try {
      const gRes = await fetch(`${gatewayUrl}/api/v1/accounts/cards/applications`);
      if (gRes.ok) {
        const data = await gRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("Gateway fetch applications failed, trying direct service...", e);
    }

    try {
      const dRes = await fetch(`${accountServiceUrl}/api/v1/accounts/cards/applications`);
      if (dRes.ok) {
        const data = await dRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("Direct account service fetch failed...", e);
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
