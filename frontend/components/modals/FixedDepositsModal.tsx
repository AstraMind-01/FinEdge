"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, Landmark, CheckCircle2, AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";

interface FixedDepositsModalProps {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onCreateFd: (sourceAccountId: string, amount: number, tenureMonths: number, interestRate: number) => Promise<Account>;
}

const TENURES = [
  { months: 12, label: "1 Year", rate: 6.50 },
  { months: 36, label: "3 Years", rate: 7.25 },
  { months: 60, label: "5 Years", rate: 7.75 },
];

export default function FixedDepositsModal({ accounts, isOpen, onClose, onCreateFd }: FixedDepositsModalProps) {
  const { isAccountVerified } = useAccounts();
  const activeAccounts = accounts.filter(a => a.type === "SAVINGS" || a.type === "CURRENT");
  const [sourceAccountId, setSourceAccountId] = useState(activeAccounts[0]?.id || "");
  const [depositAmount, setDepositAmount] = useState<string>("50000");
  const [selectedTenure, setSelectedTenure] = useState(TENURES[1]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(depositAmount) || 0;
  const estimatedInterest = Math.round(numAmount * (selectedTenure.rate / 100) * (selectedTenure.months / 12));
  const estimatedMaturityValue = numAmount + estimatedInterest;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isNaN(numAmount) || numAmount < 10000) {
      setErrorMsg("Minimum fixed deposit amount is ₹10,000.");
      return;
    }
    if (!sourceAccountId) {
      setErrorMsg("Please select a funding account.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newFd = await onCreateFd(sourceAccountId, numAmount, selectedTenure.months, selectedTenure.rate);
      setSuccessMsg(`Fixed Deposit (${newFd.maskedNumber}) opened successfully with maturity value of ₹${estimatedMaturityValue.toLocaleString('en-IN')}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to open Fixed Deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Landmark size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Open Fixed Deposit</h2>
              <p className="text-xs text-on-surface-variant">Guaranteed high returns with instant online FD creation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-xs font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3 text-tertiary text-xs font-medium">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Source Account */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Funding Source Account</label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface"
            >
              {activeAccounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-[#191f2f] text-[#dde2f8]">
                  {acc.name} ({acc.maskedNumber}) {isAccountVerified(acc.id) ? `- ${formatCurrency(acc.balance)}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Deposit Amount (Min. ₹10,000)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-on-surface-variant text-sm font-semibold">₹</span>
              <input
                type="number"
                min="10000"
                step="5000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl py-3 pl-8 pr-3 text-sm focus:outline-none focus:border-primary text-on-surface font-bold text-base"
              />
            </div>
          </div>

          {/* Tenure Cards */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-on-surface-variant">Select Deposit Tenure</label>
            <div className="grid grid-cols-3 gap-2.5">
              {TENURES.map(t => {
                const isSel = selectedTenure.months === t.months;
                return (
                  <div
                    key={t.months}
                    onClick={() => setSelectedTenure(t)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-1 ${isSel ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span className="text-xs font-bold text-on-surface">{t.label}</span>
                    <span className="text-sm font-mono font-bold text-primary">{t.rate}% p.a.</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maturity Estimate Box */}
          <div className="bg-surface-high/60 rounded-xl p-4 border border-outline-variant/10 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-on-surface-variant uppercase font-medium">Interest Earned</span>
              <p className="font-bold text-tertiary text-sm mt-0.5">{formatCurrency(estimatedInterest)}</p>
            </div>
            <div className="text-right">
              <span className="text-on-surface-variant uppercase font-medium">Estimated Maturity</span>
              <p className="font-bold text-primary text-sm mt-0.5">{formatCurrency(estimatedMaturityValue)}</p>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating FD...
                </>
              ) : (
                "Create Fixed Deposit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
