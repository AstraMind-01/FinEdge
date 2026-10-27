import { Account, Transaction, Beneficiary, ScheduledTransfer, IntlBeneficiary, ExchangeRate, BankCard, CardOffer, Loan, Holding, SIP, InvestmentGoal, PortfolioDataPoint, LoanApplication, Deposit, UserAddress, VerificationEvent, RecentBeneficiaryTransfer } from "../types";

let beneficiaryStore: Beneficiary[] = [
  { id: "BEN-01", code: "BEN-01", name: "Rajat Sharma", bankName: "ICICI Bank", accountNumber: "987654323412", ifsc: "ICIC0001234", ifscCode: "ICIC0001234", upiId: "rajat.s@icici", transferLimit: 200000, status: "ACTIVE", category: "Domestic", addedAt: "10 Oct 2023" },
  { id: "BEN-02", code: "BEN-02", name: "Sneha Gupta", bankName: "SBI", accountNumber: "887766559912", ifsc: "SBIN0004321", ifscCode: "SBIN0004321", upiId: "sneha.g@sbi", transferLimit: 150000, status: "ACTIVE", category: "Domestic", addedAt: "15 Jan 2024" },
  { id: "BEN-03", code: "BEN-03", name: "Aakash Singh", bankName: "Axis Bank", accountNumber: "112233448811", ifsc: "UTIB0009876", ifscCode: "UTIB0009876", upiId: "aakash@okaxis", transferLimit: 300000, status: "ACTIVE", category: "Domestic", addedAt: "04 Mar 2024" },
  { id: "BEN-04", code: "BEN-04", name: "Priya Ranjan", bankName: "HDFC Bank", accountNumber: "554433224411", ifsc: "HDFC0001111", ifscCode: "HDFC0001111", upiId: "priya@hdfcbank", transferLimit: 500000, status: "ACTIVE", category: "Domestic", addedAt: "20 May 2024" }
];

let recentBeneficiaryTransfersStore: RecentBeneficiaryTransfer[] = [
  { id: "RBT-001", beneficiaryId: "BEN-04", name: "Priya Sharma", amount: 15000, formattedAmount: "₹ 15,000", date: "Today", avatarUrl: "https://i.pravatar.cc/150?u=priya", bankName: "HDFC Bank", accountNumber: "•••• 4411" },
  { id: "RBT-002", beneficiaryId: "BEN-01", name: "Rahul Verma", amount: 8500, formattedAmount: "₹ 8,500", date: "Yesterday", avatarUrl: null, bankName: "ICICI Bank", accountNumber: "•••• 3412" },
  { id: "RBT-003", beneficiaryId: "BEN-02", name: "Neha Gupta", amount: 25000, formattedAmount: "₹ 25,000", date: "12 Aug", avatarUrl: "https://i.pravatar.cc/150?u=neha", bankName: "SBI", accountNumber: "•••• 9912" }
];

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
    interestRate: 3.5,
    dailyLimit: 200000.00,
    transactionLimit: 50000.00,
    atmLimit: 25000.00
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
    linkedCard: "Mastercard Business •••• 8821",
    dailyLimit: 500000.00,
    transactionLimit: 100000.00,
    atmLimit: 50000.00
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

