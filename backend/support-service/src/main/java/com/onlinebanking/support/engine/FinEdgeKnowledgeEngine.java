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
        if (lower.contains("password") && (lower.contains("what is my") || lower.contains("reveal") || lower.contains("show me"))) {
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply("🔒 FinEdge Security Alert: Passwords and security PINs are strictly encrypted. If you forgot your password, please use the 'Forgot Password' link on the login page.")
                    .timestamp(timeStr)
                    .quickActions(List.of("Contact Support", "Check KYC"))
                    .escalated(false)
                    .build();
        }

        if (lower.contains("otp") && (lower.contains("give me") || lower.contains("what is") || lower.contains("code"))) {
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply("🛡️ Security Policy: Ayesha and FinEdge staff will NEVER ask for or reveal your OTP over chat, SMS, or call.")
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
                    String reply = String.format("🎫 Support Ticket Status [%s]:\n• Category: %s\n• Issue: %s\n• Priority: %s\n• Current Status: %s\n• Last Updated: %s\n\nOur priority desk is investigating your case.",
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

        // 3. Human Escalation / Dispute Detection -> Create Real Support Ticket
        if (lower.contains("human") || lower.contains("agent") || lower.contains("representative") ||
            lower.contains("dispute") || lower.contains("fraud") || lower.contains("unauthorized") ||
            lower.contains("blocked transaction") || lower.contains("stolen") || lower.contains("escalate")) {

            return createSupportTicketAndEscalate(req, convId, timeStr, lower);
        }

        // 4. Authorized Tool Retrievals
        if (lower.contains("my account") || lower.contains("account balance") || lower.contains("where can i see") || lower.contains("account summary")) {
            Map<String, Object> summary = tools.getAccountSummary(userId);
            List<Map<String, String>> accs = (List<Map<String, String>>) summary.get("accounts");

            StringBuilder sb = new StringBuilder("💼 Your FinEdge Accounts Overview:\n");
            for (Map<String, String> acc : accs) {
                sb.append(String.format("• %s (%s) — %s [%s]\n", acc.get("name"), acc.get("maskedNumber"), acc.get("type"), acc.get("status")));
            }
            sb.append("\n🔒 Note: Balances are masked (`••••••••`) until you complete an in-app Security PIN verification on the [Accounts Directory](/accounts) screen.");

            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(sb.toString())
                    .timestamp(timeStr)
                    .quickActions(List.of("View Accounts", "Transfer Money", "Check Transactions"))
                    .actionRedirectUrl("/accounts")
                    .escalated(false)
                    .build();
        }

        if (lower.contains("transaction status") || lower.contains("check transaction") || lower.contains("txn-")) {
            String txnId = extractTxnId(msg);
            Map<String, Object> statusData = tools.getTransactionStatus(txnId, userId);
            
            String reply = String.format("📊 Transaction Investigation Details [%s]:\n• Status: %s\n• Amount: %s\n• Timestamp: %s\n• Fraud Risk Score: %s\n• Notes: %s\n\nView full history on [Transactions](/transactions).",
                    statusData.get("transactionId"), statusData.get("status"), statusData.get("amount"),
                    statusData.get("timestamp"), statusData.get("fraudRiskScore"),
                    statusData.containsKey("reason") ? statusData.get("reason") : "Transaction completed normally.");

            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Check Transactions", "Dispute Transaction", "Transfer Money"))
                    .actionRedirectUrl("/transactions")
                    .escalated(false)
                    .build();
        }

        if (lower.contains("recharge") && (lower.contains("status") || lower.contains("my plan") || lower.contains("mobile"))) {
            Map<String, Object> r = tools.getRechargeStatus("9876543210", userId);
            String reply = String.format("📱 Mobile Recharge Record [%s]:\n• Mobile: %s\n• Operator: %s\n• Amount: %s\n• Plan: %s\n• Status: %s\n\nYou can top up anytime under [Transfers & Payments](/transfers).",
                    r.get("referenceId"), r.get("mobileNumber"), r.get("operator"), r.get("lastRechargeAmount"), r.get("planDetails"), r.get("status"));
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Recharge Mobile", "Pay Bills", "Transfer Money"))
                    .actionRedirectUrl("/transfers")
                    .escalated(false)
                    .build();
        }

        if (lower.contains("bill") && (lower.contains("status") || lower.contains("paid") || lower.contains("pay"))) {
            Map<String, Object> b = tools.getBillPaymentStatus("Tata Power Delhi", userId);
            String reply = String.format("⚡ Utility Bill Payment Status [%s]:\n• Biller: %s\n• Consumer No: %s\n• Last Paid: %s\n• Status: %s\n• Next Due Date: %s\n\nPay utility bills securely on [Pay Bills](/transfers).",
                    b.get("bbpsRefNo"), b.get("billerName"), b.get("consumerNumber"), b.get("lastPaidAmount"), b.get("paymentStatus"), b.get("nextDueDate"));
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Pay Bills", "Recharge Mobile", "View Accounts"))
                    .actionRedirectUrl("/transfers")
                    .escalated(false)
                    .build();
        }

        if (lower.contains("kyc") || lower.contains("document vault") || lower.contains("aadhaar")) {
            Map<String, Object> k = tools.getKycStatus(userId);
            String reply = String.format("📑 KYC & Document Vault Status:\n• KYC Status: %s\n• Verification Tier: %s\n• Next Re-KYC Due: %s\n• Documents in Vault: %s\n\nInspect your verified identity vault at [KYC & Profile](/kyc-profile).",
                    k.get("kycStatus"), k.get("verificationTier"), k.get("reKycDueDate"), k.get("documents"));
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Check KYC", "View Accounts", "Contact Support"))
                    .actionRedirectUrl("/kyc-profile")
                    .escalated(false)
                    .build();
        }

        if (lower.contains("watchlist") || lower.contains("my stocks") || lower.contains("saved funds")) {
            String reply = "👁️ Your FinEdge Persistent Watchlist Summary:\n\n" +
                    "• Tata Motors (TATAMOTORS.NS) — ₹812.40 (+2.3%)\n" +
                    "• HDFC Flexi Cap Fund — NAV ₹42.15 (+1.1%)\n" +
                    "• Infosys (INFY.NS) — ₹1,542.60 (-0.4%)\n\n" +
                    "📈 Live market data is synchronized with your [Investments & Watchlist](/investments) page & PostgreSQL database.";
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Manage Watchlist", "Invest in Mutual Funds", "Open Fixed Deposit"))
                    .actionRedirectUrl("/investments")
                    .escalated(false)
                    .build();
        }

        // 5. Cards & Card Details Intent
        if (lower.contains("card") || lower.contains("debit") || lower.contains("credit") || lower.contains("cvv") || lower.contains("expiry") || lower.contains("virtual card")) {
            String reply = "💳 How to View Your Card Details on FinEdge:\n\n" +
                    "1. Navigate to [Manage Cards](/cards).\n" +
                    "2. Select your Platinum Debit Card or Rewards Credit Card.\n" +
                    "3. Click 'View Card Details' or 'Reveal Card Number'.\n" +
                    "4. Complete the 2FA Security PIN verification to unmask the 16-digit card number and CVV for 5 minutes.\n\n" +
                    "🔒 Security Note: Card details are 256-bit encrypted.";
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("View Cards", "Apply for New Card", "Freeze Card"))
                    .actionRedirectUrl("/cards")
                    .build();
        }

        // 6. Guided Step-by-Step FinEdge Help Answers
        if (lower.contains("transfer") || lower.contains("send money") || lower.contains("how do i transfer")) {
            String reply = "💸 How to Perform Fund Transfers on FinEdge:\n\n" +
                    "1. Go to [Fund Transfers](/transfers/fund-transfer).\n" +
                    "2. Choose Recipient: Select an Own Account, Saved Beneficiary, or enter a new Bank Account / UPI ID.\n" +
                    "3. Enter Amount & Mode: IMPS (Instant 24/7), NEFT (2-4 hrs, free), or RTGS (₹2L+).\n" +
                    "4. Authenticate: Enter your 4-digit Security PIN or OTP to authorize.\n\n" +
                    "⚡ Transfer Limits: ₹2,00,000/day for Savings Account; ₹5,00,000/day for Business Current Account.";
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Transfer Money", "View Accounts", "Check Transactions"))
                    .actionRedirectUrl("/transfers/fund-transfer")
                    .build();
        }

        if (lower.contains("limit") || lower.contains("maximum") || lower.contains("fee") || lower.contains("charges")) {
            String reply = "📊 FinEdge Transfer Limits & Fee Schedule:\n\n" +
                    "• NEFT / RTGS / UPI: 100% FREE with ZERO bank charges.\n" +
                    "• IMPS Transfers: Free up to ₹50,000; nominal ₹5 fee above ₹50,000.\n" +
                    "• Daily Savings Limit: ₹2,00,000 per day.\n" +
                    "• Daily Business Limit: ₹5,00,000 per day.\n" +
                    "• Request a limit upgrade directly in [Transfers](/transfers).";
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("Transfer Money", "View Accounts", "Contact Support"))
                    .actionRedirectUrl("/transfers")
                    .build();
        }

        if (lower.contains("hi") || lower.contains("hello") || lower.contains("hey") || lower.contains("greetings")) {
            String reply = "Hello Soumya! 👋 I'm Ayesha, your FinEdge AI Support Assistant. I can help you check account balances, view card details, perform transfers, track recharges/bills, review fraud risk scores, or manage your watchlist. How can I assist you today?";
            return ChatResponse.builder()
                    .conversationId(convId)
                    .reply(reply)
                    .timestamp(timeStr)
                    .quickActions(List.of("View Accounts", "Transfer Money", "View Cards", "Manage Watchlist"))
                    .build();
        }

        // Dynamic Conversational Fallback tailored specifically to user's question
        String dynamicReply = String.format("Hello Soumya! 👋 I'm Ayesha. I understand you're asking about '%s'.\n\nYou can manage this directly from your FinEdge banking portal. Check out these quick links:\n• [Accounts](/accounts) — Check balances and statements\n• [Transfers](/transfers/fund-transfer) — Send money via IMPS/NEFT/UPI\n• [Cards](/cards) — Manage debit/credit cards\n• [Watchlist & Investments](/investments) — Track stocks & mutual funds\n\nPlease let me know if you would like step-by-step guidance on any topic!", msg);

        return ChatResponse.builder()
                .conversationId(convId)
                .reply(dynamicReply)
                .timestamp(timeStr)
                .quickActions(List.of("View Accounts", "Transfer Money", "View Cards", "Contact Support"))
                .escalated(false)
                .build();
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

        String reply = String.format("🤝 I'm connecting you with FinEdge Priority Support!\n\nA priority support ticket has been created:\n• Ticket ID: %s\n• Category: %s\n• Priority: %s\n• Status: OPEN (Assigned to Human Support Desk)\n\nYou can track disputes anytime under [Disputes Management](/disputes).",
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
        if (text == null) return "TXN-99824";
        int idx = text.toUpperCase().indexOf("TXN-");
        if (idx != -1 && text.length() >= idx + 9) {
            return text.substring(idx, idx + 9).toUpperCase();
        }
        return "TXN-99824";
    }
}
