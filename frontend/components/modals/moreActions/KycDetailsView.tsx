"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface KycDetailsViewProps {
  kycDetails: {
    status: string;
    verificationAuthority: string;
    ckycRef: string;
    riskCategory: string;
    aadhaarStatus: string;
    panStatus: string;
    lastVerifiedDate: string;
  };
  onBack: () => void;
}

export default function KycDetailsView({ kycDetails, onBack }: KycDetailsViewProps) {
  if (!kycDetails) return null;

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3">
        <ShieldCheck size={28} className="text-tertiary shrink-0" />
        <div>
          <span className="font-bold text-sm text-tertiary flex items-center gap-2">
            {kycDetails.status}
          </span>
          <p className="text-[11px] text-on-surface-variant">Verified by {kycDetails.verificationAuthority}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-surface-high/40 rounded-xl border border-outline-variant/10">
        <div className="flex flex-col">
          <span className="text-on-surface-variant text-[10px]">CKYC Reference Number</span>
          <span className="font-mono font-bold text-on-surface">{kycDetails.ckycRef}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-on-surface-variant text-[10px]">Risk Assessment</span>
          <span className="font-mono font-bold text-tertiary">{kycDetails.riskCategory}</span>
        </div>
        <div className="flex flex-col col-span-2">
          <span className="text-on-surface-variant text-[10px]">Aadhaar e-KYC Verification</span>
          <span className="font-mono text-on-surface text-[11px]">{kycDetails.aadhaarStatus}</span>
        </div>
        <div className="flex flex-col col-span-2">
          <span className="text-on-surface-variant text-[10px]">PAN Verification Status</span>
          <span className="font-mono text-on-surface text-[11px]">{kycDetails.panStatus}</span>
        </div>
        <div className="flex flex-col col-span-2 border-t border-outline-variant/10 pt-2">
          <span className="text-on-surface-variant text-[10px]">Last Re-Verification Date</span>
          <span className="font-mono text-on-surface text-[11px]">{kycDetails.lastVerifiedDate}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs transition-all cursor-pointer mt-1"
      >
        Back to Services
      </button>
    </div>
  );
}
