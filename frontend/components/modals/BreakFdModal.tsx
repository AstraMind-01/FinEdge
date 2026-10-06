"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle2, Loader2, Landmark, ArrowRight, ShieldAlert } from "lucide-react";
import { Deposit } from "../../types";
import { MockApi } from "../../lib/mockApi";

interface BreakFdModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: Deposit | null;
  onFdBroken?: (result: { refundAmount: number; newBalance: number }) => void;
}

export default function BreakFdModal({
  isOpen,
  onClose,
  deposit,
  onFdBroken
}: BreakFdModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen || !deposit) return null;

  const principal = deposit.principalAmount;
  const accrued = deposit.accumulatedAmount ? deposit.accumulatedAmount - principal : Math.round(principal * 0.12);
  const penalty = Math.round(principal * 0.01); // 1% premature penalty
  const netRefund = principal + Math.max(0, accrued - penalty);

  const handleConfirmBreak = async () => {
    setIsSubmitting(true);
    try {
      const result = await MockApi.breakDeposit(deposit.id);
      if (onFdBroken) {
        onFdBroken(result);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Premature FD Closure</h2>
              <p className="text-xs text-on-surface-variant font-mono">Liquidating {deposit.name} ({deposit.id})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Premature Calculation Breakdown */}
        <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-on-surface-variant">
            <span>Principal Amount:</span>
            <span className="font-bold text-on-surface">₹{principal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Accrued Interest till date:</span>
            <span className="font-bold text-green-400">+₹{accrued.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-red-400">
            <span>Premature Penalty (1% p.a.):</span>
            <span className="font-bold">-₹{penalty.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center border-t border-white/10 pt-2 text-sm">
            <span className="font-bold text-on-surface">Net Payout to Bank Account:</span>
            <span className="font-bold text-primary text-base">₹{netRefund.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Destination Account */}
        <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-xs font-mono">
          <span className="text-[10px] text-on-surface-variant block uppercase">Credit Destination</span>
          <span className="font-bold text-on-surface">Primary Savings ACC-001 •••• 8812</span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
          <button 
            type="button" 
            disabled={isSubmitting}
            onClick={handleConfirmBreak}
            className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 flex items-center gap-1.5 disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Liquidating...
              </>
            ) : (
              <>
                Confirm Liquidate ₹{netRefund.toLocaleString('en-IN')} <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
