"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Loader2, Landmark, ArrowRight, ShieldCheck } from "lucide-react";
import { Deposit } from "../../types";
import { MockApi } from "../../lib/mockApi";

interface PayRdInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: Deposit | null;
  onInstallmentPaid?: (result: { updatedRd: Deposit; newBalance: number }) => void;
}

export default function PayRdInstallmentModal({
  isOpen,
  onClose,
  deposit,
  onInstallmentPaid
}: PayRdInstallmentModalProps) {
  const [pinInput, setPinInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen || !deposit) return null;

  const installmentAmount = deposit.monthlyInstallment || deposit.monthlyDepositAmount || 10000;

  const handlePayInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (pinInput.length !== 4) {
      setValidationError("Please enter your 4-digit Transaction PIN.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await MockApi.payRdInstallment(deposit.id);
      if (onInstallmentPaid) {
        onInstallmentPaid(result);
      }
      onClose();
    } catch (err) {
      setValidationError("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Pay RD Monthly Installment</h2>
            <p className="text-xs text-on-surface-variant font-mono">{deposit.name} ({deposit.id})</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">
            {validationError}
          </div>
        )}

        <form onSubmit={handlePayInstallment} className="space-y-4 text-xs">
          {/* Summary Box */}
          <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2 font-mono">
            <div className="flex justify-between text-on-surface-variant">
              <span>Installment Amount:</span>
              <span className="font-bold text-primary text-sm">₹{installmentAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Current Accumulated:</span>
              <span className="font-bold text-on-surface">₹{(deposit.accumulatedAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Due Date:</span>
              <span className="font-bold text-amber-400">{deposit.nextDueDate || '01 Sept 2026'}</span>
            </div>
          </div>

          {/* Source Account */}
          <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 font-mono">
            <span className="text-[10px] text-on-surface-variant block uppercase">Source Account</span>
            <span className="font-bold text-on-surface">Primary Savings ACC-001 •••• 8812</span>
          </div>

          {/* PIN Input */}
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">Enter 4-Digit PIN</label>
            <input 
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-center text-on-surface font-mono font-bold text-lg tracking-widest focus:outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing Payment...
                </>
              ) : (
                <>
                  Confirm &amp; Pay ₹{installmentAmount.toLocaleString('en-IN')} <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
