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
            lower.contains("blocked transaction") || lower.contains("stolen") || lower.contains("escalate")) {

            return createSupportTicketAndEscalate(req, convId, timeStr, lower);
        }

        // 4. Structured 6-Step FinEdge Help Walkthroughs

        // Cards Intent
        if (lower.contains("card") || lower.contains("debit") || lower.contains("credit") || lower.contains("cvv") || lower.contains("expiry")) {
            String reply = buildStepByStep("Viewing Card Details & Managing Cards",
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

        // International Transfers
        if (lower.contains("international") || lower.contains("swift") || lower.contains("forex") || lower.contains("wire")) {
            String reply = buildStepByStep("International Wire Transfers (SWIFT)",
                    "/transfers/international", "International Wire Transfers",
                    "Navigate to International Wire Transfers",
                    "Select destination country, foreign currency (USD, EUR, GBP), and recipient SWIFT/BIC code.",
                    "Click 'Send International Wire'.",
                    "Provide beneficiary bank details, purpose code, and authorize with 2FA email OTP.",
                    "Guaranteed FX exchange rate lock is applied and SWIFT payment message is transmitted.",
                    "Track wire status live using SWIFT UETR tracking code under Transactions.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("International Transfer", "Transfer Money", "View Accounts"))
                    .actionRedirectUrl("/transfers/international")
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

        // KYC & Profile
        if (lower.contains("kyc") || lower.contains("aadhaar") || lower.contains("pan") || lower.contains("nominee") || lower.contains("address")) {
            String reply = buildStepByStep("KYC Verification & Nominee Updates",
                    "/kyc-profile", "KYC & Profile Vault",
                    "Go to KYC & Profile Vault",
                    "Select 'Update KYC', 'Nominee Details', or 'Update Address'.",
                    "Click 'Upload Documents' or 'Update Nominee'.",
                    "Upload document scans (Aadhaar / PAN) and verify with 2FA email OTP.",
                    "Document verification engine validates identity against official registries.",
                    "Check for 'KYC Verified - Tier 1' status badge on your profile.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Check KYC", "Update Profile", "Contact Support"))
                    .actionRedirectUrl("/kyc-profile")
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

        String reply = String.format("🤝 **Priority Support Escalation**\n\nA priority support ticket has been created:\n• Ticket ID: %s\n• Category: %s\n• Priority: %s\n• Status: OPEN (Assigned to Human Support Desk)\n\nYou can track disputes anytime under [Disputes Management](/disputes).",
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
