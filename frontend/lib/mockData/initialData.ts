import { 
  Account, Transaction, Beneficiary, ScheduledTransfer, IntlBeneficiary, 
  ExchangeRate, BankCard, CardOffer, Loan, Holding, SIP, InvestmentGoal, 
  PortfolioDataPoint, LoanApplication, Deposit, UserAddress, VerificationEvent, 
  RecentBeneficiaryTransfer 
} from "../../types";

export let beneficiaryStore: Beneficiary[] = [
  { id: "BEN-01", code: "BEN-01", name: "Rajat Sharma", bankName: "ICICI Bank", accountNumber: "987654323412", ifsc: "ICIC0001234", ifscCode: "ICIC0001234", upiId: "rajat.s@icici", transferLimit: 200000, status: "ACTIVE", category: "Domestic", addedAt: "10 Oct 2023" },
  { id: "BEN-02", code: "BEN-02", name: "Sneha Gupta", bankName: "SBI", accountNumber: "887766559912", ifsc: "SBIN0004321", ifscCode: "SBIN0004321", upiId: "sneha.g@sbi", transferLimit: 150000, status: "ACTIVE", category: "Domestic", addedAt: "15 Jan 2024" },
  { id: "BEN-03", code: "BEN-03", name: "Aakash Singh", bankName: "Axis Bank", accountNumber: "112233448811", ifsc: "UTIB0009876", ifscCode: "UTIB0009876", upiId: "aakash@okaxis", transferLimit: 300000, status: "ACTIVE", category: "Domestic", addedAt: "04 Mar 2024" },
  { id: "BEN-04", code: "BEN-04", name: "Priya Ranjan", bankName: "HDFC Bank", accountNumber: "554433224411", ifsc: "HDFC0001111", ifscCode: "HDFC0001111", upiId: "priya@hdfcbank", transferLimit: 500000, status: "ACTIVE", category: "Domestic", addedAt: "20 May 2024" }
];

export let recentBeneficiaryTransfersStore: RecentBeneficiaryTransfer[] = [
  { id: "RBT-001", beneficiaryId: "BEN-04", name: "Priya Sharma", amount: 15000, formattedAmount: "₹ 15,000", date: "Today", avatarUrl: "https://i.pravatar.cc/150?u=priya", bankName: "HDFC Bank", accountNumber: "•••• 4411" },
  { id: "RBT-002", beneficiaryId: "BEN-01", name: "Rahul Verma", amount: 8500, formattedAmount: "₹ 8,500", date: "Yesterday", avatarUrl: null, bankName: "ICICI Bank", accountNumber: "•••• 3412" },
  { id: "RBT-003", beneficiaryId: "BEN-02", name: "Neha Gupta", amount: 25000, formattedAmount: "₹ 25,000", date: "12 Aug", avatarUrl: "https://i.pravatar.cc/150?u=neha", bankName: "SBI", accountNumber: "•••• 9912" }
];

