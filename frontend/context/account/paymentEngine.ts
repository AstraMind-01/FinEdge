import { executeRazorpayPayment, type PaymentMetadata } from "../../lib/razorpay";
import { MockApi } from "../../lib/mockApi";
import { Transaction, UserProfile } from "../../types";

export interface PaymentExecutionResult {
  transaction: Transaction;
  paymentId: string;
}

export async function processTransferPayment(
  from: string,
  to: string,
  amount: number,
  userProfile: UserProfile
): Promise<PaymentExecutionResult> {
  const metadata: PaymentMetadata = {
    type: "TRANSFER",
    sourceAccountId: from,
    destinationAccountId: to,
    description: `Fund Transfer to ${to}`,
  };

  const verification = await executeRazorpayPayment(amount, metadata, {
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone.replace(/\s/g, ""),
  });

  await MockApi.transferFunds(from, to, amount);

  const rzpTxn: Transaction = {
    id: verification.transactionId || `TXN-${Date.now()}`,
    accountId: from,
    merchantName: `Transfer to ${to}`,
    amount,
    date: new Date().toISOString().split("T")[0],
    type: "DEBIT",
    category: "Transfer",
    status: "SUCCESS",
    referenceId: verification.paymentId,
    paymentMode: "Razorpay",
    remarks: `Razorpay Order: ${verification.orderId}`,
    timestamp: verification.verifiedAt,
  };

  return { transaction: rzpTxn, paymentId: verification.paymentId };
}

export async function processBillPayment(
  accountId: string,
  billerName: string,
  category: string,
  amount: number,
  userProfile: UserProfile
): Promise<PaymentExecutionResult> {
  const metadata: PaymentMetadata = {
    type: "BILL_PAYMENT",
    sourceAccountId: accountId,
    billerName,
    billerCategory: category,
    description: `Bill Payment to ${billerName}`,
  };

  const verification = await executeRazorpayPayment(amount, metadata, {
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone.replace(/\s/g, ""),
  });

  await MockApi.payBill(accountId, billerName, category, amount);

  const rzpTxn: Transaction = {
    id: verification.transactionId || `TXN-${Date.now()}`,
    accountId,
    merchantName: billerName,
    amount,
    date: new Date().toISOString().split("T")[0],
    type: "DEBIT",
    category: "Bills",
    status: "SUCCESS",
    referenceId: verification.paymentId,
    paymentMode: "Razorpay",
    remarks: `Bill Payment via Razorpay Order: ${verification.orderId}`,
    timestamp: verification.verifiedAt,
  };

  return { transaction: rzpTxn, paymentId: verification.paymentId };
}

export async function processMobileRecharge(
  accountId: string,
  mobileNumber: string,
  operator: string,
  amount: number,
  userProfile: UserProfile
): Promise<PaymentExecutionResult> {
  const metadata: PaymentMetadata = {
    type: "RECHARGE",
    sourceAccountId: accountId,
    mobileNumber,
    operator,
    description: `Recharge ${mobileNumber} (${operator})`,
  };

  const verification = await executeRazorpayPayment(amount, metadata, {
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone.replace(/\s/g, ""),
  });

  await MockApi.rechargeMobile(accountId, mobileNumber, operator, amount);

  const rzpTxn: Transaction = {
    id: verification.transactionId || `TXN-${Date.now()}`,
    accountId,
    merchantName: `${operator} Recharge`,
    amount,
    date: new Date().toISOString().split("T")[0],
    type: "DEBIT",
    category: "Bills",
    status: "SUCCESS",
    referenceId: verification.paymentId,
    paymentMode: "Razorpay",
    remarks: `Mobile Recharge via Razorpay Order: ${verification.orderId} | ${mobileNumber}`,
    timestamp: verification.verifiedAt,
  };

  return { transaction: rzpTxn, paymentId: verification.paymentId };
}
