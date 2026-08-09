"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, TrendingUp, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";

interface MutualFundsModalProps {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onInvest: (accountId: string, fundName: string, amount: number, isSip: boolean) => Promise<void>;
}

const TOP_FUNDS = [
  { id: "mf1", name: "FinEdge Bluechip Equity Fund", category: "Large Cap", returns: "18.4% 3Y CAGR", minSip: 1000 },
  { id: "mf2", name: "FinEdge Flexi Cap Opportunity", category: "Flexi Cap", returns: "22.1% 3Y CAGR", minSip: 500 },
  { id: "mf3", name: "FinEdge Tax Saver ELSS Fund", category: "Tax Saving (80C)", returns: "16.8% 3Y CAGR", minSip: 500 },
  { id: "mf4", name: "FinEdge Small Cap High Alpha", category: "Small Cap", returns: "27.5% 3Y CAGR", minSip: 1000 },
];

export default function MutualFundsModal({ accounts, isOpen, onClose, onInvest }: MutualFundsModalProps) {
  const activeAccounts = accounts.filter(a => a.type === "SAVINGS" || a.type === "CURRENT");
  const [selectedFund, setSelectedFund] = useState(TOP_FUNDS[0]);
  const [isSip, setIsSip] = useState(true);
  const [amount, setAmount] = useState("5000");
  const [sourceAccountId, setSourceAccountId] = useState(activeAccounts[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < selectedFund.minSip) {
      setErrorMsg(`Minimum investment for this fund is ₹${selectedFund.minSip}.`);
      return;
    }
    if (!sourceAccountId) {
      setErrorMsg("Please select a source account.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onInvest(sourceAccountId, selectedFund.name, numAmount, isSip);
      setSuccessMsg(`${isSip ? 'Monthly SIP' : 'Lump-sum investment'} of ₹${numAmount.toLocaleString('en-IN')} in ${selectedFund.name} started successfully!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Investment failed.");
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
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Wealth & Mutual Funds</h2>
              <p className="text-xs text-on-surface-variant">Zero-commission direct mutual funds & SIPs</p>
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
          {/* Mode Toggle */}
          <div className="flex bg-surface-high/40 p-1 rounded-xl border border-outline-variant/10 text-xs">
            <button
              type="button"
              onClick={() => setIsSip(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${isSip ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Monthly SIP (Auto-Debit)
            </button>
            <button
              type="button"
              onClick={() => setIsSip(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${!isSip ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              One-Time Lump-sum
            </button>
          </div>

          {/* Select Fund */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-on-surface-variant">Select Top Performing Fund</label>
            <div className="grid grid-cols-2 gap-2">
              {TOP_FUNDS.map(f => {
                const isSel = selectedFund.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFund(f)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${isSel ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <div>
                      <span className="text-xs font-bold text-on-surface block leading-tight">{f.name}</span>
                      <span className="text-[10px] text-on-surface-variant">{f.category}</span>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-tertiary">{f.returns}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source Account */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Deduct From Account</label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface"
            >
              {activeAccounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-[#191f2f] text-[#dde2f8]">
                  {acc.name} ({acc.maskedNumber}) - {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">
              {isSip ? "Monthly SIP Amount (₹)" : "Investment Amount (₹)"}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-on-surface-variant text-sm font-semibold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl py-3 pl-8 pr-3 text-sm focus:outline-none focus:border-primary text-on-surface font-bold text-base"
              />
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
                  <Loader2 size={16} className="animate-spin" /> Investing...
                </>
              ) : (
                isSip ? "Start Monthly SIP" : "Invest Lump-sum"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
