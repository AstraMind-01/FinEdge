"use client";

import React, { useState } from "react";
import { X, MoreHorizontal, BookOpen, FileCheck, UserCheck, Users, ShieldAlert, CheckCircle2, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";
import { TaxForm16PdfBuilder } from "../../lib/pdf/documents/TaxForm16Pdf";
import NomineeFormView from "./moreActions/NomineeFormView";
import DisputeFormView from "./moreActions/DisputeFormView";
import KycDetailsView from "./moreActions/KycDetailsView";

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

      if (data.success && data.kyc) {
        setKycDetails(data.kyc);
        setActiveView("KYC_DETAILS");
      } else {
        setErrorMsg("Failed to retrieve KYC records.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to check KYC status with backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNomineeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/banking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_NOMINEE",
          nomineeName,
          nomineeRelation,
          nomineeDob,
          accountId: selectedAccountId || accounts[0]?.id || "ACC-001"
        })
      });
      const data = await res.json();

      if (data.success) {
        updateUserProfile({
          nominee: nomineeName,
          nomineeRelation: nomineeRelation
        });

        setSuccessMsg(data.message);
        addNotification("Nominee Updated", `${nomineeName} (${nomineeRelation}) added as registered nominee.`, "SECURITY");
        addInboxMessage(
          "Nominee Registration",
          `Nominee Modification Confirmation: ${data.referenceId}`,
          `Nominee details for account ${selectedAccountId || accounts[0]?.id} have been updated to ${nomineeName} (${nomineeRelation}, DOB: ${nomineeDob}). Reference: ${data.referenceId}.`
        );
        setTimeout(() => setActiveView("GRID"), 1500);
      } else {
        setErrorMsg(data.error || "Failed to update nominee");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to banking service backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/banking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISPUTE_TRANSACTION",
          transactionId: disputeTxnId,
          reason: disputeReason
        })
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`Dispute ticket ${data.disputeTicket.id} registered! Resolution ETA: ${data.disputeTicket.estimatedResolution}`);
        addNotification("Dispute Ticket Registered", `Ticket: ${data.disputeTicket.id}. Our fraud team will review within 24-48 hrs.`, "SECURITY");
        addInboxMessage(
          "Dispute Operations",
          `Dispute Confirmation: Ticket ${data.disputeTicket.id}`,
          `Your dispute for transaction ${disputeTxnId} ("${disputeReason}") has been assigned ticket ID ${data.disputeTicket.id}. Our investigation team will respond within 48 hours.`
        );
        setDisputeTxnId("");
        setTimeout(() => setActiveView("GRID"), 2500);
      } else {
        setErrorMsg(data.error || "Failed to submit dispute");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to dispute grievance desk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 overflow-y-auto py-8">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            {activeView !== "GRID" && (
              <button
                onClick={() => { setActiveView("GRID"); setErrorMsg(null); setSuccessMsg(null); }}
                className="p-1 rounded-lg hover:bg-surface-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <MoreHorizontal className="text-primary w-5 h-5" />
            <h3 className="text-base font-bold text-on-surface m-0">
              {activeView === "GRID" && "Banking Services & Actions"}
              {activeView === "NOMINEE_FORM" && "Update Account Nominee"}
              {activeView === "DISPUTE_FORM" && "Dispute Transaction"}
              {activeView === "KYC_DETAILS" && "CKYC & Aadhaar Verification Status"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

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

        {activeView === "GRID" && (
          <div className="grid grid-cols-2 gap-3 text-xs">
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

        {activeView === "KYC_DETAILS" && kycDetails && (
          <KycDetailsView kycDetails={kycDetails} onBack={() => setActiveView("GRID")} />
        )}

        {activeView === "NOMINEE_FORM" && (
          <NomineeFormView
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            nomineeName={nomineeName}
            setNomineeName={setNomineeName}
            nomineeRelation={nomineeRelation}
            setNomineeRelation={setNomineeRelation}
            nomineeDob={nomineeDob}
            setNomineeDob={setNomineeDob}
            isSubmitting={isSubmitting}
            onSubmit={handleUpdateNomineeSubmit}
            onCancel={() => setActiveView("GRID")}
          />
        )}

        {activeView === "DISPUTE_FORM" && (
          <DisputeFormView
            disputeTxnId={disputeTxnId}
            setDisputeTxnId={setDisputeTxnId}
            disputeReason={disputeReason}
            setDisputeReason={setDisputeReason}
            isSubmitting={isSubmitting}
            onSubmit={handleDisputeSubmit}
            onCancel={() => setActiveView("GRID")}
            onCloseParent={onClose}
          />
        )}

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
