import { Account, Transaction, Beneficiary, ScheduledTransfer, IntlBeneficiary, ExchangeRate, BankCard, CardOffer, Loan, Holding, SIP, InvestmentGoal, PortfolioDataPoint, Deposit } from "../types";

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
  getCards: async (): Promise<BankCard[]> => {
    await delay(300);
    return [
      {
        id: "CARD-001",
        type: "CREDIT",
        tier: "REWARDS",
        network: "VISA",
        name: "FinEdge Infinite Credit",
        cardholderName: "Soumya Ranjan",
        maskedNumber: "•••• •••• •••• 4599",
        fullNumber: "4111 2222 3333 4599",
        expiry: "12/28",
        cvv: "891",
        status: "ACTIVE",
        linkedAccountId: "ACC-001",
        isDefault: true,
        theme: "purple-gold",
        controls: {
          onlineTransactions: true,
          internationalUsage: false,
          contactlessPayments: true,
          atmWithdrawals: true,
          posTransactions: true,
          dailyAtmLimit: 50000,
          dailyPosLimit: 150000,
          onlineLimit: 100000
        },
        spentThisMonth: 45200,
        creditLimit: 250000,
        rewardsPoints: 12450
      },
      {
        id: "CARD-002",
        type: "DEBIT",
        tier: "PLATINUM",
        network: "MASTERCARD",
        name: "FinEdge Platinum Debit",
        cardholderName: "Soumya Ranjan",
        maskedNumber: "•••• •••• •••• 8821",
        fullNumber: "5123 4567 8901 8821",
        expiry: "08/27",
        cvv: "442",
        status: "ACTIVE",
        linkedAccountId: "ACC-002",
        isDefault: false,
        theme: "navy-gold",
        controls: {
          onlineTransactions: true,
          internationalUsage: true,
          contactlessPayments: true,
          atmWithdrawals: true,
          posTransactions: true,
          dailyAtmLimit: 100000,
          dailyPosLimit: 200000,
          onlineLimit: 200000
        }
      },
      {
        id: "CARD-003",
        type: "VIRTUAL",
        tier: "CLASSIC",
        network: "VISA",
        name: "FinEdge Secure Virtual",
        cardholderName: "Soumya Ranjan",
        maskedNumber: "•••• •••• •••• 1102",
        fullNumber: "4555 1234 5678 1102",
        expiry: "01/26",
        cvv: "119",
        status: "FROZEN",
        linkedAccountId: "ACC-001",
        isDefault: false,
        theme: "teal-silver",
        controls: {
          onlineTransactions: true,
          internationalUsage: false,
          contactlessPayments: false,
          atmWithdrawals: false,
          posTransactions: false,
          dailyAtmLimit: 0,
          dailyPosLimit: 0,
          onlineLimit: 50000
        }
      }
    ];
  },
  getCardOffers: async (): Promise<CardOffer[]> => {
    await delay(200);
    return [
      {
        id: "OFFER-01",
        merchantName: "Amazon",
        merchantLogo: "shopping-bag",
        discountDesc: "10% Cashback on Electronics",
        validTill: "31 Aug 2026"
      },
      {
        id: "OFFER-02",
        merchantName: "MakeMyTrip",
        merchantLogo: "plane",
        discountDesc: "Flat ₹2500 off on Flights",
        validTill: "15 Sep 2026"
      },
      {
        id: "OFFER-03",
        merchantName: "Zomato",
        merchantLogo: "coffee",
        discountDesc: "20% off on weekend dining",
        validTill: "30 Sep 2026"
      }
    ];
  },
  getLoans: async (): Promise<Loan[]> => {
    await delay(400);
    return [
      {
        id: "LOAN-001",
        type: "HOME",
        name: "Home Loan - HL2022001",
        accountNumber: "HL-XXXX-XXXX-4412",
        status: "ACTIVE",
        originalAmount: 5000000,
        outstandingBalance: 4350000,
        interestRate: 8.50,
        totalTenure: 240,
        emiPaid: 30,
        nextEmiAmount: 43391,
        nextEmiDate: "15 Aug 2026",
        monthlyEmi: 43391,
        disbursementDate: "15 Feb 2024",
        interestPaidThisYear: 185000,
        emiSchedule: [
          { month: "May 2026", dueDate: "15 May 2026", amount: 43391, principal: 8200, interest: 35191, status: "PAID" },
          { month: "Jun 2026", dueDate: "15 Jun 2026", amount: 43391, principal: 8258, interest: 35133, status: "PAID" },
          { month: "Jul 2026", dueDate: "15 Jul 2026", amount: 43391, principal: 8317, interest: 35074, status: "PAID" },
          { month: "Aug 2026", dueDate: "15 Aug 2026", amount: 43391, principal: 8376, interest: 35015, status: "UPCOMING" },
          { month: "Sep 2026", dueDate: "15 Sep 2026", amount: 43391, principal: 8435, interest: 34956, status: "UPCOMING" },
          { month: "Oct 2026", dueDate: "15 Oct 2026", amount: 43391, principal: 8495, interest: 34896, status: "UPCOMING" }
        ]
      },
      {
        id: "LOAN-002",
        type: "PERSONAL",
        name: "Personal Loan - PL2024001",
        accountNumber: "PL-XXXX-XXXX-7891",
        status: "OVERDUE",
        originalAmount: 500000,
        outstandingBalance: 280000,
        interestRate: 12.00,
        totalTenure: 36,
        emiPaid: 16,
        nextEmiAmount: 16607,
        nextEmiDate: "05 Jul 2026",
        monthlyEmi: 16607,
        disbursementDate: "05 Mar 2025",
        interestPaidThisYear: 22400,
        overdueCount: 2,
        emiSchedule: [
          { month: "May 2026", dueDate: "05 May 2026", amount: 16607, principal: 11407, interest: 5200, status: "PAID" },
          { month: "Jun 2026", dueDate: "05 Jun 2026", amount: 16607, principal: 11521, interest: 5086, status: "OVERDUE" },
          { month: "Jul 2026", dueDate: "05 Jul 2026", amount: 16607, principal: 11636, interest: 4971, status: "OVERDUE" },
          { month: "Aug 2026", dueDate: "05 Aug 2026", amount: 16607, principal: 11752, interest: 4855, status: "UPCOMING" },
          { month: "Sep 2026", dueDate: "05 Sep 2026", amount: 16607, principal: 11870, interest: 4737, status: "UPCOMING" },
          { month: "Oct 2026", dueDate: "05 Oct 2026", amount: 16607, principal: 11989, interest: 4618, status: "UPCOMING" }
        ]
      },
      {
        id: "LOAN-003",
        type: "CAR",
        name: "Car Loan - CL2021001",
        accountNumber: "CL-XXXX-XXXX-3310",
        status: "ACTIVE",
        originalAmount: 800000,
        outstandingBalance: 65000,
        interestRate: 9.25,
        totalTenure: 60,
        emiPaid: 55,
        nextEmiAmount: 16720,
        nextEmiDate: "20 Aug 2026",
        monthlyEmi: 16720,
        disbursementDate: "20 Sep 2021",
        interestPaidThisYear: 8500,
        emiSchedule: [
          { month: "May 2026", dueDate: "20 May 2026", amount: 16720, principal: 16220, interest: 500, status: "PAID" },
          { month: "Jun 2026", dueDate: "20 Jun 2026", amount: 16720, principal: 16345, interest: 375, status: "PAID" },
          { month: "Jul 2026", dueDate: "20 Jul 2026", amount: 16720, principal: 16470, interest: 250, status: "PAID" },
          { month: "Aug 2026", dueDate: "20 Aug 2026", amount: 16720, principal: 16595, interest: 125, status: "UPCOMING" },
          { month: "Sep 2026", dueDate: "20 Sep 2026", amount: 16720, principal: 16720, interest: 0, status: "UPCOMING" }
        ]
      }
    ];
  },
  getHoldings: async (): Promise<Holding[]> => {
    await delay(300);
    return [
      { id: "H-01", name: "Axis Bluechip Fund", category: "Equity", type: "MUTUAL_FUND", investedAmount: 200000, currentValue: 245000, returnPercent: 22.5, returnAmount: 45000, units: 1245.32, nav: 196.72 },
      { id: "H-02", name: "HDFC Mid-Cap Opportunities", category: "Equity", type: "MUTUAL_FUND", investedAmount: 150000, currentValue: 182000, returnPercent: 21.3, returnAmount: 32000, units: 890.15, nav: 204.46 },
      { id: "H-03", name: "Nippon India Gold ETF", category: "Gold", type: "ETF", investedAmount: 100000, currentValue: 118500, returnPercent: 18.5, returnAmount: 18500, units: 20, nav: 5925 },
      { id: "H-04", name: "Reliance Industries", category: "Equity", type: "STOCK", investedAmount: 125000, currentValue: 142800, returnPercent: 14.24, returnAmount: 17800, units: 50, nav: 2856 },
      { id: "H-05", name: "ICICI Prudential Corporate Bond", category: "Debt", type: "BOND", investedAmount: 200000, currentValue: 214200, returnPercent: 7.1, returnAmount: 14200, units: 8500, nav: 25.20 },
      { id: "H-06", name: "SBI Small Cap Fund", category: "Equity", type: "MUTUAL_FUND", investedAmount: 75000, currentValue: 68000, returnPercent: -9.33, returnAmount: -7000, units: 450.22, nav: 151.04 }
    ];
  },
  getSIPs: async (): Promise<SIP[]> => {
    await delay(200);
    return [
      { id: "SIP-01", fundName: "Axis Bluechip Fund", monthlyAmount: 10000, nextDebitDate: "15 Aug 2026", status: "ACTIVE" },
      { id: "SIP-02", fundName: "HDFC Mid-Cap Opportunities", monthlyAmount: 5000, nextDebitDate: "10 Aug 2026", status: "ACTIVE" },
      { id: "SIP-03", fundName: "SBI Small Cap Fund", monthlyAmount: 5000, nextDebitDate: "20 Aug 2026", status: "PAUSED" }
    ];
  },
  getInvestmentGoals: async (): Promise<InvestmentGoal[]> => {
    await delay(200);
    return [
      { id: "GOAL-01", name: "Retirement Fund", targetAmount: 10000000, currentAmount: 4500000, percentAchieved: 45 },
      { id: "GOAL-02", name: "Child Education", targetAmount: 3000000, currentAmount: 950000, percentAchieved: 32 },
      { id: "GOAL-03", name: "Dream Home Down Payment", targetAmount: 2000000, currentAmount: 1600000, percentAchieved: 80 }
    ];
  },
  getPortfolioData: async (): Promise<PortfolioDataPoint[]> => {
    await delay(100);
    const base = 800000;
    const data: PortfolioDataPoint[] = [];
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    for (let i = 0; i < 12; i++) {
      data.push({ date: months[i], value: Math.round(base + (i * 15000) + (Math.random() * 20000 - 5000)) });
    }
    return data;
  },
  getDeposits: async (): Promise<Deposit[]> => {
    await delay(300);
    return [
      {
        id: "FD-001",
        type: "FD",
        name: "Tax Saver FD",
        principalAmount: 150000,
        interestRate: 7.1,
        startDate: "2023-04-01",
        maturityDate: "2028-04-01",
        maturityAmount: 213388,
        status: "ACTIVE"
      },
      {
        id: "FD-002",
        type: "FD",
        name: "High Yield FD",
        principalAmount: 500000,
        interestRate: 7.5,
        startDate: "2025-01-15",
        maturityDate: "2026-01-15",
        maturityAmount: 538562,
        status: "ACTIVE"
      },
      {
        id: "RD-001",
        type: "RD",
        name: "Dream Home Fund",
        principalAmount: 0,
        interestRate: 6.8,
        startDate: "2024-06-10",
        maturityDate: "2026-06-10",
        maturityAmount: 135000,
        status: "ACTIVE",
        monthlyInstallment: 5000,
        nextDueDate: "2026-09-10",
        accumulatedAmount: 125000
      }
    ];
  }
};