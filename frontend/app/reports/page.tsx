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
import { FileDown, FileSpreadsheet, Sparkles, ChevronDown, CalendarDays } from 'lucide-react';

const DATE_RANGES = ['This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'This Year', 'Custom Range'];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('This Month');
  const [dateOpen, setDateOpen] = useState(false);

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
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low border border-white/10 rounded-xl text-[13px] font-medium text-on-surface hover:border-primary/30 transition-all"
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
                        onClick={() => { setDateRange(r); setDateOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                          r === dateRange ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 border border-primary/30 text-primary text-[13px] font-medium rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all">
                <FileDown size={15} />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-white/15 text-on-surface-variant text-[13px] font-medium rounded-xl hover:border-white/30 hover:text-on-surface transition-all">
                <FileSpreadsheet size={15} />
                Export Excel
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-[13px] font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all">
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
    </div>
  );
}