let cards: BankCard[] = [
  {
    id: "CARD-001",
    name: "FinEdge Signature Credit Card",
    cardHolderName: "Soumya Ranjan",
    cardholderName: "Soumya Ranjan",
    cardNumber: "•••• •••• •••• 4599",
    fullNumber: "4599 8812 3456 4599",
    maskedNumber: "•••• 4599",
    expiryDate: "08/29",
    expiry: "08/29",
    cvv: "882",
    type: "CREDIT",
    variant: "Signature Infinite",
    tier: "Infinite",
    theme: "purple-gold",
    status: "ACTIVE",
    network: "VISA",
    linkedAccountId: "ACC-001",
    creditLimit: 500000,
    availableCredit: 425000,
    spentThisMonth: 75000,
    dueDate: "20 Aug 2026",
    minAmountDue: 3750,
    rewardPoints: 12450,
    rewardsPoints: 12450,
    isDefault: true,
    controls: {
      onlineTransactions: true,
      internationalTx: true,
      internationalUsage: true,
      contactless: true,
      contactlessPayments: true,
      atmWithdrawals: true,
      posTransactions: true,
      dailyLimit: 200000,
      atmLimit: 50000,
      dailyAtmLimit: 50000,
      dailyPosLimit: 150000,
      onlineLimit: 200000
    }
  },
  {
    id: "CARD-002",
    name: "FinEdge Platinum Debit Card",
    cardHolderName: "Soumya Ranjan",
    cardholderName: "Soumya Ranjan",
    cardNumber: "•••• •••• •••• 8821",
    fullNumber: "5241 9912 3341 8821",
    maskedNumber: "•••• 8821",
    expiryDate: "11/28",
    expiry: "11/28",
    cvv: "341",
    type: "DEBIT",
    variant: "Platinum Debit",
    tier: "Platinum",
    theme: "navy-gold",
    status: "ACTIVE",
    network: "MASTERCARD",
    linkedAccountId: "ACC-001",
    rewardPoints: 3200,
    rewardsPoints: 3200,
    isDefault: false,
    controls: {
      onlineTransactions: true,
      internationalTx: false,
      internationalUsage: false,
      contactless: true,
      contactlessPayments: true,
      atmWithdrawals: true,
      posTransactions: true,
      dailyLimit: 100000,
      atmLimit: 25000,
      dailyAtmLimit: 25000,
      dailyPosLimit: 75000,
      onlineLimit: 100000
    }
  },
  {
    id: "CARD-003",
    name: "FinEdge Instant Virtual Card",
    cardHolderName: "Soumya Ranjan",
    cardholderName: "Soumya Ranjan",
    cardNumber: "•••• •••• •••• 9012",
    fullNumber: "4111 2233 4455 9012",
    maskedNumber: "•••• 9012",
    expiryDate: "12/30",
    expiry: "12/30",
    cvv: "992",
    type: "DEBIT",
    variant: "Virtual Cyber",
    tier: "Virtual",
    theme: "teal-silver",
    status: "ACTIVE",
    network: "VISA",
    linkedAccountId: "ACC-001",
    rewardPoints: 8500,
    rewardsPoints: 8500,
    isDefault: false,
    controls: {
      onlineTransactions: true,
      internationalTx: true,
      internationalUsage: true,
      contactless: false,
      contactlessPayments: false,
      atmWithdrawals: false,
      posTransactions: false,
      dailyLimit: 150000,
      atmLimit: 0,
      dailyAtmLimit: 0,
      dailyPosLimit: 0,
      onlineLimit: 150000
    }
  }
];

let cardOffers: CardOffer[] = [
  { id: "OFF-01", title: "10% Cashback on Amazon & Flipkart", description: "Get up to ₹1,500 cashback on electronics & fashion", merchant: "Amazon & Flipkart", merchantName: "Amazon & Flipkart", discount: "10% OFF", discountDesc: "10% OFF", validUntil: "31 Aug 2026", validTill: "31 Aug 2026", code: "FINEDG10", category: "Shopping" },
  { id: "OFF-02", title: "Free Airport Lounge Access", description: "Enjoy 2 complimentary lounge visits per quarter across India", merchant: "DreamFolks Lounge", merchantName: "DreamFolks Lounge", discount: "FREE ACCESS", discountDesc: "FREE ACCESS", validUntil: "31 Dec 2026", validTill: "31 Dec 2026", category: "Travel" },
  { id: "OFF-03", title: "20% OFF on Zomato Dining", description: "Save up to ₹500 on fine dining restaurants", merchant: "Zomato", merchantName: "Zomato", discount: "20% OFF", discountDesc: "20% OFF", validUntil: "15 Sep 2026", validTill: "15 Sep 2026", code: "ZOMATOFIN", category: "Food" }
];

