import { Account, Transaction, Beneficiary, ScheduledTransfer } from "../types";

let accounts: Account[] = [
  {
    id: "ACC-001",
    type: "SAVINGS",
    name: "Primary Savings Account",
    maskedNumber: "•••• 8812",
    lastFour: "8812",
    balance: 625430.50,
    currency: "INR",
    status: "ACTIVE",
    accountHolder: "Soumya Ranjan",
    ifsc: "HDFC0001234",
    branch: "Connaught Place, New Delhi",
    openingDate: "2018-05-12",
    nominee: "Priya Ranjan",
    nomineeRelation: "Spouse",
    interestEarned: 12450.00,
    minBalance: 10000.00,
    linkedCard: "Visa Platinum •••• 4599",
    interestRate: 3.5
  },
  {
    id: "ACC-002",
    type: "CURRENT",
    name: "Business Current Account",
    maskedNumber: "•••• 3341",
    lastFour: "3341",
    balance: 450000.00,
    currency: "INR",
    status: "ACTIVE",
    accountHolder: "Soumya Ranjan",
    ifsc: "HDFC0001234",
    branch: "Connaught Place, New Delhi",
    openingDate: "2020-11-05",
    nominee: "Priya Ranjan",
    nomineeRelation: "Spouse",
    minBalance: 50000.00,
    linkedCard: "Mastercard Business •••• 8821"
  },
  {
    id: "FD-001",
    type: "FIXED_DEPOSIT",
    name: "High Yield Fixed Deposit",
    maskedNumber: "•••• 7788",
    lastFour: "7788",
    balance: 200000.00,
    currency: "INR",
    status: "ACTIVE",
    accountHolder: "Soumya Ranjan",
    interestRate: 7.25,
    maturityDate: "2028-12-15",
    ifsc: "HDFC0001234",
    branch: "Connaught Place, New Delhi",
    openingDate: "2023-12-15",
    nominee: "Priya Ranjan",
    nomineeRelation: "Spouse",
    interestEarned: 14500.00
  },
  {
    id: "RD-001",
    type: "RECURRING_DEPOSIT",
    name: "Wealth Builder RD",
    maskedNumber: "•••• 9192",
    lastFour: "9192",
    balance: 75000.00,
    currency: "INR",
    status: "ACTIVE",
    accountHolder: "Soumya Ranjan",
    interestRate: 6.50,
    maturityDate: "2025-06-10",
    ifsc: "HDFC0001234",
    branch: "Connaught Place, New Delhi",
    openingDate: "2024-01-10",
    monthlyInstallment: 15000.00,
    nominee: "Priya Ranjan",
    nomineeRelation: "Spouse",
    interestEarned: 2250.00
  }
];

