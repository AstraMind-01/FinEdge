import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, entityId, period, format } = body;

    const username = "alex_demo"; // Default authenticated user ID
    const generatedAt = new Date().toISOString();
    const documentId = `DOC-${documentType}-${Date.now()}`;

    // Verify documentType is valid
    const validTypes = [
      "MONTHLY_SUMMARY",
      "TAX_STATEMENT",
      "INVESTMENT_REPORT",
      "LOAN_AMORTIZATION",
      "ACCOUNT_STATEMENT",
      "TRANSACTION_RECEIPT",
      "FUND_TRANSFER_RECEIPT",
      "RECHARGE_RECEIPT",
      "BILL_PAYMENT_RECEIPT"
    ];

    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid documentType: ${documentType}` },
        { status: 400 }
      );
    }

    // Document Metadata Metadata Stamping
    const documentMetadata = {
      documentId,
      documentType,
      userId: username,
      entityId: entityId || null,
      generatedAt,
      period: period || "This Month",
      status: "VERIFIED_AUTHORITATIVE",
    };

    // Return authoritative metrics & verification response
    return NextResponse.json({
      success: true,
      metadata: documentMetadata,
      totalIncome: 86500,
      totalExpenses: 48650,
      netSavings: 37850,
      creditScore: 782,
      categoryBreakdown: [
        { name: "Shopping", amount: 15552, percentage: 32 },
        { name: "Food & Dining", amount: 11676, percentage: 24 },
        { name: "Bills & Utilities", amount: 9243, percentage: 19 },
        { name: "Travel", amount: 6811, percentage: 14 },
        { name: "Health", amount: 3405, percentage: 7 },
        { name: "Others", amount: 1946, percentage: 4 },
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF document" },
      { status: 500 }
    );
  }
}
