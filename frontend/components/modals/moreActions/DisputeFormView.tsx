"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface DisputeFormViewProps {
  disputeTxnId: string;
  setDisputeTxnId: (id: string) => void;
  disputeReason: string;
  setDisputeReason: (reason: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onCloseParent: () => void;
}

export default function DisputeFormView({
  disputeTxnId,
  setDisputeTxnId,
  disputeReason,
  setDisputeReason,
  isSubmitting,
  onSubmit,
  onCancel,
  onCloseParent
}: DisputeFormViewProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
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
        <Link
          href="/disputes"
          onClick={onCloseParent}
          className="px-4 py-2 bg-surface-container-high text-primary hover:underline font-medium rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
        >
          View Disputes Dashboard
        </Link>
        <button
          type="button"
          onClick={onCancel}
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
  );
}
