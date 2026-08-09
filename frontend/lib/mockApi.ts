import { Account, Transaction } from "../types";

let accounts: Account[] = [
  {
    id: "ACC-001",
    type: "SAVINGS",
    name: "Savings Account",
    maskedNumber: "•••• 8812",
    lastFour: "8812",
    balance: 625430.50,
    currency: "INR",
    status: "ACTIVE",
    accountHolder: "Soumya Ranjan"
  },
  {
    id: "ACC-002",
    type: "CURRENT",
    name: "Current Account",
    maskedNumber: "•••• 3341",
    lastFour: "3341",
    balance: 450000.00,
    currency: "INR",
    status: "ACTIVE",
    accountHolder: "Soumya Ranjan"
  },
  {
    id: "FD-001",
    type: "FIXED_DEPOSIT",
    name: "Fixed Deposit",
    maskedNumber: "•••• 7788",
    lastFour: "7788",
    balance: 200000.00,
    currency: "INR",
    status: "ACTIVE",
    accountHolder: "Soumya Ranjan",
    interestRate: 7.25,
    maturityDate: "2028-12-15"
  }
];

let transactions: Transaction[] = [
  { id: "TX-001", accountId: "ACC-001", merchantName: "TechCorp Salary", amount: 145000, date: "Yesterday, 09:00 AM", type: "CREDIT", category: "Salary" },
  { id: "TX-002", accountId: "ACC-001", merchantName: "Amazon.in", amount: -4599, date: "Today, 10:42 AM", type: "DEBIT", category: "Shopping" },
  { id: "TX-003", accountId: "ACC-001", merchantName: "Zomato", amount: -850.50, date: "24 Oct, 08:30 PM", type: "DEBIT", category: "Food" },
  { id: "TX-004", accountId: "ACC-002", merchantName: "Business Payment", amount: 120000, date: "22 Oct, 11:15 AM", type: "CREDIT", category: "Transfer" },
  { id: "TX-005", accountId: "ACC-002", merchantName: "Vendor Payment", amount: -35000, date: "21 Oct, 04:20 PM", type: "DEBIT", category: "Transfer" },
  { id: "TX-006", accountId: "ACC-001", merchantName: "Rahul Kumar", amount: -12000, date: "23 Oct, 02:15 PM", type: "DEBIT", category: "Transfer" },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockApi = {
  getAccounts: async (): Promise<Account[]> => {
    await delay(500);
    return [...accounts];
  },
  getTransactions: async (accountId: string): Promise<Transaction[]> => {
    await delay(300);
    return transactions.filter(t => t.accountId === accountId);
  },
  transferFunds: async (fromId: string, toId: string, amount: number): Promise<boolean> => {
    await delay(800);
    const fromAccount = accounts.find(a => a.id === fromId);
    const toAccount = accounts.find(a => a.id === toId);

    if (!fromAccount || !toAccount || fromAccount.balance < amount) {
      throw new Error("Invalid transfer");
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    transactions.unshift({
      id: `TX-${Date.now()}-OUT`,
      accountId: fromId,
      merchantName: `Transfer to ${toAccount.maskedNumber}`,
      amount: -amount,
      date: "Just now",
      type: "DEBIT",
      category: "Transfer"
    });

    transactions.unshift({
      id: `TX-${Date.now()}-IN`,
      accountId: toId,
      merchantName: `Transfer from ${fromAccount.maskedNumber}`,
      amount: amount,
      date: "Just now",
      type: "CREDIT",
      category: "Transfer"
    });

    return true;
  },
  requestBalanceAccess: async (accountId: string): Promise<string> => {
    await delay(300);
    return `TOKEN-${accountId}-${Date.now()}`;
  },
  verifyBalanceAccess: async (accountId: string, token: string): Promise<boolean> => {
    await delay(800);
    return token.startsWith(`TOKEN-${accountId}`);
  }
};
