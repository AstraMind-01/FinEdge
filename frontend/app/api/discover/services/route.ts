import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action type is required" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    switch (action) {
      case "HOME_LOANS": {
        const refId = `HL-APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const loanAmount = payload?.requestedAmount || 7500000;
        const interestRate = 8.35;
        const tenureYears = payload?.tenureYears || 20;

        // EMI Calculation: P * r * (1+r)^n / ((1+r)^n - 1)
        const monthlyRate = interestRate / (12 * 100);
        const totalMonths = tenureYears * 12;
        const emi = Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        );

        return NextResponse.json({
          success: true,
          action,
          referenceId: refId,
          timestamp,
          loanDetails: {
            applicationId: refId,
            preApprovedAmount: loanAmount,
            interestRate: `${interestRate}% p.a.`,
            tenureYears,
            estimatedEmi: emi,
            processingFee: "Zero Processing Fee (Limited Festive Offer)",
            status: "Pre-Approved / Application Submitted"
          },
          message: `Home Loan pre-approval application ${refId} submitted successfully for ₹${loanAmount.toLocaleString("en-IN")}. Estimated EMI: ₹${emi.toLocaleString("en-IN")}/mo.`,
          auditLog: {
            action: "HOME_LOAN_APPLICATION_SUBMITTED",
            referenceId: refId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      case "WEALTH_MGMT": {
        const refId = `WLM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        return NextResponse.json({
          success: true,
          action,
          referenceId: refId,
          timestamp,
          wealthDetails: {
            requestId: refId,
            assignedAdvisor: "Rajesh Verma, Senior Vice President - Private Wealth",
            advisorContact: "+91 22 6900 8888 | r.verma@finedge.bank",
            portfolioReviewStatus: "Scheduled for Consultation",
            recommendedAssetAllocation: "60% Equity / 30% Debt / 10% Gold & Liquid Funds"
          },
          message: `Private Wealth Advisory consultation request ${refId} registered. Senior VP Rajesh Verma has been assigned to your portfolio.`,
          auditLog: {
            action: "WEALTH_ADVISORY_REQUESTED",
            referenceId: refId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      case "INSURANCE": {
        const refId = `INS-POL-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const policyType = payload?.policyType || "Comprehensive Health & Term Life Combo";

        return NextResponse.json({
          success: true,
          action,
          referenceId: refId,
          timestamp,
          insuranceDetails: {
            policyId: refId,
            policyType,
            healthSumInsured: "₹ 1,00,00,000 (₹1 Cr)",
            lifeSumInsured: "₹ 2,00,00,000 (₹2 Cr)",
            cashlessHospitals: "10,000+ Network Hospitals Worldwide",
            premiumAnnual: "₹ 24,999 / year",
            status: "Quote Generated / Underwriting Pre-Approved"
          },
          message: `Insurance Policy application ${refId} created successfully. Health cover ₹1 Cr + Term Life ₹2 Cr pre-approved.`,
          auditLog: {
            action: "INSURANCE_POLICY_APPLICATION_SUBMITTED",
            referenceId: refId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      case "PREMIUM_CARDS": {
        const refId = `CRD-APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        return NextResponse.json({
          success: true,
          action,
          referenceId: refId,
          timestamp,
          cardDetails: {
            applicationId: refId,
            cardName: "FinEdge Infinite Metal Credit Card",
            creditLimit: "₹ 10,00,000 (₹10 Lakhs)",
            perks: [
              "Zero Foreign Exchange Markup Fee",
              "Unlimited International & Domestic Airport Lounge Access",
              "5x Reward Points on International Travel & Dining",
              "Complimentary Golf Rounds & Airport Meet-and-Greet"
            ],
            status: "Instant Pre-Approval Verified"
          },
          message: `FinEdge Infinite Metal Credit Card upgrade application ${refId} submitted with pre-approved credit limit of ₹10,00,000.`,
          auditLog: {
            action: "PREMIUM_CARD_UPGRADE_APPLIED",
            referenceId: refId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      case "CONCIERGE": {
        const refId = `CNC-REQ-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        return NextResponse.json({
          success: true,
          action,
          referenceId: refId,
          timestamp,
          conciergeDetails: {
            ticketId: refId,
            serviceLine: "24/7 Dedicated Priority Banking Concierge",
            directLine: "+91 1800 200 9999 (Toll-Free Priority)",
            relationshipManager: "Vikramaditya Rao (Senior Relationship Manager)",
            rmEmail: "v.rao@finedge.bank",
            status: "Callback Scheduled within 15 minutes"
          },
          message: `24/7 Priority Concierge booking ${refId} confirmed. Senior Relationship Manager Vikramaditya Rao will contact you shortly.`,
          auditLog: {
            action: "CONCIERGE_SERVICE_REQUESTED",
            referenceId: refId,
            status: "SUCCESS",
            timestamp
          }
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported discover service action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process discover service request" },
      { status: 500 }
    );
  }
}
