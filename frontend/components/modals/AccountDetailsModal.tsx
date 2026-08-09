"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, Copy, Check, ShieldCheck, Landmark, CreditCard, Calendar, User, Percent, AlertCircle } from "lucide-react";

interface AccountDetailsModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  isVerified: boolean;
}

export default function AccountDetailsModal({ account, isOpen, onClose, isVerified }: AccountDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Landmark size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">{account.name} Details</h2>
              <p className="text-xs text-on-surface-variant">Complete account configuration & security specs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Strip */}
        <div className="bg-surface-high/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-outline-variant/10">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${account.status === 'ACTIVE' ? 'bg-tertiary shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></span>
            <span className="text-sm font-medium">Status: <strong className="uppercase">{account.status}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <ShieldCheck size={16} className="text-primary" />
            <span>256-Bit SSL Encrypted Account</span>
          </div>
        </div>

        {/* Detail Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              Account Number
            </span>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-base font-semibold">{account.accountNumber || account.maskedNumber}</span>
              <button 
                onClick={() => copyToClipboard(account.accountNumber || account.lastFour, "accNum")}
                className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-md"
                title="Copy Account Number"
              >
                {copiedField === "accNum" ? <Check size={16} className="text-tertiary" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              IFSC Code
            </span>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-base font-semibold">{account.ifsc || "HDFC0001234"}</span>
              <button 
                onClick={() => copyToClipboard(account.ifsc || "HDFC0001234", "ifsc")}
                className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-md"
                title="Copy IFSC Code"
              >
                {copiedField === "ifsc" ? <Check size={16} className="text-tertiary" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              Account Balance
            </span>
            <span className="text-base font-bold text-primary mt-1">
              {isVerified ? formatCurrency(account.balance) : "•••••••• (Access Required)"}
            </span>
          </div>

          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              Branch Location
            </span>
            <span className="font-medium truncate mt-1">{account.branch || "Connaught Place, New Delhi"}</span>
          </div>

          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              <User size={14} /> Account Holder
            </span>
            <span className="font-medium mt-1 uppercase">{account.accountHolder}</span>
          </div>

          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              <Calendar size={14} /> Opening Date
            </span>
            <span className="font-medium mt-1">{account.openingDate || "2020-01-15"}</span>
          </div>

          {account.nominee && (
            <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
                Registered Nominee
              </span>
              <span className="font-medium mt-1">{account.nominee} ({account.nomineeRelation || "Relative"})</span>
            </div>
          )}

          {account.linkedCard && (
            <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
                <CreditCard size={14} /> Linked Card
              </span>
              <span className="font-medium mt-1">{account.linkedCard}</span>
            </div>
          )}

          {account.dailyLimit && (
            <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
                <AlertCircle size={14} /> Daily Transfer Limit
              </span>
              <span className="font-medium text-tertiary mt-1">{formatCurrency(account.dailyLimit)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
