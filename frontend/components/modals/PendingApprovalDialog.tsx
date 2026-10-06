"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { CheckCircle2, ShieldAlert, Loader2, FileText, UserCheck, Lock } from "lucide-react";

interface PendingItem {
  id: string;
  type: "BENEFICIARY" | "LOAN" | "HIGH_VALUE_TRANSFER";
  title: string;
  subtitle: string;
  timeAgo: string;
  amount?: number;
}

interface PendingApprovalDialogProps {
  item: PendingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, actionType: "APPROVE_BENEFICIARY" | "APPROVE_LOAN" | "VERIFY_OTP", payload?: any) => Promise<void>;
}

export default function PendingApprovalDialog({ item, isOpen, onClose, onApprove }: PendingApprovalDialogProps) {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleExecuteAction = async () => {
    setIsSubmitting(true);
    try {
      if (item.type === "BENEFICIARY") {
        await onApprove(item.id, "APPROVE_BENEFICIARY");
        setSuccessMsg(`Beneficiary "${item.subtitle}" approved & added!`);
      } else if (item.type === "LOAN") {
        await onApprove(item.id, "APPROVE_LOAN", { amount: item.amount || 500000 });
        setSuccessMsg(`Loan of ₹${(item.amount || 500000).toLocaleString('en-IN')} approved & funds credited!`);
      } else if (item.type === "HIGH_VALUE_TRANSFER") {
        if (otp.length < 6) {
          setIsSubmitting(false);
          return;
        }
        await onApprove(item.id, "VERIFY_OTP", { amount: item.amount || 250000 });
        setSuccessMsg(`High value RTGS transfer of ₹${(item.amount || 250000).toLocaleString('en-IN')} authorized & sent!`);
      }
      setTimeout(() => {
        setSuccessMsg(null);
        setOtp("");
        onClose();
      }, 1800);
    } catch (e) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-container border border-outline-variant/20 rounded-2xl max-w-md p-6 text-on-surface">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              {item.type === "BENEFICIARY" ? <UserCheck size={22} /> : item.type === "LOAN" ? <FileText size={22} /> : <ShieldAlert size={22} />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">{item.title}</DialogTitle>
              <DialogDescription className="text-xs text-on-surface-variant">
                Authorization required to complete action
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successMsg ? (
          <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3 text-tertiary text-xs font-medium my-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-2 text-xs">
            <div className="bg-surface-high/60 p-4 rounded-xl border border-outline-variant/10 flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-variant uppercase font-medium">Details</span>
              <p className="font-semibold text-sm text-on-surface">{item.subtitle}</p>
              <span className="text-[10px] text-on-surface-variant mt-1">Initiated: {item.timeAgo}</span>
            </div>

            {item.type === "HIGH_VALUE_TRANSFER" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant text-center">Enter 6-Digit SMS OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="654321"
                  className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-xl font-mono font-bold tracking-[0.4em] focus:outline-none focus:border-primary text-on-surface"
                />
                <span className="text-[11px] text-on-surface-variant text-center">Demo OTP: 654321</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-outline-variant/10">
          <Button
            type="button"
            onClick={onClose}
            className="bg-surface-high hover:bg-surface-highest text-on-surface border-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExecuteAction}
            disabled={isSubmitting || (item.type === "HIGH_VALUE_TRANSFER" && otp.length < 6)}
            className="bg-primary text-on-primary font-medium hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1.5" /> Processing...
              </>
            ) : item.type === "HIGH_VALUE_TRANSFER" ? (
              "Verify OTP & Send"
            ) : item.type === "LOAN" ? (
              "Approve & Credit Loan"
            ) : (
              "Approve Beneficiary"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
