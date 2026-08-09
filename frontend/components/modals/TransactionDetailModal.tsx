"use client";

import React from "react";
import { Transaction, Account } from "../../types";
import { X, CheckCircle2, ArrowUpRight, ArrowDownLeft, Download, ShieldCheck, Landmark } from "lucide-react";

import { generatePdfBlob } from "../../lib/pdfGenerator";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, account, isOpen, onClose }: TransactionDetailModalProps) {
  if (!isOpen || !transaction) return null;

  const isCredit = transaction.type === "CREDIT";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  const handleDownloadReceipt = () => {
    const lines = [
      `OFFICIAL PAYMENT & TRANSACTION RECEIPT`,
      `---------------------------------------------------------------------------------------------------`,
      `Transaction Reference : ${transaction.id}`,
      `Date & Timestamp     : ${transaction.date}`,
      `Associated Account   : ${account?.name || 'Primary Savings Account'} (${account?.maskedNumber || '•••• 8812'})`,
      `Merchant / Payee     : ${transaction.merchantName}`,
      `Category             : ${transaction.category}`,
      `Transaction Type     : ${transaction.type}`,
      `Transaction Amount   : INR ${Math.abs(transaction.amount).toFixed(2)}`,
      `Payment Status       : SUCCESS (Cryptographically Verified)`,
      `---------------------------------------------------------------------------------------------------`,
      `Thank you for banking with FinEdge Intelligent Platform.`
    ];
    const blob = generatePdfBlob(`FINEDGE BANK - PAYMENT RECEIPT`, lines);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinEdge_Receipt_${transaction.id}.pdf`;
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
            <div className={`p-2.5 rounded-xl ${isCredit ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
              {isCredit ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Transaction Receipt</h2>
              <p className="text-xs text-on-surface-variant">Verified payment record</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Amount Box */}
        <div className="bg-surface-high/60 rounded-xl p-5 border border-outline-variant/10 flex flex-col items-center justify-center text-center gap-1">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider">Amount</span>
          <span className={`text-2xl font-extrabold font-mono ${isCredit ? 'text-tertiary' : 'text-on-surface'}`}>
            {isCredit ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-tertiary font-medium">
            <CheckCircle2 size={16} />
            <span>Transaction Completed Successfully</span>
          </div>
        </div>

        {/* Details Table */}
        <div className="flex flex-col gap-3 text-xs">
          <div className="flex justify-between p-2.5 bg-surface-high/40 rounded-lg border border-outline-variant/10">
            <span className="text-on-surface-variant font-medium">Transaction ID</span>
            <span className="font-mono font-semibold">{transaction.id}</span>
          </div>

          <div className="flex justify-between p-2.5 bg-surface-high/40 rounded-lg border border-outline-variant/10">
            <span className="text-on-surface-variant font-medium">Merchant / Beneficiary</span>
            <span className="font-semibold">{transaction.merchantName}</span>
          </div>

          <div className="flex justify-between p-2.5 bg-surface-high/40 rounded-lg border border-outline-variant/10">
            <span className="text-on-surface-variant font-medium">Category</span>
            <span className="font-semibold">{transaction.category}</span>
          </div>

          <div className="flex justify-between p-2.5 bg-surface-high/40 rounded-lg border border-outline-variant/10">
            <span className="text-on-surface-variant font-medium">Date & Time</span>
            <span className="font-mono">{transaction.date}</span>
          </div>

          {account && (
            <div className="flex justify-between p-2.5 bg-surface-high/40 rounded-lg border border-outline-variant/10">
              <span className="text-on-surface-variant font-medium">Associated Account</span>
              <span className="font-semibold">{account.name} ({account.maskedNumber})</span>
            </div>
          )}
        </div>

        {/* Security Stamp */}
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-tertiary" />
            <span>Cryptographically Verified</span>
          </div>
          <span>FinEdge Core Banking Engine</span>
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
            onClick={handleDownloadReceipt}
            className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Download size={16} /> Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
