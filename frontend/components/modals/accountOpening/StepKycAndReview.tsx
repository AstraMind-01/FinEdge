"use client";

import React from "react";
import { ShieldCheck, FileText, CheckCircle2, KeyRound, AlertCircle, Download } from "lucide-react";
import { AccountOpeningFormData, getProductInfo } from "./wizardTypes";
import { AccountStatementBuilder } from "../../../lib/pdf/documents/AccountStatement";

interface StepKycAndReviewProps {
  currentStep: number;
  formData: AccountOpeningFormData;
  updateForm: (fields: Partial<AccountOpeningFormData>) => void;
  otpError: string | null;
  createdAccResult: any | null;
  onClose: () => void;
}

export default function StepKycAndReview({
  currentStep,
  formData,
  updateForm,
  otpError,
  createdAccResult,
  onClose,
}: StepKycAndReviewProps) {
  const prodInfo = getProductInfo(formData.productType);

  if (currentStep === 5) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" /> Step 5: Digital KYC & Identity Verification
        </h3>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-on-surface-variant">KYC Document Type</label>
          <select
            value={formData.docType}
            onChange={(e) => updateForm({ docType: e.target.value })}
            className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface"
          >
            <option>Aadhaar Card (Instant OTP OCR)</option>
            <option>Passport (Machine Readable Zone)</option>
            <option>Voter ID Card</option>
            <option>Driving License</option>
          </select>
        </div>

        {/* Upload Previews */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 border-2 border-dashed border-tertiary/40 bg-tertiary/5 rounded-xl flex flex-col items-center gap-2 text-center">
            <CheckCircle2 size={24} className="text-tertiary" />
            <span className="font-bold text-on-surface">Front View Uploaded</span>
            <span className="text-[10px] text-on-surface-variant">Verified via AI Document Scanner</span>
          </div>
          <div className="p-4 border-2 border-dashed border-tertiary/40 bg-tertiary/5 rounded-xl flex flex-col items-center gap-2 text-center">
            <CheckCircle2 size={24} className="text-tertiary" />
            <span className="font-bold text-on-surface">Back View Uploaded</span>
            <span className="text-[10px] text-on-surface-variant">OCR Data Matched with Applicant</span>
          </div>
        </div>

        {/* Selfie Check */}
        <div className="p-3 bg-surface-high/60 rounded-xl border border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-tertiary" />
            <span className="font-medium">Video Liveness Selfie Check Verified</span>
          </div>
          <span className="px-2.5 py-1 bg-tertiary/20 text-tertiary rounded-lg text-[10px] font-bold uppercase">Passed 99.8% Match</span>
        </div>
      </div>
    );
  }

  if (currentStep === 6) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <FileText size={16} className="text-primary" /> Step 6: Review Summary & Aadhaar OTP e-Sign
        </h3>

        {/* Summary Box */}
        <div className="p-4 bg-surface-high/60 rounded-xl border border-outline-variant/10 grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Selected Offering</span>
            <p className="font-bold text-on-surface mt-0.5">{prodInfo.name}</p>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Applicant Name</span>
            <p className="font-bold text-on-surface mt-0.5">{formData.fullName}</p>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">PAN / Aadhaar</span>
            <p className="font-mono font-bold text-on-surface mt-0.5">
              {formData.panNumber} / {formData.aadhaarNumber.slice(-4)}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Initial Funding</span>
            <p className="font-mono font-bold text-tertiary mt-0.5">₹{formData.initialDeposit.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* OTP e-Sign Form */}
        <div className="flex flex-col gap-2 p-3.5 bg-surface rounded-xl border border-outline-variant/10">
          <span className="font-semibold text-on-surface flex items-center gap-2">
            <KeyRound size={16} className="text-primary" /> Enter 6-Digit Aadhaar e-Sign OTP
          </span>
          <input
            type="password"
            maxLength={6}
            value={formData.otpCode}
            onChange={(e) => updateForm({ otpCode: e.target.value.replace(/\D/g, "") })}
            placeholder="••••••"
            className="bg-surface-high border border-outline-variant/30 p-2.5 rounded-xl text-center text-lg font-mono font-bold tracking-[0.4em] text-on-surface focus:outline-none focus:border-primary"
          />
          <span className="text-[11px] text-on-surface-variant text-center">
            Demo e-Sign OTP: <strong className="text-primary font-mono">123456</strong>
          </span>
        </div>

        {otpError && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" /> {otpError}
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 7 && createdAccResult) {
    return (
      <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-300 py-4">
        <div className="w-16 h-16 rounded-full bg-tertiary/20 border-2 border-tertiary flex items-center justify-center text-tertiary shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <CheckCircle2 size={36} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-on-surface">Account Provisioned & Active!</h3>
          <p className="text-xs text-on-surface-variant mt-1">Your new bank account is live with instant net banking & UPI access.</p>
        </div>

        {/* Created Account Details Card */}
        <div className="w-full bg-surface-high/60 border border-outline-variant/20 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs text-left">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Account Number</span>
            <p className="font-mono font-bold text-sm text-on-surface mt-0.5">{createdAccResult.accountNumber}</p>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">IFSC Code</span>
            <p className="font-mono font-bold text-sm text-primary mt-0.5">{createdAccResult.ifsc}</p>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Opening Balance</span>
            <p className="font-mono font-bold text-sm text-tertiary mt-0.5">₹{createdAccResult.balance.toLocaleString("en-IN")}</p>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Linked Card</span>
            <p className="font-bold text-xs text-on-surface mt-0.5 truncate">{createdAccResult.linkedCard}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => {
              AccountStatementBuilder.generate(createdAccResult, formData.fullName, [], "Welcome Pack");
            }}
            className="px-4 py-2 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Download Welcome Pack PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] cursor-pointer"
          >
            Go to Accounts Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
