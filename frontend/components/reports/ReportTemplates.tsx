"use client";

import React, { useState } from 'react';
import { FileText, Download, Loader2, Check } from 'lucide-react';
import { exportReportToCSV } from '../../lib/reportExporter';
import { generateAndDownloadCentralPDF } from '../../lib/pdfService';
import { useAccounts } from '../../context/AccountContext';

const REPORTS = [
  { label: 'Monthly Summary', desc: 'Income, expenses & savings overview', icon: '📊', type: 'PDF' as const },
  { label: 'Tax Statement', desc: 'AY 2025-26 with Form 26AS details', icon: '🧾', type: 'PDF' as const },
  { label: 'Investment Report', desc: 'Portfolio performance & returns', icon: '📈', type: 'CSV' as const },
  { label: 'Loan Amortization', desc: 'Full schedule with interest breakdown', icon: '🏦', type: 'PDF' as const },
];

type GenState = 'idle' | 'generating' | 'done';

export default function ReportTemplates() {
  const { transactions } = useAccounts();
  const [states, setStates] = useState<Record<number, GenState>>({});

  const handleGenerate = (i: number) => {
    if (states[i] === 'generating') return;
    setStates(prev => ({ ...prev, [i]: 'generating' }));

    setTimeout(() => {
      setStates(prev => ({ ...prev, [i]: 'done' }));

      const template = REPORTS[i];
      const sampleTransactions = transactions.map(t => ({
        date: t.date || "Today",
        description: t.merchantName || t.category || "Transaction",
        category: t.category || "General",
        amount: Math.abs(t.amount),
        type: t.type === "CREDIT" ? "CREDIT" as const : "DEBIT" as const,
      }));

      const exportData = {
        timeframe: `Report Statement — ${template.label}`,
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

      if (template.label === 'Monthly Summary') {
        generateAndDownloadCentralPDF({ documentType: 'MONTHLY_SUMMARY', period: 'This Month', transactions });
      } else if (template.label === 'Tax Statement') {
        generateAndDownloadCentralPDF({ documentType: 'TAX_STATEMENT', period: 'AY 2025-26' });
      } else if (template.label === 'Investment Report') {
        generateAndDownloadCentralPDF({ documentType: 'INVESTMENT_REPORT', format: 'CSV' });
      } else if (template.label === 'Loan Amortization') {
        generateAndDownloadCentralPDF({ documentType: 'LOAN_AMORTIZATION', entityId: 'LN-2026-8819' });
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
