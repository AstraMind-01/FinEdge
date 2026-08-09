"use client";

import React from "react";
import { Account } from "../../types";
import { X, Landmark, Briefcase, Lock, PiggyBank, Copy, Check } from "lucide-react";

interface Props {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (id: string) => void;
}

export default function AccountsDirectoryModal({ accounts, isOpen, onClose, onSelectAccount }: Props) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (num: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getIcon = (type: string) => {
    if (type === "SAVINGS") return <Landmark className="text-tertiary" size={18} />;
    if (type === "CURRENT") return <Briefcase className="text-secondary" size={18} />;
    if (type === "FIXED_DEPOSIT") return <Lock className="text-primary-fixed" size={18} />;
    return <PiggyBank className="text-tertiary-fixed" size={18} />;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight font-headline-lg">Bank Relationships Directory</h2>
            <p className="text-xs text-on-surface-variant">Complete listing of linked accounts & fixed deposits</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Directory Cards */}
        <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
          {accounts.map(acc => (
            <div 
              key={acc.id}
              onClick={() => { onSelectAccount(acc.id); onClose(); }}
              className="p-4 bg-surface-high/40 hover:bg-surface-high rounded-xl border border-outline-variant/10 flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-surface-high rounded-xl shrink-0">
                  {getIcon(acc.type)}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-on-surface">{acc.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${acc.status === 'ACTIVE' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                      {acc.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant mt-0.5">
                    Account: {acc.accountNumber || acc.maskedNumber} • IFSC: {acc.ifsc || 'HDFC0001234'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant">Branch: {acc.branch || 'Connaught Place'}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="font-mono text-sm font-bold text-on-surface">
                  {formatCurrency(acc.balance)}
                </span>
                <button
                  onClick={(e) => handleCopy(acc.accountNumber || acc.lastFour, acc.id, e)}
                  className="px-2.5 py-1 bg-surface-high hover:bg-surface-highest text-on-surface-variant text-[11px] rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === acc.id ? <Check size={12} className="text-tertiary" /> : <Copy size={12} />}
                  {copiedId === acc.id ? "Copied" : "Copy Account"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20 text-xs">
          <span className="text-on-surface-variant font-mono">Total Relationships: {accounts.length}</span>
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
