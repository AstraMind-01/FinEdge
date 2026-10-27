export interface CategorySpending {
  id: string;
  name: string;
  amount: number;
  budget: number;
  percentage: number;
  color: string;
  iconName: string;
}

export interface MonthlyCashFlowPoint {
  day: string;
  income: number;
  spending: number;
  cumulativeSavings: number;
}

export interface InvestmentDetail {
  id: string;
  name: string;
  category: 'Mutual Fund' | 'Equities' | 'Fixed Deposit' | 'Digital Gold' | 'PPF / NPS';
  amount: number;
  frequency: 'SIP Monthly' | 'Lump Sum' | 'Auto-Debit';
  returnsYTD: string;
  status: 'Invested' | 'Scheduled' | 'Processing';
  nextDate: string;
}

export interface LoanDetail {
  id: string;
  loanName: string;
  loanType: 'Home Loan' | 'Auto Loan' | 'Personal Loan' | 'Education Loan';
  accountNo: string;
  emiAmount: number;
  principalAmount: string;
  interestRate: string;
  remainingTenure: string;
  nextDueDate: string;
  autoDebitStatus: 'Enabled' | 'Pending';
}

export interface InsuranceDetail {
  id: string;
  policyName: string;
  policyType: 'Health' | 'Term Life' | 'Motor / Car' | 'Home Protection';
  provider: string;
  premiumAmount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annual';
  sumInsured: string;
  nextRenewalDate: string;
  status: 'Active' | 'Due Soon' | 'Auto-Debited';
}

export interface SubscriptionDetail {
  id: string;
  serviceName: string;
  category: 'Entertainment' | 'Cloud & Tech' | 'Utilities' | 'Gym & Wellness';
  amount: number;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  dueDate: string;
  autoPay: boolean;
  paymentMethod: string;
}

export interface MonthlyTransactionItem {
  id: string;
  date: string;
  title: string;
  category: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  method: string;
  status: 'Completed' | 'Pending' | 'Flagged';
}

export interface MonthlyFinanceData {
  monthKey: string;
  monthLabel: string;
  totalIncome: number;
  totalSpending: number;
  netSavings: number;
  savingsRate: number;
  totalInvestments: number;
  totalLoansEmi: number;
  totalInsurance: number;
  totalSubscriptions: number;
  categories: CategorySpending[];
  cashFlow: MonthlyCashFlowPoint[];
  investments: InvestmentDetail[];
  loans: LoanDetail[];
  insurance: InsuranceDetail[];
  subscriptions: SubscriptionDetail[];
  transactions: MonthlyTransactionItem[];
}

export const AVAILABLE_MONTHS = [
  { key: '2026-10', label: 'October 2026' },
  { key: '2026-09', label: 'September 2026' },
  { key: '2026-08', label: 'August 2026' },
  { key: '2026-07', label: 'July 2026' },
  { key: '2026-06', label: 'June 2026' },
  { key: '2026-05', label: 'May 2026' },
];

