"use client";

import React, { useState } from 'react';
import { FileText, Download, Loader2, Check } from 'lucide-react';
import { exportReportToCSV, exportReportToPrintablePDF } from '../../lib/reportExporter';
import { ReportAnalytics } from '../../lib/reportAnalytics';

const REPORTS = [
  { label: 'Monthly Summary', desc: 'Income, expenses & savings overview', icon: '📊', type: 'PDF' as const },
  { label: 'Tax Statement', desc: 'AY 2025-26 with Form 26AS details', icon: '🧾', type: 'PDF' as const },
  { label: 'Investment Report', desc: 'Portfolio performance & returns', icon: '📈', type: 'CSV' as const },
  { label: 'Loan Amortization', desc: 'Full schedule with interest breakdown', icon: '🏦', type: 'PDF' as const },
];

type GenState = 'idle' | 'generating' | 'done';

export default function ReportTemplates({ analytics }: { analytics: ReportAnalytics }) {
  const [states, setStates] = useState<Record<number, GenState>>({});

  const handleGenerate = (i: number) => {
    if (states[i] === 'generating') return;
    setStates(prev => ({ ...prev, [i]: 'generating' }));

    setTimeout(() => {
      setStates(prev => ({ ...prev, [i]: 'done' }));

      const template = REPORTS[i];
      const sampleTransactions = analytics.transactions.map(t => ({
        date: t.date || "Today",
        description: t.merchantName || t.category || "Transaction",
        category: t.category || "General",
        amount: Math.abs(t.amount),
        type: t.type === "CREDIT" ? "CREDIT" as const : "DEBIT" as const,
      }));

      const exportData = {
        timeframe: `Report Statement — ${template.label}`,
        totalIncome: analytics.totalIncome,
        totalExpenses: analytics.totalExpenses,
        netSavings: analytics.netSavings,
        investments: analytics.investmentActivity,
        creditScore: 0,
        categoryBreakdown: analytics.categories,
        transactions: sampleTransactions,
      };

      if (template.label === 'Monthly Summary') {
        exportReportToPrintablePDF(exportData, 'Monthly Financial Summary');
      } else if (template.label === 'Tax Statement') {
        exportReportToPrintablePDF(exportData, 'Tax Transaction Statement');
      } else if (template.label === 'Investment Report') {
        exportReportToCSV(exportData, 'FinEdge_Investment_Report.csv');
      } else if (template.label === 'Loan Amortization') {
        exportReportToPrintablePDF(exportData, 'Loan Payment Activity');
      }

      // Reset state after 3 seconds so user can generate again if needed
      setTimeout(() => {
        setStates(prev => ({ ...prev, [i]: 'idle' }));
      }, 4000);
    }, 1200);
  };

  return (
    <div className="bg-surface-container-low border border-white/5 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <FileText size={18} className="text-primary" />
        <h3 className="text-[16px] font-headline-lg font-semibold text-on-surface">Report Templates</h3>
      </div>

      <div className="flex flex-col gap-2">
        {REPORTS.map((r, i) => {
          const state = states[i] || 'idle';
          return (
            <div
              key={r.label}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-high/40 border border-white/5 hover:border-primary/20 hover:bg-surface-container-high/80 transition-all duration-200 group"
            >
              <span className="text-[22px] group-hover:scale-110 transition-transform duration-200">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-on-surface truncate">{r.label}</p>
                <p className="text-[12px] text-on-surface-variant/70 truncate">{r.desc}</p>
              </div>
              <button
                onClick={() => handleGenerate(i)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  state === 'done'
                    ? 'bg-tertiary/20 text-tertiary'
                    : state === 'generating'
                    ? 'bg-surface-container border border-white/10 text-on-surface-variant cursor-wait'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {state === 'generating' && <Loader2 size={13} className="animate-spin" />}
                {state === 'done' && <Check size={13} />}
                {state === 'idle' && <Download size={13} />}
                {state === 'idle' && 'Generate'}
                {state === 'generating' && 'Building...'}
                {state === 'done' && 'Downloaded'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
