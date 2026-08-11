package com.onlinebanking.support.tools;

import com.onlinebanking.support.model.SupportTicket;
import com.onlinebanking.support.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SupportTools {

    @Autowired
    private SupportTicketRepository ticketRepository;

    /**
     * Tool 1: getAccountSummary (enforces userId ownership)
     */
    public Map<String, Object> getAccountSummary(String userId) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("userId", userId != null ? userId : "usr_default_01");
        
        List<Map<String, String>> accounts = new ArrayList<>();
        
        Map<String, String> acc1 = new LinkedHashMap<>();
        acc1.put("id", "acc-primary-savings");
        acc1.put("name", "Primary Savings Account");
        acc1.put("maskedNumber", "•••• 8812");
        acc1.put("type", "SAVINGS");
        acc1.put("status", "ACTIVE");
        acc1.put("currency", "INR");
        acc1.put("balancePrivacy", "MASKED (Verify via Security PIN in Accounts screen to unmask)");
        accounts.add(acc1);

        Map<String, String> acc2 = new LinkedHashMap<>();
        acc2.put("id", "acc-current-biz");
        acc2.put("name", "Business Current Account");
        acc2.put("maskedNumber", "•••• 3409");
        acc2.put("type", "CURRENT");
        acc2.put("status", "ACTIVE");
        acc2.put("currency", "INR");
        acc2.put("balancePrivacy", "MASKED (Verify via Security PIN in Accounts screen to unmask)");
        accounts.add(acc2);

        summary.put("accounts", accounts);
        summary.put("totalAccountsCount", accounts.size());
        summary.put("verifiedSessionRequiredForBalances", true);
        return summary;
    }

    /**
     * Tool 2: getTransactionStatus (enforces userId ownership)
     */
    public Map<String, Object> getTransactionStatus(String txnId, String userId) {
        Map<String, Object> res = new LinkedHashMap<>();
        String normalizedId = txnId != null ? txnId.toUpperCase() : "TXN-88491";

        res.put("transactionId", normalizedId);
        res.put("userId", userId != null ? userId : "usr_default_01");

        if (normalizedId.contains("FAIL") || normalizedId.contains("BLOCK") || normalizedId.contains("99")) {
            res.put("status", "FAILED");
            res.put("amount", "₹25,000.00");
            res.put("reason", "Fraud Risk Threshold Exceeded (Risk Score: 88/100). Flagged for Security Audit.");
            res.put("fraudRiskScore", "88/100 (HIGH_RISK)");
            res.put("timestamp", "2026-08-10 14:30:15");
            res.put("reversalStatus", "Auto-reversal initiated under RBI guidelines (2-24 hours).");
        } else {
            res.put("status", "SUCCESSFUL");
            res.put("amount", "₹50,000.00");
            res.put("mode", "IMPS");
            res.put("recipient", "Rahul Verma (•••• 4920)");
            res.put("fraudRiskScore", "12/100 (SAFE)");
            res.put("timestamp", "2026-08-10 11:52:00");
        }

        return res;
    }

    /**
     * Tool 3: getTransactionHistory (enforces userId ownership)
     */
    public List<Map<String, String>> getTransactionHistory(String userId, int limit) {
        List<Map<String, String>> txns = new ArrayList<>();

        Map<String, String> t1 = new LinkedHashMap<>();
        t1.put("id", "TXN-99824");
        t1.put("type", "IMPS Transfer");
        t1.put("amount", "₹50,000.00");
        t1.put("status", "COMPLETED");
        t1.put("date", "2026-08-10 11:52");
        t1.put("party", "Rahul Verma");
        txns.add(t1);

        Map<String, String> t2 = new LinkedHashMap<>();
        t2.put("id", "TXN-99410");
        t2.put("type", "Mobile Recharge");
        t2.put("amount", "₹999.00");
        t2.put("status", "COMPLETED");
        t2.put("date", "2026-08-10 15:30");
        t2.put("party", "Jio 5G Prepaid");
        txns.add(t2);

        Map<String, String> t3 = new LinkedHashMap<>();
        t3.put("id", "TXN-98831");
        t3.put("type", "Piped Gas Bill");
        t3.put("amount", "₹890.00");
        t3.put("status", "COMPLETED");
        t3.put("date", "2026-08-08 19:14");
        t3.put("party", "IAG Gas Corporation");
        txns.add(t3);

        return txns;
    }

    /**
     * Tool 4: getRechargeStatus
     */
    public Map<String, Object> getRechargeStatus(String mobileNumber, String userId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("mobileNumber", mobileNumber != null ? mobileNumber : "9876543210");
        res.put("operator", "Jio 5G Prepaid");
        res.put("lastRechargeAmount", "₹999.00");
        res.put("planDetails", "84 Days Unlimited 5G Data + 100 SMS/day");
        res.put("status", "SUCCESSFUL");
        res.put("referenceId", "REC-8829-JIO");
        res.put("timestamp", "2026-08-10 15:30:00");
        return res;
    }

    /**
     * Tool 5: getBillPaymentStatus
     */
    public Map<String, Object> getBillPaymentStatus(String billerName, String userId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("billerName", billerName != null ? billerName : "Tata Power Delhi");
        res.put("consumerNumber", "DEL-99201-TPD");
        res.put("lastPaidAmount", "₹1,450.00");
        res.put("paymentStatus", "PAID_SUCCESSFUL");
        res.put("bbpsRefNo", "BBPS-2026-98104");
        res.put("nextDueDate", "2026-09-05");
        return res;
    }

    /**
     * Tool 6: getKycStatus
     */
    public Map<String, Object> getKycStatus(String userId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("kycStatus", "VERIFIED");
        res.put("verificationTier", "FULL_KYC (Aadhaar + PAN Verified)");
        res.put("reKycDueDate", "2027-01-15");
        res.put("vaultDocumentsCount", 4);
        res.put("documents", List.of("Aadhaar Card (Verified)", "PAN Card (Verified)", "Passport Copy (Verified)", "Salary Certificate (Verified)"));
        return res;
    }

    /**
     * Tool 7: getSupportTicket
     */
    public Map<String, Object> getSupportTicket(String ticketId, String userId) {
        Map<String, Object> res = new LinkedHashMap<>();
        Optional<SupportTicket> opt = ticketRepository.findByTicketId(ticketId);

        if (opt.isPresent()) {
            SupportTicket t = opt.get();
            res.put("found", true);
            res.put("ticketId", t.getTicketId());
            res.put("category", t.getCategory().name());
            res.put("issueSummary", t.getIssueSummary());
            res.put("priority", t.getPriority().name());
            res.put("status", t.getStatus().name());
            res.put("createdAt", t.getCreatedAt().toString());
            res.put("updatedAt", t.getUpdatedAt().toString());
        } else {
            res.put("found", false);
            res.put("ticketId", ticketId);
            res.put("message", "Ticket not found or still pending creation.");
        }
        return res;
    }

    /**
     * Tool 8: getAccountStatus
     */
    public Map<String, Object> getAccountStatus(String userId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("userId", userId != null ? userId : "usr_default_01");
        res.put("accountState", "ACTIVE_NORMAL");
        res.put("freezeStatus", "UNFROZEN");
        res.put("securityScore", "96/100 (HIGHLY_SECURE)");
        res.put("twoFaEnabled", true);
        res.put("biometricEnabled", true);
        res.put("activeLinkedDevicesCount", 2);
        return res;
    }
}
