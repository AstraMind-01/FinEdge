"use client";

import React, { useState } from "react";
import { X, FileText, CheckCircle2, Loader2, Calculator } from "lucide-react";

interface ApplyLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOAN_TYPES = [
  { id: "personal", name: "Personal Loan", rate: 10.5, defaultAmount: 200000 },
  { id: "home", name: "Home Loan", rate: 8.4, defaultAmount: 3500000 },
  { id: "car", name: "Car Loan", rate: 8.9, defaultAmount: 750000 },
  { id: "edu", name: "Education Loan", rate: 9.2, defaultAmount: 500000 },
];

export default function ApplyLoanModal({ isOpen, onClose }: ApplyLoanModalProps) {
  const [selectedLoan, setSelectedLoan] = useState(LOAN_TYPES[0]);
  const [loanAmount, setLoanAmount] = useState<number>(LOAN_TYPES[0].defaultAmount);
  const [tenureYears, setTenureYears] = useState<number>(3);
  const [monthlyIncome, setMonthlyIncome] = useState<string>("85000");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoanTypeChange = (loan: typeof LOAN_TYPES[0]) => {
    setSelectedLoan(loan);
    setLoanAmount(loan.defaultAmount);
  };

  // EMI Formula = [P x R x (1+R)^N]/[(1+R)^N-1]
  const p = loanAmount;
  const r = (selectedLoan.rate / 12) / 100;
  const n = tenureYears * 12;
  const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(`Pre-approval request for ${selectedLoan.name} (₹${loanAmount.toLocaleString('en-IN')}) submitted! Application Ref: LN-${Date.now()}`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2500);
    }, 1200);
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
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Instant Loan Pre-Approval</h2>
              <p className="text-xs text-on-surface-variant">Check pre-approved EMI & apply online in minutes</p>
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
        {successMsg && (
          <div className="p-3.5 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3 text-tertiary text-xs font-medium">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Loan Type Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-on-surface-variant">Loan Type</label>
            <div className="grid grid-cols-2 gap-2">
              {LOAN_TYPES.map(l => {
                const isSel = selectedLoan.id === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleLoanTypeChange(l)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${isSel ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span className="text-xs font-bold text-on-surface">{l.name}</span>
                    <span className="text-[11px] font-mono text-primary">{l.rate}% Interest</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Slider */}
          <div className="bg-surface-high/40 p-4 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-on-surface-variant uppercase">Required Loan Amount</span>
              <span className="text-sm font-bold text-primary font-mono">{formatCurrency(loanAmount)}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-primary bg-surface-high cursor-pointer h-2 rounded-lg"
            />
          </div>

          {/* Tenure Slider */}
          <div className="bg-surface-high/40 p-4 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-on-surface-variant uppercase">Tenure (Years)</span>
              <span className="text-sm font-bold text-primary font-mono">{tenureYears} Years ({tenureYears * 12} Months)</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-primary bg-surface-high cursor-pointer h-2 rounded-lg"
            />
          </div>

          {/* Monthly EMI Box */}
          <div className="bg-surface-high/60 rounded-xl p-4 border border-outline-variant/10 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-primary" />
              <div>
                <span className="text-on-surface-variant uppercase font-medium">Calculated Monthly EMI</span>
                <p className="font-bold text-base text-primary mt-0.5">{formatCurrency(emi)} / mo</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-on-surface-variant uppercase font-medium">Interest Rate</span>
              <p className="font-bold text-sm text-on-surface mt-0.5">{selectedLoan.rate}% p.a.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
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
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Loan Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
