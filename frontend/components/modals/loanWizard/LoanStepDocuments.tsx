"use client";

import React from "react";
import { FileText, FileCheck, Trash2, Upload, ShieldCheck, CheckCircle2 } from "lucide-react";
import { LoanProductConfig } from "./loanProducts";
import { LoanApplication } from "../../../types";

interface LoanStepDocumentsProps {
  currentProduct: LoanProductConfig;
  uploadedFiles: { [docName: string]: { name: string; size: string } };
  panInputId: string;
  onFileUpload: (docName: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (docName: string) => void;
}

export function LoanStepUploadDocs({
  currentProduct,
  uploadedFiles,
  panInputId,
  onFileUpload,
  onRemoveFile,
}: LoanStepDocumentsProps) {
  return (
    <div className="space-y-4 text-xs">
      <p className="text-on-surface-variant text-xs">
        Upload required documents for <strong>{currentProduct.name}</strong> verification. Scanned PDFs or JPG images accepted.
      </p>

      <div className="space-y-3">
        {currentProduct.requiredDocs.map((docName, idx) => {
          const uploaded = uploadedFiles[docName];
          return (
            <div key={idx} className="p-3.5 bg-surface rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    uploaded ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-surface-high text-on-surface-variant"
                  }`}
                >
                  {uploaded ? <FileCheck size={18} /> : <FileText size={18} />}
                </div>
                <div>
                  <p className="font-bold text-on-surface text-xs">{docName}</p>
                  {uploaded ? (
                    <p className="text-[11px] text-green-400 font-mono font-medium">
                      {uploaded.name} ({uploaded.size})
                    </p>
                  ) : (
                    <p className="text-[11px] text-on-surface-variant">Mandatory verification document</p>
                  )}
                </div>
              </div>

              <div>
                {uploaded ? (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(docName)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <label
                    htmlFor={`${panInputId}-${idx}`}
                    className="cursor-pointer px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                  >
                    <Upload size={14} /> Upload
                    <input
                      id={`${panInputId}-${idx}`}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => onFileUpload(docName, e)}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LoanStepEligibilityProps {
  foirRatio: number;
  loanAmount: number;
  emi: number;
  uploadedFilesCount: number;
}

export function LoanStepEligibility({
  foirRatio,
  loanAmount,
  emi,
  uploadedFilesCount,
}: LoanStepEligibilityProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="p-4 bg-gradient-to-r from-surface to-surface-container rounded-xl border border-primary/30 space-y-3">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="font-bold text-on-surface text-sm">Automated Underwriting Summary</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
            <ShieldCheck size={14} /> High Approval Likelihood
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-center pt-1">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">CIBIL Score</span>
            <span className="text-sm font-bold text-green-400">785 / 900</span>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">FOIR Ratio</span>
            <span className={`text-sm font-bold ${foirRatio <= 50 ? "text-green-400" : "text-amber-400"}`}>
              {foirRatio}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Applied Amount</span>
            <span className="text-sm font-bold text-primary">₹{loanAmount.toLocaleString("en-IN")}</span>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Calculated EMI</span>
            <span className="text-sm font-bold text-on-surface">₹{emi.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-surface rounded-xl border border-white/5 space-y-1">
        <p className="font-bold text-on-surface text-xs">Verification Details</p>
        <p className="text-[11px] text-on-surface-variant">
          Documents Attached: <strong>{uploadedFilesCount} Verified Files</strong> • Bank Mandate Account:{" "}
          <strong>Primary Savings ACC-001 •••• 8812</strong>
        </p>
      </div>
    </div>
  );
}

interface LoanStepSubmittedProps {
  submittedApp: LoanApplication;
  onClose: () => void;
}

export function LoanStepSubmitted({ submittedApp, onClose }: LoanStepSubmittedProps) {
  return (
    <div className="flex flex-col items-center text-center py-6 gap-3">
      <div className="w-16 h-16 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center justify-center animate-bounce">
        <CheckCircle2 size={36} />
      </div>
      <h3 className="text-lg font-bold text-on-surface">Loan Application Submitted!</h3>
      <p className="text-xs text-on-surface-variant max-w-md">
        Your application for <strong>{submittedApp.loanTypeName}</strong> of{" "}
        <strong className="text-primary font-mono">₹{submittedApp.requestedAmount.toLocaleString("en-IN")}</strong> has been submitted.
      </p>
      <div className="p-3 bg-surface rounded-xl border border-white/5 font-mono text-xs text-on-surface-variant my-2">
        Application Reference: <strong className="text-primary font-bold">{submittedApp.referenceNumber}</strong>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] cursor-pointer"
      >
        Done &amp; View Dashboard
      </button>
    </div>
  );
}
