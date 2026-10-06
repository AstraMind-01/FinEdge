import { Account, Transaction, UserProfile } from "../../types";
import { MockApi } from "../../lib/mockApi";
import { AccountApi, TransactionApi } from "../../lib/api";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchAccountsList(): Promise<Account[]> {
  if (USE_MOCK) {
    return await MockApi.getAccounts();
  }
  const backendAccounts = await AccountApi.getAccounts();
  return backendAccounts.map((acc) => ({
    id: String(acc.id),
    type: acc.accountType,
    name: `${acc.accountType.charAt(0) + acc.accountType.slice(1).toLowerCase()} Account`,
    maskedNumber: `•••• ${acc.accountNumber.slice(-4)}`,
    lastFour: acc.accountNumber.slice(-4),
    balance: acc.balance,
    currency: "INR",
    status: acc.status,
    accountHolder: acc.ownerUsername,
  }));
}

export async function fetchAccountTransactions(accountId: string): Promise<Transaction[]> {
  if (USE_MOCK) {
    return await MockApi.getTransactions(accountId);
  }
  const backendTxs = await TransactionApi.getMyTransactions();
  return backendTxs.map((tx) => ({
    id: String(tx.id),
    accountId: tx.fromAccountNumber || tx.toAccountNumber || accountId,
    merchantName: tx.fromAccountNumber
      ? `Transfer from ${tx.fromAccountNumber.slice(-4)}`
      : `Deposit to ${tx.toAccountNumber?.slice(-4)}`,
    amount: tx.type === "WITHDRAWAL" || tx.type === "TRANSFER" ? -Math.abs(tx.amount) : Math.abs(tx.amount),
    date: new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    type: tx.type === "DEPOSIT" ? "CREDIT" : "DEBIT",
    category: "Transfer",
    status: tx.status,
    referenceId: tx.transactionRef,
    timestamp: tx.createdAt,
  }));
}

export function buildNewAccount(
  newAccountData: Partial<Account> & { initialDeposit?: number },
  existingAccountsCount: number,
  userProfile: UserProfile
): { account: Account; initialTransaction?: Transaction } {
  const accType = newAccountData.type || "SAVINGS";
  const last4 = Math.floor(1000 + Math.random() * 9000).toString();
  const accNum = `4092${Math.floor(100000000 + Math.random() * 900000000)}`;
  const depositAmt = newAccountData.initialDeposit || newAccountData.balance || 0;

  const account: Account = {
    id: `ACC-00${existingAccountsCount + 1}`,
    type: accType,
    name:
      newAccountData.name ||
      (accType === "SAVINGS"
        ? "High-Yield Savings Account"
        : accType === "CURRENT"
        ? "Business Current Account"
        : accType === "FIXED_DEPOSIT"
        ? "High Yield Fixed Deposit"
        : "Wealth Builder RD"),
    maskedNumber: `•••• ${last4}`,
    accountNumber: accNum,
    lastFour: last4,
    balance: depositAmt,
    currency: "INR",
    status: "ACTIVE",
    accountHolder: userProfile.name,
    ifsc: "HDFC0001234",
    branch: userProfile.branch || "Mumbai Corporate",
    openingDate: new Date().toISOString().split("T")[0],
    nominee: newAccountData.nominee || "Registered Nominee",
    nomineeRelation: newAccountData.nomineeRelation || "Spouse",
    dailyLimit: newAccountData.dailyLimit || (accType === "CURRENT" ? 500000 : 100000),
    transactionLimit: 50000,
    atmLimit: 25000,
    linkedCard: `Visa Platinum Debit Card (•••• ${last4})`,
  };

  let initialTransaction: Transaction | undefined;
  if (depositAmt > 0) {
    initialTransaction = {
      id: `TX-INIT-${Date.now()}`,
      accountId: account.id,
      merchantName: "Initial Account Funding Deposit",
      amount: depositAmt,
      date: "Just now",
      timestamp: new Date().toISOString(),
      type: "CREDIT",
      category: "Deposit",
      status: "SUCCESS",
    };
  }

  return { account, initialTransaction };
}
