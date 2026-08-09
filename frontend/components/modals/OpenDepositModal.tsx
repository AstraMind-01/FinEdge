"use client";

import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, Loader2, Calculator, ArrowRight, ArrowLeft, Building2, User, Lock } from "lucide-react";
import { Deposit } from "../../types";
import { MockApi } from "../../lib/mockApi";

interface OpenDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositOpened?: (result: { deposit: Deposit; newBalance: number }) => void;
  initialType?: "FD" | "RD";
}

export default function OpenDepositModal({
  isOpen,
  onClose,
  onDepositOpened,
  initialType = "FD"
}: OpenDepositModalProps) {
  const [depositType, setDepositType] = useState<"FD" | "RD">(initialType);
  const [depositScheme, setDepositScheme] = useState("Tax Saver Fixed Deposit (8.50% p.a.)");
  const [amountInput, setAmountInput] = useState("150000");
  const [monthlyInstallmentInput, setMonthlyInstallmentInput] = useState("10000");
  const [tenureYears, setTenureYears] = useState(5);
  const [compoundingFreq, setCompoundingFreq] = useState("Quarterly Compounded");
  const [nominee, setNominee] = useState("Spouse - Priya Ranjan");
  const [maturityInstruction, setMaturityInstruction] = useState("Auto-Renew Principal & Interest");
  const [pinInput, setPinInput] = useState("");

  const [currentStep, setCurrentStep] = useState(1); // 1: Scheme & Amount, 2: Nominee & Auto-Renew, 3: Account & PIN, 4: Done
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAmount = depositType === 'FD' ? (Number(amountInput) || 0) : (Number(monthlyInstallmentInput) || 0);
  const rate = depositType === 'FD' ? (depositScheme.includes("Tax Saver") ? 8.50 : depositScheme.includes("High Yield") ? 8.10 : 7.25) : 7.80;
  
  // Maturity Math
  const maturityValue = depositType === 'FD' 
    ? Math.round(Number(amountInput || 0) * Math.pow(1 + (rate / 100) / 4, 4 * tenureYears))
    : Math.round(Number(monthlyInstallmentInput || 0) * tenureYears * 12 * 1.085);

  const handleNextStep = () => {
    setValidationError(null);
    if (currentStep === 1) {
      if (currentAmount <= 0) {
        setValidationError("Please enter a valid deposit amount.");
        return;
      }
      if (currentAmount > 625430.50) {
        setValidationError("Amount exceeds available balance in Primary Savings ACC-001 (₹6,25,430.50).");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleConfirmOpenDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (pinInput.length !== 4) {
      setValidationError("Please enter your 4-digit Transaction PIN.");
      return;
    }
    setIsSubmitting(true);
    try {
      const schemeName = depositType === 'FD' ? depositScheme.split(' (')[0] : 'Monthly Wealth Recurring Deposit';
      const result = await MockApi.openNewDeposit({
        name: schemeName,
        type: depositType,
        principalAmount: depositType === 'FD' ? Number(amountInput) : Number(monthlyInstallmentInput) * tenureYears * 12,
        monthlyInstallment: depositType === 'RD' ? Number(monthlyInstallmentInput) : undefined,
        tenureYears: tenureYears,
        interestRate: rate
      });

      setCurrentStep(4);
      if (onDepositOpened) {
        onDepositOpened(result);
      }
    } catch (err) {
      setValidationError("Failed to open deposit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/30">
                FinEdge Guaranteed Deposits
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                DICGC Insured up to ₹5 Lakhs
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Open New {depositType === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'}</h2>
            <p className="text-xs text-on-surface-variant">Step {currentStep} of 4 • Guaranteed interest returns &amp; flexible tenures</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">
            {validationError}
          </div>
        )}

        {/* STEP 1: SCHEME & PARAMETERS */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            
            {/* Deposit Type Switcher */}
            <div className="flex bg-surface rounded-xl p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setDepositType('FD')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all text-xs ${depositType === 'FD' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Fixed Deposit (FD)
              </button>
              <button
                type="button"
                onClick={() => setDepositType('RD')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all text-xs ${depositType === 'RD' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Recurring Deposit (RD)
              </button>
            </div>

            {/* Scheme Selector */}
            {depositType === 'FD' ? (
              <div>
                <label className="font-semibold text-on-surface-variant block mb-1.5">Select FD Scheme</label>
                <select value={depositScheme} onChange={e => setDepositScheme(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary">
                  <option value="Tax Saver Fixed Deposit (8.50% p.a.)">5 Year Tax Saver FD (8.50% p.a. - Sec 80C)</option>
                  <option value="High Yield Fixed Deposit (8.10% p.a.)">3 Year High Yield FD (8.10% p.a.)</option>
                  <option value="Short Term Fixed Deposit (7.25% p.a.)">1 Year Flexible Short Term FD (7.25% p.a.)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="font-semibold text-on-surface-variant block mb-1.5">Select RD Scheme</label>
                <div className="p-3.5 bg-surface rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">Monthly Wealth Recurring Deposit</p>
                    <p className="text-[11px] text-on-surface-variant">Automated monthly auto-debit</p>
                  </div>
                  <span className="text-sm font-bold text-primary font-mono">7.80% p.a.</span>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5">
                {depositType === 'FD' ? 'Principal Deposit Amount (₹)' : 'Monthly RD Installment (₹)'}
              </label>
              <input 
                type="number"
                value={depositType === 'FD' ? amountInput : monthlyInstallmentInput}
                onChange={e => depositType === 'FD' ? setAmountInput(e.target.value) : setMonthlyInstallmentInput(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-semibold text-on-surface-variant">Tenure (Years)</label>
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

            {/* Maturity Calculation Box */}
            <div className="p-4 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/30 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Estimated Maturity Amount</span>
                <span className="text-lg font-bold text-green-400">₹{maturityValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-on-surface-variant block">Interest Rate</span>
                <span className="text-xs font-bold text-primary font-sans">{rate}% p.a.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
              <button type="button" onClick={handleNextStep} className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]">
                Next: Nominee &amp; Instructions <ArrowRight size={14} />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: NOMINEE & MATURITY INSTRUCTIONS */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5">Deposit Nominee</label>
              <select value={nominee} onChange={e => setNominee(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary">
                <option value="Spouse - Priya Ranjan">Spouse - Priya Ranjan (Registered Nominee)</option>
                <option value="Parent - Rajat Sharma">Parent - Rajat Sharma</option>
                <option value="Child - Aarav Ranjan">Child - Aarav Ranjan</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5">Maturity Instructions</label>
              <select value={maturityInstruction} onChange={e => setMaturityInstruction(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary">
                <option value="Auto-Renew Principal & Interest">Auto-Renew Principal &amp; Interest at prevailing rates</option>
                <option value="Auto-Renew Principal Only">Auto-Renew Principal Only (Pay interest to savings account)</option>
                <option value="Credit to Account on Maturity">Do Not Auto-Renew (Credit full maturity value to savings account)</option>
              </select>
            </div>

            <div className="p-3.5 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
              <ShieldCheck size={16} className="text-tertiary shrink-0" />
              <span>Free instant nomination update. 100% digital process.</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setCurrentStep(1)} className="px-4 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Back</button>
              <button type="button" onClick={handleNextStep} className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]">
                Next: Pay &amp; Verify PIN <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SOURCE ACCOUNT & TRANSACTION PIN */}
        {currentStep === 3 && (
          <form onSubmit={handleConfirmOpenDeposit} className="space-y-4 text-xs">
            <div className="p-3.5 bg-surface rounded-xl border border-white/5 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-on-surface-variant block uppercase tracking-wider">Debit Account</span>
                <span className="text-xs font-bold text-on-surface">Primary Savings ACC-001 •••• 8812</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-on-surface-variant block">Amount to Debit</span>
                <span className="text-sm font-bold text-primary">₹{currentAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5">Enter 4-Digit Transaction PIN</label>
              <input 
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-center text-on-surface font-mono font-bold text-lg tracking-widest focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setCurrentStep(2)} className="px-4 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Back</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing Deposit...
                  </>
                ) : (
                  <>
                    Confirm &amp; Debit ₹{currentAmount.toLocaleString('en-IN')} <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center text-center py-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-on-surface">{depositType === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'} Opened Successfully!</h3>
            <p className="text-xs text-on-surface-variant max-w-md">
              Your {depositType} for <strong className="text-primary font-mono">₹{currentAmount.toLocaleString('en-IN')}</strong> at <strong className="text-green-400">{rate}% p.a.</strong> has been created and debited from ACC-001.
            </p>
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
            >
              Done &amp; View My Deposits
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
