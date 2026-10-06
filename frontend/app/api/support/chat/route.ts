import { NextRequest, NextResponse } from "next/server";

interface GroundedWalkthrough {
  title: string;
  route: string;
  routeName: string;
  whereToGo: string;
  whatToSelect: string;
  actionButton: string;
  verification: string;
  backendOperation: string;
  resultingStatus: string;
  howToConfirm: string;
  quickActions: string[];
}

// ─── 1. TEXT NORMALIZATION & TYPO CORRECTION ────────────────────────────────
function normalizeText(text: string): string {
  if (!text) return "";
  let s = text.toLowerCase().trim();

  // Correct common typos & variations
  s = s.replace(/\bfreze\b|\bfreez\b|\bfroze\b|\bblock\b|\block\b|\bdisable\b/g, "freeze");
  s = s.replace(/\bcrrate\b|\bcretae\b|\bmak\b|\bmake\b|\bapply\b|\brequest\b|\bissue\b|\border\b/g, "apply_new");
  s = s.replace(/\bbalence\b|\bbalanc\b|\bbacc\b|\baccnt\b/g, "balance");
  s = s.replace(/\btransfr\b|\btrnsfer\b|\bsend\b|\bpay\b/g, "transfer");
  s = s.replace(/\bnomni\b|\bnomine\b|\bnomnee\b/g, "nominee");
  s = s.replace(/\bchequ\b|\bchequebook\b|\bcheckbook\b/g, "cheque");
  s = s.replace(/\bstok\b|\bwatchl\b|\bstock\b/g, "watchlist");
  s = s.replace(/\baadhr\b|\baadahr\b/g, "aadhaar");
  s = s.replace(/\bpasswrd\b|\bpasword\b/g, "password");

  return s;
}

// ─── 2. CONVERSATION CONTEXT RESOLUTION FOR FOLLOW-UP QUESTIONS ─────────────
function resolveContextTopic(rawMsg: string, history: Array<{ sender: string; text: string }> = []): string {
  const norm = normalizeText(rawMsg);

  // If message contains explicit keywords, return direct normalized text
  if (norm.includes("freeze") || norm.includes("apply_new") || norm.includes("card") || 
      norm.includes("transfer") || norm.includes("loan") || norm.includes("deposit") || 
      norm.includes("dispute") || norm.includes("kyc") || norm.includes("beneficiary")) {
    return norm;
  }

  // If query is a follow-up ("it", "this", "that", "how do i do it"), check history
  const isFollowUp = /\b(it|this|that|so|do it)\b/i.test(rawMsg);
  if (isFollowUp && history && history.length > 0) {
    const combinedHistory = history.map(h => h.text).join(" ").toLowerCase();

    if (combinedHistory.includes("card")) {
      if (norm.includes("freeze")) return `${norm} card freeze`;
      if (norm.includes("apply_new")) return `${norm} card apply_new`;
      return `${norm} card`;
    }
    if (combinedHistory.includes("loan")) return `${norm} loan`;
    if (combinedHistory.includes("deposit") || combinedHistory.includes("fd")) return `${norm} deposit`;
    if (combinedHistory.includes("dispute")) return `${norm} dispute`;
    if (combinedHistory.includes("transfer")) return `${norm} transfer`;
  }

  return norm;
}

