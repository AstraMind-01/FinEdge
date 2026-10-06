"use client";

import React, { useState } from "react";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { MockApi } from "../../lib/mockApi";
import { Beneficiary } from "../../types";

interface DeleteBeneficiaryConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary: Beneficiary | null;
  onBeneficiaryDeleted: (deletedId: string) => void;
}

export default function DeleteBeneficiaryConfirmModal({
  isOpen,
  onClose,
  beneficiary,
  onBeneficiaryDeleted
}: DeleteBeneficiaryConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !beneficiary) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await MockApi.deleteBeneficiary(beneficiary.id);
      setIsSubmitting(false);
      onBeneficiaryDeleted(beneficiary.id);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-red-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-4 text-on-surface">
        
        <div className="flex items-center gap-3 text-red-400">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">Delete Beneficiary</h2>
            <p className="text-xs text-on-surface-variant">Confirm Recipient Removal</p>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Are you sure you want to remove <strong className="text-on-surface">{beneficiary.name}</strong> ({beneficiary.bankName} - Account {beneficiary.accountNumber.slice(-4)}) from your saved beneficiaries?
        </p>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Removing...
              </>
            ) : (
              <>
                <Trash2 size={14} /> Yes, Delete
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
