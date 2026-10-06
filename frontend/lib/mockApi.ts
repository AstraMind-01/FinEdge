import { 
  Account, Transaction, Beneficiary, ScheduledTransfer, IntlBeneficiary, 
  ExchangeRate, BankCard, CardOffer, Loan, Holding, SIP, InvestmentGoal, 
  PortfolioDataPoint, LoanApplication, Deposit, UserAddress, VerificationEvent, 
  RecentBeneficiaryTransfer 
} from "../types";

import {
  beneficiaryStore,
  recentBeneficiaryTransfersStore,
  accounts,
  cards,
  cardOffers,
  loans,
  loanApplications,
  transactions,
  delay
} from "./mockData/initialData";

import { DepositMockService } from "./mockServices/depositService";
import { InvestmentMockService } from "./mockServices/investmentService";
import { KycAddressMockService } from "./mockServices/kycAddressService";

let beneficiariesList = beneficiaryStore;
let recentTransfersList = recentBeneficiaryTransfersStore;
let cardsList = cards;

export const MockApi = {
  getAccounts: async (): Promise<Account[]> => {
    await delay(500);
    return [...accounts];
  },

  getCards: async (): Promise<BankCard[]> => {
    await delay(300);
    return [...cardsList];
  },

  addCard: async (newCard: BankCard): Promise<BankCard[]> => {
    await delay(300);
    cardsList.unshift(newCard);
    return [...cardsList];
  },

  updateCardStatus: async (cardId: string, status: "ACTIVE" | "FROZEN" | "BLOCKED"): Promise<BankCard[]> => {
    await delay(200);
    cardsList = cardsList.map(c => c.id === cardId ? { ...c, status } : c);
    return [...cardsList];
  },

  getCardOffers: async (): Promise<CardOffer[]> => {
    await delay(200);
    return [...cardOffers];
  },

  getLoans: async (): Promise<Loan[]> => {
    await delay(300);
    return [...loans];
  },

  getHoldings: InvestmentMockService.getHoldings,
  getSIPs: InvestmentMockService.getSIPs,
  getInvestmentGoals: InvestmentMockService.getInvestmentGoals,
  getPortfolioData: InvestmentMockService.getPortfolioData,
  executeInvestment: InvestmentMockService.executeInvestment,
  investMutualFund: InvestmentMockService.investMutualFund,

  getTransactions: async (accountId?: string): Promise<Transaction[]> => {
    await delay(300);
    if (!accountId || accountId === "ALL" || accountId === "all") {
      return transactions;
    }
    return transactions.filter(t => t.accountId === accountId);
  },

  transferFunds: async (fromId: string, toId: string, amount: number): Promise<boolean> => {
    await delay(800);
    const fromAccount = accounts.find(a => a.id === fromId);
    const toAccount = accounts.find(a => a.id === toId);

    if (!fromAccount || !toAccount) {
      throw new Error("Account not found");
    }
    if (fromAccount.status !== "ACTIVE") {
      throw new Error(`Source account is ${fromAccount.status.toLowerCase()} and cannot perform transfers.`);
    }
    if (fromAccount.balance < amount) {
      throw new Error("Insufficient balance for transfer");
    }
    if (fromAccount.transactionLimit && amount > fromAccount.transactionLimit) {
      throw new Error(`Amount exceeds per-transaction limit of ₹${fromAccount.transactionLimit.toLocaleString('en-IN')}`);
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

  updateLimits: async (accountId: string, dailyLimit: number, transactionLimit: number, atmLimit: number): Promise<boolean> => {
    await delay(500);
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      account.dailyLimit = dailyLimit;
      account.transactionLimit = transactionLimit;
      account.atmLimit = atmLimit;
      return true;
    }
    return false;
  },

  toggleFreezeAccount: async (accountId: string): Promise<Account> => {
    await delay(600);
    const account = accounts.find(a => a.id === accountId);
    if (!account) throw new Error("Account not found");
    account.status = account.status === "ACTIVE" ? "FROZEN" : "ACTIVE";
    return { ...account };
  },

  requestBalanceAccess: async (accountId: string): Promise<string> => {
    await delay(300);
    return `TOKEN-${accountId}-${Date.now()}`;
  },

  verifyBalanceAccess: async (accountId: string, token: string): Promise<boolean> => {
    await delay(800);
    return token.startsWith(`TOKEN-${accountId}`);
  },

  payBill: async (accountId: string, billerName: string, category: string, amount: number): Promise<boolean> => {
    await delay(800);
    const account = accounts.find(a => a.id === accountId);
    if (!account) throw new Error("Account not found");
    if (account.status !== "ACTIVE") throw new Error("Account is not active");
    if (account.balance < amount) throw new Error("Insufficient balance for bill payment");

    account.balance -= amount;
    transactions.unshift({
      id: `TX-${Date.now()}-BILL`,
      accountId: accountId,
      merchantName: `${category}: ${billerName}`,
      amount: -amount,
      date: "Just now",
      type: "DEBIT",
      category: "Bills"
    });
    return true;
  },

  rechargeMobile: async (accountId: string, mobileNumber: string, operator: string, amount: number): Promise<boolean> => {
    await delay(800);
    const account = accounts.find(a => a.id === accountId);
    if (!account) throw new Error("Account not found");
    if (account.status !== "ACTIVE") throw new Error("Account is not active");
    if (account.balance < amount) throw new Error("Insufficient balance for recharge");

    account.balance -= amount;
    transactions.unshift({
      id: `TX-${Date.now()}-RCHG`,
      accountId: accountId,
      merchantName: `Recharge: ${operator} (${mobileNumber})`,
      amount: -amount,
      date: "Just now",
      type: "DEBIT",
      category: "Bills"
    });
    return true;
  },

  createFixedDeposit: DepositMockService.createFixedDeposit,
  getDeposits: DepositMockService.getDeposits,
  openNewDeposit: DepositMockService.openNewDeposit,
  breakDeposit: DepositMockService.breakDeposit,
  payRdInstallment: DepositMockService.payRdInstallment,

  getUserAddress: KycAddressMockService.getUserAddress,
  updateUserAddress: KycAddressMockService.updateUserAddress,
  getVerificationJourney: KycAddressMockService.getVerificationJourney,
  addVerificationEvent: KycAddressMockService.addVerificationEvent,

  getBeneficiaries: async (): Promise<Beneficiary[]> => {
    await delay(300);
    return [...beneficiariesList];
  },

  addBeneficiary: async (b: Partial<Beneficiary>): Promise<Beneficiary[]> => {
    await delay(500);
    const newB: Beneficiary = {
      id: `BEN-0${beneficiariesList.length + 1}`,
      code: `BEN-0${beneficiariesList.length + 1}`,
      name: b.name || "Unknown",
      bankName: b.bankName || "FinEdge Bank",
      accountNumber: b.accountNumber || "1234567890",
      ifsc: b.ifsc || "HDFC0001234",
      ifscCode: b.ifscCode || b.ifsc || "HDFC0001234",
      upiId: b.upiId,
      transferLimit: b.transferLimit || 100000,
      status: "ACTIVE",
      category: b.category || "Domestic",
      addedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    beneficiariesList.unshift(newB);
    return [...beneficiariesList];
  },

  deleteBeneficiary: async (id: string): Promise<Beneficiary[]> => {
    await delay(300);
    beneficiariesList = beneficiariesList.filter(b => b.id !== id);
    return [...beneficiariesList];
  },

  getRecentBeneficiaryTransfers: async (): Promise<RecentBeneficiaryTransfer[]> => {
    await delay(200);
    return [...recentTransfersList];
  },

  getScheduledTransfers: async (): Promise<ScheduledTransfer[]> => {
    await delay(300);
    return [
      {
        id: "SCHED-01",
        fromAccountId: "ACC-001",
        toAccountName: "House Rent - Sneha Gupta",
        toAccountNumber: "•••• 9912",
        toBankName: "State Bank of India",
        amount: 25000,
        frequency: "MONTHLY",
        startDate: "2026-09-01",
        nextExecutionDate: "2026-09-01",
        category: "Rent",
        status: "ACTIVE",
        remarks: "Apartment 402 Rent",
        executionsCount: 8,
        history: [
          { id: "EX-101", date: "2026-08-01", amount: 25000, status: "SUCCESS", referenceId: "TX-SCHED-9912" },
          { id: "EX-102", date: "2026-07-01", amount: 25000, status: "SUCCESS", referenceId: "TX-SCHED-8821" }
        ]
      },
      {
        id: "SCHED-02",
        fromAccountId: "ACC-001",
        toAccountName: "SIP - Parag Parikh Flexi Cap",
        toAccountNumber: "•••• 3412",
        toBankName: "ICICI Mutual Fund Desk",
        amount: 10000,
        frequency: "MONTHLY",
        startDate: "2026-09-10",
        nextExecutionDate: "2026-09-10",
        category: "Investment",
        status: "ACTIVE",
        remarks: "Systematic Investment Plan",
        executionsCount: 14,
        history: [
          { id: "EX-201", date: "2026-08-10", amount: 10000, status: "SUCCESS", referenceId: "TX-SCHED-7744" }
        ]
      }
    ];
  },

  addScheduledTransfer: async (transfer: Partial<ScheduledTransfer>): Promise<ScheduledTransfer> => {
    await delay(500);
    return {
      id: `SCHED-${Date.now()}`,
      fromAccountId: transfer.fromAccountId || "ACC-001",
      toAccountName: transfer.toAccountName || "Direct Recipient",
      toAccountNumber: transfer.toAccountNumber || "•••• 0000",
      toBankName: transfer.toBankName || "National Bank",
      amount: transfer.amount || 1000,
      frequency: transfer.frequency || "MONTHLY",
      startDate: transfer.startDate || new Date().toISOString().split("T")[0],
      nextExecutionDate: transfer.nextExecutionDate || new Date().toISOString().split("T")[0],
      category: transfer.category || "General",
      status: "ACTIVE",
      remarks: transfer.remarks || "Automated Schedule",
      executionsCount: 0,
      history: []
    };
  },

  cancelScheduledTransfer: async (id: string): Promise<boolean> => {
    await delay(300);
    return true;
  },

  getIntlBeneficiaries: async (): Promise<IntlBeneficiary[]> => {
    await delay(300);
    return [
      { id: "INTL-01", name: "David Smith", country: "United States", countryCode: "US", bankName: "Chase Bank", swiftCode: "CHASUS33", iban: "US00CHAS000123456789", bankAddress: "New York, NY", recipientAddress: "123 Broadway, NY" },
      { id: "INTL-02", name: "Sarah Jones", country: "United Kingdom", countryCode: "GB", bankName: "Barclays", swiftCode: "BARCGB22", iban: "GB00BARC200000123456", bankAddress: "London, UK", recipientAddress: "45 Oxford St, London" },
      { id: "INTL-03", name: "Michael Wong", country: "Singapore", countryCode: "SG", bankName: "DBS Bank", swiftCode: "DBSSSG", iban: "SG00DBS0000001234567", bankAddress: "Marina Bay, SG", recipientAddress: "10 Bayfront Ave, SG" }
    ];
  },

  getExchangeRates: async (): Promise<ExchangeRate[]> => {
    await delay(100);
    return [
      { currency: "USD", countryCode: "US", rate: 83.42, trend: "up" },
      { currency: "EUR", countryCode: "EU", rate: 90.15, trend: "up" },
      { currency: "GBP", countryCode: "GB", rate: 105.60, trend: "down" },
      { currency: "AED", countryCode: "AE", rate: 22.71, trend: "up" },
      { currency: "SGD", countryCode: "SG", rate: 61.85, trend: "down" }
    ];
  },

  submitLoanApplication: async (data: Partial<LoanApplication>): Promise<LoanApplication> => {
    await delay(800);
    const newApp: LoanApplication = {
      id: `APP-${Date.now()}`,
      referenceNumber: `LN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      loanType: data.loanType || "PERSONAL",
      loanTypeName: data.loanTypeName || "Personal Loan",
      requestedAmount: data.requestedAmount || 500000,
      tenureMonths: data.tenureMonths || 36,
      interestRate: data.interestRate || 10.25,
      calculatedEmi: data.calculatedEmi || 16200,
      status: "APPROVED",
      submittedAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      dynamicFields: data.dynamicFields || {},
      uploadedDocuments: data.uploadedDocuments || [],
      eligibilityScore: data.eligibilityScore || 85,
      foirRatio: data.foirRatio || 35,
    };
    loanApplications.unshift(newApp);
    return newApp;
  },

  getLoanApplications: async (): Promise<LoanApplication[]> => {
    await delay(200);
    return loanApplications;
  }
};
