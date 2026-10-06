import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, accountId, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action type is required" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    switch (action) {
      case "CHEQUE_BOOK_REQUEST": {
        const refId = `CHQ-REQ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        return NextResponse.json({
          success: true,
          action,
          referenceId: refId,
          timestamp,
          message: `25-leaf personalized cheque book requested for account ${accountId || "Primary Savings"}. Delivered home within 3-5 business days.`,
          auditLog: {
            action: "CHEQUE_BOOK_REQUESTED",
            referenceId: refId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      case "TAX_FORM_DOWNLOAD": {
        const refId = `TAX-CERT-${Date.now().toString().slice(-6)}`;
        return NextResponse.json({
          success: true,
          action,
          referenceId: refId,
          timestamp,
          assessmentYear: "2026-27",
          financialYear: "2025-26",
          message: "Tax Form 16 / 26AS Interest Certificate generated successfully.",
          auditLog: {
            action: "TAX_CERTIFICATE_DOWNLOADED",
            referenceId: refId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      case "KYC_STATUS_CHECK": {
        return NextResponse.json({
          success: true,
          action,
          timestamp,
          kycData: {
            status: "Fully Verified",
            ckycRef: "CKYC-IND-9842019",
            aadhaarStatus: "Verified via UIDAI e-KYC (XXXX-XXXX-4920)",
            panStatus: "Verified via NSDL Portal (ABCDE1234F)",
            lastVerifiedDate: "15-Jan-2026",
            verificationAuthority: "CERSAI CKYCR & UIDAI",
            riskCategory: "Low Risk"
          },
          auditLog: {
            action: "KYC_STATUS_CHECKED",
            status: "SUCCESS",
            timestamp
          }
        });
      }

      case "UPDATE_NOMINEE": {
        const nomineeName = payload?.nomineeName || "Registered Nominee";
        const relation = payload?.relation || "Relative";
        const refId = `NOM-UPD-${Date.now().toString().slice(-6)}`;

        return NextResponse.json({
          success: true,
          action,
          referenceId: refId,
          timestamp,
          nominee: {
            name: nomineeName,
            relation,
            dob: payload?.dob || "1995-05-15",
            allocation: "100%"
          },
          message: `Nominee "${nomineeName}" (${relation}) updated successfully for account ${accountId || "Primary Savings"}.`,
          auditLog: {
            action: "NOMINEE_UPDATED",
            referenceId: refId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      case "DISPUTE_TRANSACTION": {
        const ticketId = `DSP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const txnId = payload?.transactionId || `TXN-${Date.now()}`;
        const reason = payload?.reason || "Unauthorized Charge / Merchant Dispute";

        return NextResponse.json({
          success: true,
          action,
          ticketId,
          referenceId: ticketId,
          timestamp,
          dispute: {
            ticketId,
            transactionId: txnId,
            reason,
            status: "Open / Under Review",
            expectedResolution: "3 Business Days"
          },
          message: `Dispute ticket ${ticketId} created for transaction ${txnId}. Investigation in progress.`,
          auditLog: {
            action: "TRANSACTION_DISPUTE_FILED",
            ticketId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported banking service action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process banking request" },
      { status: 500 }
    );
  }
}
