"use client";

import React from "react";
import { X, CreditCard, ShieldCheck, Calculator, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Loan } from "../../types";

interface PayEmiModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoan: Loan | null;
  selectedAccount: string;
  setSelectedAccount: (acc: string) => void;
  isSubmitting: boolean;
  onConfirm: (e: React.FormEvent) => void;
}

export function PayEmiModal({
  isOpen,
  onClose,
  selectedLoan,
  selectedAccount,
  setSelectedAccount,
  isSubmitting,
  onConfirm
}: PayEmiModalProps) {
  if (!isOpen || !selectedLoan) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Pay Monthly EMI</h3>
              <p className="text-[11px] text-on-surface-variant">{selectedLoan.name} • {selectedLoan.accountNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirm} className="space-y-4 text-xs">
          <div className="p-4 bg-surface rounded-xl border border-white/5 flex items-center justify-between font-mono">
            <div>
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block">EMI Amount Due</span>
              <span className="text-2xl font-bold text-primary">₹{selectedLoan.nextEmiAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-on-surface-variant block">Due Date</span>
              <span className="text-xs font-bold text-on-surface">{selectedLoan.nextEmiDate}</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">Pay From Account</label>
            <select 
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-medium focus:outline-none focus:border-primary"
            >
              <option value="ACC-001">Primary Savings Account (ACC-001 • Balance: ₹6,25,430)</option>
              <option value="ACC-002">Business Current Account (ACC-002 • Balance: ₹4,50,000)</option>
            </select>
          </div>

          <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
            <ShieldCheck size={16} className="text-tertiary shrink-0" />
            <span>Instant receipt generation and automated loan statement update.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-40">
              {isSubmitting ? "Processing..." : "Confirm & Pay EMI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PrepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoan: Loan | null;
  prepayAmountInput: string;
  setPrepayAmountInput: (val: string) => void;
  isSubmitting: boolean;
  onConfirm: (e: React.FormEvent) => void;
}

export function PrepayModal({
  isOpen,
  onClose,
  selectedLoan,
  prepayAmountInput,
  setPrepayAmountInput,
  isSubmitting,
  onConfirm
}: PrepayModalProps) {
  if (!isOpen || !selectedLoan) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <Calculator size={20} className="text-primary" />
            <h3 className="text-base font-bold text-on-surface">Loan Prepayment</h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onConfirm} className="space-y-4 text-xs">
          <div className="p-3.5 bg-surface rounded-xl border border-white/5 space-y-1">
            <p className="text-xs font-bold text-on-surface">{selectedLoan.name}</p>
            <p className="text-[11px] text-on-surface-variant font-mono">Current Outstanding: ₹{selectedLoan.outstandingBalance.toLocaleString('en-IN')}</p>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">Prepayment Amount (₹)</label>
            <input 
              type="number"
              value={prepayAmountInput}
              onChange={e => setPrepayAmountInput(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="p-3 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/20 space-y-1 font-mono">
            <div className="flex justify-between text-on-surface text-[11px]">
              <span>Estimated Interest Saved:</span>
              <span className="text-green-400 font-bold">₹{Math.round(Number(prepayAmountInput || 0) * 0.24).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-on-surface text-[11px]">
              <span>Tenure Reduction:</span>
              <span className="text-primary font-bold">{Math.max(1, Math.round(Number(prepayAmountInput || 0) / 10000))} months earlier</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-40">
              {isSubmitting ? "Processing..." : "Confirm Prepayment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursalSuccess: boolean;
  onDisburse: () => void;
}

export function EligibilityModal({
  isOpen,
  onClose,
  disbursalSuccess,
  onDisburse
}: EligibilityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles size={20} className="text-primary" />
            <h3 className="text-base font-bold text-on-surface">Pre-Approved Offer Eligibility</h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        {disbursalSuccess ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={48} className="text-tertiary animate-bounce" />
            <span className="text-sm font-bold text-on-surface">Loan Amount Credited!</span>
            <p className="text-xs text-on-surface-variant">₹5,00,000 has been transferred directly into your Primary Savings ACC-001.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-surface rounded-xl border border-primary/30 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-semibold">CIBIL Credit Score</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">785 (Excellent)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-semibold">Pre-Approved Credit Limit</span>
                <span className="text-base font-bold text-primary font-mono">₹15,00,000</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-on-surface-variant">Special Interest Rate</span>
                <span className="text-tertiary font-bold">10.5% p.a. (0 Processing Fee)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-on-surface-variant block">Disbursal Account</label>
              <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 font-mono text-on-surface font-bold text-xs">
                Primary Savings Account (ACC-001 •••• 8812)
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Close</button>
              <button onClick={onDisburse} className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center justify-center gap-1.5">
                Instantly Disburse ₹5 Lakhs <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FullCalcModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  calcPrepayAmount: number;
  setCalcPrepayAmount: (amt: number) => void;
  onExecute: () => void;
}

export function FullCalcModal({
  isOpen,
  onClose,
  loans,
  calcPrepayAmount,
  setCalcPrepayAmount,
  onExecute
}: FullCalcModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Full Loan Prepayment Calculator</h3>
              <p className="text-[11px] text-on-surface-variant">Compare side-by-side interest savings &amp; tenure reduction</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">Select Loan Account</label>
            <select className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary">
              {loans.map(l => (
                <option key={l.id} value={l.id}>{l.name} (Outstanding: ₹{l.outstandingBalance.toLocaleString('en-IN')})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-on-surface-variant">Extra Lump-Sum Prepayment (₹)</label>
              <span className="text-primary font-mono font-bold text-sm">₹{calcPrepayAmount.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={calcPrepayAmount}
              onChange={e => setCalcPrepayAmount(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-surface rounded-xl border border-white/5 font-mono">
            <div className="space-y-1 pb-2 border-b border-white/5 col-span-2 flex justify-between text-[11px] font-sans">
              <span className="font-bold text-on-surface">Repayment Comparison</span>
              <span className="text-tertiary font-bold">Smart Prepayment</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Without Prepayment</span>
              <p className="text-xs text-on-surface">Interest: <strong className="text-on-surface font-bold">₹12,45,000</strong></p>
              <p className="text-xs text-on-surface">Tenure: <strong className="text-on-surface font-bold">192 Months</strong></p>
            </div>

            <div className="space-y-1 border-l border-white/10 pl-3">
              <span className="text-[10px] text-primary uppercase tracking-wider block">With ₹{calcPrepayAmount.toLocaleString('en-IN')} Prepayment</span>
              <p className="text-xs text-green-400">Interest: <strong className="font-bold">₹11,92,618</strong></p>
              <p className="text-xs text-primary">Tenure: <strong className="font-bold">{192 - Math.max(1, Math.round(calcPrepayAmount / 15000))} Months</strong></p>
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/30 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Total Net Interest Saved</span>
              <span className="text-lg font-bold text-green-400">₹{Math.round(calcPrepayAmount * 0.2468).toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-on-surface-variant block">Loan Debt Free</span>
              <span className="text-xs font-bold text-primary font-sans">{Math.max(1, Math.round(calcPrepayAmount / 15000))} Months Earlier</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest">Close</button>
            <button 
              type="button" 
              onClick={onExecute}
              className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
            >
              Execute Prepayment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
