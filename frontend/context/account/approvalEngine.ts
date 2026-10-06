import { Account } from "../../types";
import { MockApi } from "../../lib/mockApi";

export interface ApprovalNotificationData {
  title: string;
  subtitle: string;
  type: "CREDIT" | "DEBIT";
  inboxSubject: string;
  inboxSender: string;
  inboxBody: string;
}

export async function processApprovalItem(
  id: string,
  actionType: "APPROVE_BENEFICIARY" | "APPROVE_LOAN" | "VERIFY_OTP",
  targetAcc: Account | undefined,
  payload?: any
): Promise<{ success: boolean; notification?: ApprovalNotificationData }> {
  if (actionType === "APPROVE_LOAN" && targetAcc && payload?.amount) {
    await MockApi.transferFunds(targetAcc.id, targetAcc.id, 0);
    targetAcc.balance += payload.amount;
    return {
      success: true,
      notification: {
        title: "Loan Sanctioned",
        subtitle: `₹${payload.amount.toLocaleString("en-IN")} credited to your account.`,
        type: "CREDIT",
        inboxSender: "Loan Sanctions",
        inboxSubject: `Loan Disbursal Advice: ₹${payload.amount.toLocaleString("en-IN")}`,
        inboxBody: `Congratulations! Your personal loan application of ₹${payload.amount.toLocaleString("en-IN")} has been approved and credited to your account.`,
      },
    };
  } else if (actionType === "VERIFY_OTP" && targetAcc && payload?.amount) {
    if (targetAcc.balance >= payload.amount) {
      targetAcc.balance -= payload.amount;
    }
    return {
      success: true,
      notification: {
        title: "High Value Transfer Executed",
        subtitle: `₹${payload.amount.toLocaleString("en-IN")} debited for RTGS transfer.`,
        type: "DEBIT",
        inboxSender: "RTGS Operations",
        inboxSubject: `High-Value RTGS Transfer Executed: ₹${payload.amount.toLocaleString("en-IN")}`,
        inboxBody: `Your high-value RTGS transfer of ₹${payload.amount.toLocaleString("en-IN")} passed 2FA authorization and was settled.`,
      },
    };
  }
  return { success: true };
}