let depositsStore: Deposit[] = [
  {
    id: "FD-001",
    name: "Tax Saver Fixed Deposit",
    type: "FD",
    principalAmount: 150000,
    interestRate: 8.50,
    startDate: "2024-01-15",
    maturityDate: "2029-01-15",
    maturityAmount: 228420,
    status: "ACTIVE",
    accumulatedAmount: 178500
  },
  {
    id: "FD-002",
    name: "High Yield Fixed Deposit",
    type: "FD",
    principalAmount: 300000,
    interestRate: 8.10,
    startDate: "2025-06-10",
    maturityDate: "2028-06-10",
    maturityAmount: 380450,
    status: "ACTIVE",
    accumulatedAmount: 328400
  },
  {
    id: "RD-001",
    name: "Monthly Wealth Recurring Deposit",
    type: "RD",
    principalAmount: 120000,
    monthlyDepositAmount: 10000,
    monthlyInstallment: 10000,
    interestRate: 7.80,
    startDate: "2025-09-01",
    maturityDate: "2026-09-01",
    maturityAmount: 125180,
    totalDepositedAmount: 110000,
    accumulatedAmount: 118400,
    nextDueDate: "2026-09-01",
    status: "ACTIVE"
  }
];

let userAddressStore: UserAddress = {
  currentAddress: "402, Skyline Towers, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051",
  permanentAddress: "402, Skyline Towers, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051",
  isSameAsCurrent: true,
  proofDocumentType: "Passport / Driving License",
  lastUpdated: "15 Mar 2026"
};

let verificationEventsStore: VerificationEvent[] = [
  { id: "VE-01", label: "Account Opened", date: "OCT 2021", status: "completed", description: "Primary Savings Account opened at Mumbai Corporate Branch" },
  { id: "VE-02", label: "Docs Submitted", date: "OCT 2021", status: "completed", description: "Aadhaar, PAN & Passport documents uploaded" },
  { id: "VE-03", label: "In Progress", date: "NOV 2021", status: "completed", description: "Central KYC Registry verification completed" },
  { id: "VE-04", label: "KYC Approved", date: "MAR 2026", status: "completed", description: "Full CKYC verified & active status granted" }
];

let loans: Loan[] = [
  {
    id: "LOAN-001",
    name: "HDFC Home Loan",
    accountNumber: "HL-8821-9901",
    type: "HOME",
    status: "ACTIVE",
    originalAmount: 3500000,
    outstandingBalance: 2450000,
    interestRate: 8.4,
    totalTenure: 240,
    emiPaid: 48,
    nextEmiAmount: 25000,
    nextEmiDate: "15 Sep 2026",
    disbursementDate: "15 Sep 2022",
    monthlyEmi: 25000,
    interestPaidThisYear: 185000,
    emiSchedule: [
      { month: "Aug 2026", dueDate: "15 Aug 2026", amount: 25000, principal: 7850, interest: 17150, status: "PAID" },
      { month: "Jul 2026", dueDate: "15 Jul 2026", amount: 25000, principal: 7790, interest: 17210, status: "PAID" },
      { month: "Sep 2026", dueDate: "15 Sep 2026", amount: 25000, principal: 7910, interest: 17090, status: "PENDING" }
    ]
  },
  {
    id: "LOAN-002",
    name: "ICICI Personal Loan",
    accountNumber: "PL-3412-1002",
    type: "PERSONAL",
    status: "ACTIVE",
    originalAmount: 500000,
    outstandingBalance: 175000,
    interestRate: 11.5,
    totalTenure: 36,
    emiPaid: 24,
    nextEmiAmount: 16500,
    nextEmiDate: "05 Sep 2026",
    disbursementDate: "05 Sep 2024",
    monthlyEmi: 16500,
    interestPaidThisYear: 28500,
    emiSchedule: [
      { month: "Aug 2026", dueDate: "05 Aug 2026", amount: 16500, principal: 14800, interest: 1700, status: "PAID" },
      { month: "Sep 2026", dueDate: "05 Sep 2026", amount: 16500, principal: 14950, interest: 1550, status: "PENDING" }
    ]
  }
];

let holdings: Holding[] = [
  { id: "HLD-01", name: "Axis Bluechip Fund Direct-Growth", category: "Large Cap Mutual Fund", units: 450.25, avgNav: 45.2, investedAmount: 20351, currentValue: 28450 },
  { id: "HLD-02", name: "Nippon India Small Cap Fund", category: "Small Cap Mutual Fund", units: 1200.5, avgNav: 98.4, investedAmount: 118129, currentValue: 168400 },
  { id: "HLD-03", name: "Parag Parikh Flexi Cap Fund", category: "Flexi Cap Mutual Fund", units: 890.1, avgNav: 62.1, investedAmount: 55275, currentValue: 82100 },
  { id: "HLD-04", name: "Reliance Industries Ltd (RIL)", category: "Equity Stock", units: 50, avgNav: 2450.0, investedAmount: 122500, currentValue: 148500 }
];

