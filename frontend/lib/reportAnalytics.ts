import { Transaction } from "../types";

export interface ReportAnalytics {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  investmentActivity: number;
  categories: { name: string; amount: number; percentage: number }[];
  monthly: { name: string; income: number; expense: number }[];
  previous: { income: number; expenses: number; savings: number };
}

function transactionDate(transaction: Transaction): Date | null {
  const value = transaction.timestamp || transaction.date;
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function filterTransactionsByRange(transactions: Transaction[], range: string): Transaction[] {
  if (range === "Custom Range") return transactions;
  const now = new Date();
  const cutoff = new Date(now);
  if (range === "This Month") cutoff.setDate(1);
  else if (range === "Last Month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions.filter(t => {
      const date = transactionDate(t);
      return !date || (date >= start && date < end);
    });
  } else if (range === "Last 3 Months") cutoff.setMonth(cutoff.getMonth() - 3);
  else if (range === "Last 6 Months") cutoff.setMonth(cutoff.getMonth() - 6);
  else if (range === "This Year") cutoff.setMonth(0, 1);
  else return transactions;
  cutoff.setHours(0, 0, 0, 0);
  return transactions.filter(t => {
    const date = transactionDate(t);
    return !date || date >= cutoff;
  });
}

export function buildReportAnalytics(transactions: Transaction[], range: string): ReportAnalytics {
  const filtered = filterTransactionsByRange(transactions, range);
  const totalIncome = filtered.filter(t => t.type === "CREDIT").reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalExpenses = filtered.filter(t => t.type === "DEBIT").reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const investmentActivity = filtered
    .filter(t => t.type === "DEBIT" && /invest/i.test(t.category || ""))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const categoryTotals = new Map<string, number>();
  filtered.filter(t => t.type === "DEBIT").forEach(t => {
    const name = t.category || "Other";
    categoryTotals.set(name, (categoryTotals.get(name) || 0) + Math.abs(t.amount));
  });
  const categories = [...categoryTotals.entries()]
    .map(([name, amount]) => ({ name, amount, percentage: totalExpenses ? Math.round(amount / totalExpenses * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const monthMap = new Map<string, { income: number; expense: number; date: Date }>();
  filtered.forEach(t => {
    const date = transactionDate(t) || new Date();
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const row = monthMap.get(key) || { income: 0, expense: 0, date: new Date(date.getFullYear(), date.getMonth(), 1) };
    if (t.type === "CREDIT") row.income += Math.abs(t.amount); else row.expense += Math.abs(t.amount);
    monthMap.set(key, row);
  });
  const monthly = [...monthMap.values()].sort((a, b) => a.date.getTime() - b.date.getTime()).map(row => ({
    name: row.date.toLocaleDateString("en-IN", { month: "short" }), income: row.income, expense: row.expense,
  }));

  const now = new Date();
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousEnd = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousTransactions = transactions.filter(t => {
    const date = transactionDate(t);
    return Boolean(date && date >= previousStart && date < previousEnd);
  });
  const previousIncome = previousTransactions.filter(t => t.type === "CREDIT").reduce((s, t) => s + Math.abs(t.amount), 0);
  const previousExpenses = previousTransactions.filter(t => t.type === "DEBIT").reduce((s, t) => s + Math.abs(t.amount), 0);

  return {
    transactions: filtered,
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    investmentActivity,
    categories,
    monthly,
    previous: { income: previousIncome, expenses: previousExpenses, savings: previousIncome - previousExpenses },
  };
}
