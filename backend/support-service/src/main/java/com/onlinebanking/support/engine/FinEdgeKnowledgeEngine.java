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

    private String normalizeText(String text) {
        if (text == null) return "";
        String s = text.toLowerCase().trim();

        s = s.replaceAll("\\bfreze\\b|\\bfreez\\b|\\bfroze\\b|\\bblock\\b|\\block\\b|\\bdisable\\b", "freeze");
        s = s.replaceAll("\\bcrrate\\b|\\bcretae\\b|\\bmak\\b|\\bmake\\b|\\bapply\\b|\\brequest\\b|\\bissue\\b|\\border\\b", "apply_new");
        s = s.replaceAll("\\bbalence\\b|\\bbalanc\\b|\\bbacc\\b|\\baccnt\\b", "balance");
        s = s.replaceAll("\\btransfr\\b|\\btrnsfer\\b|\\bsend\\b|\\bpay\\b", "transfer");
        s = s.replaceAll("\\bnomni\\b|\\bnomine\\b|\\bnomnee\\b", "nominee");
        s = s.replaceAll("\\bchequ\\b|\\bchequebook\\b|\\bcheckbook\\b", "cheque");
        s = s.replaceAll("\\bstok\\b|\\bwatchl\\b|\\bstock\\b", "watchlist");
        s = s.replaceAll("\\baadhr\\b|\\baadahr\\b", "aadhaar");
        s = s.replaceAll("\\bpasswrd\\b|\\bpasword\\b", "password");

        return s;
    }

    public ChatResponse processUserQuery(ChatRequest req) {
        String msg = req.getMessage() != null ? req.getMessage().trim() : "";
        String lower = normalizeText(msg);
        String userId = req.getUserId() != null ? req.getUserId() : "usr_default_01";
        String convId = req.getConversationId() != null ? req.getConversationId() : UUID.randomUUID().toString();
        String timeStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));

        // 1. Guardrail Check: Never expose sensitive secrets or bypass security
        if ((lower.contains("cvv") || lower.contains("card") || lower.contains("pin")) && 
            (lower.contains("without otp") || lower.contains("without pin") || lower.contains("bypass") || lower.contains("no otp"))) {
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply("🔒 **Security Guardrail Policy**: No. Revealing 16-digit card numbers, CVVs, or completing financial transactions strictly requires 4-digit Security PIN or 2FA Email OTP authorization. Security checks can NEVER be bypassed under FinEdge banking policy.")
                    .timestamp(timeStr)
                    .quickActions(List.of("View Cards", "Security Settings", "Contact Support"))
                    .escalated(false)
                    .build();
        }

        if (lower.contains("password") && (lower.contains("what is") || lower.contains("reveal") || lower.contains("show me"))) {
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply("🔒 **Security Guardrail Policy**: Passwords and PINs are strictly encrypted. To reset your password, click 'Forgot Password?' on the login screen or open Security Settings.")
                    .timestamp(timeStr)
                    .quickActions(List.of("Security Settings", "Contact Support"))
                    .escalated(false)
                    .build();
        }

        if (lower.contains("otp") && (lower.contains("give me") || lower.contains("what is") || lower.contains("code"))) {
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply("🛡️ **Security Guardrail Policy**: Ayasa and FinEdge staff will NEVER ask for, reveal, or share your OTP over chat, SMS, or call.")
                    .timestamp(timeStr)
                    .quickActions(List.of("Contact Support", "Check KYC"))
                    .escalated(false)
                    .build();
        }

        // Unconfirmed features
        if (lower.contains("crypto") || lower.contains("bitcoin") || lower.contains("ethereum")) {
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply("ℹ️ **Information Unconfirmed**: FinEdge currently does not support cryptocurrency trading directly. For authorized investment products (Mutual Funds, Stocks, FDs), please visit [Investments & Watchlist](/investments).")
                    .timestamp(timeStr)
                    .quickActions(List.of("Manage Watchlist", "Invest in Mutual Funds", "View Deposits"))
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

        // 4. Grounded 7-Point Walkthroughs

        // Cards: Freeze Card
        if (lower.contains("freeze") && lower.contains("card")) {
            String reply = build7Point("Freezing or Blocking a Card",
                    "/cards", "Manage Cards",
                    "Navigate to Manage Cards",
                    "Select the specific Debit Card or Credit Card from your active card carousel.",
                    "Click 'Freeze Card' (Temporary Hold) or 'Block Card' (Permanent Cancellation).",
                    "Select freeze reason (Temporary Hold, Lost, Stolen) and confirm with 4-digit Security PIN / OTP.",
                    "Updates card status to FROZEN in backend Card Service & PostgreSQL database.",
                    "Card status changes to FROZEN immediately; all online, ATM, and POS transactions are blocked.",
                    "Look for the 'FROZEN' status badge displayed on your card under Manage Cards.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Freeze Card", "View Cards", "Apply for New Card"))
                    .actionRedirectUrl("/cards")
                    .build();
        }

        // Cards: Apply for New Card
        if (lower.contains("apply_new") && lower.contains("card")) {
            String reply = build7Point("Applying for a New FinEdge Card",
                    "/cards", "Manage Cards",
                    "Navigate to Manage Cards",
                    "Select 'Apply for New Card' tab (Virtual Visa, Rewards Credit Card, or Premium Debit Card).",
                    "Click 'Apply Now' button.",
                    "Select primary account to link, choose daily transaction limits, and authorize with Security PIN / 2FA OTP.",
                    "Creates new card record via /api/v1/cards/apply in Card Service & PostgreSQL.",
                    "Virtual card issued immediately; physical card dispatched within 3-5 business days.",
                    "Look for your new card added to the card carousel under Manage Cards.");
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Apply for New Card", "View Cards", "Freeze Card"))
                    .actionRedirectUrl("/cards")
                    .build();
        }

        // Cards: View Card Details
        if (lower.contains("card") || lower.contains("debit") || lower.contains("credit") || lower.contains("cvv") || lower.contains("expiry")) {
            String reply = build7Point("Viewing Card Details & Unmasking CVV",
                    "/cards", "Manage Cards",
                    "Navigate to Manage Cards",
                    "Select your active Debit Card or Credit Card from the card carousel.",
                    "Click 'View Card Details' or 'Reveal Card Number'.",
                    "Enter your 4-digit Security PIN or 2FA OTP to unmask sensitive numbers.",
                    "Fetches encrypted card payload from /api/v1/cards upon authorized PIN verification.",
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

        // Default Greeting
        String defaultReply = "Hello Soumya! 👋 I'm **Ayasa**, your FinEdge AI Support Assistant.\n\nI provide **grounded 7-step guidance** for every feature on FinEdge:\n• [Accounts & Balances](/accounts)\n• [Fund Transfers](/transfers/fund-transfer)\n• [Manage Cards](/cards)\n• [Disputes & Fraud](/disputes)\n• [Recharges & Bills](/transfers)\n• [KYC & Profile](/kyc-profile)\n\nHow can I help you today?";
        return ChatResponse.builder()
                .conversationId(convId)
                .reply(defaultReply)
                .timestamp(timeStr)
                .quickActions(List.of("View Accounts", "Transfer Money", "View Cards"))
                .escalated(false)
                .build();
    }

    private String build7Point(String title, String route, String routeName, String whereToGo,
                               String whatToSelect, String actionButton, String verification,
                               String backendOp, String resultingStatus, String howToConfirm) {
        return String.format("🤖 **Ayasa Grounded Step-by-Step Guidance: %s**\n\n" +
                        "1. **Actual page/route to open:** Navigate to [%s](%s)\n" +
                        "2. **Actual item/card/account to select:** %s\n" +
                        "3. **Actual button/action available:** %s\n" +
                        "4. **Actual security verification required:** %s\n" +
                        "5. **Actual backend operation:** %s\n" +
                        "6. **Actual resulting status:** %s\n" +
                        "7. **Actual way to confirm:** %s\n\n" +
                        "🔒 *Security Notice: Sensitive operations require Security PIN or 2FA Email OTP authorization. Security checks can NEVER be bypassed.*",
                title, routeName, route, whatToSelect, actionButton, verification, backendOp, resultingStatus, howToConfirm);
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
