"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { useAccounts } from "../context/AccountContext";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  accountId: string | null;
  onClose: () => void;
  onSuccess?: (accountId: string) => void;
}

export default function AccountVerificationDialog({ accountId, onClose, onSuccess }: Props) {
  const { accounts, verificationStates, verifyAccountWithPin, cancelVerification } = useAccounts();
  const account = accounts.find(a => a.id === accountId);
  const state = accountId ? verificationStates[accountId] : "NOT_VERIFIED";

  const [mpin, setMpin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (accountId) {
      setMpin("");
      setErrorMsg(null);
    }
  }, [accountId]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    setErrorMsg(null);
    const res = await verifyAccountWithPin(accountId, mpin);

    if (res.success) {
      setTimeout(() => {
        setMpin("");
        setErrorMsg(null);
        const targetId = accountId;
        onClose();
        if (onSuccess) {
          onSuccess(targetId);
        }
      }, 1000);
    } else {
      setErrorMsg(res.error || "Security verification failed. Please try again.");
    }
  };

  const handleClose = () => {
    setMpin("");
    setErrorMsg(null);
    if (accountId) {
      cancelVerification(accountId);
    } else {
      cancelVerification(undefined);
    }
    onClose();
  };

  if (!account) return null;

  return (
    <Dialog open={!!accountId} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-surface-container border border-outline-variant/20 rounded-2xl max-w-md p-6 text-on-surface">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Security Access Barrier</DialogTitle>
              <DialogDescription className="text-xs text-on-surface-variant">
                Enter your 4-Digit Security PIN / MPIN to access details for {account.name}
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
            <label className="text-xs font-medium text-on-surface-variant text-center">Enter 4-Digit Transaction / Security PIN</label>
            <input
              type="password"
              maxLength={4}
              value={mpin}
              onChange={(e) => {
                setMpin(e.target.value.replace(/\D/g, ""));
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="••••"
              autoComplete="one-time-code"
              data-lpignore="true"
              data-1p-ignore="true"
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-xl font-mono font-bold tracking-[0.3em] focus:outline-none focus:border-primary text-on-surface"
            />
            <span className="text-[11px] text-on-surface-variant text-center">Demo PIN: <strong className="text-primary font-mono">1234</strong></span>
          </div>

          <div className="text-center text-xs">
            {state === "VERIFYING" && (
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center gap-2 font-medium">
                <Lock size={16} className="animate-spin" />
                <span>Authenticating Security Session Token...</span>
              </div>
            )}
            {state === "VERIFIED" && (
              <div className="p-2.5 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center gap-2 font-medium">
                <CheckCircle2 size={16} />
                <span>Access Granted! 5-minute security session active...</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-2.5 bg-error/10 text-error rounded-xl flex items-center justify-center gap-2 font-medium text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-outline-variant/10">
            <Button
              type="button"
              onClick={handleClose}
              className="bg-surface-high hover:bg-surface-highest text-on-surface border-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-primary text-on-primary font-medium hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer"
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
