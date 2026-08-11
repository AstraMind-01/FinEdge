package com.onlinebanking.support.engine;

import com.onlinebanking.support.dto.ChatRequest;
import com.onlinebanking.support.dto.ChatResponse;
import com.onlinebanking.support.model.SupportTicket;
import com.onlinebanking.support.model.TicketCategory;
import com.onlinebanking.support.model.TicketPriority;
import com.onlinebanking.support.model.TicketStatus;
import com.onlinebanking.support.repository.SupportTicketRepository;
import com.onlinebanking.support.tools.SupportTools;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FinEdgeKnowledgeEngine {

    @Autowired
    private SupportTools tools;

    @Autowired
    private SupportTicketRepository ticketRepository;

    public ChatResponse processUserQuery(ChatRequest req) {
        String msg = req.getMessage() != null ? req.getMessage().trim() : "";
        String lower = msg.toLowerCase();
        String userId = req.getUserId() != null ? req.getUserId() : "usr_default_01";
        String convId = req.getConversationId() != null ? req.getConversationId() : UUID.randomUUID().toString();
        String timeStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));

        // 1. Guardrail Check: Never expose sensitive secrets
        if (lower.contains("password") && (lower.contains("what is") || lower.contains("reveal") || lower.contains("show me"))) {
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply("🔒 **Security Alert**: Passwords and PINs are strictly encrypted. To reset your password, click 'Forgot Password?' on the login screen or open Security Settings.")
                    .timestamp(timeStr)
                    .quickActions(List.of("Security Settings", "Contact Support"))
                    .escalated(false)
                    .build();
        }

        if (lower.contains("otp") && (lower.contains("give me") || lower.contains("what is") || lower.contains("code"))) {
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply("🛡️ **Security Policy**: Ayasa and FinEdge staff will NEVER ask for, reveal, or share your OTP over chat, SMS, or call.")
                    .timestamp(timeStr)
                    .quickActions(List.of("Contact Support", "Check KYC"))
                    .escalated(false)
                    .build();
        }

        // 2. Ticket Status Lookup
        if (lower.contains("tkt-") || (lower.contains("ticket") && lower.contains("status"))) {
            String extractedTicketId = extractTicketId(msg);
            if (extractedTicketId != null) {
                Map<String, Object> tData = tools.getSupportTicket(extractedTicketId, userId);
                if ((Boolean) tData.get("found")) {
                    String reply = String.format("🎫 **Support Ticket Status** [%s]:\n• Category: %s\n• Issue: %s\n• Priority: %s\n• Current Status: %s\n• Last Updated: %s\n\nMonitor your ticket on [Disputes Management](/disputes).",
                            tData.get("ticketId"), tData.get("category"), tData.get("issueSummary"), tData.get("priority"), tData.get("status"), tData.get("updatedAt"));
                    return ChatResponse.builder()
                            .conversationId(convId)
                            .reply(reply)
                            .ticketId(extractedTicketId)
                            .timestamp(timeStr)
                            .quickActions(List.of("Dispute Transaction", "Contact Support"))
                            .escalated(false)
                            .build();
                }
            }
        }

        // 3. Human Escalation / Fraud Detection
        if (lower.contains("human") || lower.contains("agent") || lower.contains("representative") ||
            lower.contains("dispute") || lower.contains("fraud") || lower.contains("unauthorized") ||
            lower.contains("stolen card") || lower.contains("blocked transaction") || lower.contains("escalate")) {

            return createSupportTicketAndEscalate(req, convId, timeStr, lower);
        }

        // 4. Cards Intent Classification: Apply for New Card vs Freeze Card vs View Cards
        if ((lower.contains("create") || lower.contains("apply") || lower.contains("new") || lower.contains("request") || lower.contains("issue") || lower.contains("order")) && lower.contains("card")) {
            String reply = buildStepByStep("Applying for a New FinEdge Card",
                    "/cards", "Manage Cards",
                    "Navigate to Manage Cards",
                    "Select 'Apply for New Card' tab (Virtual Visa, Rewards Credit Card, or Premium Debit Card).",
                    "Click 'Apply Now' button.",
                    "Select account to link, choose daily transaction limits, and authorize with 4-digit PIN / 2FA OTP.",
                    "Virtual card is generated instantly for online use; physical card is printed & dispatched within 3-5 business days.",
                    "Look for your new card added to the card carousel under Manage Cards.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Apply for New Card", "View Cards", "Freeze Card"))
                    .actionRedirectUrl("/cards")
                    .build();
        }

        if ((lower.contains("freeze") || lower.contains("block") || lower.contains("lost") || lower.contains("lock") || lower.contains("disable")) && lower.contains("card")) {
            String reply = buildStepByStep("Freezing or Blocking a Card",
                    "/cards", "Manage Cards",
                    "Navigate to Manage Cards",
                    "Select the specific Debit or Credit Card you want to freeze.",
                    "Click 'Freeze Card' (Temporary Hold) or 'Block Card' (Permanent Cancellation).",
                    "Select freeze reason (Temporary, Lost, Stolen) and confirm with Security PIN / OTP.",
                    "Card status changes immediately to FROZEN; all online, ATM, and POS transactions are blocked.",
                    "Look for the 'FROZEN' status badge displayed on your card under Manage Cards.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Freeze Card", "View Cards", "Apply for New Card"))
                    .actionRedirectUrl("/cards")
                    .build();
        }

        if (lower.contains("card") || lower.contains("debit") || lower.contains("credit") || lower.contains("cvv") || lower.contains("expiry")) {
            String reply = buildStepByStep("Viewing Card Details & Unmasking CVV",
                    "/cards", "Manage Cards",
                    "Navigate to Manage Cards",
                    "Select your active Debit Card or Credit Card from the card carousel.",
                    "Click 'View Card Details' or 'Reveal Card Number'.",
                    "Enter your 4-digit Security PIN or OTP to unmask sensitive card numbers.",
                    "16-digit card number and CVV are unmasked for 5 minutes before auto-masking.",
                    "Look for the 'Card Details Unmasked' status badge on your card display.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("View Cards", "Apply for New Card", "Freeze Card"))
                    .actionRedirectUrl("/cards")
                    .build();
        }

        // 5. Loans Intent Classification: Apply for Loan vs Pay EMI
        if ((lower.contains("apply") || lower.contains("new") || lower.contains("get") || lower.contains("borrow") || lower.contains("sanction")) && (lower.contains("loan") || lower.contains("mortgage"))) {
            String reply = buildStepByStep("Applying for a New Loan",
                    "/loans", "Loans & Mortgages",
                    "Navigate to Loans & Mortgages",
                    "Select Personal Loan, Home Loan, or Auto Loan.",
                    "Click 'Apply for Loan'.",
                    "Provide annual income, loan amount, soft credit score consent, and verify with 2FA email OTP.",
                    "Automated underwriting engine evaluates credit eligibility for instant pre-approval.",
                    "Check for your sanction letter and loan account listing on Loans page.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Apply for Loan", "Pay EMI", "View Accounts"))
                    .actionRedirectUrl("/loans")
                    .build();
        }

        if (lower.contains("loan") || lower.contains("emi") || lower.contains("mortgage")) {
            String reply = buildStepByStep("Paying Loan EMIs & Viewing Loan Status",
                    "/loans", "Loans & Mortgages",
                    "Navigate to Loans & Mortgages",
                    "Select your active Loan account from your loans overview.",
                    "Click 'Pay EMI' or 'Prepay Loan'.",
                    "Select payment account and authorize repayment with your Security PIN.",
                    "EMI payment is debited from savings account and principal balance updates.",
                    "View updated principal balance and download payment receipt on Loans page.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Pay EMI", "Apply for Loan", "View Accounts"))
                    .actionRedirectUrl("/loans")
                    .build();
        }

        // 6. Deposits Intent Classification: Open Deposit vs Break Deposit
        if ((lower.contains("break") || lower.contains("close") || lower.contains("withdraw") || lower.contains("premature")) && (lower.contains("fd") || lower.contains("rd") || lower.contains("deposit"))) {
            String reply = buildStepByStep("Premature Closure / Breaking a Deposit",
                    "/deposits", "Fixed & Recurring Deposits",
                    "Navigate to Fixed & Recurring Deposits",
                    "Select the active Fixed Deposit you wish to close.",
                    "Click 'Break FD / Premature Closure'.",
                    "Review applicable premature closure penalty (0.5%) and authorize with 2FA email OTP.",
                    "Principal plus accrued interest minus penalty is credited to primary savings account immediately.",
                    "Check updated savings account balance and closure advice PDF.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Open Deposit", "View Accounts", "Check Transactions"))
                    .actionRedirectUrl("/deposits")
                    .build();
        }

        if (lower.contains("deposit") || lower.contains("fd") || lower.contains("rd")) {
            String reply = buildStepByStep("Opening a New Fixed or Recurring Deposit",
                    "/deposits", "Fixed & Recurring Deposits",
                    "Navigate to Fixed & Recurring Deposits",
                    "Choose FD (Fixed Deposit) or RD (Recurring Deposit) scheme.",
                    "Use Deposit Calculator, then click 'Open New Deposit'.",
                    "Enter principal amount, tenure (6 months to 10 years), payout frequency, and authorize with PIN.",
                    "Principal is transferred from savings account and deposit account is created instantly.",
                    "Download your official FD Advice Certificate directly from Deposits page.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Open Deposit", "Deposit Calculator", "View Accounts"))
                    .actionRedirectUrl("/deposits")
                    .build();
        }

        // Transfers Intent
        if (lower.contains("transfer") || lower.contains("send money") || lower.contains("imps") || lower.contains("neft") || lower.contains("upi")) {
            String reply = buildStepByStep("Executing Fund Transfers",
                    "/transfers/fund-transfer", "Fund Transfers",
                    "Go to Fund Transfers page",
                    "Select Source Account and Recipient (Saved Beneficiary or New Account / UPI ID).",
                    "Select payment mode (IMPS Instant, NEFT, or RTGS) and click 'Initiate Transfer'.",
                    "Enter transfer amount, remark, and complete 2FA Security PIN / OTP verification.",
                    "Real-time fraud risk engine checks transaction safety and dispatches funds.",
                    "Receive instant transaction reference ID (TXN-XXXXXXXX) and downloadable PDF receipt.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Transfer Money", "Manage Beneficiaries", "Check Transactions"))
                    .actionRedirectUrl("/transfers/fund-transfer")
                    .build();
        }

        // Accounts & Balances
        if (lower.contains("account") || lower.contains("balance") || lower.contains("statement") || lower.contains("cheque")) {
            String reply = buildStepByStep("Accounts Overview & Cheque Book Requests",
                    "/accounts", "Accounts Directory",
                    "Navigate to Accounts Directory",
                    "Select Primary Savings Account or Business Current Account.",
                    "Click 'View Details', 'Download Statement', or 'Request Cheque Book'.",
                    "Authenticate with 4-digit Security PIN.",
                    "Account balances unmask and requested services/statements generate instantly.",
                    "Check updated account dashboard and confirmation notification.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("View Accounts", "Transfer Money", "Check Transactions"))
                    .actionRedirectUrl("/accounts")
                    .build();
        }

        // Recharges & Utility Bills
        if (lower.contains("recharge") || lower.contains("bill") || lower.contains("electricity") || lower.contains("water") || lower.contains("bbps")) {
            String reply = buildStepByStep("Mobile Recharges & Utility Bill Payments",
                    "/transfers", "Transfers & Payments",
                    "Go to Transfers & Payments",
                    "Select 'Mobile Recharge' or 'Utility Bills' (Electricity, Water, Gas, DTH).",
                    "Choose biller/operator, enter consumer number, and click 'Proceed to Pay'.",
                    "Select debiting account and authorize with your Security PIN.",
                    "Bharat BillPay (BBPS) gateway verifies biller and completes payment instantly.",
                    "View your BBPS payment reference ID and instant email/SMS confirmation.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Recharge Mobile", "Pay Bills", "View Accounts"))
                    .actionRedirectUrl("/transfers")
                    .build();
        }

        // Default Conversational Greeting
        String defaultReply = "Hello Soumya! 👋 I'm **Ayasa**, your FinEdge AI Support Assistant.\n\nI provide **step-by-step guidance** for every feature on FinEdge:\n• [Accounts & Balances](/accounts)\n• [Fund Transfers](/transfers/fund-transfer)\n• [Manage Cards](/cards)\n• [Disputes & Fraud](/disputes)\n• [Recharges & Bills](/transfers)\n• [KYC & Profile](/kyc-profile)\n\nHow can I help you today?";
        return ChatResponse.builder()
                .conversationId(convId)
                .reply(defaultReply)
                .timestamp(timeStr)
                .quickActions(List.of("View Accounts", "Transfer Money", "View Cards"))
                .escalated(false)
                .build();
    }

    private String buildStepByStep(String title, String route, String routeName, String whereToGo,
                                   String whatToSelect, String actionButton, String verification,
                                   String whatHappensNext, String howToConfirm) {
        return String.format("🤖 **Ayasa Step-by-Step Guidance: %s**\n\n" +
                        "1. **Where to go:** Navigate to [%s](%s)\n" +
                        "2. **What to select:** %s\n" +
                        "3. **What button/action to use:** %s\n" +
                        "4. **What information or verification is required:** %s\n" +
                        "5. **What happens next:** %s\n" +
                        "6. **How to confirm:** %s\n\n" +
                        "🔒 *Security Notice: Sensitive operations require Security PIN or 2FA Email OTP authorization. Security checks can never be bypassed.*",
                title, routeName, route, whatToSelect, actionButton, verification, whatHappensNext, howToConfirm);
    }

    private ChatResponse createSupportTicketAndEscalate(ChatRequest req, String convId, String timeStr, String lowerMsg) {
        String ticketId = "TKT-2026-" + (10000 + new Random().nextInt(90000));
        String userId = req.getUserId() != null ? req.getUserId() : "usr_default_01";

        TicketCategory category = TicketCategory.GENERAL_SUPPORT;
        TicketPriority priority = TicketPriority.MEDIUM;

        if (lowerMsg.contains("dispute") || lowerMsg.contains("unauthorized")) {
            category = TicketCategory.TRANSACTION_DISPUTE;
            priority = TicketPriority.HIGH;
        } else if (lowerMsg.contains("fraud") || lowerMsg.contains("stolen") || lowerMsg.contains("blocked")) {
            category = TicketCategory.FRAUD_ALERT;
            priority = TicketPriority.CRITICAL;
        }

        SupportTicket ticket = SupportTicket.builder()
                .ticketId(ticketId)
                .userId(userId)
                .conversationId(convId)
                .category(category)
                .issueSummary(req.getMessage())
                .transactionId(extractTxnId(req.getMessage()))
                .priority(priority)
                .status(TicketStatus.OPEN)
                .build();

        ticketRepository.save(ticket);

        String reply = String.format("🤝 **Priority Support Escalation**\n\nA priority support ticket has been logged:\n• Ticket ID: %s\n• Category: %s\n• Priority: %s\n• Status: OPEN (Assigned to Human Support Desk)\n\nYou can track disputes anytime under [Disputes Management](/disputes).",
                ticketId, category.name(), priority.name());

        return ChatResponse.builder()
                .conversationId(convId)
                .reply(reply)
                .ticketId(ticketId)
                .timestamp(timeStr)
                .quickActions(List.of("Dispute Transaction", "Check Transactions", "Contact Support"))
                .actionRedirectUrl("/disputes")
                .escalated(true)
                .build();
    }

    private String extractTicketId(String text) {
        if (text == null) return null;
        int idx = text.toUpperCase().indexOf("TKT-");
        if (idx != -1 && text.length() >= idx + 14) {
            return text.substring(idx, idx + 14).toUpperCase();
        }
        return null;
    }

    private String extractTxnId(String text) {
        if (text == null) return "TXN-2026-88192";
        int idx = text.toUpperCase().indexOf("TXN-");
        if (idx != -1 && text.length() >= idx + 14) {
            return text.substring(idx, idx + 14).toUpperCase();
        }
        return "TXN-2026-88192";
    }
}
