"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, Settings, CheckCircle2, Loader2, Sliders, Shield } from "lucide-react";

interface AccountLimitsModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLimits: (accountId: string, daily: number, transaction: number, atm: number) => Promise<void>;
}

export default function AccountLimitsModal({ account, isOpen, onClose, onSaveLimits }: AccountLimitsModalProps) {
  const [dailyLimit, setDailyLimit] = useState<number>(account?.dailyLimit || 200000);
  const [transactionLimit, setTransactionLimit] = useState<number>(account?.transactionLimit || 50000);
  const [atmLimit, setAtmLimit] = useState<number>(account?.atmLimit || 25000);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !account) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveLimits(account.id, dailyLimit, transactionLimit, atmLimit);
      setSuccessMsg("Account limits updated successfully!");
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      // Error handling
    } finally {
      setIsSaving(false);
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
              <Settings size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Transfer & ATM Limits</h2>
              <p className="text-xs text-on-surface-variant">Configure security limits for {account.name}</p>
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

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Daily Limit Slider */}
          <div className="bg-surface-high/40 p-4 rounded-xl border border-outline-variant/10 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                <Sliders size={14} className="text-primary" /> Daily Transfer Limit
              </span>
              <span className="text-sm font-bold text-primary font-mono">{formatCurrency(dailyLimit)}</span>
            </div>
            <input 
              type="range" 
              min="10000" 
              max="1000000" 
              step="10000"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full accent-primary bg-surface-high cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
              <span>₹10,000</span>
              <span>₹10,00,000</span>
            </div>
          </div>

          {/* Per Transaction Limit Slider */}
          <div className="bg-surface-high/40 p-4 rounded-xl border border-outline-variant/10 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                <Shield size={14} className="text-primary" /> Per-Transaction Limit
              </span>
              <span className="text-sm font-bold text-primary font-mono">{formatCurrency(transactionLimit)}</span>
            </div>
            <input 
              type="range" 
              min="5000" 
              max="500000" 
              step="5000"
              value={transactionLimit}
              onChange={(e) => setTransactionLimit(Number(e.target.value))}
              className="w-full accent-primary bg-surface-high cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
              <span>₹5,000</span>
              <span>₹5,00,000</span>
            </div>
          </div>

          {/* ATM Withdrawal Limit */}
          <div className="bg-surface-high/40 p-4 rounded-xl border border-outline-variant/10 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                Daily ATM Withdrawal Limit
              </span>
              <span className="text-sm font-bold text-primary font-mono">{formatCurrency(atmLimit)}</span>
            </div>
            <input 
              type="range" 
              min="5000" 
              max="100000" 
              step="5000"
              value={atmLimit}
              onChange={(e) => setAtmLimit(Number(e.target.value))}
              className="w-full accent-primary bg-surface-high cursor-pointer h-2 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
              <span>₹5,000</span>
              <span>₹1,00,000</span>
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
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Limits"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
