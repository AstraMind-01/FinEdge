"use client";

import React, { useState, useEffect } from "react";
import { X, Download, ShieldCheck, FileText, CheckCircle2, Lock, Clock, History, KeyRound } from "lucide-react";
import { VaultDocument } from "../../types";
import { useAccounts } from "../../context/AccountContext";
import { VaultDocumentPdfBuilder } from "../../lib/pdf/documents/VaultDocumentPdf";

interface KycDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentStatus: string;
  vaultDoc?: VaultDocument | null;
}

const DOCUMENT_METADATA: Record<string, { num: string; date: string; authority: string; textPreview: string }> = {
  "Aadhaar Card": { num: "•••• •••• 9912", date: "15 Jan 2026", authority: "UIDAI (Govt of India)", textPreview: "REPUBLIC OF INDIA - AADHAAR CARD\nName: Soumya Ranjan\nDOB: 12/08/1992\nGender: MALE\nAadhaar No: 4912 8821 9912\nAddress: 402, Skyline Towers, BKC, Mumbai 400051" },
  "PAN Card": { num: "ABCDE1234F", date: "20 Feb 2026", authority: "Income Tax Dept of India", textPreview: "INCOME TAX DEPARTMENT - GOVT OF INDIA\nPermanent Account Number: ABCDE1234F\nName: SOUMYA RANJAN\nFather's Name: RAJAT RANJAN\nDate of Birth: 12/08/1992\nSignature Verified ✓" },
  "Address Proof": { num: "PASSPORT-Z991042", date: "05 Mar 2026", authority: "Ministry of External Affairs", textPreview: "PASSPORT / ADDRESS PROOF\nDocument Type: Passport\nPassport No: Z991042\nAddress: 402, Skyline Towers, BKC, Mumbai 400051\nValid Until: 10 May 2034" },
  "Income Proof": { num: "SALARY-SLIP-JUL2026", date: "10 Jul 2026", authority: "Employer HR Payroll", textPreview: "SALARY SLIP - JULY 2026\nEmployee Name: Soumya Ranjan\nEmployee ID: EMP-88410\nDesignation: VP Engineering\nGross Pay: ₹ 4,25,000 / month\nNet Credit: ₹ 3,45,000 / month" },
  "Photograph": { num: "PHOTO-HD-2026", date: "15 Mar 2026", authority: "FinEdge Biometric Scan", textPreview: "BIOMETRIC PHOTOGRAPH VERIFIED\nMatch Score: 99.8%\nLiveness Detection: PASSED\nTimestamp: 15 Mar 2026 10:45 AM" },
  "Signature": { num: "DIGI-SIG-9912", date: "15 Mar 2026", authority: "FinEdge e-Sign Gateway", textPreview: "DIGITAL E-SIGNATURE VERIFIED\nSigner: Soumya Ranjan\nIP Address: 103.44.12.89\nSHA-256 Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
};

export default function KycDocumentViewerModal({
  isOpen,
  onClose,
  documentTitle,
  documentStatus,
  vaultDoc
}: KycDocumentViewerModalProps) {
  const { getDocumentRemainingAccessTime, userProfile } = useAccounts();
  const [remSec, setRemSec] = useState(0);

  const docId = vaultDoc?.id || "";

  useEffect(() => {
    if (!isOpen || !docId) return;

    setRemSec(getDocumentRemainingAccessTime(docId));
    const interval = setInterval(() => {
      const remaining = getDocumentRemainingAccessTime(docId);
      setRemSec(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, docId, getDocumentRemainingAccessTime]);

  if (!isOpen) return null;

  const meta = vaultDoc ? {
    num: vaultDoc.documentNumber,
    date: vaultDoc.uploadDate,
    authority: vaultDoc.authority,
    textPreview: vaultDoc.textPreview
  } : (DOCUMENT_METADATA[documentTitle] || DOCUMENT_METADATA["Aadhaar Card"]);

  const statusToShow = vaultDoc?.status || documentStatus;

  const handleDownload = () => {
    // Clean up filename by stripping any existing extension (.pdf, .txt, .png, .jpg)
    const rawFileName = vaultDoc?.fileName || documentTitle;
    const baseName = rawFileName
      .replace(/\.(pdf|txt|png|jpg|jpeg)$/i, "")
      .replace(/ /g, "_")
      .replace(/_Encrypted$/i, "")
      .replace(/_Verified$/i, "");

    const cleanPdfFileName = `${baseName}_Encrypted.pdf`;

    const docObj = vaultDoc || {
      title: documentTitle,
      fileName: `${baseName}.pdf`,
      status: statusToShow,
      documentNumber: meta.num,
      authority: meta.authority,
      uploadDate: meta.date,
      storageId: "VAULT-STORE-1001",
      encryptionKeyId: "AES256-KEY-9941",
      textPreview: meta.textPreview
    };

    VaultDocumentPdfBuilder.generate(docObj, userProfile?.name || "Soumya Ranjan", cleanPdfFileName);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6 animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/30">
                AES-256 Encrypted Document
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusToShow === 'Verified' ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20' : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'}`}>
                {statusToShow}
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">{vaultDoc?.title || documentTitle}</h2>
            <p className="text-xs text-on-surface-variant font-mono">Doc ID: {meta.num}</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Access Token Countdown Banner */}
        {remSec > 0 ? (
          <div className="flex items-center justify-between p-3 bg-tertiary/10 border border-tertiary/30 rounded-xl text-tertiary text-xs font-medium">
            <div className="flex items-center gap-2">
              <Clock size={16} className="animate-pulse" />
              <span>Signed Access Token Active</span>
            </div>
            <span className="font-mono font-bold">{remSec}s remaining</span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-error/10 border border-error/30 rounded-xl text-error text-xs font-medium">
            <div className="flex items-center gap-2">
              <Lock size={16} />
              <span>Access Token Expired</span>
            </div>
            <span>Re-verify 2FA to view</span>
          </div>
        )}

        {/* Document Preview Box */}
        <div className="p-4 bg-[#1E293B] rounded-xl border border-white/10 font-mono text-xs text-on-surface-variant space-y-2 whitespace-pre-line">
          <div className="flex items-center justify-between text-primary font-bold mb-2 pb-2 border-b border-white/10">
            <span className="flex items-center gap-2">
              <FileText size={16} /> Certified Preview ({meta.authority})
            </span>
            {vaultDoc?.fileSize && (
              <span className="text-[10px] text-on-surface-variant font-normal">{vaultDoc.fileSize}</span>
            )}
          </div>
          <p className="text-on-surface leading-relaxed">{meta.textPreview}</p>
        </div>

        {/* Encryption & Storage Meta */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-surface rounded-xl border border-white/5">
            <span className="text-on-surface-variant block text-[10px] uppercase">Storage ID</span>
            <span className="font-bold text-on-surface truncate block">{vaultDoc?.storageId || "VAULT-STORE-1001"}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-white/5">
            <span className="text-on-surface-variant block text-[10px] uppercase">Encryption Key ID</span>
            <span className="font-bold text-primary truncate block">{vaultDoc?.encryptionKeyId || "AES256-KEY-9941"}</span>
          </div>
        </div>

        {/* Audit Log Trail */}
        {vaultDoc?.auditLogs && vaultDoc.auditLogs.length > 0 && (
          <div className="flex flex-col gap-1.5 p-3 bg-surface-high/40 rounded-xl border border-white/5 text-[11px] font-mono">
            <span className="font-bold text-on-surface flex items-center gap-1.5 text-xs">
              <History size={14} className="text-primary" /> Security Audit Log
            </span>
            {vaultDoc.auditLogs.slice(0, 2).map((log) => (
              <div key={log.id} className="flex justify-between items-center text-on-surface-variant">
                <span>• {log.action}</span>
                <span className="text-[10px] text-tertiary">{log.timestamp}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-white/5">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs cursor-pointer">Close</button>
          <button 
            type="button" 
            onClick={handleDownload}
            disabled={remSec <= 0}
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} /> Download Encrypted Copy
          </button>
        </div>

      </div>
    </div>
  );
}
