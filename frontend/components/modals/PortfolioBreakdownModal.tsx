"use client";

import React from "react";
import { Account } from "../../types";
import { X, PieChart, Landmark, Briefcase, Lock, PiggyBank, ShieldCheck } from "lucide-react";

interface Props {
  accounts: Account[];
  totalBalance: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PortfolioBreakdownModal({ accounts, totalBalance, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const savingsBalance = accounts.filter(a => a.type === "SAVINGS").reduce((s, a) => s + a.balance, 0);
  const currentBalance = accounts.filter(a => a.type === "CURRENT").reduce((s, a) => s + a.balance, 0);
  const fdBalance = accounts.filter(a => a.type === "FIXED_DEPOSIT").reduce((s, a) => s + a.balance, 0);
  const rdBalance = accounts.filter(a => a.type === "RECURRING_DEPOSIT").reduce((s, a) => s + a.balance, 0);

  const getPct = (bal: number) => (totalBalance > 0 ? Math.round((bal / totalBalance) * 100) : 0);

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
              <PieChart size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Portfolio Net Worth Breakdown</h2>
              <p className="text-xs text-on-surface-variant">Asset allocation across all bank relationships</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Total Net Worth Box */}
        <div className="bg-surface-high/60 rounded-xl p-4 border border-outline-variant/10 flex justify-between items-center">
          <div>
            <span className="text-xs text-on-surface-variant uppercase font-medium">Total Portfolio Value</span>
            <p className="font-bold text-2xl text-primary mt-0.5 font-mono">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-tertiary font-medium bg-tertiary/10 px-3 py-1.5 rounded-full border border-tertiary/20">
            <ShieldCheck size={16} />
            <span>DICGC Insured</span>
          </div>
        </div>

        {/* Categories Progress Bars */}
        <div className="flex flex-col gap-3.5 text-xs">
          {/* Savings */}
          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Landmark size={16} className="text-tertiary" />
                <span className="font-semibold text-on-surface">Savings Accounts ({getPct(savingsBalance)}%)</span>
              </div>
              <span className="font-mono font-bold text-on-surface">{formatCurrency(savingsBalance)}</span>
            </div>
            <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden">
              <div className="h-full bg-tertiary rounded-full transition-all duration-700" style={{ width: `${getPct(savingsBalance)}%` }}></div>
            </div>
          </div>

          {/* Current */}
          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-secondary" />
                <span className="font-semibold text-on-surface">Current Accounts ({getPct(currentBalance)}%)</span>
              </div>
              <span className="font-mono font-bold text-on-surface">{formatCurrency(currentBalance)}</span>
            </div>
            <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${getPct(currentBalance)}%` }}></div>
            </div>
          </div>

          {/* Fixed Deposits */}
          <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-primary-fixed" />
                <span className="font-semibold text-on-surface">Fixed Deposits ({getPct(fdBalance)}%)</span>
              </div>
              <span className="font-mono font-bold text-on-surface">{formatCurrency(fdBalance)}</span>
            </div>
            <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden">
              <div className="h-full bg-primary-fixed rounded-full transition-all duration-700" style={{ width: `${getPct(fdBalance)}%` }}></div>
            </div>
          </div>

          {/* Recurring Deposits */}
          {rdBalance > 0 && (
            <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PiggyBank size={16} className="text-tertiary-fixed" />
                  <span className="font-semibold text-on-surface">Recurring Deposits ({getPct(rdBalance)}%)</span>
                </div>
                <span className="font-mono font-bold text-on-surface">{formatCurrency(rdBalance)}</span>
              </div>
              <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-fixed rounded-full transition-all duration-700" style={{ width: `${getPct(rdBalance)}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/20">
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
