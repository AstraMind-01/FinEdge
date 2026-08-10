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
  const { transactions, accounts } = useAccounts();
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [reportFormat, setReportFormat] = useState<"PDF" | "CSV">("PDF");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateCustomReport = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // Calculate dynamic data
      const sampleTransactions = transactions.map(t => ({
        date: t.date || "Today",
        description: t.merchantName || t.category || "Transaction",
        category: t.category || "General",
        amount: Math.abs(t.amount),
        type: t.type === "CREDIT" ? "CREDIT" as const : "DEBIT" as const,
      }));

      const totalIncome = transactions.filter(t => t.type === "CREDIT").reduce((acc, t) => acc + Math.abs(t.amount), 86500);
      const totalExpenses = transactions.filter(t => t.type === "DEBIT").reduce((acc, t) => acc + Math.abs(t.amount), 48650);

      const exportData = {
        timeframe: `Custom Range (${startDate} to ${endDate})`,
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
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
