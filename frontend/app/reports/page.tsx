"use client";

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import MetricsStrip from '../../components/reports/MetricsStrip';
import IncomeExpenseChart from '../../components/reports/IncomeExpenseChart';
import SpendingBreakdown from '../../components/reports/SpendingBreakdown';
import CashFlowForecast from '../../components/reports/CashFlowForecast';
import GoalProgressTracker from '../../components/reports/GoalProgressTracker';
import AIInsights from '../../components/reports/AIInsights';
import ReportTemplates from '../../components/reports/ReportTemplates';
import ComparisonSnapshot from '../../components/reports/ComparisonSnapshot';
import ScheduledReports from '../../components/reports/ScheduledReports';
import DeepDiveTiles from '../../components/reports/DeepDiveTiles';
import CustomReportModal from '../../components/modals/CustomReportModal';
import { FileDown, FileSpreadsheet, Sparkles, ChevronDown, CalendarDays } from 'lucide-react';
import { exportReportToCSV } from '../../lib/reportExporter';
import { generateAndDownloadCentralPDF } from '../../lib/pdfService';
import { useAccounts } from '../../context/AccountContext';

const DATE_RANGES = ['This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'This Year', 'Custom Range'];

export default function ReportsPage() {
  const { transactions } = useAccounts();
  const [dateRange, setDateRange] = useState('This Month');
  const [dateOpen, setDateOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const getReportExportData = () => {
    const sampleTransactions = transactions.map(t => ({
      date: t.date || "Today",
      description: t.merchantName || t.category || "Transaction",
      category: t.category || "General",
      amount: Math.abs(t.amount),
      type: t.type === "CREDIT" ? "CREDIT" as const : "DEBIT" as const,
    }));

    return {
      timeframe: dateRange,
      totalIncome: 86500,
      totalExpenses: 48650,
      netSavings: 37850,
      investments: 124000,
      creditScore: 782,
      categoryBreakdown: [
        { name: "Shopping", amount: 15552, percentage: 32 },
        { name: "Food & Dining", amount: 11676, percentage: 24 },
        { name: "Bills & Utilities", amount: 9243, percentage: 19 },
        { name: "Travel", amount: 6811, percentage: 14 },
        { name: "Health", amount: 3405, percentage: 7 },
        { name: "Others", amount: 1946, percentage: 4 },
      ],
      transactions: sampleTransactions.length > 0 ? sampleTransactions : [
        { date: "10 Aug 2026", description: "Amazon.in", category: "Shopping", amount: 2499, type: "DEBIT" as const },
        { date: "09 Aug 2026", description: "TechCorp Salary", category: "Salary", amount: 86500, type: "CREDIT" as const },
        { date: "08 Aug 2026", description: "Starbucks Coffee", category: "Food & Dining", amount: 450, type: "DEBIT" as const },
        { date: "07 Aug 2026", description: "Airtel Broadband", category: "Bills & Utilities", amount: 1179, type: "DEBIT" as const },
      ],
    };
  };

  const handleExportPDF = () => {
    generateAndDownloadCentralPDF({
      documentType: 'MONTHLY_SUMMARY',
      period: dateRange,
      transactions: transactions,
    });
  };

  const handleExportExcel = () => {
    exportReportToCSV(getReportExportData(), `FinEdge_Financial_Report_${dateRange.replace(/\s+/g, '_')}.csv`);
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
        <Header />
        <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">

          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] md:text-[32px] font-headline-lg font-bold text-on-surface leading-tight">
                Reports &amp; Analytics
              </h1>
              <p className="text-[14px] text-on-surface-variant mt-1">
                Understand your money with smart, visual insights
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Range Selector */}
              <div className="relative">
                <button
                  onClick={() => setDateOpen(!dateOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low border border-white/10 rounded-xl text-[13px] font-medium text-on-surface hover:border-primary/30 transition-all cursor-pointer"
                >
                  <CalendarDays size={15} className="text-primary" />
                  {dateRange}
                  <ChevronDown size={14} className={`text-on-surface-variant transition-transform duration-200 ${dateOpen ? 'rotate-180' : ''}`} />
                </button>
                {dateOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-highest border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-[slideDown_200ms_ease-out]">
                    {DATE_RANGES.map((r) => (
                      <button
                        key={r}
                        onClick={() => { 
                          setDateRange(r); 
                          setDateOpen(false); 
                          if (r === 'Custom Range') {
                            setIsCustomOpen(true);
                          }
                        }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors cursor-pointer ${
                          r === dateRange ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2.5 border border-primary/30 text-primary text-[13px] font-medium rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer"
              >
                <FileDown size={15} />
                Export PDF
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 border border-white/15 text-on-surface-variant text-[13px] font-medium rounded-xl hover:border-white/30 hover:text-on-surface transition-all cursor-pointer"
              >
                <FileSpreadsheet size={15} />
                Export Excel
              </button>
              <button 
                onClick={() => setIsCustomOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-[13px] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all cursor-pointer"
              >
                <Sparkles size={15} />
                Custom Report
              </button>
            </div>
          </div>

          {/* Animated Metrics Strip */}
          <MetricsStrip />

          {/* Two-Column Main Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">

            {/* Left Column */}
            <div className="flex flex-col gap-6">
              <IncomeExpenseChart />
              <SpendingBreakdown />
              <CashFlowForecast />
              <GoalProgressTracker />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              <AIInsights />
              <ReportTemplates />
              <ComparisonSnapshot />
              <ScheduledReports />
            </div>
          </div>

          {/* Bottom Deep Dive Section */}
          <DeepDiveTiles />

        </main>
      </div>

      <CustomReportModal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
      />
    </div>
  );
}
