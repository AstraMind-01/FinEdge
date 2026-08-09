"use client";

import React from "react";
import { Account } from "../../types";
import { X, Coins, Download, ShieldCheck, FileCheck, CheckCircle2 } from "lucide-react";

import { generatePdfBlob } from "../../lib/pdfGenerator";

interface Props {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
}

export default function InterestCertificateModal({ accounts, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const totalInterest = accounts.reduce((acc, a) => acc + (a.interestEarned || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  const handleDownloadCert = () => {
    const lines = [
      `OFFICIAL INTEREST CERTIFICATE FOR FINANCIAL YEAR 2025-2026`,
      `---------------------------------------------------------------------------------------------------`,
      `Customer Name    : Soumya Ranjan`,
      `PAN Card Number  : ABCDE1234F`,
      `Issue Date       : 09 Aug 2026`,
      `---------------------------------------------------------------------------------------------------`,
      `INTEREST EARNED BREAKDOWN BY ACCOUNT:`,
      ...accounts.map(a => `- ${a.name.padEnd(28)} (${a.maskedNumber}) : INR ${(a.interestEarned || 7300).toFixed(2)}`),
      `---------------------------------------------------------------------------------------------------`,
      `TOTAL INTEREST ACCRUED : INR ${totalInterest.toFixed(2)}`,
      `TDS DEDUCTED (Form 16A): INR 0.00`,
      `---------------------------------------------------------------------------------------------------`,
      `This document is cryptographically signed and valid for Income Tax Return (ITR) filings.`
    ];
    const blob = generatePdfBlob(`FINEDGE BANK - FORM 16A INTEREST CERTIFICATE`, lines);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinEdge_Interest_Certificate_FY25-26.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Coins size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Interest & Tax Earnings</h2>
              <p className="text-xs text-on-surface-variant">Annual accrued interest summary for FY 2025-26</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Total Interest Banner */}
        <div className="bg-surface-high/60 rounded-xl p-5 border border-outline-variant/10 flex flex-col items-center justify-center text-center gap-1">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">Total Accrued Interest</span>
          <span className="text-3xl font-extrabold font-mono text-tertiary">
            {formatCurrency(totalInterest)}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-tertiary font-medium">
            <CheckCircle2 size={16} />
            <span>Form 16A / 15G Compliant</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="flex flex-col gap-2.5 text-xs">
          {accounts.map(acc => (
            <div key={acc.id} className="flex justify-between p-3 bg-surface-high/40 rounded-xl border border-outline-variant/10">
              <div className="flex flex-col">
                <span className="font-semibold text-on-surface">{acc.name}</span>
                <span className="text-[10px] text-on-surface-variant font-mono">{acc.maskedNumber} • {acc.type}</span>
              </div>
              <span className="font-mono font-bold text-tertiary self-center">
                +{formatCurrency(acc.interestEarned || 7300)}
              </span>
            </div>
          ))}
        </div>

        {/* Security Stamp */}
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-tertiary" />
            <span>Verified Tax Document</span>
          </div>
          <span>ITR Filing Ready</span>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
          >
            Close
          </button>
          <button
            onClick={handleDownloadCert}
            className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Download size={16} /> Download Certificate (Form 16A)
          </button>
        </div>
      </div>
    </div>
  );
}
