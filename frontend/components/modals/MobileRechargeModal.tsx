"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, Smartphone, CheckCircle2, AlertCircle, Loader2, Zap } from "lucide-react";

interface MobileRechargeModalProps {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (accountId: string, mobileNumber: string, operator: string, amount: number) => Promise<void>;
}

const RECHARGE_PLANS = [
  { id: "p1", name: "Unlimited 1.5GB/Day", price: 299, validity: "28 Days", data: "1.5 GB/Day", calls: "Truly Unlimited" },
  { id: "p2", name: "Super Saver 2GB/Day", price: 719, validity: "84 Days", data: "2.0 GB/Day", calls: "Truly Unlimited" },
  { id: "p3", name: "Data Add-On Boost", price: 149, validity: "Existing Pack", data: "12 GB Bulk", calls: "NA" },
  { id: "p4", name: "Annual Super Value", price: 2999, validity: "365 Days", data: "2.5 GB/Day", calls: "Truly Unlimited" }
];

export default function MobileRechargeModal({ accounts, isOpen, onClose, onRecharge }: MobileRechargeModalProps) {
  const activeAccounts = accounts.filter(a => a.type === "SAVINGS" || a.type === "CURRENT");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [operator, setOperator] = useState("Jio 5G Prepaid");
  const [selectedPlan, setSelectedPlan] = useState(RECHARGE_PLANS[0]);
  const [sourceAccountId, setSourceAccountId] = useState(activeAccounts[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!sourceAccountId) {
      setErrorMsg("Please select a source account.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onRecharge(sourceAccountId, mobileNumber, operator, selectedPlan.price);
      setSuccessMsg(`Mobile recharge of ₹${selectedPlan.price} for ${mobileNumber} (${operator}) successful!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Recharge failed. Please try again.");
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
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Instant Mobile Recharge</h2>
              <p className="text-xs text-on-surface-variant">Recharge any prepaid mobile number instantly</p>
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
          {/* Mobile & Operator */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Mobile Number</label>
              <input
                type="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface font-mono font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Operator & Circle</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="Jio 5G Prepaid" className="bg-[#191f2f] text-[#dde2f8]">Jio 5G Prepaid</option>
                <option value="Airtel 5G" className="bg-[#191f2f] text-[#dde2f8]">Airtel 5G</option>
                <option value="Vi Prepaid" className="bg-[#191f2f] text-[#dde2f8]">Vi Prepaid</option>
                <option value="BSNL Special" className="bg-[#191f2f] text-[#dde2f8]">BSNL Special</option>
              </select>
            </div>
          </div>

          {/* Select Plan */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-on-surface-variant">Select Recharge Plan</label>
            <div className="grid grid-cols-2 gap-2.5">
              {RECHARGE_PLANS.map(plan => {
                const isSel = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${isSel ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-on-surface">{plan.name}</span>
                      <span className="text-xs font-mono font-bold text-primary">₹{plan.price}</span>
                    </div>
                    <div className="flex justify-between text-[10px] mt-2 text-on-surface-variant">
                      <span>Val: {plan.validity}</span>
                      <span>{plan.data}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Source Account */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Pay From Account</label>
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
                  <Loader2 size={16} className="animate-spin" /> Recharging...
                </>
              ) : (
                `Recharge ₹${selectedPlan.price}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