let sips: SIP[] = [
  { 
    id: "SIP-01", 
    fundName: "Axis Bluechip Fund Direct-Growth", 
    fundHouse: "Axis Mutual Fund",
    category: "Large Cap Equity",
    nav: 54.80,
    returns3Y: 18.4,
    returns5Y: 22.1,
    rating: 5,
    riskGrade: "Very High Risk",
    amount: 5000, 
    monthlyAmount: 5000,
    frequency: "Monthly (10th)", 
    debitDate: 10,
    nextDebitDate: "10 Sep 2026",
    status: "ACTIVE",
    totalInvested: 60000,
    currentValue: 74200,
    installmentsPaid: 12,
    stepUpPercent: 10,
    linkedAccount: "Primary Savings ACC-001 •••• 8812",
    folioNumber: "FOL-992184-AX"
  },
  { 
    id: "SIP-02", 
    fundName: "Nippon India Small Cap Fund", 
    fundHouse: "Nippon India Mutual Fund",
    category: "Small Cap Equity",
    nav: 142.50,
    returns3Y: 28.6,
    returns5Y: 34.2,
    rating: 5,
    riskGrade: "Very High Risk",
    amount: 7500, 
    monthlyAmount: 7500,
    frequency: "Monthly (15th)", 
    debitDate: 15,
    nextDebitDate: "15 Sep 2026",
    status: "ACTIVE",
    totalInvested: 90000,
    currentValue: 128400,
    installmentsPaid: 12,
    stepUpPercent: 15,
    linkedAccount: "Primary Savings ACC-001 •••• 8812",
    folioNumber: "FOL-334189-NP"
  },
  { 
    id: "SIP-03", 
    fundName: "Parag Parikh Flexi Cap Fund", 
    fundHouse: "PPFAS Mutual Fund",
    category: "Flexi Cap Equity",
    nav: 84.10,
    returns3Y: 21.2,
    returns5Y: 25.8,
    rating: 5,
    riskGrade: "Very High Risk",
    amount: 10000, 
    monthlyAmount: 10000,
    frequency: "Monthly (05th)", 
    debitDate: 5,
    nextDebitDate: "05 Sep 2026",
    status: "ACTIVE",
    totalInvested: 120000,
    currentValue: 156800,
    installmentsPaid: 12,
    stepUpPercent: 10,
    linkedAccount: "Primary Savings ACC-001 •••• 8812",
    folioNumber: "FOL-109284-PP"
  }
];

let goals: InvestmentGoal[] = [
  { id: "GOL-01", name: "Dream House Down Payment", targetAmount: 2500000, currentAmount: 1850000, targetDate: "Dec 2028", percentAchieved: 74 },
  { id: "GOL-02", name: "Higher Education Fund", targetAmount: 1500000, currentAmount: 920000, targetDate: "Jun 2030", percentAchieved: 61 },
  { id: "GOL-03", name: "Europe Vacation 2027", targetAmount: 500000, currentAmount: 410000, targetDate: "May 2027", percentAchieved: 82 }
];

let portfolioData: PortfolioDataPoint[] = [
  { month: "Jan", value: 310000 },
  { month: "Feb", value: 325000 },
  { month: "Mar", value: 340000 },
  { month: "Apr", value: 355000 },
  { month: "May", value: 370000 },
  { month: "Jun", value: 395000 },
  { month: "Jul", value: 410000 },
  { month: "Aug", value: 427450 }
];

