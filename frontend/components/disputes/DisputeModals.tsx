"use client";

import React from "react";
import {
  Gavel,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  ShieldAlert,
  Filter,
  Calendar,
} from "lucide-react";

interface RaiseDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  txnId: string;
  setTxnId: (val: string) => void;
  reason: string;
  setReason: (val: string) => void;
  isSubmitting: boolean;
  successMsg: string | null;
}

export function RaiseDisputeModal({
  isOpen,
  onClose,
  onSubmit,
  txnId,
  setTxnId,
  reason,
  setReason,
  isSubmitting,
  successMsg,
}: RaiseDisputeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <XCircle size={20} />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/10">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Gavel size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface m-0">Raise Transaction Dispute</h3>
            <p className="text-xs text-on-surface-variant m-0">File a claim for unauthorized or failed charges</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-on-surface-variant uppercase tracking-wider text-[10px]">
              Transaction ID / Reference Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TXN-948201 or Razorpay Pay ID"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-on-surface-variant uppercase tracking-wider text-[10px]">
              Dispute Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
            >
              <option value="Unauthorized Online Transaction">Unauthorized Online Transaction</option>
              <option value="Double Charged / Duplicate Debit">Double Charged / Duplicate Debit</option>
              <option value="Merchant Amount Mismatch">Merchant Amount Mismatch</option>
              <option value="Failed ATM Cash Withdrawal">Failed ATM Cash Withdrawal</option>
              <option value="Services/Goods Not Received">Services/Goods Not Received</option>
            </select>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] rounded-xl flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>Dispute claims are subject to banking audit compliance. A formal ticket ID will be assigned upon submission.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-fixed-dim transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : "Submit Dispute Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface BlockCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BlockCardModal({ isOpen, onClose, onConfirm }: BlockCardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container border border-error/30 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in duration-200">
        <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center">
          <AlertTriangle size={24} fill="currentColor" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-on-surface m-0">Confirm Instant Card Block</h3>
          <p className="text-xs text-on-surface-variant mt-1 m-0">
            This will immediately freeze your active debit/credit card to prevent unauthorized charges.
          </p>
        </div>

        <div className="p-3 bg-surface-container-high rounded-xl text-xs flex flex-col gap-1 text-on-surface">
          <p className="m-0 font-medium">Card Number: <span className="font-mono text-primary">•••• •••• •••• 4920</span></p>
          <p className="m-0 font-medium">Status: <span className="text-emerald-400">ACTIVE</span> &rarr; <span className="text-error font-bold">FROZEN</span></p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-error text-on-error font-bold text-xs hover:bg-error/90 transition-all shadow-md cursor-pointer"
          >
            Confirm Card Freeze
          </button>
        </div>
      </div>
    </div>
  );
}

interface DisputeDetailsModalProps {
  isOpen: boolean;
  dispute: any | null;
  onClose: () => void;
}

export function DisputeDetailsModal({ isOpen, dispute, onClose }: DisputeDetailsModalProps) {
  if (!isOpen || !dispute) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <XCircle size={20} />
        </button>

        <div className="flex items-start justify-between border-b border-outline-variant/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Gavel size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface m-0">{dispute.title}</h3>
              <p className="text-xs text-on-surface-variant font-mono mt-0.5 m-0">Ticket ID: {dispute.id}</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {dispute.status}
          </div>
        </div>

        {/* Security Audit Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface-container-high p-4 rounded-xl text-xs">
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold m-0">Amount</p>
            <p className="font-bold text-on-surface text-sm m-0">{dispute.amount}</p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold m-0">Raised On</p>
            <p className="font-medium text-on-surface m-0">{dispute.raisedAt}</p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold m-0">Security SLA</p>
            <p className="font-medium text-emerald-400 m-0">RBI Cyber Compliance</p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold m-0">Proof Token</p>
            <p className="font-mono text-[10px] text-primary truncate m-0">FE-PROOF-828FB4</p>
          </div>
        </div>

        {/* Security Audit Log */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider m-0 flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-primary" />
            Security Investigation Log
          </h4>
          <div className="bg-background/80 border border-outline-variant/20 rounded-xl p-4 text-xs font-mono flex flex-col gap-2">
            <div className="flex justify-between text-on-surface-variant">
              <span>Audit Trace ID:</span>
              <span className="text-on-surface">AUD-2026-981042</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Target Merchant:</span>
              <span className="text-on-surface">{dispute.merchant || "Online Merchant"}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>IP Address / Tunnel:</span>
              <span className="text-on-surface">192.168.1.104 (TLS 1.3 Encrypted)</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Verification Status:</span>
              <span className="text-emerald-400 font-semibold">Salted SHA-256 Verified</span>
            </div>
          </div>
        </div>

        {/* Status Note or Resolution */}
        {dispute.resolution && (
          <div className="p-4 bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 rounded-xl text-xs text-on-surface flex items-start gap-2">
            <CheckCircle2 size={16} className="text-[#2DD4BF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#2DD4BF]">Resolution Details:</strong>
              <p className="m-0 mt-0.5 text-on-surface-variant">{dispute.resolution}</p>
            </div>
          </div>
        )}

        {dispute.reason && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-xs text-on-surface flex items-start gap-2">
            <Info size={16} className="text-error shrink-0 mt-0.5" />
            <div>
              <strong className="text-error">Audit Finding:</strong>
              <p className="m-0 mt-0.5 text-on-surface-variant">{dispute.reason}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-fixed-dim transition-all cursor-pointer shadow-md"
          >
            Close Investigation Summary
          </button>
        </div>
      </div>
    </div>
  );
}

interface DisputeFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVal: string;
  onSelect: (val: string) => void;
}

export function DisputeTypeFilterModal({ isOpen, onClose, selectedVal, onSelect }: DisputeFilterModalProps) {
  if (!isOpen) return null;

  const options = [
    { label: "All Types", val: "ALL" },
    { label: "Unauthorized Transaction", val: "Unauthorized" },
    { label: "Failed Transfer", val: "Failed" },
    { label: "Wrong Amount Debited", val: "Wrong Amount" },
    { label: "Card Fraud", val: "Card Fraud" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
          <h3 className="text-base font-bold text-on-surface m-0 flex items-center gap-2">
            <Filter size={18} className="text-primary" />
            Filter by Dispute Type
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <XCircle size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <button
              key={opt.val}
              onClick={() => {
                onSelect(opt.val);
                onClose();
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                selectedVal === opt.val
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-highest"
              }`}
            >
              <span>{opt.label}</span>
              {selectedVal === opt.val && <CheckCircle2 size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DisputeDateFilterModal({ isOpen, onClose, selectedVal, onSelect }: DisputeFilterModalProps) {
  if (!isOpen) return null;

  const options = [
    { label: "All Time", val: "ALL" },
    { label: "Last 7 Days", val: "LAST_7" },
    { label: "Last 30 Days", val: "LAST_30" },
    { label: "Year 2026", val: "2026" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
          <h3 className="text-base font-bold text-on-surface m-0 flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Filter by Date Range
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <XCircle size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <button
              key={opt.val}
              onClick={() => {
                onSelect(opt.val);
                onClose();
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                selectedVal === opt.val
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-highest"
              }`}
            >
              <span>{opt.label}</span>
              {selectedVal === opt.val && <CheckCircle2 size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
