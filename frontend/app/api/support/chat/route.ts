import { NextRequest, NextResponse } from "next/server";

interface GuideTopic {
  title: string;
  route: string;
  routeName: string;
  whereToGo: string;
  whatToSelect: string;
  actionButton: string;
  verification: string;
  whatHappensNext: string;
  howToConfirm: string;
  quickActions: string[];
}

function buildStepByStepResponse(topic: GuideTopic, userQuery: string): { reply: string; quickActions: string[] } {
  const reply = `🤖 **Ayasa Step-by-Step Guidance: ${topic.title}**

1. **Where to go:** Navigate to [${topic.routeName}](${topic.route})
2. **What to select:** ${topic.whatToSelect}
3. **What button/action to use:** ${topic.actionButton}
4. **What information or verification is required:** ${topic.verification}
5. **What happens next:** ${topic.whatHappensNext}
6. **How to confirm:** ${topic.howToConfirm}

🔒 *Security Notice: Sensitive operations require Security PIN or 2FA Email OTP authorization. Security checks can never be bypassed.*`;

  return { reply, quickActions: topic.quickActions };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, userId, userEmail, userName, contextPage } = body;

    const gatewayUrl = process.env.GATEWAY_URL || "http://localhost:8080";
    const supportServiceUrl = process.env.SUPPORT_SERVICE_URL || "http://localhost:8087";

    // Attempt to communicate via API Gateway first
    try {
      const gatewayRes = await fetch(`${gatewayUrl}/api/v1/support/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId,
          userId: userId || "usr_default_01",
          userEmail,
          userName,
          contextPage
        }),
      });

      if (gatewayRes.ok) {
        const data = await gatewayRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("API Gateway unavailable, trying direct support-service...", e);
    }

    // Direct support-service fallback
    try {
      const directRes = await fetch(`${supportServiceUrl}/api/v1/support/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId,
          userId: userId || "usr_default_01",
          userEmail,
          userName,
          contextPage
        }),
      });

      if (directRes.ok) {
        const data = await directRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("Direct support service unavailable, using enhanced step-by-step AI engine...", e);
    }

    // Client-side / server fallback AI engine with structured 6-step walkthroughs
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const lower = (message || "").toLowerCase().trim();

    let reply = "";
    let ticketId: string | undefined = undefined;
    let escalated = false;
    let quickActions: string[] = ["View Accounts", "Transfer Money", "View Cards"];

    // ─── 1. GUARDRAILS ────────────────────────────────────────────────────────
    if (lower.includes("password") && (lower.includes("what is") || lower.includes("reveal") || lower.includes("show me"))) {
      reply = "🔒 **Security Guardrail**: Passwords and PINs are strictly encrypted. To reset your password securely, click 'Forgot Password?' on the login screen or update it via your profile security modal.\n\n• Go to [Login](/login) or open Profile Security modal.";
      quickActions = ["Security Settings", "Contact Support"];
    } else if (lower.includes("otp") && (lower.includes("give me") || lower.includes("what is") || lower.includes("code"))) {
      reply = "🛡️ **Security Policy**: Ayasa and FinEdge staff will **NEVER** ask for, reveal, or share your OTP over chat, SMS, or call.";
      quickActions = ["Contact Support", "Check KYC"];
    }
    // ─── 2. HUMAN ESCALATION & FRAUD TICKETING ──────────────────────────────
    else if (lower.includes("human") || lower.includes("agent") || lower.includes("representative") || lower.includes("fraud") || lower.includes("unauthorized") || lower.includes("stolen") || lower.includes("blocked transaction")) {
      ticketId = `TKT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      reply = `🤝 **Priority Support Escalation**\n\nA priority support ticket has been created:\n• **Ticket ID:** ${ticketId}\n• **Priority:** HIGH / CRITICAL\n• **Status:** OPEN (Assigned to Human Support Desk)\n\n1. **Where to go:** Monitor claim status on [Disputes Management](/disputes)\n2. **What to select:** Open ticket ${ticketId}\n3. **What button/action to use:** Click 'Upload Evidence' if additional merchant receipts are required\n4. **Verification:** Authenticate with 2FA email OTP\n5. **What happens next:** Fraud Operations team investigates within 24 hours\n6. **How to confirm:** Check for 'Under Investigation' badge on [Disputes](/disputes)`;
      escalated = true;
      quickActions = ["Dispute Transaction", "Check Transactions", "Contact Support"];
    }
    // ─── 3. CARDS (REVEAL / APPLY / FREEZE) ─────────────────────────────────
    else if (lower.includes("card") || lower.includes("debit") || lower.includes("credit") || lower.includes("cvv") || lower.includes("expiry") || lower.includes("virtual card")) {
      const guide = buildStepByStepResponse({
        title: "Viewing Card Details & Managing Cards",
        route: "/cards",
        routeName: "Manage Cards",
        whereToGo: "Navigate to Manage Cards",
        whatToSelect: "Select your active Debit Card or Credit Card from the card carousel.",
        actionButton: "Click 'View Card Details' or 'Reveal Card Number'.",
        verification: "Enter your 4-digit Security PIN or OTP to unmask sensitive card numbers.",
        whatHappensNext: "16-digit card number and CVV are unmasked for 5 minutes before auto-masking.",
        howToConfirm: "Look for the 'Card Details Unmasked' status badge on your card display.",
        quickActions: ["View Cards", "Apply for New Card", "Freeze Card"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 4. FUND TRANSFERS & PAYMENTS ────────────────────────────────────────
    else if (lower.includes("transfer") || lower.includes("send money") || lower.includes("imps") || lower.includes("neft") || lower.includes("upi")) {
      const guide = buildStepByStepResponse({
        title: "Executing Fund Transfers",
        route: "/transfers/fund-transfer",
        routeName: "Fund Transfers",
        whereToGo: "Go to Fund Transfers page",
        whatToSelect: "Select Source Account and Recipient (Saved Beneficiary or New Account / UPI ID).",
        actionButton: "Select payment mode (IMPS Instant, NEFT, or RTGS) and click 'Initiate Transfer'.",
        verification: "Enter transfer amount, remark, and complete 2FA Security PIN / OTP verification.",
        whatHappensNext: "Real-time fraud risk engine checks transaction safety and dispatches funds.",
        howToConfirm: "Receive instant transaction reference ID (TXN-XXXXXXXX) and downloadable PDF receipt.",
        quickActions: ["Transfer Money", "Manage Beneficiaries", "Check Transactions"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 5. INTERNATIONAL WIRE TRANSFERS ──────────────────────────────────────
    else if (lower.includes("international") || lower.includes("swift") || lower.includes("forex") || lower.includes("wire")) {
      const guide = buildStepByStepResponse({
        title: "International Wire Transfers (SWIFT)",
        route: "/transfers/international",
        routeName: "International Wire Transfers",
        whereToGo: "Navigate to International Wire Transfers",
        whatToSelect: "Select destination country, foreign currency (USD, EUR, GBP), and recipient SWIFT/BIC code.",
        actionButton: "Click 'Send International Wire'.",
        verification: "Provide beneficiary bank details, purpose code, and authorize with 2FA email OTP.",
        whatHappensNext: "Guaranteed FX exchange rate lock is applied and SWIFT payment message is transmitted.",
        howToConfirm: "Track wire status live using SWIFT UETR tracking code under Transactions.",
        quickActions: ["International Transfer", "Transfer Money", "View Accounts"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 6. SCHEDULED / RECURRING TRANSFERS ──────────────────────────────────
    else if (lower.includes("scheduled") || lower.includes("standing instruction") || lower.includes("recurring")) {
      const guide = buildStepByStepResponse({
        title: "Setting Up Scheduled Transfers",
        route: "/transfers/scheduled",
        routeName: "Scheduled Transfers",
        whereToGo: "Open Scheduled Transfers",
        whatToSelect: "Select target beneficiary and auto-payment frequency (Monthly, Weekly, Custom).",
        actionButton: "Click 'Create Standing Instruction'.",
        verification: "Specify start date, execution day, transfer amount, and confirm with PIN.",
        whatHappensNext: "FinEdge automated payment engine registers your recurring auto-debit rule.",
        howToConfirm: "Verify your active standing instruction listed on Scheduled Transfers.",
        quickActions: ["Scheduled Transfers", "Transfer Money", "View Accounts"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 7. RECHARGES & BILL PAYMENTS ───────────────────────────────────────
    else if (lower.includes("recharge") || lower.includes("bill") || lower.includes("electricity") || lower.includes("water") || lower.includes("bbps")) {
      const guide = buildStepByStepResponse({
        title: "Mobile Recharges & Utility Bill Payments",
        route: "/transfers",
        routeName: "Transfers & Payments",
        whereToGo: "Go to Transfers & Payments",
        whatToSelect: "Select 'Mobile Recharge' or 'Utility Bills' (Electricity, Water, Gas, DTH).",
        actionButton: "Choose biller/operator, enter consumer number, and click 'Proceed to Pay'.",
        verification: "Select debiting account and authorize with your Security PIN.",
        whatHappensNext: "Bharat BillPay (BBPS) gateway verifies biller and completes payment instantly.",
        howToConfirm: "View your BBPS payment reference ID and instant email/SMS confirmation.",
        quickActions: ["Recharge Mobile", "Pay Bills", "View Accounts"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 8. ACCOUNTS & BALANCES & CHEQUE BOOKS ──────────────────────────────
    else if (lower.includes("account") || lower.includes("balance") || lower.includes("statement") || lower.includes("cheque")) {
      const guide = buildStepByStepResponse({
        title: "Accounts Overview & Cheque Book Requests",
        route: "/accounts",
        routeName: "Accounts Directory",
        whereToGo: "Navigate to Accounts Directory",
        whatToSelect: "Select Primary Savings Account or Business Current Account.",
        actionButton: "Click 'View Details', 'Download Statement', or 'Request Cheque Book'.",
        verification: "Authenticate with 4-digit Security PIN.",
        whatHappensNext: "Account balances unmask and requested services/statements generate instantly.",
        howToConfirm: "Check updated account dashboard and confirmation notification.",
        quickActions: ["View Accounts", "Transfer Money", "Check Transactions"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 9. TRANSACTIONS & RECEIPTS ──────────────────────────────────────────
    else if (lower.includes("transaction") || lower.includes("history") || lower.includes("receipt") || lower.includes("download receipt")) {
      const guide = buildStepByStepResponse({
        title: "Transaction History & Receipt Downloads",
        route: "/transactions",
        routeName: "View Transactions",
        whereToGo: "Open View Transactions page",
        whatToSelect: "Select specific transaction record from your history list.",
        actionButton: "Click 'Download Receipt' for PDF receipt or 'Dispute Transaction' if suspicious.",
        verification: "Security PIN verification required for transaction export.",
        whatHappensNext: "Receipt PDF is generated with transaction timestamp and digital signature.",
        howToConfirm: "PDF file downloads directly to your device browser.",
        quickActions: ["View Transactions", "Dispute Transaction", "Download Statements"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 10. BENEFICIARIES ──────────────────────────────────────────────────
    else if (lower.includes("beneficiary") || lower.includes("payee") || lower.includes("add beneficiary")) {
      const guide = buildStepByStepResponse({
        title: "Managing Saved Beneficiaries",
        route: "/beneficiaries",
        routeName: "Beneficiaries Management",
        whereToGo: "Navigate to Beneficiaries Management",
        whatToSelect: "Click 'Add New Beneficiary' or select an existing beneficiary to edit/delete.",
        actionButton: "Enter recipient bank details and click 'Save Beneficiary'.",
        verification: "Verify with 2FA email OTP sent to datebong59@gmail.com.",
        whatHappensNext: "Beneficiary is registered. A 30-minute cooling period applies for large transfers.",
        howToConfirm: "Look for 'Verified Beneficiary' badge in your beneficiary directory.",
        quickActions: ["Manage Beneficiaries", "Transfer Money", "View Accounts"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 11. DEPOSITS (FD / RD) ───────────────────────────────────────────────
    else if (lower.includes("deposit") || lower.includes("fixed deposit") || lower.includes("recurring deposit") || lower.includes("fd") || lower.includes("rd")) {
      const guide = buildStepByStepResponse({
        title: "Opening Fixed & Recurring Deposits",
        route: "/deposits",
        routeName: "Fixed & Recurring Deposits",
        whereToGo: "Navigate to Fixed & Recurring Deposits",
        whatToSelect: "Choose FD or RD scheme and tenure (6 months to 10 years).",
        actionButton: "Use Deposit Calculator, then click 'Open New Deposit'.",
        verification: "Enter principal amount, interest payout frequency, and authorize with PIN.",
        whatHappensNext: "Principal is transferred from savings account and deposit account is created.",
        howToConfirm: "Download your official FD Advice Certificate directly from Deposits page.",
        quickActions: ["Open Deposit", "Deposit Calculator", "View Accounts"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 12. LOANS & MORTGAGES ──────────────────────────────────────────────
    else if (lower.includes("loan") || lower.includes("emi") || lower.includes("mortgage") || lower.includes("borrow")) {
      const guide = buildStepByStepResponse({
        title: "Applying for Loans & Paying EMIs",
        route: "/loans",
        routeName: "Loans & Mortgages",
        whereToGo: "Navigate to Loans & Mortgages",
        whatToSelect: "Select Personal Loan, Home Loan, or Auto Loan.",
        actionButton: "Click 'Apply for Loan' or 'Pay EMI'.",
        verification: "Provide income details, soft credit score consent, and verify with OTP.",
        whatHappensNext: "Automated underwriting engine evaluates credit eligibility for pre-approval.",
        howToConfirm: "View your loan sanction letter and active EMI schedule on Loans page.",
        quickActions: ["Apply for Loan", "Pay EMI", "View Accounts"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 13. KYC & PROFILE & NOMINEE ────────────────────────────────────────
    else if (lower.includes("kyc") || lower.includes("aadhaar") || lower.includes("pan") || lower.includes("nominee") || lower.includes("address")) {
      const guide = buildStepByStepResponse({
        title: "KYC Verification & Nominee Updates",
        route: "/kyc-profile",
        routeName: "KYC & Profile Vault",
        whereToGo: "Go to KYC & Profile Vault",
        whatToSelect: "Select 'Update KYC', 'Nominee Details', or 'Update Address'.",
        actionButton: "Click 'Upload Documents' or 'Update Nominee'.",
        verification: "Upload document scans (Aadhaar / PAN) and verify with 2FA email OTP.",
        whatHappensNext: "Document verification engine validates identity against official registries.",
        howToConfirm: "Check for 'KYC Verified - Tier 1' status badge on your profile.",
        quickActions: ["Check KYC", "Update Profile", "Contact Support"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 14. DISPUTES & EVIDENCE ────────────────────────────────────────────
    else if (lower.includes("dispute") || lower.includes("evidence") || lower.includes("claim") || lower.includes("provisional")) {
      const guide = buildStepByStepResponse({
        title: "Filing Disputes & Attaching Evidence",
        route: "/disputes",
        routeName: "Disputes Management",
        whereToGo: "Go to Disputes Management",
        whatToSelect: "Select an active claim ticket or click 'File New Dispute'.",
        actionButton: "Click 'Upload Evidence' or 'Cancel Dispute'.",
        verification: "Attach merchant communication, receipts, or order numbers.",
        whatHappensNext: "Provisional credit is credited to account while fraud team reviews claim.",
        howToConfirm: "Track claim status updated to 'Under Investigation' or 'Resolved'.",
        quickActions: ["Dispute Transaction", "View Transactions", "Contact Support"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 15. SECURITY & NOTIFICATIONS & DND ────────────────────────────────
    else if (lower.includes("security") || lower.includes("dnd") || lower.includes("notification") || lower.includes("alert")) {
      const guide = buildStepByStepResponse({
        title: "Security Settings & Notification Preferences",
        route: "/notifications",
        routeName: "Notifications & Security",
        whereToGo: "Go to Notifications & Security",
        whatToSelect: "Select 'Channel Preferences', 'Enable DND', or open Profile Security modal.",
        actionButton: "Toggle Push/SMS/Email alerts or click 'Password & 2FA Security'.",
        verification: "Enter current password and verify 6-digit email OTP for security updates.",
        whatHappensNext: "Security preferences update in PostgreSQL DB; DND suppresses non-urgent alerts.",
        howToConfirm: "Check for 'Preferences Saved' confirmation alert.",
        quickActions: ["Notification Settings", "Security Settings", "Contact Support"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 16. PDF REPORTS & TAX STATEMENTS ───────────────────────────────────
    else if (lower.includes("report") || lower.includes("tax") || lower.includes("26as") || lower.includes("summary")) {
      const guide = buildStepByStepResponse({
        title: "Downloading Reports & Tax Statements (Form 26AS)",
        route: "/reports",
        routeName: "Reports & Statements",
        whereToGo: "Navigate to Reports & Statements",
        whatToSelect: "Select report type: Monthly Summary, Form 26AS Tax Statement, or Custom Range.",
        actionButton: "Select financial year/date range and click 'Download PDF Report'.",
        verification: "Security PIN verification required for formal financial export.",
        whatHappensNext: "Centralized PDF Generation Service compiles statement with real data.",
        howToConfirm: "The PDF document will automatically download to your browser.",
        quickActions: ["Download Statements", "View Accounts", "Check Transactions"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 17. INVESTMENTS & WATCHLIST ────────────────────────────────────────
    else if (lower.includes("watchlist") || lower.includes("stock") || lower.includes("mutual fund") || lower.includes("investment")) {
      const guide = buildStepByStepResponse({
        title: "Investments & Persistent Watchlist",
        route: "/investments",
        routeName: "Investments & Watchlist",
        whereToGo: "Navigate to Investments & Watchlist",
        whatToSelect: "Select target stock symbol, index, or mutual fund scheme.",
        actionButton: "Click 'Add to Watchlist' or 'Invest Now'.",
        verification: "Confirm investment amount and authorization PIN.",
        whatHappensNext: "Order is transmitted to market exchange / AMC registry.",
        howToConfirm: "View your updated holding under Portfolio Breakdown.",
        quickActions: ["Manage Watchlist", "Invest in Mutual Funds", "View Deposits"]
      }, message);
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 18. GREETINGS & DEFAULT ────────────────────────────────────────────
    else {
      reply = `Hello Soumya! 👋 I'm **Ayasa**, your FinEdge AI Support Assistant.\n\nI provide **step-by-step guidance** for every feature on FinEdge:\n• [Accounts & Balances](/accounts) — View balances, statements, cheque books\n• [Fund Transfers](/transfers/fund-transfer) — Send money via IMPS/NEFT/RTGS\n• [Manage Cards](/cards) — Reveal card details, apply, or freeze cards\n• [Disputes & Fraud](/disputes) — File claims & upload evidence\n• [Recharges & Bills](/transfers) — Mobile top-ups & utility bills\n• [KYC & Profile](/kyc-profile) — Verify documents & nominee details\n• [PDF Reports](/reports) — Download statements & Form 26AS\n\nHow can I help you today? Ask me any "how do I..." or "where can I..." question!`;
      quickActions = ["View Accounts", "Transfer Money", "View Cards"];
    }

    return NextResponse.json({
      conversationId: conversationId || "conv-default",
      reply,
      timestamp: timeStr,
      ticketId,
      escalated,
      quickActions
    });
  } catch (error) {
    console.error("Support API route error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
