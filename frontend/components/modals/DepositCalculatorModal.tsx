"use client";

import React, { useState } from "react";
import { X, Calculator, Percent, ArrowRight, TrendingUp } from "lucide-react";

interface DepositCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
}

export default function DepositCalculatorModal({
  isOpen,
  onClose,
  onOpenDeposit
}: DepositCalculatorModalProps) {
  const [calcType, setCalcType] = useState<"FD" | "RD">("FD");
  const [amountInput, setAmountInput] = useState("200000");
  const [tenureYears, setTenureYears] = useState(3);

  if (!isOpen) return null;

  const principal = Number(amountInput) || 0;
  const rate = tenureYears >= 3 ? 8.10 : tenureYears >= 2 ? 7.50 : 7.10;
  
  const maturityAmount = calcType === 'FD' 
    ? Math.round(principal * Math.pow(1 + (rate / 100) / 4, 4 * tenureYears))
    : Math.round(principal * tenureYears * 12 * 1.085);

  const interestEarned = maturityAmount - (calcType === 'FD' ? principal : principal * tenureYears * 12);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Calculator size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Deposit Returns Calculator</h2>
              <p className="text-xs text-on-surface-variant">Real-time compounding interest &amp; payout breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-surface rounded-xl p-1 border border-white/5 text-xs">
          <button
            type="button"
            onClick={() => setCalcType('FD')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${calcType === 'FD' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Fixed Deposit Calculator
          </button>
          <button
            type="button"
            onClick={() => setCalcType('RD')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${calcType === 'RD' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Recurring Deposit Calculator
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">
              {calcType === 'FD' ? 'Deposit Principal (₹)' : 'Monthly Installment (₹)'}
            </label>
            <input 
              type="number"
              value={amountInput}
              onChange={e => setAmountInput(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-on-surface-variant">Deposit Tenure</label>
              <span className="text-primary font-mono font-bold">{tenureYears} Years</span>
            </div>
            <input 
              type="range"
              min={1}
              max={10}
              value={tenureYears}
              onChange={e => setTenureYears(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
            />
          </div>

          {/* Results Grid */}
          <div className="p-4 bg-gradient-to-br from-[#1E293B] to-surface rounded-xl border border-primary/30 space-y-3 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Applicable Interest Rate:</span>
              <span className="font-bold text-primary">{rate}% p.a.</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Total Interest Earned:</span>
              <span className="font-bold text-green-400">+₹{interestEarned.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/10 pt-2 text-sm">
              <span className="font-bold text-on-surface">Maturity Value:</span>
              <span className="font-bold text-primary text-base">₹{maturityAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Close</button>
          <button 
            type="button" 
            onClick={() => { onClose(); onOpenDeposit(); }}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5"
          >
            Proceed to Open Deposit <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
