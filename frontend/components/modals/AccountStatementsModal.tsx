"use client";

import React, { useState } from "react";
import { Account, Transaction } from "../../types";
import { X, Globe, Download, FileText, Calendar, Printer, CheckCircle2 } from "lucide-react";

import { AccountStatementBuilder } from "../../lib/pdf/documents/AccountStatement";

interface AccountStatementsModalProps {
  account: Account | null;
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountStatementsModal({ account, transactions, isOpen, onClose }: AccountStatementsModalProps) {
  const [period, setPeriod] = useState<string>("30");
  const [fileFormat, setFileFormat] = useState<"pdf" | "csv">("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !account) return null;

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let blob: Blob;
      if (fileFormat === "csv") {
        const headers = "Transaction ID,Date,Description,Type,Amount (INR)\n";
        const rows = transactions.map(t => 
          `"${t.id}","${t.date}","${t.merchantName}","${t.type}",${t.amount}`
        ).join("\n");
        blob = new Blob([headers + rows], { type: "text/csv" });
      } else {
        // We try to get the account holder name
        const customerName = account && 'accountHolder' in account && typeof (account as any).accountHolder === 'string' 
          ? (account as any).accountHolder 
          : 'FinEdge Customer';

        const periodStr = period === 'all' ? 'All Time' : `Last ${period} Days`;
        
        AccountStatementBuilder.generate(account, customerName, transactions, periodStr);
        blob = new Blob(); // Dummy blob to not break the rest of the flow for CSV
      }

      if (fileFormat === "csv") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `FinEdge_Statement_${account.name.replace(/\s+/g, '_')}_${period}days.${fileFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Account Statements</h2>
              <p className="text-xs text-on-surface-variant">Generate & download official statements for {account.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="p-3.5 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3 text-tertiary text-xs font-medium">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>Statement generated and downloaded to your device!</span>
          </div>
        )}

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Period Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
              <Calendar size={14} /> Select Statement Period
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Last 30 Days", val: "30" },
                { label: "Last 90 Days", val: "90" },
                { label: "Financial Year", val: "365" },
                { label: "All Time", val: "all" },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setPeriod(p.val)}
                  className={`p-2.5 rounded-xl border text-center font-medium transition-all ${period === p.val ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
              <FileText size={14} /> File Format
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFileFormat("pdf")}
                className={`p-3 rounded-xl border text-center font-medium transition-all flex items-center justify-center gap-2 ${fileFormat === "pdf" ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'}`}
              >
                PDF Document
              </button>
              <button
                type="button"
                onClick={() => setFileFormat("csv")}
                className={`p-3 rounded-xl border text-center font-medium transition-all flex items-center justify-center gap-2 ${fileFormat === "csv" ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'}`}
              >
                CSV / Excel
              </button>
            </div>
          </div>
        </div>

        {/* Statement Preview Table */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">Statement Preview ({transactions.length} Records)</span>
            <button
              onClick={handlePrint}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <Printer size={14} /> Print Preview
            </button>
          </div>

          <div className="bg-surface-high/40 border border-outline-variant/10 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-high text-on-surface-variant uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-on-surface-variant">No transactions found for selected range</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-high/60 transition-colors">
                      <td className="p-3 font-mono text-on-surface-variant">{tx.date}</td>
                      <td className="p-3 font-medium text-on-surface">{tx.merchantName}</td>
                      <td className="p-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${tx.type === 'CREDIT' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`p-3 text-right font-mono font-semibold ${tx.amount > 0 ? 'text-tertiary' : 'text-on-surface'}`}>
                        {formatCurrency(Math.abs(tx.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20 mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Download size={16} />
            {isGenerating ? "Generating..." : `Download ${fileFormat.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
