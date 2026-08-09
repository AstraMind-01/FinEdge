"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, Snowflake, AlertTriangle, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

interface FreezeAccountModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFreeze: (accountId: string) => Promise<void>;
}

export default function FreezeAccountModal({ account, isOpen, onClose, onToggleFreeze }: FreezeAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const isCurrentlyFrozen = account.status === "FROZEN";

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onToggleFreeze(account.id);
      setSuccessMsg(
        isCurrentlyFrozen
          ? `Account successfully unfrozen and reactivated.`
          : `Account frozen. All outgoing transfers are suspended.`
      );
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isCurrentlyFrozen ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
              <Snowflake size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">
                {isCurrentlyFrozen ? "Unfreeze Account" : "Freeze Account"}
              </h2>
              <p className="text-xs text-on-surface-variant">Security control for {account.name}</p>
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

        {/* Warning Notice Box */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isCurrentlyFrozen ? 'bg-tertiary/5 border-tertiary/20' : 'bg-error/5 border-error/20'}`}>
          <div className="flex items-center gap-2 font-semibold text-sm">
            {isCurrentlyFrozen ? (
              <ShieldAlert className="text-tertiary" size={18} />
            ) : (
              <AlertTriangle className="text-error" size={18} />
            )}
            <span className={isCurrentlyFrozen ? "text-tertiary" : "text-error"}>
              {isCurrentlyFrozen ? "Reactivate Account Operations?" : "Temporary Account Lock"}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isCurrentlyFrozen ? (
              <>Unfreezing <strong>{account.name}</strong> will instantly restore full outgoing transfer, debit card, and payment capabilities.</>
            ) : (
              <>Freezing <strong>{account.name}</strong> will temporarily block all outgoing transfers, withdrawals, and debit transactions until unfrozen. Incoming credits will still be accepted.</>
            )}
          </p>
        </div>

        {/* Account Details Box */}
        <div className="bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex justify-between items-center text-xs">
          <div>
            <span className="text-on-surface-variant uppercase font-medium">Current Status</span>
            <p className="font-bold text-sm mt-0.5 capitalize">{account.status.toLowerCase()}</p>
          </div>
          <div className="text-right">
            <span className="text-on-surface-variant uppercase font-medium">Account Number</span>
            <p className="font-mono font-medium text-sm mt-0.5">{account.maskedNumber}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-6 py-2.5 font-medium rounded-xl text-sm transition-all flex items-center gap-2 ${
              isCurrentlyFrozen 
                ? 'bg-tertiary text-on-tertiary hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                : 'bg-error text-on-error hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing...
              </>
            ) : isCurrentlyFrozen ? (
              "Confirm Unfreeze"
            ) : (
              "Freeze Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
