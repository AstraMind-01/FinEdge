"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import MonthlyFinanceHeader from '../../components/monthly-finance/MonthlyFinanceHeader';
import MonthlySummaryCards from '../../components/monthly-finance/MonthlySummaryCards';
import MonthlyCashFlowChart from '../../components/monthly-finance/MonthlyCashFlowChart';
import CategorySpendingBreakdown from '../../components/monthly-finance/CategorySpendingBreakdown';
import MonthlyInvestmentsAndLoans from '../../components/monthly-finance/MonthlyInvestmentsAndLoans';
import MonthlyInsuranceAndBills from '../../components/monthly-finance/MonthlyInsuranceAndBills';
import MonthlyTransactionTimeline from '../../components/monthly-finance/MonthlyTransactionTimeline';
import { getMonthlyFinanceData } from '../../components/monthly-finance/monthlyFinanceData';
import { useAccounts } from '../../context/AccountContext';
import { generateAndDownloadCentralPDF } from '../../lib/pdfService';
import { exportReportToCSV } from '../../lib/reportExporter';

export default function MonthlyFinancePage() {
  const { transactions, accounts } = useAccounts();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const monthlyData = getMonthlyFinanceData(selectedMonth, transactions);

  const handleExportPDF = () => {
    generateAndDownloadCentralPDF({
      documentType: 'MONTHLY_SUMMARY',
      period: monthlyData.monthLabel,
      account: accounts[0],
      transactions: transactions.filter(transaction => {
        const parsed = new Date(transaction.timestamp || transaction.date || '');
        return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 7) === selectedMonth;
      }),
    });
  };

  const handleExportCSV = () => {
    const reportData = {
      timeframe: monthlyData.monthLabel,
      totalIncome: monthlyData.totalIncome,
      totalExpenses: monthlyData.totalSpending,
      netSavings: monthlyData.netSavings,
      investments: monthlyData.totalInvestments,
      creditScore: 0,
      categoryBreakdown: monthlyData.categories.map(c => ({
        name: c.name,
        amount: c.amount,
        percentage: c.percentage,
      })),
      transactions: monthlyData.transactions.map(t => ({
        date: t.date,
        description: t.title,
        category: t.category,
        amount: t.amount,
        type: t.type,
      })),
    };

    exportReportToCSV(reportData, `FinEdge_Monthly_Finance_${monthlyData.monthKey}.csv`);
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
        <Header />
        <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
          {/* Header & Controls */}
          <MonthlyFinanceHeader
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            savingsRate={monthlyData.savingsRate}
          />

          {/* Metric Summary Cards */}
          <MonthlySummaryCards data={monthlyData} />

          {/* Charts Row: Cash Flow & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyCashFlowChart
              cashFlow={monthlyData.cashFlow}
              monthLabel={monthlyData.monthLabel}
            />
            <CategorySpendingBreakdown
              categories={monthlyData.categories}
              totalSpending={monthlyData.totalSpending}
            />
          </div>

          {/* Investments & Loans Section */}
          <MonthlyInvestmentsAndLoans
            investments={monthlyData.investments}
            loans={monthlyData.loans}
            totalInvestments={monthlyData.totalInvestments}
            totalLoansEmi={monthlyData.totalLoansEmi}
          />

          {/* Insurance & Recurring Bills Section */}
          <MonthlyInsuranceAndBills
            insurance={monthlyData.insurance}
            subscriptions={monthlyData.subscriptions}
            totalInsurance={monthlyData.totalInsurance}
            totalSubscriptions={monthlyData.totalSubscriptions}
          />

          {/* Activity Timeline */}
          <MonthlyTransactionTimeline
            transactions={monthlyData.transactions}
            monthLabel={monthlyData.monthLabel}
          />
        </main>
      </div>
    </div>
  );
}