export let accounts: Account[] = [
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

export let cards: BankCard[] = [
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

export let cardOffers: CardOffer[] = [
  { id: "OFF-01", title: "10% Cashback on Amazon & Flipkart", description: "Get up to ₹1,500 cashback on electronics & fashion", merchant: "Amazon & Flipkart", merchantName: "Amazon & Flipkart", discount: "10% OFF", discountDesc: "10% OFF", validUntil: "31 Aug 2026", validTill: "31 Aug 2026", code: "FINEDG10", category: "Shopping" },
  { id: "OFF-02", title: "Free Airport Lounge Access", description: "Enjoy 2 complimentary lounge visits per quarter across India", merchant: "DreamFolks Lounge", merchantName: "DreamFolks Lounge", discount: "FREE ACCESS", discountDesc: "FREE ACCESS", validUntil: "31 Dec 2026", validTill: "31 Dec 2026", category: "Travel" },
  { id: "OFF-03", title: "20% OFF on Zomato Dining", description: "Save up to ₹500 on fine dining restaurants", merchant: "Zomato", merchantName: "Zomato", discount: "20% OFF", discountDesc: "20% OFF", validUntil: "15 Sep 2026", validTill: "15 Sep 2026", code: "ZOMATOFIN", category: "Food" }
];

export let depositsStore: Deposit[] = [
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

export let userAddressStore: UserAddress = {
  currentAddress: "402, Skyline Towers, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051",
  permanentAddress: "402, Skyline Towers, G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051",
  isSameAsCurrent: true,
  proofDocumentType: "Passport / Driving License",
  lastUpdated: "15 Mar 2026"
};

export let verificationEventsStore: VerificationEvent[] = [
  { id: "VE-01", label: "Account Opened", date: "OCT 2021", status: "completed", description: "Primary Savings Account opened at Mumbai Corporate Branch" },
  { id: "VE-02", label: "Docs Submitted", date: "OCT 2021", status: "completed", description: "Aadhaar, PAN & Passport documents uploaded" },
  { id: "VE-03", label: "In Progress", date: "NOV 2021", status: "completed", description: "Central KYC Registry verification completed" },
  { id: "VE-04", label: "KYC Approved", date: "MAR 2026", status: "completed", description: "Full CKYC verified & active status granted" }
];

export let loans: Loan[] = [
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

export let holdings: Holding[] = [
  { id: "HLD-01", name: "Axis Bluechip Fund Direct-Growth", category: "Large Cap Mutual Fund", units: 450.25, avgNav: 45.2, investedAmount: 20351, currentValue: 28450 },
  { id: "HLD-02", name: "Nippon India Small Cap Fund", category: "Small Cap Mutual Fund", units: 1200.5, avgNav: 98.4, investedAmount: 118129, currentValue: 168400 },
  { id: "HLD-03", name: "Parag Parikh Flexi Cap Fund", category: "Flexi Cap Mutual Fund", units: 890.1, avgNav: 62.1, investedAmount: 55275, currentValue: 82100 },
  { id: "HLD-04", name: "Reliance Industries Ltd (RIL)", category: "Equity Stock", units: 50, avgNav: 2450.0, investedAmount: 122500, currentValue: 148500 }
];

export let sips: SIP[] = [
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

export let goals: InvestmentGoal[] = [
  { id: "GOL-01", name: "Dream House Down Payment", targetAmount: 2500000, currentAmount: 1850000, targetDate: "Dec 2028", percentAchieved: 74 },
  { id: "GOL-02", name: "Higher Education Fund", targetAmount: 1500000, currentAmount: 920000, targetDate: "Jun 2030", percentAchieved: 61 },
  { id: "GOL-03", name: "Europe Vacation 2027", targetAmount: 500000, currentAmount: 410000, targetDate: "May 2027", percentAchieved: 82 }
];

export let portfolioData: PortfolioDataPoint[] = [
  { month: "Jan", value: 310000 },
  { month: "Feb", value: 325000 },
  { month: "Mar", value: 340000 },
  { month: "Apr", value: 355000 },
  { month: "May", value: 370000 },
  { month: "Jun", value: 395000 },
  { month: "Jul", value: 410000 },
  { month: "Aug", value: 427450 }
];

export let loanApplications: LoanApplication[] = [
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

export let transactions: Transaction[] = [
  { id: "TX-001", accountId: "ACC-001", merchantName: "TechCorp Salary", amount: 145000, date: "Yesterday, 09:00 AM", type: "CREDIT", category: "Salary" },
  { id: "TX-002", accountId: "ACC-001", merchantName: "Amazon.in", amount: -4599, date: "Today, 10:42 AM", type: "DEBIT", category: "Shopping" },
  { id: "TX-003", accountId: "ACC-001", merchantName: "Zomato", amount: -850.50, date: "24 Oct, 08:30 PM", type: "DEBIT", category: "Food" },
  { id: "TX-004", accountId: "ACC-002", merchantName: "Business Payment", amount: 120000, date: "22 Oct, 11:15 AM", type: "CREDIT", category: "Transfer" },
  { id: "TX-005", accountId: "ACC-002", merchantName: "Vendor Payment", amount: -35000, date: "21 Oct, 04:20 PM", type: "DEBIT", category: "Transfer" },
  { id: "TX-006", accountId: "ACC-001", merchantName: "Rahul Kumar", amount: -12000, date: "23 Oct, 02:15 PM", type: "DEBIT", category: "Transfer" },
  { id: "TX-007", accountId: "ACC-001", merchantName: "HDFC Home Loan EMI", amount: -25000, date: "15 Oct, 06:00 AM", type: "DEBIT", category: "Bills" },
  { id: "TX-008", accountId: "ACC-001", merchantName: "ICICI Personal Loan EMI", amount: -16500, date: "05 Oct, 06:00 AM", type: "DEBIT", category: "Bills" },
  { id: "TX-009", accountId: "ACC-001", merchantName: "Parag Parikh Flexi Cap SIP", amount: -10000, date: "05 Oct, 09:30 AM", type: "DEBIT", category: "Investment" },
  { id: "TX-010", accountId: "ACC-001", merchantName: "Axis Bluechip SIP", amount: -5000, date: "10 Oct, 09:30 AM", type: "DEBIT", category: "Investment" },
  { id: "TX-011", accountId: "ACC-001", merchantName: "Nippon Small Cap SIP", amount: -7500, date: "15 Oct, 09:30 AM", type: "DEBIT", category: "Investment" },
  { id: "TX-012", accountId: "ACC-001", merchantName: "Star Health Insurance Premium", amount: -2083, date: "01 Oct, 10:00 AM", type: "DEBIT", category: "Bills" },
  { id: "TX-013", accountId: "ACC-001", merchantName: "HDFC Life Term Insurance", amount: -1450, date: "01 Oct, 10:00 AM", type: "DEBIT", category: "Bills" },
  { id: "TX-014", accountId: "ACC-001", merchantName: "Airtel Fiber Broadband", amount: -1179, date: "07 Oct, 02:30 PM", type: "DEBIT", category: "Bills" },
  { id: "TX-015", accountId: "ACC-001", merchantName: "Netflix & Spotify Subscriptions", amount: -999, date: "12 Oct, 05:00 PM", type: "DEBIT", category: "Bills" }
];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
