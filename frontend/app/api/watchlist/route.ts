import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:8080";
    const accountServiceUrl = process.env.ACCOUNT_SERVICE_URL || "http://localhost:8082";

    try {
      const gRes = await fetch(`${gatewayUrl}/api/v1/watchlist`, { cache: "no-store" });
      if (gRes.ok) {
        const data = await gRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("Gateway fetch watchlist failed, trying direct service...", e);
    }

    try {
      const dRes = await fetch(`${accountServiceUrl}/api/v1/watchlist`, { cache: "no-store" });
      if (dRes.ok) {
        const data = await dRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("Direct account service fetch watchlist failed, using fallback...", e);
    }

    // Fallback default dataset
    return NextResponse.json([
      {
        id: 1,
        instrumentId: "TATAMOTORS",
        symbol: "TATAMOTORS.NS",
        instrumentName: "Tata Motors",
        instrumentType: "STOCK",
        exchange: "NSE",
        marketData: {
          formattedPrice: "₹812.40",
          formattedChange: "+2.3%",
          isPositive: true,
          currentPrice: 812.40
        }
      },
      {
        id: 2,
        instrumentId: "HDFC_FLEXI",
        symbol: "101881",
        instrumentName: "HDFC Flexi Cap Fund",
        instrumentType: "MUTUAL_FUND",
        exchange: "AMFI",
        marketData: {
          formattedPrice: "NAV ₹42.15",
          formattedChange: "+1.1%",
          isPositive: true,
          currentPrice: 42.15
        }
      },
      {
        id: 3,
        instrumentId: "INFY",
        symbol: "INFY.NS",
        instrumentName: "Infosys",
        instrumentType: "STOCK",
        exchange: "NSE",
        marketData: {
          formattedPrice: "₹1,542.60",
          formattedChange: "-0.4%",
          isPositive: false,
          currentPrice: 1542.60
        }
      }
    ]);
  } catch (error) {
    console.error("Watchlist API error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:8080";
    const accountServiceUrl = process.env.ACCOUNT_SERVICE_URL || "http://localhost:8082";

    try {
      const gRes = await fetch(`${gatewayUrl}/api/v1/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (gRes.status === 409) {
        return NextResponse.json({ error: "Already in watchlist", duplicate: true }, { status: 409 });
      }
      if (gRes.ok) {
        const data = await gRes.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch (e) {
      console.warn("Gateway add watchlist failed...", e);
    }

    try {
      const dRes = await fetch(`${accountServiceUrl}/api/v1/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (dRes.status === 409) {
        return NextResponse.json({ error: "Already in watchlist", duplicate: true }, { status: 409 });
      }
      if (dRes.ok) {
        const data = await dRes.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch (e) {
      console.warn("Direct account service add watchlist failed...", e);
    }

    return NextResponse.json({
      id: Date.now(),
      instrumentId: body.instrumentId,
      symbol: body.symbol || body.instrumentId,
      instrumentName: body.instrumentName,
      instrumentType: body.instrumentType || "STOCK",
      exchange: body.exchange || "NSE",
      marketData: {
        formattedPrice: body.price || "₹500.00",
        formattedChange: body.change || "+1.0%",
        isPositive: !(body.change || "").startsWith("-"),
        currentPrice: 500.00
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}
