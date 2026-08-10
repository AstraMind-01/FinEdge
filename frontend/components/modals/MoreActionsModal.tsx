"use client";

import React, { useState } from "react";
import { X, MoreHorizontal, BookOpen, FileCheck, UserCheck, Users, ShieldAlert, CheckCircle2, Loader2, AlertCircle, ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";
import { TaxForm16PdfBuilder } from "../../lib/pdf/documents/TaxForm16Pdf";

interface MoreActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MoreActionsModal({ isOpen, onClose }: MoreActionsModalProps) {
  const { accounts, userProfile, addNotification, addInboxMessage, updateUserProfile } = useAccounts();

  const [activeView, setActiveView] = useState<"GRID" | "NOMINEE_FORM" | "DISPUTE_FORM" | "KYC_DETAILS">("GRID");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Nominee Form State
  const [nomineeName, setNomineeName] = useState(userProfile.nominee || "Sunita Ranjan");
  const [nomineeRelation, setNomineeRelation] = useState(userProfile.nomineeRelation || "Spouse");
  const [nomineeDob, setNomineeDob] = useState("1994-08-12");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || "");

  // Dispute Form State
  const [disputeTxnId, setDisputeTxnId] = useState("");
  const [disputeReason, setDisputeReason] = useState("Unauthorized Online Transaction");

  // KYC Data State
  const [kycDetails, setKycDetails] = useState<any>(null);

  if (!isOpen) return null;

  // Handle Cheque Book Request
  const handleChequeBookRequest = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/banking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHEQUE_BOOK_REQUEST",
          accountId: selectedAccountId || accounts[0]?.id || "ACC-001"
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message);
        addNotification("Cheque Book Requested", `Ref ID: ${data.referenceId}. Delivered within 3-5 business days.`, "SYSTEM");
        addInboxMessage(
          "Cheque Book Request",
          `Cheque Book Advice: ${data.referenceId}`,
          `Your request for a 25-leaf personalized cheque book for account ${selectedAccountId || accounts[0]?.id} has been registered under reference ${data.referenceId}.`
        );
      } else {
        setErrorMsg(data.error || "Cheque book request failed");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to banking service backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Tax Form 16 / 26AS Download
  const handleTaxFormDownload = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/banking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TAX_FORM_DOWNLOAD" })
      });
      const data = await res.json();

      if (data.success) {
        // Generate and download official Tax Form 16 PDF
        TaxForm16PdfBuilder.generate(userProfile, accounts, "2025-26", "2026-27");

        setSuccessMsg("Form 16 / 26AS Tax Certificate PDF generated & downloaded successfully.");
        addNotification("Tax Certificate Downloaded", `Form 16 / 26AS downloaded for AY 2026-27. Ref: ${data.referenceId}`, "SYSTEM");
        addInboxMessage(
          "Tax Documents",
          `Form 16 Tax Certificate: ${data.referenceId}`,
          `Tax Certificate (Form 16A / 26AS) for Financial Year 2025-26 was generated and downloaded successfully.`
        );
      } else {
        setErrorMsg(data.error || "Tax Form 16 download failed");
      }
    } catch (err: any) {
      setErrorMsg("Failed to generate Tax Form 16 PDF document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle KYC Status Check
  const handleKycStatusCheck = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/banking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "KYC_STATUS_CHECK" })
      });
      const data = await res.json();

      if (data.success) {
        setKycDetails(data.kycData);
        setActiveView("KYC_DETAILS");
        addNotification("KYC Status Verified", "CKYC & Aadhaar e-KYC status: Fully Verified", "SECURITY");
      } else {
        setErrorMsg(data.error || "KYC status check failed");
      }
    } catch (err: any) {
      setErrorMsg("Failed to check KYC status from CKYCR portal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Nominee Update
  const handleUpdateNomineeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/banking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_NOMINEE",
          accountId: selectedAccountId || accounts[0]?.id || "ACC-001",
          payload: { nomineeName, relation: nomineeRelation, dob: nomineeDob }
        })
      });
      const data = await res.json();

      if (data.success) {
        updateUserProfile({
          nominee: nomineeName,
          nomineeRelation: nomineeRelation
        });

        setSuccessMsg(data.message);
        addNotification("Nominee Updated", `Account beneficiary updated to ${nomineeName} (${nomineeRelation})`, "SECURITY");
        addInboxMessage(
          "Nominee Services",
          `Account Beneficiary Updated: ${selectedAccountId || "Primary Account"}`,
          `Nominee details for account ${selectedAccountId || "Primary Account"} have been updated to ${nomineeName} (${nomineeRelation}).`
        );
        setTimeout(() => {
          setActiveView("GRID");
        }, 1500);
      } else {
        setErrorMsg(data.error || "Failed to update nominee");
      }
    } catch (err: any) {
      setErrorMsg("Failed to update nominee details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Transaction Dispute
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/banking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISPUTE_TRANSACTION",
          payload: { transactionId: disputeTxnId || `TXN-${Date.now()}`, reason: disputeReason }
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message);
        addNotification("Dispute Filed", `Dispute Ticket: ${data.ticketId}. Resolution expected in 3 business days.`, "SECURITY");
        addInboxMessage(
          "Dispute Operations",
          `Transaction Dispute Ticket: ${data.ticketId}`,
          `Dispute ticket ${data.ticketId} has been registered for transaction investigation. Our compliance team will review within 3 business days.`
        );
        setTimeout(() => {
          setActiveView("GRID");
        }, 1800);
      } else {
        setErrorMsg(data.error || "Failed to file dispute ticket");
      }
    } catch (err: any) {
      setErrorMsg("Failed to register dispute ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            {activeView !== "GRID" && (
              <button
                type="button"
                onClick={() => { setActiveView("GRID"); setErrorMsg(null); setSuccessMsg(null); }}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg bg-surface-high hover:bg-surface-highest transition-colors cursor-pointer"
                title="Back to Services"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <MoreHorizontal size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">
                {activeView === "GRID" && "More Banking Services"}
                {activeView === "NOMINEE_FORM" && "Update Account Nominee"}
                {activeView === "DISPUTE_FORM" && "File Transaction Dispute"}
                {activeView === "KYC_DETAILS" && "KYC Status Verification"}
              </h2>
              <p className="text-xs text-on-surface-variant">Self-service banking requests &amp; document center</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { setActiveView("GRID"); setErrorMsg(null); setSuccessMsg(null); onClose(); }}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-xs font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3 text-tertiary text-xs font-medium">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: Main Services Grid */}
        {activeView === "GRID" && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* 1. Request Cheque Book */}
            <div 
              onClick={handleChequeBookRequest}
              className={`p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-2 group ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform flex items-center gap-2">
                <BookOpen size={20} />
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              </div>
              <span className="font-semibold text-on-surface text-sm">Request Cheque Book</span>
              <p className="text-[11px] text-on-surface-variant">25-leaf personalized cheque book delivered home</p>
            </div>

            {/* 2. Tax Form 16 / 26AS */}
            <div 
              onClick={handleTaxFormDownload}
              className={`p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-2 group ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform flex items-center gap-2">
                <FileCheck size={20} />
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              </div>
              <span className="font-semibold text-on-surface text-sm">Tax Form 16 / 26AS</span>
              <p className="text-[11px] text-on-surface-variant">Download interest certificate for tax filing</p>
            </div>

            {/* 3. KYC Status Check */}
            <div 
              onClick={handleKycStatusCheck}
              className={`p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-2 group ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="p-2 rounded-lg bg-tertiary/10 text-tertiary w-fit group-hover:scale-110 transition-transform flex items-center gap-2">
                <UserCheck size={20} />
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              </div>
              <span className="font-semibold text-on-surface text-sm">KYC Status Check</span>
              <p className="text-[11px] text-on-surface-variant">Verified via CKYC &amp; Aadhaar e-KYC portal</p>
            </div>

            {/* 4. Update Nominee */}
            <div 
              onClick={() => { setActiveView("NOMINEE_FORM"); setErrorMsg(null); setSuccessMsg(null); }}
              className="p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 hover:border-primary/40 cursor-pointer transition-all flex flex-col gap-2 group"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <span className="font-semibold text-on-surface text-sm">Update Nominee</span>
              <p className="text-[11px] text-on-surface-variant">Add or modify account beneficiary nominee</p>
            </div>

            {/* 5. Dispute Transaction */}
            <div 
              onClick={() => { setActiveView("DISPUTE_FORM"); setErrorMsg(null); setSuccessMsg(null); }}
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
        )}

        {/* VIEW 2: KYC Details Badge View */}
        {activeView === "KYC_DETAILS" && kycDetails && (
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
              onClick={() => setActiveView("GRID")}
              className="w-full py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs transition-all cursor-pointer mt-1"
            >
              Back to Services
            </button>
          </div>
        )}

        {/* VIEW 3: Update Nominee Form */}
        {activeView === "NOMINEE_FORM" && (
          <form onSubmit={handleUpdateNomineeSubmit} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-on-surface-variant">Select Account</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-[#191f2f] text-[#dde2f8]">
                    {acc.name} ({acc.maskedNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-on-surface-variant">Nominee Full Name</label>
              <input
                type="text"
                required
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-on-surface-variant">Relationship</label>
                <select
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Spouse" className="bg-[#191f2f] text-[#dde2f8]">Spouse</option>
                  <option value="Son" className="bg-[#191f2f] text-[#dde2f8]">Son</option>
                  <option value="Daughter" className="bg-[#191f2f] text-[#dde2f8]">Daughter</option>
                  <option value="Father" className="bg-[#191f2f] text-[#dde2f8]">Father</option>
                  <option value="Mother" className="bg-[#191f2f] text-[#dde2f8]">Mother</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-on-surface-variant">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={nomineeDob}
                  onChange={(e) => setNomineeDob(e.target.value)}
                  className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setActiveView("GRID")}
                className="px-4 py-2 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary text-on-primary font-medium rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Save Nominee"}
              </button>
            </div>
          </form>
        )}

        {/* VIEW 4: Dispute Transaction Form */}
        {activeView === "DISPUTE_FORM" && (
          <form onSubmit={handleDisputeSubmit} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-on-surface-variant">Transaction Reference / Order ID</label>
              <input
                type="text"
                required
                placeholder="e.g. TXN-1786339224 or order_TNwv3H3QiIyLq8"
                value={disputeTxnId}
                onChange={(e) => setDisputeTxnId(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-on-surface-variant">Dispute Reason</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Unauthorized Online Transaction" className="bg-[#191f2f] text-[#dde2f8]">Unauthorized Online Transaction</option>
                <option value="Duplicate Charge Debited" className="bg-[#191f2f] text-[#dde2f8]">Duplicate Charge Debited</option>
                <option value="Paid via Razorpay but Service Not Delivered" className="bg-[#191f2f] text-[#dde2f8]">Paid via Razorpay but Service Not Delivered</option>
                <option value="Incorrect Amount Debited" className="bg-[#191f2f] text-[#dde2f8]">Incorrect Amount Debited</option>
                <option value="ATM Cash Not Dispensed" className="bg-[#191f2f] text-[#dde2f8]">ATM Cash Not Dispensed</option>
              </select>
            </div>

            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-[11px]">
              Submitting a false dispute is punishable under banking regulations. A dispute ticket will be registered with audit tracking.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setActiveView("GRID")}
                className="px-4 py-2 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-error text-on-error font-medium rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Submit Dispute Ticket"}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        {activeView === "GRID" && (
          <div className="flex justify-end pt-3 border-t border-outline-variant/20">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
