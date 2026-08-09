"use client";

import React, { useState } from "react";
import { X, MoreHorizontal, BookOpen, FileCheck, UserCheck, Users, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";

interface MoreActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MoreActionsModal({ isOpen, onClose }: MoreActionsModalProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerAction = (actionName: string) => {
    setIsSubmitting(true);
    setActiveAction(actionName);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(`Request for "${actionName}" has been successfully processed & logged!`);
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveAction(null);
      }, 2500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <MoreHorizontal size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">More Banking Services</h2>
              <p className="text-xs text-on-surface-variant">Self-service banking requests & document center</p>
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

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div 
            onClick={() => handleTriggerAction("Cheque Book Request")}
            className="p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
            <span className="font-semibold text-on-surface text-sm">Request Cheque Book</span>
            <p className="text-[11px] text-on-surface-variant">25-leaf personalized cheque book delivered home</p>
          </div>

          <div 
            onClick={() => handleTriggerAction("Tax Certificate (Form 16/26AS)")}
            className="p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform">
              <FileCheck size={20} />
            </div>
            <span className="font-semibold text-on-surface text-sm">Tax Form 16 / 26AS</span>
            <p className="text-[11px] text-on-surface-variant">Download interest certificate for tax filing</p>
          </div>

          <div 
            onClick={() => handleTriggerAction("KYC Re-Verification Check")}
            className="p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="p-2 rounded-lg bg-tertiary/10 text-tertiary w-fit group-hover:scale-110 transition-transform">
              <UserCheck size={20} />
            </div>
            <span className="font-semibold text-on-surface text-sm">KYC Status Check</span>
            <p className="text-[11px] text-on-surface-variant">Verified via CKYC & Aadhaar e-KYC portal</p>
          </div>

          <div 
            onClick={() => handleTriggerAction("Register / Change Nominee")}
            className="p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-2 group"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <span className="font-semibold text-on-surface text-sm">Update Nominee</span>
            <p className="text-[11px] text-on-surface-variant">Add or modify account beneficiary nominee</p>
          </div>

          <div 
            onClick={() => handleTriggerAction("Dispute Unknown Transaction")}
            className="p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-error/40 cursor-pointer transition-all flex flex-col gap-2 group col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/10 text-error">
                <ShieldAlert size={20} />
              </div>
              <div>
                <span className="font-semibold text-on-surface text-sm">Dispute Transaction</span>
                <p className="text-[11px] text-on-surface-variant">Report fraudulent or unauthorized charge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
