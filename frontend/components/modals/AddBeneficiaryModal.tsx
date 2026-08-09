"use client";

import React, { useState } from "react";
import { X, UserPlus, Building2, CreditCard, ShieldCheck, CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";
import { MockApi } from "../../lib/mockApi";
import { Beneficiary } from "../../types";

interface AddBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBeneficiaryAdded: (newBen: Beneficiary) => void;
}

export default function AddBeneficiaryModal({
  isOpen,
  onClose,
  onBeneficiaryAdded
}: AddBeneficiaryModalProps) {
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccount, setConfirmAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [transferLimit, setTransferLimit] = useState("100000");
  const [accountType, setAccountType] = useState<"SAVINGS" | "CURRENT">("SAVINGS");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the beneficiary full name.");
      return;
    }
    if (!accountNumber || accountNumber.length < 8) {
      setError("Please enter a valid account number (min 8 digits).");
      return;
    }
    if (accountNumber !== confirmAccount) {
      setError("Account numbers do not match. Please verify.");
      return;
    }
    if (!ifscCode || ifscCode.length < 11) {
      setError("Please enter a valid 11-character IFSC code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await MockApi.addBeneficiary({
        name,
        bankName,
        accountNumber,
        ifsc: ifscCode,
        ifscCode,
        accountType,
        transferLimit: parseFloat(transferLimit) || 100000,
        category: "Domestic"
      });

      setIsSubmitting(false);
      onBeneficiaryAdded(created);
      onClose();
      // Reset form
      setName("");
      setAccountNumber("");
      setConfirmAccount("");
    } catch (err: any) {
      setError(err.message || "Failed to add beneficiary");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Add New Beneficiary</h2>
              <p className="text-xs text-on-surface-variant">Register a domestic recipient for fund transfers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Cooling Notice Banner */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px] flex items-start gap-2.5">
          <Clock size={16} className="shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">30-Minute Security Cooling Period</strong>
            <span>Newly registered beneficiaries undergo a 30-min security cooling window before high-value transfers are unlocked.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Beneficiary Name */}
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Beneficiary Full Name (As per Bank)</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Vikram Malhotra"
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          {/* Bank Name Dropdown */}
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1 flex items-center gap-1.5">
              <Building2 size={14} className="text-primary" /> Select Bank
            </label>
            <select
              value={bankName}
              onChange={e => {
                setBankName(e.target.value);
                if (e.target.value === "HDFC Bank") setIfscCode("HDFC0001234");
                else if (e.target.value === "ICICI Bank") setIfscCode("ICIC0003412");
                else if (e.target.value === "SBI") setIfscCode("SBIN0009912");
                else if (e.target.value === "Axis Bank") setIfscCode("UTIB0008811");
                else if (e.target.value === "Kotak Bank") setIfscCode("KKBK0001122");
              }}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary text-xs"
            >
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="SBI">State Bank of India (SBI)</option>
              <option value="Axis Bank">Axis Bank</option>
              <option value="Kotak Bank">Kotak Mahindra Bank</option>
              <option value="Punjab National Bank">Punjab National Bank</option>
            </select>
          </div>

          {/* Account Number & Confirm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1">Account Number</label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="10-16 digit account"
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-medium focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1">Confirm Account</label>
              <input
                type="password"
                required
                value={confirmAccount}
                onChange={e => setConfirmAccount(e.target.value)}
                placeholder="Re-enter account"
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* IFSC & Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1">IFSC Code</label>
              <input
                type="text"
                required
                value={ifscCode}
                onChange={e => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234"
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono uppercase font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1">Daily Limit (INR)</label>
              <input
                type="number"
                required
                value={transferLimit}
                onChange={e => setTransferLimit(e.target.value)}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-medium focus:outline-none focus:border-primary"
              />
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
                  <Loader2 size={16} className="animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Add Beneficiary
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
