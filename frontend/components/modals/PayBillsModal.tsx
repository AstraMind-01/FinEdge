"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, Receipt, CheckCircle2, AlertCircle, Loader2, Zap, Droplet, Flame, Wifi, Tv } from "lucide-react";

interface PayBillsModalProps {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onPayBill: (accountId: string, billerName: string, category: string, amount: number) => Promise<void>;
}

const BILLER_CATEGORIES = [
  { id: "Electricity", name: "Electricity", icon: Zap, color: "text-amber-400 bg-amber-400/10", defaultBiller: "Tata Power Delhi", defaultAmount: 1450 },
  { id: "Water", name: "Water Bill", icon: Droplet, color: "text-blue-400 bg-blue-400/10", defaultBiller: "Delhi Jal Board", defaultAmount: 480 },
  { id: "Gas", name: "Piped Gas", icon: Flame, color: "text-orange-400 bg-orange-400/10", defaultBiller: "IAG Gas Corporation", defaultAmount: 890 },
  { id: "Broadband", name: "Broadband / Fiber", icon: Wifi, color: "text-purple-400 bg-purple-400/10", defaultBiller: "Airtel Xstream Fiber", defaultAmount: 999 },
  { id: "DTH", name: "DTH TV", icon: Tv, color: "text-rose-400 bg-rose-400/10", defaultBiller: "Tata Play DTH", defaultAmount: 399 },
];

export default function PayBillsModal({ accounts, isOpen, onClose, onPayBill }: PayBillsModalProps) {
  const activeAccounts = accounts.filter(a => a.type === "SAVINGS" || a.type === "CURRENT");
  const [selectedCat, setSelectedCat] = useState(BILLER_CATEGORIES[0]);
  const [billerName, setBillerName] = useState(BILLER_CATEGORIES[0].defaultBiller);
  const [consumerNumber, setConsumerNumber] = useState("1098472948");
  const [sourceAccountId, setSourceAccountId] = useState(activeAccounts[0]?.id || "");
  const [amount, setAmount] = useState(BILLER_CATEGORIES[0].defaultAmount.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCatChange = (cat: typeof BILLER_CATEGORIES[0]) => {
    setSelectedCat(cat);
    setBillerName(cat.defaultBiller);
    setAmount(cat.defaultAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Please enter a valid bill amount.");
      return;
    }
    if (!sourceAccountId) {
      setErrorMsg("Please select a source account.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onPayBill(sourceAccountId, billerName, selectedCat.name, numAmount);
      setSuccessMsg(`Bill payment of ₹${numAmount.toLocaleString('en-IN')} to ${billerName} successful!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to pay bill. Please check account balance.");
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
              <Receipt size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Pay Utility Bills</h2>
              <p className="text-xs text-on-surface-variant">Instant BBPS utility bill payments</p>
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

        {/* Category Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-on-surface-variant">Select Bill Category</label>
          <div className="grid grid-cols-5 gap-2">
            {BILLER_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSel = selectedCat.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCatChange(cat)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${isSel ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'}`}
                >
                  <div className={`p-2 rounded-lg ${cat.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] leading-tight truncate w-full">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Biller Name & Consumer ID */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Biller Provider</label>
              <input
                type="text"
                value={billerName}
                onChange={(e) => setBillerName(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Consumer No. / Account ID</label>
              <input
                type="text"
                value={consumerNumber}
                onChange={(e) => setConsumerNumber(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface font-mono"
              />
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

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Bill Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-on-surface-variant text-sm font-semibold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl py-3 pl-8 pr-3 text-sm focus:outline-none focus:border-primary text-on-surface font-bold text-base"
              />
            </div>
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
                  <Loader2 size={16} className="animate-spin" /> Processing Payment...
                </>
              ) : (
                "Pay Bill Now"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