let transactions: Transaction[] = [
  { id: "TX-001", accountId: "ACC-001", merchantName: "TechCorp Salary", amount: 145000, date: "Today, 09:00 AM", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), type: "CREDIT", category: "Salary", status: "SUCCESS", referenceId: "SAL-2026-05", paymentMode: "NEFT", remarks: "May Salary" },
  { id: "TX-002", accountId: "ACC-001", merchantName: "Amazon.in", amount: -4599, date: "Today, 10:42 AM", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Shopping", status: "SUCCESS", referenceId: "AMZ-991283", paymentMode: "UPI", remarks: "Electronics" },
  { id: "TX-003", accountId: "ACC-001", merchantName: "Zomato", amount: -850.50, date: "Yesterday, 08:30 PM", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Food", status: "SUCCESS", referenceId: "ZMT-88123", paymentMode: "UPI", remarks: "Dinner" },
  { id: "TX-004", accountId: "ACC-002", merchantName: "Client Payment", amount: 120000, date: "Yesterday, 11:15 AM", timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), type: "CREDIT", category: "Transfer", status: "SUCCESS", referenceId: "IMPS-009123", paymentMode: "IMPS", remarks: "Invoice #102" },
  { id: "TX-005", accountId: "ACC-002", merchantName: "Vendor Payment", amount: -35000, date: "2 days ago", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Transfer", status: "SUCCESS", referenceId: "NEFT-9912", paymentMode: "NEFT", remarks: "Office Supplies" },
  { id: "TX-006", accountId: "ACC-001", merchantName: "Rahul Kumar", amount: -12000, date: "2 days ago", timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Transfer", status: "PENDING", referenceId: "UPI-91823", paymentMode: "UPI", remarks: "Rent share" },
  { id: "TX-007", accountId: "ACC-001", merchantName: "Netflix", amount: -649, date: "3 days ago", timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Bills", status: "SUCCESS", referenceId: "SUB-NET-01", paymentMode: "Card", remarks: "Monthly Subscription" },
  { id: "TX-008", accountId: "ACC-001", merchantName: "Uber", amount: -350, date: "3 days ago", timestamp: new Date(Date.now() - 75 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Travel", status: "SUCCESS", referenceId: "UBR-9912", paymentMode: "UPI", remarks: "Ride to office" },
  { id: "TX-009", accountId: "ACC-002", merchantName: "Google Workspace", amount: -4500, date: "4 days ago", timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Bills", status: "SUCCESS", referenceId: "GWS-1123", paymentMode: "Card", remarks: "Cloud Storage" },
  { id: "TX-010", accountId: "ACC-001", merchantName: "Swiggy Instamart", amount: -1250, date: "4 days ago", timestamp: new Date(Date.now() - 98 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Food", status: "FAILED", referenceId: "SWG-8812", paymentMode: "UPI", remarks: "Timeout error" },
  { id: "TX-011", accountId: "FD-001", merchantName: "Fixed Deposit Interest", amount: 14500, date: "5 days ago", timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), type: "CREDIT", category: "Investment", status: "SUCCESS", referenceId: "FD-INT-01", paymentMode: "Internal", remarks: "Annual Interest" },
  { id: "TX-012", accountId: "ACC-001", merchantName: "MakeMyTrip", amount: -15000, date: "6 days ago", timestamp: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Travel", status: "SUCCESS", referenceId: "MMT-9182", paymentMode: "Card", remarks: "Flight booking" },
  { id: "TX-013", accountId: "ACC-001", merchantName: "ATM Withdrawal", amount: -5000, date: "1 week ago", timestamp: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Others", status: "SUCCESS", referenceId: "ATM-9912", paymentMode: "Cash", remarks: "HDFC ATM" },
  { id: "TX-014", accountId: "ACC-002", merchantName: "Software License", amount: -25000, date: "1 week ago", timestamp: new Date(Date.now() - 170 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Bills", status: "SUCCESS", referenceId: "LIC-001", paymentMode: "Card", remarks: "Annual License" },
  { id: "TX-015", accountId: "RD-001", merchantName: "RD Installment", amount: -15000, date: "2 weeks ago", timestamp: new Date(Date.now() - 336 * 60 * 60 * 1000).toISOString(), type: "DEBIT", category: "Investment", status: "SUCCESS", referenceId: "RD-INST-01", paymentMode: "Auto-debit", remarks: "Monthly Installment" }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockApi = {
  getAccounts: async (): Promise<Account[]> => {
    await delay(500);
    return [...accounts];
  },
  getTransactions: async (accountId?: string): Promise<Transaction[]> => {
    await delay(300);
    if (!accountId || accountId === "ALL") {
      return transactions;
    }
    return transactions.filter(t => t.accountId === accountId);
  },
  getBeneficiaries: async (): Promise<Beneficiary[]> => {
    await delay(300);
    return [
      { id: "BEN-01", name: "Rajat Sharma", bankName: "ICICI Bank", accountNumber: "xxxx-xxxx-3412", ifsc: "ICIC0001234", upiId: "rajat.s@icici" },
      { id: "BEN-02", name: "Sneha Gupta", bankName: "SBI", accountNumber: "xxxx-xxxx-9912", ifsc: "SBIN0004321", upiId: "sneha.g@sbi" },
      { id: "BEN-03", name: "Aakash Singh", bankName: "Axis Bank", accountNumber: "xxxx-xxxx-8811", ifsc: "UTIB0009876", upiId: "aakash@okaxis" },
      { id: "BEN-04", name: "Priya Ranjan", bankName: "HDFC Bank", accountNumber: "xxxx-xxxx-4411", ifsc: "HDFC0001111", upiId: "priya@hdfcbank" }
    ];
  },
  getScheduledTransfers: async (): Promise<ScheduledTransfer[]> => {
    await delay(300);
    return [
      { 
        id: "SCH-01", beneficiaryId: "BEN-04", beneficiaryName: "HDFC Bank Home Loan", 
        purpose: "EMI", fromAccountId: "ACC-01", amount: 25000, frequency: "MONTHLY", 
        isRecurring: true, transferMode: "NEFT", startDate: "15 Jan 2026", nextDate: "15 Sep 2026", 
        status: "ACTIVE", history: [
          { date: "15 Aug 2026", amount: 25000, status: "SUCCESS" },
          { date: "15 Jul 2026", amount: 25000, status: "SUCCESS" }
        ]
      },
      { 
        id: "SCH-02", beneficiaryId: "BEN-01", beneficiaryName: "Rajat Sharma", 
        purpose: "Rent", fromAccountId: "ACC-01", amount: 15000, frequency: "MONTHLY", 
        isRecurring: true, transferMode: "IMPS", startDate: "01 Feb 2026", nextDate: "01 Sep 2026", 
        status: "ACTIVE", history: [
          { date: "01 Aug 2026", amount: 15000, status: "SUCCESS" }
        ]
      },
      { 
        id: "SCH-03", beneficiaryId: "BEN-02", beneficiaryName: "Sneha Gupta", 
        purpose: "Family Support", fromAccountId: "ACC-02", amount: 5000, frequency: "ONCE", 
        isRecurring: false, transferMode: "UPI", startDate: "12 Aug 2026", nextDate: "12 Aug 2026", 
        status: "FAILED", history: [
          { date: "12 Aug 2026", amount: 5000, status: "FAILED" }
        ]
      },
      { 
        id: "SCH-04", beneficiaryId: "BEN-03", beneficiaryName: "Aakash Singh", 
        purpose: "Utility Bill", fromAccountId: "ACC-01", amount: 2500, frequency: "MONTHLY", 
        isRecurring: true, transferMode: "IMPS", startDate: "10 Mar 2026", nextDate: "10 Sep 2026", 
        status: "PAUSED", history: [
          { date: "10 Aug 2026", amount: 2500, status: "SUCCESS" }
        ]
      }
    ];
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
