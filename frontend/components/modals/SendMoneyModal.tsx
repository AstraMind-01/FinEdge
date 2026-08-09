"use client";

import React, { useState, useEffect } from "react";
import { X, Send, ShieldCheck, Building2, Wallet, Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";
import { Beneficiary } from "../../types";
import { MockApi } from "../../lib/mockApi";

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
  initialAmount?: number;
  onSuccess: (amount: number, recipientName: string) => void;
}

export default function SendMoneyModal({
  isOpen,
  onClose,
  beneficiary,
  initialAmount = 5000,
  onSuccess
}: SendMoneyModalProps) {
  const { accounts, selectedAccountId, executeTransfer } = useAccounts();

  const [fromAccountId, setFromAccountId] = useState(selectedAccountId || accounts[0]?.id || "");
  const [amount, setAmount] = useState(initialAmount.toString());
  const [transferMode, setTransferMode] = useState<"IMPS" | "NEFT" | "RTGS">("IMPS");
  const [remark, setRemark] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setRemark("");
      setError(null);
      setAmount(initialAmount.toString());
      if (selectedAccountId) setFromAccountId(selectedAccountId);
    }
  }, [isOpen, initialAmount, selectedAccountId]);

  if (!isOpen || !beneficiary) return null;

  const selectedAccount = accounts.find(a => a.id === fromAccountId) || accounts[0];
  const parsedAmount = parseFloat(amount) || 0;
  const transferLimit = beneficiary.transferLimit || 200000;

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (error) setError(null);

    if (value && index < 3) {
      document.getElementById(`sm-pin-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setError("Please enter a valid transfer amount greater than 0.");
      return;
    }
    if (selectedAccount && parsedAmount > selectedAccount.balance) {
      setError(`Insufficient account balance (Available: ₹${selectedAccount.balance.toLocaleString("en-IN")}).`);
      return;
    }
    if (parsedAmount > transferLimit) {
      setError(`Amount exceeds beneficiary daily limit of ₹${transferLimit.toLocaleString("en-IN")}.`);
      return;
    }

    const pinStr = pin.join("");
    if (pinStr.length < 4) {
      setError("Please enter your 4-digit Security PIN.");
      return;
    }
    if (pinStr !== "1234") {
      setError("Invalid Security PIN (Demo PIN: 1234).");
      return;
    }

    setIsSubmitting(true);
    try {
      await MockApi.sendMoneyToBeneficiary(
        fromAccountId || selectedAccount?.id || "ACC-001",
        beneficiary.id,
        parsedAmount,
        transferMode,
        remark
      );

      // Debit context state
      await executeTransfer(
        fromAccountId || selectedAccount?.id || "ACC-001",
        fromAccountId || selectedAccount?.id || "ACC-001",
        0
      );

      setIsSubmitting(false);
      onSuccess(parsedAmount, beneficiary.name);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process transfer");
      setIsSubmitting(false);
    }
  };

  const maskAccount = (acc?: string) => acc ? `•••• ${acc.slice(-4)}` : "•••• 1234";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Send Money to {beneficiary.name}</h2>
              <p className="text-xs text-on-surface-variant">Instant Direct Bank Transfer</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Beneficiary Badge Card */}
        <div className="p-3.5 bg-[#1E293B] rounded-xl border border-surface-container-highest flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-primary">
              {beneficiary.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-on-surface text-sm">{beneficiary.name}</span>
              <span className="text-[11px] text-on-surface-variant">{beneficiary.bankName} • {maskAccount(beneficiary.accountNumber)}</span>
            </div>
          </div>
          <span className="px-2 py-1 bg-teal-400/10 text-teal-400 rounded text-[10px] font-bold uppercase border border-teal-400/20">
            Verified Beneficiary
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
          
          {/* Source Account Selector */}
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
              <Wallet size={14} className="text-primary" /> Select Debiting Account
            </label>
            <select
              value={fromAccountId}
              onChange={e => setFromAccountId(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary text-xs"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.maskedNumber}) — ₹{acc.balance.toLocaleString("en-IN")} Available
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input & Presets */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-on-surface-variant">Transfer Amount (INR)</label>
              <span className="text-[11px] text-on-surface-variant">Daily Limit: ₹{transferLimit.toLocaleString("en-IN")}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg text-primary">₹</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-on-surface focus:outline-none focus:border-primary"
                placeholder="Enter amount"
                required
              />
            </div>

            {/* Quick Amount Presets */}
            <div className="flex gap-2 mt-2">
              {[1000, 5000, 10000, 25000, 50000].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p.toString())}
                  className="px-2.5 py-1 bg-surface-high hover:bg-surface-variant text-[11px] font-bold rounded-lg border border-white/5 transition-colors text-on-surface"
                >
                  +₹{p.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Mode */}
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-primary" /> Transfer Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "IMPS", label: "IMPS (Instant)", desc: "24x7 Real-time" },
                { id: "NEFT", label: "NEFT (Batch)", desc: "Half-hourly" },
                { id: "RTGS", label: "RTGS (High)", desc: "Min ₹2 Lakh" }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTransferMode(m.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    transferMode === m.id 
                      ? 'bg-primary/10 border-primary text-primary font-bold' 
                      : 'bg-surface border-outline-variant/20 text-on-surface-variant hover:border-outline-variant'
                  }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Remark */}
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Payment Remark (Optional)</label>
            <input
              type="text"
              autoComplete="off"
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="e.g. Rent payment, Family support"
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2 text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          {/* Security PIN Challenge */}
          <div className="p-3 bg-surface rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-on-surface flex items-center gap-1.5">
                <Lock size={14} className="text-primary" /> Enter 4-Digit Security PIN
              </label>
              <span className="text-[10px] text-on-surface-variant font-mono">Demo PIN: <strong className="text-primary">1234</strong></span>
            </div>
            <div className="flex justify-center gap-3">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`sm-pin-${idx}`}
                  type="password"
                  maxLength={1}
                  autoComplete="one-time-code"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  value={digit}
                  onChange={e => handlePinChange(idx, e.target.value)}
                  className="w-10 h-10 text-center text-lg font-bold bg-surface-container-high border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Transferring...
                </>
              ) : (
                <>
                  <Send size={16} /> Confirm Transfer (₹{parsedAmount.toLocaleString("en-IN")})
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
