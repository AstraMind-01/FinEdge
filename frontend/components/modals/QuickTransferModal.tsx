"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, ArrowLeftRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface QuickTransferModalProps {
  fromAccount: Account | null;
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (fromId: string, toId: string, amount: number) => Promise<void>;
}

export default function QuickTransferModal({ fromAccount, accounts, isOpen, onClose, onTransfer }: QuickTransferModalProps) {
  const [toAccountId, setToAccountId] = useState<string>("");
  const [externalAccountNum, setExternalAccountNum] = useState<string>("");
  const [isExternal, setIsExternal] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !fromAccount) return null;

  const availableDestAccounts = accounts.filter(a => a.id !== fromAccount.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg("Please enter a valid positive transfer amount.");
      return;
    }

    if (fromAccount.status !== "ACTIVE") {
      setErrorMsg(`Source account is ${fromAccount.status.toLowerCase()}. Outgoing transfers are disabled.`);
      return;
    }

    if (numericAmount > fromAccount.balance) {
      setErrorMsg("Insufficient balance for this transfer.");
      return;
    }

    if (fromAccount.transactionLimit && numericAmount > fromAccount.transactionLimit) {
      setErrorMsg(`Amount exceeds your per-transaction limit of ₹${fromAccount.transactionLimit.toLocaleString('en-IN')}.`);
      return;
    }

    const destinationId = isExternal ? availableDestAccounts[0]?.id || fromAccount.id : toAccountId;
    if (!destinationId && !isExternal) {
      setErrorMsg("Please select a target account for transfer.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onTransfer(fromAccount.id, destinationId, numericAmount);
      setSuccessMsg(`Transfer of ₹${numericAmount.toLocaleString('en-IN')} completed successfully!`);
      setTimeout(() => {
        setSuccessMsg(null);
        setAmount("");
        setRemarks("");
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete transfer. Please try again.");
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
              <ArrowLeftRight size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">Quick Transfer</h2>
              <p className="text-xs text-on-surface-variant">Instant money transfer from your account</p>
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

        {/* Source Account Banner */}
        <div className="bg-surface-high/60 rounded-xl p-4 border border-outline-variant/10 flex justify-between items-center">
          <div>
            <span className="text-xs text-on-surface-variant uppercase font-medium">From Account</span>
            <p className="font-semibold text-sm mt-0.5">{fromAccount.name} ({fromAccount.maskedNumber})</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-on-surface-variant uppercase font-medium">Available</span>
            <p className="font-bold text-primary text-sm mt-0.5">{formatCurrency(fromAccount.balance)}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Transfer Mode Toggle */}
          <div className="flex bg-surface-high/40 p-1 rounded-xl border border-outline-variant/10 text-xs">
            <button
              type="button"
              onClick={() => setIsExternal(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${!isExternal ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Own Account
            </button>
            <button
              type="button"
              onClick={() => setIsExternal(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${isExternal ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              External Beneficiary
            </button>
          </div>

          {/* Destination Selector */}
          {!isExternal ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Select Destination Account</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="" className="bg-[#191f2f] text-[#dde2f8]">-- Choose Account --</option>
                {availableDestAccounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-[#191f2f] text-[#dde2f8]">
                    {acc.name} ({acc.maskedNumber}) - {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Beneficiary Account / VPA</label>
              <input
                type="text"
                placeholder="e.g. 9876543210@finedge or 10098765432"
                value={externalAccountNum}
                onChange={(e) => setExternalAccountNum(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface"
              />
            </div>
          )}

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-on-surface-variant text-sm font-semibold">₹</span>
              <input
                type="number"
                placeholder="0.00"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl py-3 pl-8 pr-3 text-sm focus:outline-none focus:border-primary text-on-surface font-semibold"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Bill payment, Rent, Gift"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || fromAccount.status !== 'ACTIVE'}
              className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </>
              ) : (
                "Confirm & Send"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
