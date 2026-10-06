"use client";

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, FileDown, FileSpreadsheet, Sparkles, ChevronDown } from 'lucide-react';
import { AVAILABLE_MONTHS } from './monthlyFinanceData';

interface MonthlyFinanceHeaderProps {
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  savingsRate: number;
}

export default function MonthlyFinanceHeader({
  selectedMonth,
  onSelectMonth,
  onExportPDF,
  onExportCSV,
  savingsRate,
}: MonthlyFinanceHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentIndex = AVAILABLE_MONTHS.findIndex(m => m.key === selectedMonth);
  const currentLabel = AVAILABLE_MONTHS[currentIndex]?.label || 'Selected Month';

  const handlePrev = () => {
    if (currentIndex < AVAILABLE_MONTHS.length - 1) {
      onSelectMonth(AVAILABLE_MONTHS[currentIndex + 1].key);
    }
  };

  const handleNext = () => {
    if (currentIndex > 0) {
      onSelectMonth(AVAILABLE_MONTHS[currentIndex - 1].key);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] md:text-[30px] font-headline-lg font-bold text-on-surface tracking-tight">
              Monthly Finance
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[12px] font-semibold">
              <Sparkles size={13} className="text-primary animate-pulse" />
              <span>Smart Monthly Overview</span>
            </div>
          </div>
          <p className="text-[14px] text-on-surface-variant mt-1">
            Track total income, cash outflows, investments, loans/EMIs, insurance, and recurring expenses.
          </p>
        </div>

        {/* Controls: Month Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Month Switcher */}
          <div className="flex items-center bg-surface-container-low border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex >= AVAILABLE_MONTHS.length - 1}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
              >
                <Calendar size={14} className="text-primary" />
                <span>{currentLabel}</span>
                <ChevronDown size={14} className="text-on-surface-variant" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface-container border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                  {AVAILABLE_MONTHS.map(month => (
                    <button
                      key={month.key}
                      type="button"
                      onClick={() => {
                        onSelectMonth(month.key);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] transition-colors flex items-center justify-between ${
                        month.key === selectedMonth
                          ? 'bg-primary/15 text-primary font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span>{month.label}</span>
                      {month.key === selectedMonth && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Export Actions */}
          <button
            type="button"
            onClick={onExportPDF}
            className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container-high border border-white/10 rounded-xl text-[13px] font-medium text-on-surface hover:border-primary/40 transition-all cursor-pointer"
          >
            <FileDown size={14} className="text-primary" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container-high border border-white/10 rounded-xl text-[13px] font-medium text-on-surface hover:border-primary/40 transition-all cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Health Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-surface-container-low to-surface-container-low border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-on-surface">
              Monthly Financial Health: <span className="text-emerald-400">Excellent</span>
            </h4>
            <p className="text-[12px] text-on-surface-variant">
              You are retaining <span className="text-primary font-semibold">{savingsRate}%</span> of your income after all expenses, investments, and loan EMIs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto text-[12px] text-on-surface-variant">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> EMIs On Track</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span> SIPs Invested</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400"></span> Auto-Pay Active</span>
        </div>
      </div>
    </div>
  );
}