export function getMonthlyFinanceData(monthKey: string, liveTransactions: any[] = []): MonthlyFinanceData {
  const isOctober = monthKey === '2026-10';
  const isSeptember = monthKey === '2026-09';
  const isAugust = monthKey === '2026-08';

  const baseIncome = isOctober ? 128500 : isSeptember ? 116200 : isAugust ? 122400 : 108000;
  const baseSpending = isOctober ? 54320 : isSeptember ? 49850 : isAugust ? 58900 : 47200;
  const totalInvestments = isOctober ? 28500 : isSeptember ? 25000 : 22000;
  const totalLoansEmi = 18250;
  const totalInsurance = 7450;
  const totalSubscriptions = 3880;

  const netSavings = baseIncome - (baseSpending + totalInvestments + totalLoansEmi + totalInsurance + totalSubscriptions);
  const savingsRate = Math.round((netSavings / baseIncome) * 100);

  const categories: CategorySpending[] = [
    { id: 'cat-1', name: 'Housing & Rent', amount: 22000, budget: 22000, percentage: 40, color: '#f0b429', iconName: 'Home' },
    { id: 'cat-2', name: 'Groceries & Mart', amount: 11450, budget: 14000, percentage: 21, color: '#38bdf8', iconName: 'ShoppingCart' },
    { id: 'cat-3', name: 'Dining & Cafes', amount: 6240, budget: 8000, percentage: 11, color: '#f43f5e', iconName: 'Utensils' },
    { id: 'cat-4', name: 'Bills & Utilities', amount: 5680, budget: 6500, percentage: 10, color: '#a855f7', iconName: 'Zap' },
    { id: 'cat-5', name: 'Shopping & Apparel', amount: 4890, budget: 7000, percentage: 9, color: '#ec4899', iconName: 'ShoppingBag' },
    { id: 'cat-6', name: 'Travel & Fuel', amount: 2460, budget: 4500, percentage: 5, color: '#10b981', iconName: 'Fuel' },
    { id: 'cat-7', name: 'Health & Pharmacy', amount: 1600, budget: 3000, percentage: 4, color: '#06b6d4', iconName: 'HeartPulse' },
  ];

  const cashFlow: MonthlyCashFlowPoint[] = [
    { day: 'Day 1-5', income: 95000, spending: 26000, cumulativeSavings: 69000 },
    { day: 'Day 6-10', income: 8500, spending: 12400, cumulativeSavings: 65100 },
    { day: 'Day 11-15', income: 12000, spending: 6800, cumulativeSavings: 70300 },
    { day: 'Day 16-20', income: 5000, spending: 4900, cumulativeSavings: 70400 },
    { day: 'Day 21-25', income: 8000, spending: 3120, cumulativeSavings: 75280 },
    { day: 'Day 26-30', income: 0, spending: 1100, cumulativeSavings: 74180 },
  ];

  const investments: InvestmentDetail[] = [
    { id: 'inv-1', name: 'HDFC Top 100 Bluechip Fund', category: 'Mutual Fund', amount: 10000, frequency: 'SIP Monthly', returnsYTD: '+18.4%', status: 'Invested', nextDate: 'Nov 05, 2026' },
    { id: 'inv-2', name: 'Parag Parikh Flexi Cap Fund', category: 'Mutual Fund', amount: 7500, frequency: 'SIP Monthly', returnsYTD: '+21.2%', status: 'Invested', nextDate: 'Nov 10, 2026' },
    { id: 'inv-3', name: 'FinEdge Digital Gold Reserve', category: 'Digital Gold', amount: 3000, frequency: 'SIP Monthly', returnsYTD: '+14.9%', status: 'Invested', nextDate: 'Nov 12, 2026' },
    { id: 'inv-4', name: 'Tata Motors & L&T Equity Basket', category: 'Equities', amount: 5000, frequency: 'Lump Sum', returnsYTD: '+9.8%', status: 'Invested', nextDate: 'Discretionary' },
    { id: 'inv-5', name: 'Public Provident Fund (PPF)', category: 'PPF / NPS', amount: 3000, frequency: 'Auto-Debit', returnsYTD: '7.1% p.a.', status: 'Invested', nextDate: 'Nov 01, 2026' },
  ];

  const loans: LoanDetail[] = [
    { id: 'loan-1', loanName: 'Urban Horizon Home Loan', loanType: 'Home Loan', accountNo: 'HL-8839201', emiAmount: 14250, principalAmount: '₹18,00,000', interestRate: '8.40% p.a.', remainingTenure: '14 yrs 2 mos', nextDueDate: 'Oct 15, 2026', autoDebitStatus: 'Enabled' },
    { id: 'loan-2', loanName: 'EV Green Auto Loan', loanType: 'Auto Loan', accountNo: 'AL-550192', emiAmount: 4000, principalAmount: '₹2,45,000', interestRate: '7.85% p.a.', remainingTenure: '2 yrs 4 mos', nextDueDate: 'Oct 20, 2026', autoDebitStatus: 'Enabled' },
  ];

  const insurance: InsuranceDetail[] = [
    { id: 'ins-1', policyName: 'Star Comprehensive Health Shield', policyType: 'Health', provider: 'Star Health Care', premiumAmount: 3850, frequency: 'Monthly', sumInsured: '₹5,00,000', nextRenewalDate: 'Nov 01, 2026', status: 'Active' },
    { id: 'ins-2', policyName: 'Max Life Smart Secure Plus', policyType: 'Term Life', provider: 'Max Financial', premiumAmount: 2400, frequency: 'Monthly', sumInsured: '₹10,00,000', nextRenewalDate: 'Nov 08, 2026', status: 'Active' },
    { id: 'ins-3', policyName: 'Bumper-to-Bumper Auto Insurance', policyType: 'Motor / Car', provider: 'HDFC ERGO', premiumAmount: 1200, frequency: 'Monthly', sumInsured: '₹2,80,000 IDV', nextRenewalDate: 'Oct 28, 2026', status: 'Due Soon' },
  ];

  const subscriptions: SubscriptionDetail[] = [
    { id: 'sub-1', serviceName: 'Netflix Premium 4K', category: 'Entertainment', amount: 649, billingCycle: 'Monthly', dueDate: 'Oct 14, 2026', autoPay: true, paymentMethod: 'FinEdge Metal Card' },
    { id: 'sub-2', serviceName: 'Spotify Family Plan', category: 'Entertainment', amount: 179, billingCycle: 'Monthly', dueDate: 'Oct 18, 2026', autoPay: true, paymentMethod: 'FinEdge Metal Card' },
    { id: 'sub-3', serviceName: 'Google One 2TB Cloud', category: 'Cloud & Tech', amount: 650, billingCycle: 'Monthly', dueDate: 'Oct 22, 2026', autoPay: true, paymentMethod: 'Auto Debit' },
    { id: 'sub-4', serviceName: 'JioFiber GigaSpeed 300Mbps', category: 'Utilities', amount: 1499, billingCycle: 'Monthly', dueDate: 'Oct 25, 2026', autoPay: true, paymentMethod: 'UPI AutoPay' },
    { id: 'sub-5', serviceName: 'Cult.Fit Elite Pass', category: 'Gym & Wellness', amount: 902, billingCycle: 'Monthly', dueDate: 'Oct 29, 2026', autoPay: true, paymentMethod: 'FinEdge Virtual Card' },
  ];

  const transactions: MonthlyTransactionItem[] = [
    { id: 'tx-1', date: 'Oct 06, 2026', title: 'TechCorp Salary Credit', category: 'Income', amount: 128500, type: 'CREDIT', method: 'Direct Deposit', status: 'Completed' },
    { id: 'tx-2', date: 'Oct 05, 2026', title: 'Prestige Sky Living Society Rent', category: 'Housing & Rent', amount: 22000, type: 'DEBIT', method: 'IMPS Transfer', status: 'Completed' },
    { id: 'tx-3', date: 'Oct 05, 2026', title: 'HDFC Bluechip SIP Auto-Debit', category: 'Investments', amount: 10000, type: 'DEBIT', method: 'NACH Mandate', status: 'Completed' },
    { id: 'tx-4', date: 'Oct 04, 2026', title: 'Whole Foods Organic Groceries', category: 'Groceries', amount: 4850, type: 'DEBIT', method: 'Contactless Card', status: 'Completed' },
    { id: 'tx-5', date: 'Oct 03, 2026', title: 'Urban Horizon Home Loan EMI', category: 'Loans & EMI', amount: 14250, type: 'DEBIT', method: 'Auto-Debit', status: 'Completed' },
    { id: 'tx-6', date: 'Oct 02, 2026', title: 'Star Comprehensive Health Premium', category: 'Insurance', amount: 3850, type: 'DEBIT', method: 'Debit Card', status: 'Completed' },
    { id: 'tx-7', date: 'Oct 02, 2026', title: 'JioFiber Broadband Bill', category: 'Utilities', amount: 1499, type: 'DEBIT', method: 'UPI AutoPay', status: 'Completed' },
    { id: 'tx-8', date: 'Oct 01, 2026', title: 'Apple Store Regent St', category: 'Shopping', amount: 3200, type: 'DEBIT', method: 'Metal Card', status: 'Completed' },
  ];

  const selectedTransactions = liveTransactions.filter(transaction => {
    const parsed = new Date(transaction.timestamp || transaction.date || '');
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 7) === monthKey;
  });

  if (selectedTransactions.length > 0) {
    const liveIncome = selectedTransactions
      .filter(transaction => transaction.type === 'CREDIT')
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    const debits = selectedTransactions.filter(transaction => transaction.type === 'DEBIT');
    const isInvestment = (transaction: any) => /invest|fund|sip|nifty|equity|gold|ppf|nps/i.test(`${transaction.category || ''} ${transaction.merchantName || ''}`);
    const isLoan = (transaction: any) => /loan|emi/i.test(`${transaction.category || ''} ${transaction.merchantName || ''}`);
    const isInsurance = (transaction: any) => /insurance|premium/i.test(`${transaction.category || ''} ${transaction.merchantName || ''}`);
    const isSubscription = (transaction: any) => /netflix|spotify|subscription|cloud|gym|broadband/i.test(`${transaction.category || ''} ${transaction.merchantName || ''}`);

    const liveInvestments = debits.filter(isInvestment).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    const liveLoans = debits.filter(isLoan).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    const liveInsurance = debits.filter(isInsurance).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    const liveSubscriptions = debits.filter(isSubscription).reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    const regularDebits = debits.filter(transaction => !isInvestment(transaction) && !isLoan(transaction) && !isInsurance(transaction) && !isSubscription(transaction));
    const liveSpending = regularDebits.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    const liveNetSavings = liveIncome - liveSpending - liveInvestments - liveLoans - liveInsurance - liveSubscriptions;

    const colors = ['#f0b429', '#38bdf8', '#f43f5e', '#a855f7', '#ec4899', '#10b981', '#06b6d4'];
    const categoryMap = new Map<string, number>();
    regularDebits.forEach(transaction => {
      const category = transaction.category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + Math.abs(transaction.amount));
    });
    const liveCategories: CategorySpending[] = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], index) => ({
        id: `live-category-${index}`,
        name,
        amount,
        budget: Math.ceil(amount * 1.15),
        percentage: liveSpending ? Math.round((amount / liveSpending) * 100) : 0,
        color: colors[index % colors.length],
        iconName: name === 'Bills' ? 'Zap' : name === 'Travel' ? 'Fuel' : name === 'Food' ? 'Utensils' : 'ShoppingBag',
      }));

    const buckets = Array.from({ length: 6 }, (_, index) => ({ income: 0, spending: 0, day: `Day ${index * 5 + 1}-${index === 5 ? 31 : index * 5 + 5}` }));
    selectedTransactions.forEach(transaction => {
      const parsed = new Date(transaction.timestamp || transaction.date || '');
      const bucket = Math.min(5, Math.floor((parsed.getDate() - 1) / 5));
      if (transaction.type === 'CREDIT') buckets[bucket].income += Math.abs(transaction.amount);
      else buckets[bucket].spending += Math.abs(transaction.amount);
    });
    let cumulative = 0;
    const liveCashFlow = buckets.map(bucket => {
      cumulative += bucket.income - bucket.spending;
      return { ...bucket, cumulativeSavings: cumulative };
    });

    const liveTimeline: MonthlyTransactionItem[] = selectedTransactions
      .slice()
      .sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime())
      .map(transaction => ({
        id: String(transaction.id),
        date: new Date(transaction.timestamp || transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        title: transaction.merchantName || 'Transaction',
        category: transaction.category || 'Other',
        amount: Math.abs(transaction.amount),
        type: transaction.type,
        method: transaction.paymentMode || 'FinEdge Account',
        status: transaction.status === 'PENDING' ? 'Pending' : transaction.status === 'FAILED' ? 'Flagged' : 'Completed',
      }));

    const liveInvestmentDetails: InvestmentDetail[] = debits.filter(isInvestment).map((transaction, index) => ({
      id: String(transaction.id), name: transaction.merchantName || 'Investment', category: 'Mutual Fund', amount: Math.abs(transaction.amount),
      frequency: 'Lump Sum', returnsYTD: 'Tracked', status: 'Invested', nextDate: 'As scheduled',
    }));
    const liveLoanDetails: LoanDetail[] = debits.filter(isLoan).map(transaction => ({
      id: String(transaction.id), loanName: transaction.merchantName || 'Loan EMI', loanType: 'Home Loan', accountNo: transaction.referenceId || 'Connected account',
      emiAmount: Math.abs(transaction.amount), principalAmount: 'Connected loan', interestRate: 'As contracted', remainingTenure: 'See loan account',
      nextDueDate: 'Next monthly cycle', autoDebitStatus: 'Enabled',
    }));

    return {
      monthKey,
      monthLabel: AVAILABLE_MONTHS.find(month => month.key === monthKey)?.label || new Date(`${monthKey}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      totalIncome: liveIncome,
      totalSpending: liveSpending,
      netSavings: liveNetSavings,
      savingsRate: liveIncome ? Math.round((liveNetSavings / liveIncome) * 100) : 0,
      totalInvestments: liveInvestments,
      totalLoansEmi: liveLoans,
      totalInsurance: liveInsurance,
      totalSubscriptions: liveSubscriptions,
      categories: liveCategories,
      cashFlow: liveCashFlow,
      investments: liveInvestmentDetails,
      loans: liveLoanDetails,
      insurance: [],
      subscriptions: [],
      transactions: liveTimeline,
    };
  }

  return {
    monthKey,
    monthLabel: AVAILABLE_MONTHS.find(m => m.key === monthKey)?.label || 'Current Month',
    totalIncome: baseIncome,
    totalSpending: baseSpending,
    netSavings: Math.max(0, netSavings),
    savingsRate,
    totalInvestments,
    totalLoansEmi,
    totalInsurance,
    totalSubscriptions,
    categories,
    cashFlow,
    investments,
    loans,
    insurance,
    subscriptions,
    transactions,
  };
}
