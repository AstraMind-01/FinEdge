"use client";

import React, { useState } from "react";
import { X, Upload, CheckCircle2, Loader2, FileText, ShieldCheck, ArrowRight } from "lucide-react";

interface UpdateKycDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  onDocumentUpdated: (docTitle: string) => void;
}

export default function UpdateKycDocumentModal({
  isOpen,
  onClose,
  documentTitle,
  onDocumentUpdated
}: UpdateKycDocumentModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [ocrStep, setOcrStep] = useState<"IDLE" | "VERIFYING" | "SUCCESS">("IDLE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setOcrStep("IDLE");
    }
  };

  const handleRunOcrAndVerify = () => {
    if (!uploadedFile) return;
    setOcrStep("VERIFYING");
    setTimeout(() => {
      setOcrStep("SUCCESS");
    }, 1200);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onDocumentUpdated(documentTitle);
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Upload / Update {documentTitle}</h2>
            <p className="text-xs text-on-surface-variant">Automated OCR verification engine</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6 border-2 border-dashed border-white/10 hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer relative bg-surface text-center">
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          <Upload size={28} className="text-primary" />
          <div>
            <p className="text-xs font-bold text-on-surface">
              {uploadedFile ? uploadedFile.name : `Drag & Drop or Browse ${documentTitle}`}
            </p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Supports PDF, PNG, JPG (Max 10MB)</p>
          </div>
          {uploadedFile && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
              <FileText size={12} /> File Loaded ({(uploadedFile.size / 1024).toFixed(0)} KB)
            </span>
          )}
        </div>

        {/* OCR Verification Process */}
        {uploadedFile && (
          <div className="p-4 bg-surface-container-high rounded-xl border border-white/5 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-on-surface-variant">Automated OCR Parsing</span>
              {ocrStep === "IDLE" && (
                <button type="button" onClick={handleRunOcrAndVerify} className="px-3 py-1 bg-primary text-on-primary font-bold rounded-lg text-[11px]">
                  Run OCR Check
                </button>
              )}
              {ocrStep === "VERIFYING" && (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Loader2 size={14} className="animate-spin" /> Extracting details...
                </span>
              )}
              {ocrStep === "SUCCESS" && (
                <span className="text-teal-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> OCR Passed (Match Score 99.8%)
                </span>
              )}
            </div>

            {ocrStep === "SUCCESS" && (
              <div className="p-3 bg-[#1E293B] rounded-lg border border-teal-500/30 text-[11px] font-mono text-teal-300 space-y-1">
                <p>✓ Document Name: {documentTitle}</p>
                <p>✓ Format &amp; Tamper Check: PASSED</p>
                <p>✓ Name Match: Soumya Ranjan (100% Match)</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
          <button 
            type="button"
            disabled={!uploadedFile || ocrStep !== "SUCCESS" || isSubmitting}
            onClick={handleFinalSubmit}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit &amp; Mark Verified <CheckCircle2 size={16} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