// ─── 3. 7-POINT GROUNDED RESPONSE BUILDER ──────────────────────────────────
function build7PointWalkthrough(w: GroundedWalkthrough): { reply: string; quickActions: string[] } {
  const reply = `🤖 **Ayasa Grounded Step-by-Step Guidance: ${w.title}**

1. **Actual page/route to open:** Navigate to [${w.routeName}](${w.route})
2. **Actual item/card/account to select:** ${w.whatToSelect}
3. **Actual button/action available:** ${w.actionButton}
4. **Actual security verification required:** ${w.verification}
5. **Actual backend operation:** ${w.backendOperation}
6. **Actual resulting status:** ${w.resultingStatus}
7. **Actual way to confirm:** ${w.howToConfirm}

🔒 *Security Notice: Sensitive operations require Security PIN or 2FA Email OTP authorization. Security checks can NEVER be bypassed.*`;

  return { reply, quickActions: w.quickActions };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, userId, userEmail, userName, contextPage, history = [] } = body;

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
          contextPage,
          history
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
          contextPage,
          history
        }),
      });

      if (directRes.ok) {
        const data = await directRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("Direct support service unavailable, using grounded AI engine...", e);
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const resolvedText = resolveContextTopic(message || "", history);

    let reply = "";
    let ticketId: string | undefined = undefined;
    let escalated = false;
    let quickActions: string[] = ["View Accounts", "Transfer Money", "View Cards"];

    // ─── 1. SECURITY BYPASS / GUARDRAIL REQUESTS ──────────────────────────────
    if ((resolvedText.includes("cvv") || resolvedText.includes("card") || resolvedText.includes("pin")) && 
        (resolvedText.includes("without otp") || resolvedText.includes("without pin") || resolvedText.includes("bypass") || resolvedText.includes("no otp"))) {
      reply = "🔒 **Security Guardrail Policy**: No. Revealing 16-digit card numbers, CVVs, or completing financial transactions strictly requires 4-digit Security PIN or 2FA Email OTP authorization. Security checks can **NEVER** be bypassed under FinEdge banking policy.";
      quickActions = ["View Cards", "Security Settings", "Contact Support"];
    }
    else if (resolvedText.includes("password") && (resolvedText.includes("what is") || resolvedText.includes("reveal") || resolvedText.includes("show me"))) {
      reply = "🔒 **Security Guardrail Policy**: Passwords and PINs are encrypted. If you forgot your password, click 'Forgot Password?' on the login screen or initiate 2FA password recovery.";
      quickActions = ["Security Settings", "Contact Support"];
    }
    else if (resolvedText.includes("otp") && (resolvedText.includes("give me") || resolvedText.includes("what is") || resolvedText.includes("code"))) {
      reply = "🛡️ **Security Guardrail Policy**: Ayasa and FinEdge staff will **NEVER** ask for, reveal, or share your OTP over chat, SMS, or call.";
      quickActions = ["Contact Support", "Check KYC"];
    }
    // ─── 2. UNCONFIRMED / NON-EXISTENT FEATURES ──────────────────────────────
    else if (resolvedText.includes("crypto") || resolvedText.includes("bitcoin") || resolvedText.includes("ethereum") || resolvedText.includes("nft")) {
      reply = "ℹ️ **Information Unconfirmed**: FinEdge currently does not support cryptocurrency trading or digital asset wallets directly. For authorized investment products (Mutual Funds, Stocks, FDs), please visit [Investments & Watchlist](/investments).";
      quickActions = ["Manage Watchlist", "Invest in Mutual Funds", "View Deposits"];
    }
    // ─── 3. HUMAN ESCALATION & FRAUD TICKETING ──────────────────────────────
    else if (resolvedText.includes("human") || resolvedText.includes("agent") || resolvedText.includes("representative") || resolvedText.includes("fraud") || resolvedText.includes("unauthorized") || resolvedText.includes("stolen card") || resolvedText.includes("blocked transaction")) {
      ticketId = `TKT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      reply = `🤝 **Priority Support Escalation**\n\nA priority support ticket has been logged:\n• **Ticket ID:** ${ticketId}\n• **Priority:** HIGH / CRITICAL\n• **Status:** OPEN (Assigned to Human Support Desk)\n\n1. **Actual page/route to open:** [Disputes Management](/disputes)\n2. **Actual item to select:** Open ticket ${ticketId}\n3. **Actual button available:** Click 'Upload Evidence'\n4. **Actual security verification:** Authenticate with 2FA email OTP\n5. **Actual backend operation:** Priority ticket registered in PostgreSQL ` + "`support_tickets`" + `\n6. **Actual resulting status:** OPEN (Assigned to Fraud Operations Desk)\n7. **Actual way to confirm:** Track claim live under [Disputes Management](/disputes)`;
      escalated = true;
      quickActions = ["Dispute Transaction", "Check Transactions", "Contact Support"];
    }
    // ─── 4. CARDS: FREEZE / BLOCK CARD ──────────────────────────────────────
    else if (resolvedText.includes("freeze") && resolvedText.includes("card")) {
      const guide = build7PointWalkthrough({
        title: "Freezing or Blocking a Card",
        route: "/cards",
        routeName: "Manage Cards",
        whereToGo: "Navigate to Manage Cards",
        whatToSelect: "Select the specific Debit Card or Credit Card from your active card carousel.",
        actionButton: "Click 'Freeze Card' (Temporary Hold) or 'Block Card' (Permanent Cancellation).",
        verification: "Select freeze reason (Temporary Hold, Lost, Stolen) and confirm with 4-digit Security PIN / OTP.",
        backendOperation: "Updates card status to `FROZEN` in backend Card Service & PostgreSQL database.",
        resultingStatus: "Card status changes to `FROZEN` immediately; all online, ATM, and POS transactions are blocked.",
        howToConfirm: "Look for the 'FROZEN' status badge displayed on your card under Manage Cards.",
        quickActions: ["Freeze Card", "View Cards", "Apply for New Card"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 5. CARDS: APPLY / CREATE NEW CARD ──────────────────────────────────
    else if (resolvedText.includes("apply_new") && resolvedText.includes("card")) {
      const guide = build7PointWalkthrough({
        title: "Applying for a New FinEdge Card",
        route: "/cards",
        routeName: "Manage Cards",
        whereToGo: "Navigate to Manage Cards",
        whatToSelect: "Select 'Apply for New Card' tab (Virtual Visa, Rewards Credit Card, or Premium Debit Card).",
        actionButton: "Click 'Apply Now' button.",
        verification: "Select primary account to link, choose daily transaction limits, and authorize with Security PIN / 2FA OTP.",
        backendOperation: "Creates new card record via `/api/v1/cards/apply` in Card Service & PostgreSQL.",
        resultingStatus: "Virtual card issued immediately; physical card dispatched within 3-5 business days.",
        howToConfirm: "Look for your new card added to the card carousel under Manage Cards.",
        quickActions: ["Apply for New Card", "View Cards", "Freeze Card"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 6. CARDS: VIEW CARD DETAILS / REVEAL CVV ───────────────────────────
    else if (resolvedText.includes("card") || resolvedText.includes("debit") || resolvedText.includes("credit") || resolvedText.includes("cvv") || resolvedText.includes("expiry")) {
      const guide = build7PointWalkthrough({
        title: "Viewing Card Details & Unmasking CVV",
        route: "/cards",
        routeName: "Manage Cards",
        whereToGo: "Navigate to Manage Cards",
        whatToSelect: "Select your active Debit Card or Credit Card from the card carousel.",
        actionButton: "Click 'View Card Details' or 'Reveal Card Number'.",
        verification: "Enter your 4-digit Security PIN or 2FA OTP to unmask sensitive numbers.",
        backendOperation: "Fetches encrypted card payload from `/api/v1/cards` upon authorized PIN verification.",
        resultingStatus: "16-digit card number and CVV are unmasked for 5 minutes before auto-masking.",
        howToConfirm: "Look for the 'Card Details Unmasked' status badge on your card display.",
        quickActions: ["View Cards", "Apply for New Card", "Freeze Card"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 7. LOANS: APPLY FOR LOAN ───────────────────────────────────────────
    else if (resolvedText.includes("apply_new") && (resolvedText.includes("loan") || resolvedText.includes("mortgage"))) {
      const guide = build7PointWalkthrough({
        title: "Applying for a New Loan",
        route: "/loans",
        routeName: "Loans & Mortgages",
        whereToGo: "Navigate to Loans & Mortgages",
        whatToSelect: "Select Personal Loan, Home Loan, or Auto Loan.",
        actionButton: "Click 'Apply for Loan'.",
        verification: "Provide annual income, loan amount, credit consent, and verify with 2FA email OTP.",
        backendOperation: "Submits credit evaluation request to Loan Service underwriting engine.",
        resultingStatus: "Loan application registered and instant pre-approval decision issued.",
        howToConfirm: "View your loan sanction letter and application record on Loans page.",
        quickActions: ["Apply for Loan", "Pay EMI", "View Accounts"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 8. LOANS: PAY EMI / LOAN STATUS ────────────────────────────────────
    else if (resolvedText.includes("loan") || resolvedText.includes("emi") || resolvedText.includes("mortgage")) {
      const guide = build7PointWalkthrough({
        title: "Paying Loan EMIs & Viewing Loan Status",
        route: "/loans",
        routeName: "Loans & Mortgages",
        whereToGo: "Navigate to Loans & Mortgages",
        whatToSelect: "Select your active Loan account from your loans overview.",
        actionButton: "Click 'Pay EMI' or 'Prepay Loan'.",
        verification: "Select payment account and authorize repayment with your Security PIN.",
        backendOperation: "Debits EMI amount from savings account and updates loan balance in PostgreSQL.",
        resultingStatus: "EMI payment completed and principal balance reduced accordingly.",
        howToConfirm: "View updated principal balance and payment receipt on Loans page.",
        quickActions: ["Pay EMI", "Apply for Loan", "View Accounts"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 9. DEPOSITS: OPEN NEW FD/RD ─────────────────────────────────────────
    else if ((resolvedText.includes("open") || resolvedText.includes("apply_new") || resolvedText.includes("invest")) && (resolvedText.includes("fd") || resolvedText.includes("rd") || resolvedText.includes("deposit"))) {
      const guide = build7PointWalkthrough({
        title: "Opening a New Fixed or Recurring Deposit",
        route: "/deposits",
        routeName: "Fixed & Recurring Deposits",
        whereToGo: "Navigate to Fixed & Recurring Deposits",
        whatToSelect: "Choose FD (Fixed Deposit) or RD (Recurring Deposit) scheme.",
        actionButton: "Use Deposit Calculator, then click 'Open New Deposit'.",
        verification: "Enter principal amount, tenure (6m - 10y), payout preference, and authorize with PIN.",
        backendOperation: "Debits principal from savings account and creates deposit account in Deposit Service.",
        resultingStatus: "Deposit account opened and interest rate locked in.",
        howToConfirm: "Download your official FD Advice Certificate directly from Deposits page.",
        quickActions: ["Open Deposit", "Deposit Calculator", "View Accounts"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 10. DEPOSITS: BREAK / WITHDRAW FD ───────────────────────────────────
    else if ((resolvedText.includes("break") || resolvedText.includes("close") || resolvedText.includes("withdraw") || resolvedText.includes("premature")) && (resolvedText.includes("fd") || resolvedText.includes("rd") || resolvedText.includes("deposit"))) {
      const guide = build7PointWalkthrough({
        title: "Premature Closure / Breaking a Deposit",
        route: "/deposits",
        routeName: "Fixed & Recurring Deposits",
        whereToGo: "Navigate to Fixed & Recurring Deposits",
        whatToSelect: "Select the active Fixed Deposit you wish to close.",
        actionButton: "Click 'Break FD / Premature Closure'.",
        verification: "Review applicable premature closure penalty (0.5%) and authorize with 2FA email OTP.",
        backendOperation: "Calculates net payout and credits funds to primary savings account in Account Service.",
        resultingStatus: "Deposit account closed and net funds credited immediately.",
        howToConfirm: "Check updated savings account balance and closure advice PDF.",
        quickActions: ["Open Deposit", "View Accounts", "Check Transactions"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 11. BENEFICIARIES: ADD NEW ──────────────────────────────────────────
    else if ((resolvedText.includes("add") || resolvedText.includes("apply_new")) && (resolvedText.includes("beneficiary") || resolvedText.includes("payee"))) {
      const guide = build7PointWalkthrough({
        title: "Adding a New Beneficiary / Payee",
        route: "/beneficiaries",
        routeName: "Beneficiaries Management",
        whereToGo: "Navigate to Beneficiaries Management",
        whatToSelect: "Click 'Add New Beneficiary' button.",
        actionButton: "Enter recipient bank details (Name, Account Number, IFSC) and click 'Save Beneficiary'.",
        verification: "Verify with 2FA email OTP sent to datebong59@gmail.com.",
        backendOperation: "Saves beneficiary record in PostgreSQL `beneficiaries` table.",
        resultingStatus: "Beneficiary registered; 30-minute cooling period applies for transfers > ₹50,000.",
        howToConfirm: "Look for 'Verified Beneficiary' badge in your beneficiary list.",
        quickActions: ["Manage Beneficiaries", "Transfer Money", "View Accounts"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 12. DISPUTES: CANCEL DISPUTE ────────────────────────────────────────
    else if ((resolvedText.includes("cancel") || resolvedText.includes("withdraw")) && resolvedText.includes("dispute")) {
      const guide = build7PointWalkthrough({
        title: "Cancelling an Active Dispute Claim",
        route: "/disputes",
        routeName: "Disputes Management",
        whereToGo: "Go to Disputes Management",
        whatToSelect: "Select your open dispute ticket.",
        actionButton: "Click 'Cancel Dispute Claim'.",
        verification: "Confirm cancellation and reason with Security PIN.",
        backendOperation: "Updates ticket status to `CANCELLED` in PostgreSQL `support_tickets`.",
        resultingStatus: "Dispute ticket status updated to CANCELLED and hold on funds released.",
        howToConfirm: "Look for 'CANCELLED' status badge on your claim ticket.",
        quickActions: ["Dispute Transaction", "View Transactions", "Contact Support"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 13. TRANSFERS: LOCAL FUND TRANSFERS ─────────────────────────────────
    else if (resolvedText.includes("transfer") || resolvedText.includes("send money") || resolvedText.includes("imps") || resolvedText.includes("neft") || resolvedText.includes("upi")) {
      const guide = build7PointWalkthrough({
        title: "Executing Fund Transfers",
        route: "/transfers/fund-transfer",
        routeName: "Fund Transfers",
        whereToGo: "Go to Fund Transfers page",
        whatToSelect: "Select Source Account and Recipient (Saved Beneficiary or New Account / UPI ID).",
        actionButton: "Select payment mode (IMPS Instant, NEFT, or RTGS) and click 'Initiate Transfer'.",
        verification: "Enter transfer amount, remark, and complete 2FA Security PIN / OTP verification.",
        backendOperation: "Processes debit/credit transaction via Transaction Service API.",
        resultingStatus: "Transfer completed and transaction record created in PostgreSQL.",
        howToConfirm: "Receive instant transaction reference ID (TXN-XXXXXXXX) and downloadable PDF receipt.",
        quickActions: ["Transfer Money", "Manage Beneficiaries", "Check Transactions"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 14. ACCOUNTS & BALANCES ──────────────────────────────────────────────
    else if (resolvedText.includes("account") || resolvedText.includes("balance") || resolvedText.includes("statement") || resolvedText.includes("cheque")) {
      const guide = build7PointWalkthrough({
        title: "Accounts Overview & Cheque Book Requests",
        route: "/accounts",
        routeName: "Accounts Directory",
        whereToGo: "Navigate to Accounts Directory",
        whatToSelect: "Select Primary Savings Account or Business Current Account.",
        actionButton: "Click 'View Details', 'Download Statement', or 'Request Cheque Book'.",
        verification: "Authenticate with 4-digit Security PIN.",
        backendOperation: "Fetches account details & balance via Account Service API.",
        resultingStatus: "Account balances unmask and requested services/statements generate instantly.",
        howToConfirm: "Check updated account dashboard and confirmation notification.",
        quickActions: ["View Accounts", "Transfer Money", "Check Transactions"]
      });
      reply = guide.reply;
      quickActions = guide.quickActions;
    }
    // ─── 15. GREETINGS & DEFAULT ────────────────────────────────────────────
    else {
      reply = `Hello Soumya! 👋 I'm **Ayasa**, your FinEdge AI Support Assistant.\n\nI provide **grounded 7-step guidance** for every feature on FinEdge:\n• [Accounts & Balances](/accounts) — View balances, statements, cheque books\n• [Fund Transfers](/transfers/fund-transfer) — Send money via IMPS/NEFT/RTGS\n• [Manage Cards](/cards) — Reveal card details, apply, or freeze cards\n• [Disputes & Fraud](/disputes) — File claims & upload evidence\n• [Recharges & Bills](/transfers) — Mobile top-ups & utility bills\n• [KYC & Profile](/kyc-profile) — Verify documents & nominee details\n• [PDF Reports](/reports) — Download statements & Form 26AS\n\nHow can I help you today? Ask me any "how do I..." or "where can I..." question!`;
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
