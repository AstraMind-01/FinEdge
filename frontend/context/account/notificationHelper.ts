import { AppNotification } from "./types";
import { mapAppNotificationType, mapPriority } from "../NotificationContext";

export function resolveNotificationMetadata(
  title: string,
  subtitle: string,
  type: AppNotification["type"] = "SYSTEM"
) {
  const timestamp = Date.now();
  let actionLink: string | undefined;
  let actionLabel: string | undefined;
  let sourceEvent: string | undefined;

  if (title === "Profile Updated") {
    actionLink = "/kyc-profile"; actionLabel = "View Profile"; sourceEvent = `PROFILE_UPDATE_${timestamp}`;
  } else if (title === "Security Access Granted") {
    actionLink = "/accounts"; actionLabel = "View Account"; sourceEvent = `SEC_ACCESS_${timestamp}`;
  } else if (title === "Security Lockout Triggered") {
    actionLink = "/accounts"; actionLabel = "Review Activity"; sourceEvent = `SEC_LOCKOUT_${timestamp}`;
  } else if (title === "Transfer Executed via Razorpay") {
    const match = subtitle.match(/Payment ID: (.+)$/);
    const paymentId = match ? match[1] : timestamp.toString();
    actionLink = "/transactions"; actionLabel = "View Transaction"; sourceEvent = `TRANSFER_${paymentId}`;
  } else if (title === "Limits Updated") {
    actionLink = "/accounts"; actionLabel = "View Account"; sourceEvent = `LIMITS_UPDATE_${timestamp}`;
  } else if (title === "Account Frozen" || title === "Account Unfrozen") {
    actionLink = "/accounts"; actionLabel = "View Account"; sourceEvent = `FREEZE_TOGGLE_${timestamp}`;
  } else if (title === "Bill Payment via Razorpay") {
    const match = subtitle.match(/Payment ID: (.+)$/);
    const paymentId = match ? match[1] : timestamp.toString();
    actionLink = "/transactions"; actionLabel = "View Bills"; sourceEvent = `BILL_PAY_${paymentId}`;
  } else if (title === "Recharge via Razorpay") {
    const match = subtitle.match(/Payment ID: (.+)$/);
    const paymentId = match ? match[1] : timestamp.toString();
    actionLink = "/transactions"; actionLabel = "View Recharge"; sourceEvent = `RECHARGE_${paymentId}`;
  } else if (title === "Account Activated") {
    actionLink = "/accounts"; actionLabel = "View Account"; sourceEvent = `ACCOUNT_CREATE_${timestamp}`;
  } else if (title === "Fixed Deposit Created") {
    actionLink = "/deposits"; actionLabel = "View Deposits"; sourceEvent = `FD_CREATE_${timestamp}`;
  } else if (title === "Investment Executed") {
    actionLink = "/investments"; actionLabel = "View Investments"; sourceEvent = `INVEST_${timestamp}`;
  } else if (title === "Loan Sanctioned") {
    actionLink = "/loans"; actionLabel = "View Loan"; sourceEvent = `LOAN_APPROVE_${timestamp}`;
  } else if (title === "High Value Transfer Executed") {
    actionLink = "/transactions"; actionLabel = "View Transaction"; sourceEvent = `HVT_${timestamp}`;
  } else if (title === "Document Encrypted & Stored") {
    actionLink = "/kyc-profile"; actionLabel = "View Vault"; sourceEvent = `DOC_UPLOAD_${timestamp}`;
  }

  return {
    type: mapAppNotificationType(type),
    title,
    description: subtitle,
    priority: mapPriority(type),
    category: type,
    actionLink,
    actionLabel,
    sourceEvent
  };
}
