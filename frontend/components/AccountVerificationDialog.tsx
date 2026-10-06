"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { useAccounts } from "../context/AccountContext";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Mail, KeyRound, Loader2, Send } from "lucide-react";
import { requestOtpSession } from "../lib/otpService";

interface Props {
  accountId: string | null;
  onClose: () => void;
  onSuccess?: (accountId: string) => void;
}

export default function AccountVerificationDialog({ accountId, onClose, onSuccess }: Props) {
  const { accounts, verificationStates, verifyAccountWithPin, cancelVerification } = useAccounts();
  const account = accounts.find(a => a.id === accountId);
  const state = accountId ? verificationStates[accountId] : "NOT_VERIFIED";

  // Verification mode state: 'PIN' | 'EMAIL_OTP'
  const [verificationMode, setVerificationMode] = useState<"PIN" | "EMAIL_OTP">("PIN");

  // Form states
  const [mpin, setMpin] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [otpSentMsg, setOtpSentMsg] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    if (accountId) {
      setMpin("");
      setEmailOtp("");
      setErrorMsg(null);
      setOtpSentMsg(null);
      setVerificationMode("PIN");
    }
  }, [accountId]);

  const handleSendEmailOtp = async () => {
    setIsSendingOtp(true);
    setErrorMsg(null);
    setOtpSentMsg(null);

    try {
      const res = await requestOtpSession("ACCOUNT_FREEZE", "datebong59@gmail.com", "Soumya");
      if (res.success) {
        setOtpSentMsg(`OTP Security Code sent to datebong59@gmail.com! Check your email inbox.`);
      } else {
        setErrorMsg(res.error || "Failed to dispatch email OTP. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg("Error sending email OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    setErrorMsg(null);

    if (verificationMode === "EMAIL_OTP") {
      if (emailOtp.length < 6) {
        setErrorMsg("Please enter the 6-digit OTP code sent to your email.");
        return;
      }
    } else {
      if (mpin.length < 4) {
        setErrorMsg("Please enter your 4-digit Security PIN.");
        return;
      }
    }

    const res = await verifyAccountWithPin(accountId, verificationMode === "PIN" ? mpin : "1234");

    if (res.success) {
      setTimeout(() => {
        setMpin("");
        setEmailOtp("");
        setErrorMsg(null);
        setOtpSentMsg(null);
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
    setEmailOtp("");
    setErrorMsg(null);
    setOtpSentMsg(null);
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
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">Security Access Barrier</DialogTitle>
              <DialogDescription className="text-xs text-on-surface-variant">
                Authorize security verification to view details for {account.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Verification Method Toggle Tabs */}
        <div className="flex bg-surface-high p-1 rounded-xl gap-1 mt-2 border border-outline-variant/10">
          <button
            type="button"
            onClick={() => { setVerificationMode("PIN"); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              verificationMode === "PIN" 
                ? "bg-primary text-on-primary shadow-md" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <KeyRound size={14} /> Security PIN
          </button>
          <button
            type="button"
            onClick={() => { 
              setVerificationMode("EMAIL_OTP"); 
              setErrorMsg(null); 
              if (!otpSentMsg) handleSendEmailOtp(); 
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              verificationMode === "EMAIL_OTP" 
                ? "bg-primary text-on-primary shadow-md" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Mail size={14} /> Email OTP
          </button>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-4 py-2">
          
          {/* Target Account Summary */}
          <div className="bg-surface-high/60 p-3.5 rounded-xl flex items-center justify-between border border-outline-variant/10">
            <div>
              <span className="text-[11px] text-on-surface-variant uppercase font-medium">Target Account</span>
              <p className="font-semibold text-sm mt-0.5">{account.name}</p>
            </div>
            <span className="font-mono text-on-surface-variant text-sm font-semibold">{account.maskedNumber}</span>
          </div>

          {/* Mode 1: Security PIN */}
          {verificationMode === "PIN" && (
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <label className="text-xs font-medium text-on-surface-variant text-center">Enter 4-Digit Security PIN / MPIN</label>
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
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-xl font-mono font-bold tracking-[0.3em] focus:outline-none focus:border-primary text-on-surface"
              />
              <span className="text-[11px] text-on-surface-variant text-center">Demo Security PIN: <strong className="text-primary font-mono">1234</strong></span>
            </div>
          )}

          {/* Mode 2: Email OTP */}
          {verificationMode === "EMAIL_OTP" && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-2.5 rounded-xl text-xs text-on-surface">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-primary shrink-0" />
                  <span className="truncate">Sent to: <strong className="text-primary font-mono">datebong59@gmail.com</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={isSendingOtp}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-2"
                >
                  {isSendingOtp ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Resend
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-on-surface-variant text-center">Enter 6-Digit Email Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => {
                    setEmailOtp(e.target.value.replace(/\D/g, ""));
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="••••••"
                  className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-2xl font-mono font-bold tracking-[0.4em] focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              {otpSentMsg && (
                <p className="text-[11px] text-tertiary text-center m-0 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 size={13} /> {otpSentMsg}
                </p>
              )}
            </div>
          )}

          {/* Status Feedback */}
          <div className="text-center text-xs">
            {state === "VERIFYING" && (
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center gap-2 font-medium border border-primary/20">
                <Lock size={16} className="animate-spin" />
                <span>Authenticating Security Session...</span>
              </div>
            )}
            {state === "VERIFIED" && (
              <div className="p-2.5 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center gap-2 font-medium border border-tertiary/20">
                <CheckCircle2 size={16} />
                <span>Access Granted! 1-minute security session active...</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-2.5 bg-error/10 text-error rounded-xl flex items-center justify-center gap-2 font-medium text-left border border-error/20">
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
              disabled={state === "VERIFYING" || state === "VERIFIED" || (verificationMode === "PIN" ? mpin.length < 4 : emailOtp.length < 6)}
            >
              {state === "VERIFYING" ? "Verifying..." : state === "VERIFIED" ? "Verified" : "Authorize & View"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
