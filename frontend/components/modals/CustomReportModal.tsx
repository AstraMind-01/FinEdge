"use client";

import React, { useState } from "react";
import { X, Sparkles, Calendar, FileText, CheckCircle2, Download } from "lucide-react";
import { exportReportToCSV, exportReportToPrintablePDF } from "../../lib/reportExporter";
import { useAccounts } from "../../context/AccountContext";

interface CustomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomReportModal({ isOpen, onClose }: CustomReportModalProps) {
  const { transactions } = useAccounts();
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportFormat, setReportFormat] = useState<"PDF" | "CSV">("PDF");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateCustomReport = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // Calculate dynamic data
      const filteredTransactions = transactions.filter(t => {
        const categoryMatches = selectedCategory === "ALL" || (t.category || "General") === selectedCategory;
        const parsed = new Date(t.timestamp || t.date || "");
        const dateMatches = Number.isNaN(parsed.getTime()) || (parsed >= new Date(startDate) && parsed <= new Date(`${endDate}T23:59:59`));
        return categoryMatches && dateMatches;
      });
      const sampleTransactions = filteredTransactions.map(t => ({
        date: t.date || "Today",
        description: t.merchantName || t.category || "Transaction",
        category: t.category || "General",
        amount: Math.abs(t.amount),
        type: t.type === "CREDIT" ? "CREDIT" as const : "DEBIT" as const,
      }));

      const totalIncome = filteredTransactions.filter(t => t.type === "CREDIT").reduce((acc, t) => acc + Math.abs(t.amount), 0);
      const totalExpenses = filteredTransactions.filter(t => t.type === "DEBIT").reduce((acc, t) => acc + Math.abs(t.amount), 0);
      const investmentActivity = filteredTransactions
        .filter(t => t.type === "DEBIT" && /invest/i.test(t.category || ""))
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);
      const categoryTotals = new Map<string, number>();
      filteredTransactions.filter(t => t.type === "DEBIT").forEach(t => {
        const name = t.category || "Other";
        categoryTotals.set(name, (categoryTotals.get(name) || 0) + Math.abs(t.amount));
      });
      const categoryBreakdown = [...categoryTotals.entries()].map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0,
      })).sort((a, b) => b.amount - a.amount);

      const exportData = {
        timeframe: `Custom Range (${startDate} to ${endDate})`,
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        investments: investmentActivity,
        creditScore: 0,
        categoryBreakdown,
        transactions: sampleTransactions,
      };

      if (reportFormat === "PDF") {
        exportReportToPrintablePDF(exportData, `Custom Financial Report (${startDate} to ${endDate})`);
      } else {
        exportReportToCSV(exportData, `FinEdge_Custom_Report_${startDate}_to_${endDate}.csv`);
      }

      setIsGenerating(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-headline-lg font-bold text-on-surface">Custom Report Builder</h2>
              <p className="text-[12px] text-on-surface-variant">Generate tailored financial insights for any date range</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-on-surface-variant font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-on-surface-variant font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-on-surface-variant font-medium">Include Categories</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="ALL">All Categories & Transactions</option>
              <option value="Shopping">Shopping Only</option>
              <option value="Food & Dining">Food & Dining Only</option>
              <option value="Bills & Utilities">Bills & Utilities Only</option>
              <option value="Travel">Travel Only</option>
              <option value="Investments">Investments & Wealth</option>
            </select>
          </div>

          {/* Export Format Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-on-surface-variant font-medium">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportFormat("PDF")}
                className={`py-3 px-4 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  reportFormat === "PDF"
                    ? "bg-primary/10 border-primary/50 text-primary"
                    : "bg-surface-container-high border-white/5 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <FileText size={16} />
                <span>PDF Document</span>
              </button>
              <button
                type="button"
                onClick={() => setReportFormat("CSV")}
                className={`py-3 px-4 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  reportFormat === "CSV"
                    ? "bg-primary/10 border-primary/50 text-primary"
                    : "bg-surface-container-high border-white/5 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Download size={16} />
                <span>Excel / CSV</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surface-container-low flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerateCustomReport}
            disabled={isGenerating}
            className="px-5 py-2 bg-primary text-on-primary font-semibold text-[13px] rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Building Report...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate & Download</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