let loanApplications: LoanApplication[] = [
  {
    id: "APP-101",
    referenceNumber: "LN-2026-994102",
    loanType: "HOME",
    loanTypeName: "Home Loan",
    requestedAmount: 3500000,
    tenureMonths: 240,
    interestRate: 8.50,
    calculatedEmi: 30372,
    status: "APPROVED",
    submittedAt: "10 Aug 2026, 11:30 AM",
    dynamicFields: { propertyValue: 4500000, propertyStatus: "Ready to Move" },
    uploadedDocuments: [{ name: "PAN_Card.pdf", type: "pdf", size: "1.2 MB", status: "VERIFIED" }],
    eligibilityScore: 92,
    foirRatio: 32
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
  getCards: async (): Promise<BankCard[]> => {
    await delay(300);
    return [...cards];
  },
  addCard: async (newCard: BankCard): Promise<BankCard[]> => {
    await delay(300);
    cards.unshift(newCard);
    return [...cards];
  },
  updateCardStatus: async (cardId: string, status: "ACTIVE" | "FROZEN" | "BLOCKED"): Promise<BankCard[]> => {
    await delay(200);
    cards = cards.map(c => c.id === cardId ? { ...c, status } : c);
    return [...cards];
  },
  getCardOffers: async (): Promise<CardOffer[]> => {
    await delay(200);
    return [...cardOffers];
  },
  getLoans: async (): Promise<Loan[]> => {
    await delay(300);
    return [...loans];
  },
  getHoldings: async (): Promise<Holding[]> => {
    await delay(300);
    return [...holdings];
  },
  getSIPs: async (): Promise<SIP[]> => {
    await delay(300);
    return [...sips];
  },
  getInvestmentGoals: async (): Promise<InvestmentGoal[]> => {
    await delay(300);
    return [...goals];
  },
  getPortfolioData: async (): Promise<PortfolioDataPoint[]> => {
    await delay(200);
    return [...portfolioData];
  },
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
  createFixedDeposit: async (sourceAccountId: string, amount: number, tenureMonths: number, interestRate: number): Promise<Account> => {
    await delay(1000);
    const source = accounts.find(a => a.id === sourceAccountId);
    if (!source) throw new Error("Source account not found");
    if (source.status !== "ACTIVE") throw new Error("Source account is not active");
    if (source.balance < amount) throw new Error("Insufficient balance to open FD");

    source.balance -= amount;

    const fdNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const maturityYear = new Date().getFullYear() + Math.ceil(tenureMonths / 12);
    const maturityDate = `${maturityYear}-12-31`;

    const newFd: Account = {
      id: `FD-${Date.now()}`,
      type: "FIXED_DEPOSIT",
      name: `${tenureMonths / 12} Yr Fixed Deposit`,
      maskedNumber: `•••• ${fdNumber}`,
      lastFour: fdNumber,
      balance: amount,
      currency: "INR",
      status: "ACTIVE",
      accountHolder: source.accountHolder,
      interestRate: interestRate,
      maturityDate: maturityDate,
      ifsc: source.ifsc,
      branch: source.branch,
      openingDate: new Date().toISOString().split("T")[0],
      nominee: source.nominee,
      nomineeRelation: source.nomineeRelation,
      interestEarned: Math.round(amount * (interestRate / 100) * (tenureMonths / 12))
    };

    accounts.push(newFd);

    transactions.unshift({
      id: `TX-${Date.now()}-FD`,
      accountId: sourceAccountId,
      merchantName: `FD Creation (${newFd.maskedNumber})`,
      amount: -amount,
      date: "Just now",
      type: "DEBIT",
      category: "Transfer"
    });

    return newFd;
  },
  investMutualFund: async (accountId: string, fundName: string, amount: number, isSip: boolean): Promise<boolean> => {
    await delay(800);
    const account = accounts.find(a => a.id === accountId);
    if (!account) throw new Error("Account not found");
    if (account.status !== "ACTIVE") throw new Error("Account is not active");
    if (account.balance < amount) throw new Error("Insufficient balance for investment");

    account.balance -= amount;
    transactions.unshift({
      id: `TX-${Date.now()}-MF`,
      accountId: accountId,
      merchantName: `${isSip ? 'SIP' : 'Lump-sum'}: ${fundName}`,
      amount: -amount,
      date: "Just now",
      type: "DEBIT",
      category: "Shopping"
    });
    return true;
  },
  getBeneficiaries: async (query?: string, categoryFilter?: string): Promise<Beneficiary[]> => {
    await delay(200);
    let list = [...beneficiaryStore];
    if (categoryFilter && categoryFilter !== "All") {
      list = list.filter(b => (b.category || "Domestic") === categoryFilter);
    }
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase();
      list = list.filter(b => 
        b.name.toLowerCase().includes(q) || 
        b.bankName.toLowerCase().includes(q) || 
        b.accountNumber.includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    }
    return list;
  },
  addBeneficiary: async (benData: Partial<Beneficiary>): Promise<Beneficiary> => {
    await delay(400);
    const newId = `BEN-0${beneficiaryStore.length + 1}`;
    const newBen: Beneficiary = {
      id: newId,
      code: newId,
      name: benData.name || "New Beneficiary",
      bankName: benData.bankName || "HDFC Bank",
      accountNumber: benData.accountNumber || "998877665544",
      ifsc: benData.ifsc || benData.ifscCode || "HDFC0001234",
      ifscCode: benData.ifsc || benData.ifscCode || "HDFC0001234",
      upiId: benData.upiId || `${(benData.name || "user").toLowerCase().replace(/\s+/g, ".")}@upi`,
      accountType: benData.accountType || "SAVINGS",
      transferLimit: benData.transferLimit || 100000,
      coolingPeriodUntil: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "COOLING_PERIOD",
      addedAt: "Just now",
      category: benData.category || "Domestic",
      avatarUrl: benData.avatarUrl || undefined
    };
    beneficiaryStore.unshift(newBen);
    return newBen;
  },
  updateBeneficiary: async (id: string, updated: Partial<Beneficiary>): Promise<Beneficiary> => {
    await delay(300);
    const idx = beneficiaryStore.findIndex(b => b.id === id);
    if (idx !== -1) {
      beneficiaryStore[idx] = { ...beneficiaryStore[idx], ...updated };
      return beneficiaryStore[idx];
    }
    throw new Error("Beneficiary not found");
  },
  deleteBeneficiary: async (id: string): Promise<boolean> => {
    await delay(300);
    beneficiaryStore = beneficiaryStore.filter(b => b.id !== id);
    return true;
  },
  getRecentBeneficiaryTransfers: async (): Promise<RecentBeneficiaryTransfer[]> => {
    await delay(200);
    return [...recentBeneficiaryTransfersStore];
  },
  sendMoneyToBeneficiary: async (
    fromAccountId: string,
    beneficiaryId: string,
    amount: number,
    mode: string = "IMPS",
    note?: string
  ): Promise<Transaction> => {
    await delay(500);
    const acc = accounts.find(a => a.id === fromAccountId) || accounts[0];
    if (!acc) throw new Error("Source account not found");
    if (acc.balance < amount) throw new Error("Insufficient account balance");

    const ben = beneficiaryStore.find(b => b.id === beneficiaryId || b.name.toLowerCase().includes(beneficiaryId.toLowerCase()));
    const benName = ben ? ben.name : beneficiaryId;

    acc.balance -= amount;
    const newTx: Transaction = {
      id: `TX-BEN-${Date.now()}`,
      accountId: acc.id,
      merchantName: `Fund Transfer to ${benName} (${mode})`,
      amount: -amount,
      date: "Just now",
      type: "DEBIT",
      category: "Transfer"
    };

    transactions.unshift(newTx);

    // Update recent transfers store
    recentBeneficiaryTransfersStore.unshift({
      id: `RBT-${Date.now()}`,
      beneficiaryId: ben?.id || "BEN-01",
      name: benName,
      amount: amount,
      formattedAmount: `₹ ${amount.toLocaleString("en-IN")}`,
      date: "Just now",
      avatarUrl: ben?.avatarUrl || null,
      bankName: ben?.bankName,
      accountNumber: ben ? `•••• ${ben.accountNumber.slice(-4)}` : undefined
    });

    return newTx;
  },
  getScheduledTransfers: async (): Promise<ScheduledTransfer[]> => {
    await delay(300);
    return [
      { 
        id: "SCH-01", beneficiaryId: "BEN-04", beneficiaryName: "HDFC Bank Home Loan", 
        purpose: "EMI", fromAccountId: "ACC-001", amount: 25000, frequency: "MONTHLY", 
        isRecurring: true, transferMode: "NEFT", startDate: "15 Jan 2026", nextDate: "15 Sep 2026", 
        status: "ACTIVE", history: [
          { date: "15 Aug 2026", amount: 25000, status: "SUCCESS" },
          { date: "15 Jul 2026", amount: 25000, status: "SUCCESS" }
        ]
      },
      { 
        id: "SCH-02", beneficiaryId: "BEN-01", beneficiaryName: "Rajat Sharma", 
        purpose: "Rent", fromAccountId: "ACC-001", amount: 15000, frequency: "MONTHLY", 
        isRecurring: true, transferMode: "IMPS", startDate: "01 Feb 2026", nextDate: "01 Sep 2026", 
        status: "ACTIVE", history: [
          { date: "01 Aug 2026", amount: 15000, status: "SUCCESS" }
        ]
      }
    ];
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
  },
  getDeposits: async (): Promise<Deposit[]> => {
    await delay(300);
    return depositsStore;
  },
  openNewDeposit: async (data: {
    name: string;
    type: "FD" | "RD";
    principalAmount: number;
    monthlyInstallment?: number;
    tenureYears: number;
    interestRate: number;
  }): Promise<{ deposit: Deposit; newBalance: number }> => {
    await delay(800);
    const amountToDebit = data.type === 'FD' ? data.principalAmount : (data.monthlyInstallment || 10000);
    
    if (accounts.length > 0) {
      accounts[0].balance = Math.max(0, accounts[0].balance - amountToDebit);
    }
    const newBal = accounts[0]?.balance || 525430.50;

    const startDate = new Date().toISOString().split('T')[0];
    const maturityDate = new Date(Date.now() + data.tenureYears * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const maturityAmount = Math.round(data.principalAmount * Math.pow(1 + (data.interestRate / 100) / 4, 4 * data.tenureYears));

    const newDep: Deposit = {
      id: `${data.type}-${Math.floor(100 + Math.random() * 900)}`,
      name: data.name,
      type: data.type,
      principalAmount: data.principalAmount,
      monthlyDepositAmount: data.monthlyInstallment,
      monthlyInstallment: data.monthlyInstallment,
      interestRate: data.interestRate,
      startDate,
      maturityDate,
      maturityAmount,
      totalDepositedAmount: amountToDebit,
      accumulatedAmount: amountToDebit,
      nextDueDate: data.type === 'RD' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      status: "ACTIVE"
    };

    depositsStore.unshift(newDep);

    transactions.unshift({
      id: `TX-DEP-${Date.now()}`,
      accountId: "ACC-001",
      merchantName: `Opened ${data.type} - ${data.name}`,
      amount: -amountToDebit,
      date: "Just now",
      type: "DEBIT",
      category: "Deposit"
    });

    return { deposit: newDep, newBalance: newBal };
  },
  breakDeposit: async (depositId: string): Promise<{ refundAmount: number; newBalance: number }> => {
    await delay(800);
    const target = depositsStore.find(d => d.id === depositId);
    const refundAmount = target ? Math.round(target.accumulatedAmount || target.principalAmount) : 100000;
    
    depositsStore = depositsStore.filter(d => d.id !== depositId);

    if (accounts.length > 0) {
      accounts[0].balance += refundAmount;
    }
    const newBal = accounts[0]?.balance || 625430.50;

    transactions.unshift({
      id: `TX-BRK-${Date.now()}`,
      accountId: "ACC-001",
      merchantName: `Liquidated FD - ${target?.name || depositId}`,
      amount: refundAmount,
      date: "Just now",
      type: "CREDIT",
      category: "Deposit"
    });

    return { refundAmount, newBalance: newBal };
  },
  payRdInstallment: async (depositId: string): Promise<{ updatedRd: Deposit; newBalance: number }> => {
    await delay(800);
    const target = depositsStore.find(d => d.id === depositId);
    const installmentAmt = target?.monthlyInstallment || target?.monthlyDepositAmount || 10000;

    if (accounts.length > 0) {
      accounts[0].balance = Math.max(0, accounts[0].balance - installmentAmt);
    }
    const newBal = accounts[0]?.balance || 525430.50;

    if (target) {
      target.accumulatedAmount = (target.accumulatedAmount || 0) + installmentAmt;
      target.totalDepositedAmount = (target.totalDepositedAmount || 0) + installmentAmt;
      target.nextDueDate = "01 Oct 2026";
    }

    transactions.unshift({
      id: `TX-RD-${Date.now()}`,
      accountId: "ACC-001",
      merchantName: `RD Installment - ${target?.name || depositId}`,
      amount: -installmentAmt,
      date: "Just now",
      type: "DEBIT",
      category: "Deposit"
    });

    return { updatedRd: target!, newBalance: newBal };
  },
  executeInvestment: async (params: {
    category: string;
    assetName: string;
    amount: number;
    investType: 'SIP' | 'LUMP';
    navOrPrice?: number;
    tenureYears?: number;
  }): Promise<{ holding?: Holding; sip?: SIP; newBalance: number }> => {
    await delay(800);
    // Deduct from primary savings account
    if (accounts.length > 0) {
      accounts[0].balance = Math.max(0, accounts[0].balance - params.amount);
    }
    const newBal = accounts[0]?.balance || 525430.50;

    // Log transaction
    transactions.unshift({
      id: `TX-INV-${Date.now()}`,
      accountId: "ACC-001",
      merchantName: `Investment - ${params.assetName}`,
      amount: -params.amount,
      date: "Just now",
      type: "DEBIT",
      category: "Investment"
    });

    let newHolding: Holding | undefined;
    let newSip: SIP | undefined;

    if (params.investType === 'SIP') {
      newSip = {
        id: `SIP-${Date.now()}`,
        fundName: params.assetName,
        fundHouse: `${params.category} Portfolio`,
        category: params.category,
        nav: params.navOrPrice || 50.00,
        returns3Y: 18.5,
        rating: 5,
        riskGrade: "Moderate to High",
        amount: params.amount,
        monthlyAmount: params.amount,
        frequency: "Monthly (10th)",
        debitDate: 10,
        nextDebitDate: "10 Sep 2026",
        status: "ACTIVE",
        totalInvested: params.amount,
        currentValue: params.amount,
        installmentsPaid: 1,
        stepUpPercent: 10,
        linkedAccount: "Primary Savings ACC-001 •••• 8812",
        folioNumber: `FOL-${Math.floor(100000 + Math.random() * 900000)}-IN`
      };
      sips.unshift(newSip);
    } else {
      const price = params.navOrPrice || 100;
      const unitsCalculated = Math.round((params.amount / price) * 100) / 100;
      newHolding = {
        id: `HLD-${Date.now()}`,
        name: params.assetName,
        category: params.category,
        units: unitsCalculated,
        avgNav: price,
        currentNav: price * 1.02,
        investedAmount: params.amount,
        currentValue: Math.round(params.amount * 1.02),
        returnAmount: Math.round(params.amount * 0.02),
        returnPercent: 2.0,
        returns3Y: 15.4,
        rating: 5,
        type: params.investType,
        folioNumber: `HLD-${Math.floor(100000 + Math.random() * 900000)}`
      };
      holdings.unshift(newHolding);
    }

    return { holding: newHolding, sip: newSip, newBalance: newBal };
  },

  getUserAddress: async (): Promise<UserAddress> => {
    await delay(200);
    return { ...userAddressStore };
  },

  updateUserAddress: async (data: {
    currentAddress: string;
    permanentAddress: string;
    isSameAsCurrent: boolean;
    proofDocumentType: string;
  }): Promise<{ address: UserAddress; events: VerificationEvent[] }> => {
    await delay(400);

    const nowStr = "Just Now";
    const permAddr = data.isSameAsCurrent ? data.currentAddress : data.permanentAddress;

    userAddressStore = {
      currentAddress: data.currentAddress,
      permanentAddress: permAddr,
      isSameAsCurrent: data.isSameAsCurrent,
      proofDocumentType: data.proofDocumentType,
      lastUpdated: nowStr
    };

    const newEvent: VerificationEvent = {
      id: `VE-${Date.now()}`,
      label: "Address Updated",
      date: nowStr,
      status: "completed",
      description: `Residential address updated with ${data.proofDocumentType}`
    };

    verificationEventsStore.push(newEvent);

    return { address: { ...userAddressStore }, events: [...verificationEventsStore] };
  },

  getVerificationJourney: async (): Promise<VerificationEvent[]> => {
    await delay(200);
    return [...verificationEventsStore];
  },

  addVerificationEvent: async (label: string, description?: string): Promise<VerificationEvent[]> => {
    await delay(200);
    const newEvent: VerificationEvent = {
      id: `VE-${Date.now()}`,
      label,
      date: "Just Now",
      status: "completed",
      description: description || `${label} completed successfully`
    };
    verificationEventsStore.push(newEvent);
    return [...verificationEventsStore];
  }
};
