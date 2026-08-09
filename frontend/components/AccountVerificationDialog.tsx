"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { useAccounts } from "../context/AccountContext";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  accountId: string | null;
  onClose: () => void;
}

export default function AccountVerificationDialog({ accountId, onClose }: Props) {
  const { accounts, verificationStates, verifyAccount } = useAccounts();
  const account = accounts.find(a => a.id === accountId);
  const state = accountId ? verificationStates[accountId] : "NOT_VERIFIED";
  const [mpin, setMpin] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountId) {
      const success = await verifyAccount(accountId);
      if (success) {
        setTimeout(() => {
          setMpin("");
          onClose();
        }, 1200);
      }
    }
  };

  if (!account) return null;

  return (
    <Dialog open={!!accountId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-surface-container border border-outline-variant/20 rounded-2xl max-w-md p-6 text-on-surface">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Security Balance Access</DialogTitle>
              <DialogDescription className="text-xs text-on-surface-variant">
                Enter your 4-Digit MPIN to view balance for {account.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleVerify} className="flex flex-col gap-4 py-2">
          <div className="bg-surface-high/60 p-4 rounded-xl flex items-center justify-between border border-outline-variant/10">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-medium">Account</span>
              <p className="font-semibold text-sm mt-0.5">{account.name}</p>
            </div>
            <span className="font-mono text-on-surface-variant text-sm font-semibold">{account.maskedNumber}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant text-center">Enter 4-Digit MPIN</label>
            <input
              type="password"
              maxLength={4}
              value={mpin}
              onChange={(e) => setMpin(e.target.value)}
              placeholder="••••"
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-xl font-mono font-bold tracking-[0.3em] focus:outline-none focus:border-primary text-on-surface"
            />
            <span className="text-[11px] text-on-surface-variant text-center">Demo MPIN: Any 4 digits (e.g. 1234)</span>
          </div>

          <div className="text-center text-xs">
            {state === "VERIFYING" && (
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center gap-2 font-medium">
                <Lock size={16} className="animate-spin" />
                <span>Authenticating 2FA Security Token...</span>
              </div>
            )}
            {state === "VERIFIED" && (
              <div className="p-2.5 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center gap-2 font-medium">
                <CheckCircle2 size={16} />
                <span>Access Granted! Unmasking account balance...</span>
              </div>
            )}
            {state === "FAILED" && (
              <div className="p-2.5 bg-error/10 text-error rounded-xl flex items-center justify-center gap-2 font-medium">
                <AlertCircle size={16} />
                <span>Security verification failed. Please try again.</span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-outline-variant/10">
            <Button
              type="button"
              onClick={onClose}
              className="bg-surface-high hover:bg-surface-highest text-on-surface border-none"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary text-on-primary font-medium hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all"
              disabled={state === "VERIFYING" || state === "VERIFIED" || mpin.length < 4}
            >
              {state === "VERIFYING" ? "Verifying..." : state === "VERIFIED" ? "Verified" : "Authorize & View"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
