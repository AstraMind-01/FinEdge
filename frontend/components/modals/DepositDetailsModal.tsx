"use client";

import React from "react";
import { X, ShieldCheck, Download, Calendar, Landmark, CheckCircle2, UserCheck, FileText, ArrowRight } from "lucide-react";
import { Deposit } from "../../types";
import { DepositCertificateBuilder } from "../../lib/pdf/documents/DepositCertificate";

interface DepositDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: Deposit | null;
}

export default function DepositDetailsModal({
  isOpen,
  onClose,
  deposit
}: DepositDetailsModalProps) {
  if (!isOpen || !deposit) return null;

  const handleDownloadPdf = () => {
    // Attempt to parse out linked account number, or just use a generic placeholder
    // In a real app this would come from the user's accounts list
    DepositCertificateBuilder.generate(deposit, "FinEdge Customer", "Primary Savings Account");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/30">
                Official Deposit Certificate
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                Active &amp; Insured
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">{deposit.name}</h2>
            <p className="text-xs text-on-surface-variant font-mono">Ref ID: {deposit.id} • Certificate #{deposit.id}-CERT-2026</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Certificate Card Summary */}
        <div className="p-4 bg-gradient-to-br from-[#1E293B] to-surface rounded-xl border border-primary/30 space-y-3 font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Principal Amount:</span>
            <span className="font-bold text-on-surface">₹{deposit.principalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Interest Rate:</span>
            <span className="font-bold text-primary">{deposit.interestRate}% p.a.</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Accumulated Value:</span>
            <span className="font-bold text-green-400">₹{(deposit.accumulatedAmount || deposit.principalAmount).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
            <span className="text-on-surface-variant">Expected Maturity Value:</span>
            <span className="font-bold text-primary text-sm">₹{deposit.maturityAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Dates & Nominee Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-surface rounded-xl border border-white/5">
            <span className="text-on-surface-variant block text-[10px] uppercase">Deposit Start Date</span>
            <span className="font-bold text-on-surface">{deposit.startDate}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-white/5">
            <span className="text-on-surface-variant block text-[10px] uppercase">Maturity Date</span>
            <span className="font-bold text-on-surface">{deposit.maturityDate}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-white/5 col-span-2 flex items-center justify-between">
            <div>
              <span className="text-on-surface-variant block text-[10px] uppercase">Registered Nominee</span>
              <span className="font-bold text-on-surface">Priya Ranjan (Spouse • 100% Share)</span>
            </div>
            <UserCheck size={18} className="text-green-400 shrink-0" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-white/5">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Close</button>
          <button 
            type="button" 
            onClick={handleDownloadPdf}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
          >
            <Download size={16} /> Download Certificate (PDF)
          </button>
        </div>

      </div>
    </div>
  );
}
