"use client";

import React, { useState } from "react";
import { X, Edit2, ShieldCheck, Building2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { MockApi } from "../../lib/mockApi";
import { Beneficiary } from "../../types";

interface EditBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
  onBeneficiaryUpdated: (updated: Beneficiary) => void;
}

export default function EditBeneficiaryModal({
  isOpen,
  onClose,
  beneficiary,
  onBeneficiaryUpdated
}: EditBeneficiaryModalProps) {
  const [name, setName] = useState(beneficiary?.name || "");
  const [transferLimit, setTransferLimit] = useState(beneficiary?.transferLimit?.toString() || "200000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !beneficiary) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await MockApi.updateBeneficiary(beneficiary.id, {
        name,
        transferLimit: parseFloat(transferLimit) || beneficiary.transferLimit || 200000
      });
      setIsSubmitting(false);
      onBeneficiaryUpdated(updated);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Edit2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Edit Beneficiary</h2>
              <p className="text-xs text-on-surface-variant">{beneficiary.id} • {beneficiary.bankName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Beneficiary Nickname / Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Daily Transfer Limit (INR)</label>
            <input
              type="number"
              required
              value={transferLimit}
              onChange={e => setTransferLimit(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="p-3 bg-[#1E293B] rounded-xl border border-white/5 space-y-1">
            <span className="text-[11px] text-on-surface-variant block">Bank Details (Immutable)</span>
            <div className="text-xs font-mono font-bold text-on-surface">{beneficiary.bankName} • Account {beneficiary.accountNumber}</div>
            <div className="text-[10px] text-on-surface-variant font-mono">IFSC: {beneficiary.ifsc || beneficiary.ifscCode}</div>
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
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
