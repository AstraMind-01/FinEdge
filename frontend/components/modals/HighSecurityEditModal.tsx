"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Lock, Smartphone, Mail, CheckCircle2, Loader2, FileDiff, AlertCircle } from "lucide-react";

interface FieldChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

interface HighSecurityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: FieldChange[];
  onConfirmSave: () => void;
}

export default function HighSecurityEditModal({
  isOpen,
  onClose,
  changes,
  onConfirmSave
}: HighSecurityEditModalProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"DIFF" | "AUTH">("DIFF");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setOtp(["", "", "", "", "", ""]);
      setStep("DIFF");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (error) setError(null);

    if (value && index < 3) {
      document.getElementById(`hs-pin-${index + 1}`)?.focus();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (error) setError(null);

    if (value && index < 5) {
      document.getElementById(`hs-otp-${index + 1}`)?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    setOtp(["8", "8", "4", "9", "1", "2"]);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pinStr = pin.join("");
    const otpStr = otp.join("");

    if (pinStr.length < 4) {
      setError("Please enter all 4 digits of your Security PIN.");
      return;
    }
    if (pinStr !== "1234") {
      setError("Invalid Security PIN code (Demo PIN: 1234).");
      return;
    }

    if (otpStr.length < 6) {
      setError("Please enter the 6-digit SMS / Email OTP.");
      return;
    }
    if (otpStr !== "884912") {
      setError("Invalid OTP code (Demo OTP: 884912).");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmSave();
      setIsSubmitting(false);
      setPin(["", "", "", ""]);
      setOtp(["", "", "", "", "", ""]);
      setStep("DIFF");
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-teal-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">High-Security 2FA Verification</h2>
              <p className="text-xs text-on-surface-variant">Confirm Confidential Profile Changes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: AUDIT DIFF SUMMARY */}
        {step === "DIFF" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-on-surface flex items-center gap-1.5">
                <FileDiff size={16} className="text-primary" /> Proposed Modifications ({changes.length})
              </span>
              <span className="text-[10px] text-teal-400 font-mono font-bold bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 rounded">
                2FA Challenge Required
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 border border-white/10 rounded-xl p-3 bg-surface">
              {changes.map((c, idx) => (
                <div key={idx} className="p-2 bg-surface-container-high rounded-lg flex flex-col gap-1 border border-white/5 font-mono">
                  <span className="text-[11px] font-bold text-primary">{c.fieldName}</span>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-red-400 line-through">Old: {c.oldValue || "(empty)"}</span>
                    <span className="text-teal-400 font-bold">New: {c.newValue}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
              <button 
                type="button" 
                onClick={() => setStep("AUTH")}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
              >
                Proceed to 2FA Authentication →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MULTI-FACTOR AUTHENTICATION */}
        {step === "AUTH" && (
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* PIN Challenge */}
            <div className="space-y-2 p-3 bg-surface rounded-xl border border-white/5">
              <label className="font-semibold text-on-surface block flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Lock size={14} className="text-primary" /> Step 1: 4-Digit Security PIN</span>
                <span className="text-[10px] text-on-surface-variant font-mono">Demo PIN: <strong className="text-primary">1234</strong></span>
              </label>
              <div className="flex justify-center gap-3">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`hs-pin-${idx}`}
                    type="password"
                    maxLength={1}
                    autoComplete="one-time-code"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    className="w-10 h-10 text-center text-lg font-bold bg-surface-container-high border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-teal-400"
                  />
                ))}
              </div>
            </div>

            {/* OTP Challenge */}
            <div className="space-y-2 p-3 bg-surface rounded-xl border border-white/5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-on-surface flex items-center gap-1.5">
                  <Smartphone size={14} className="text-teal-400" /> Step 2: 6-Digit SMS / Email OTP
                </label>
                <button 
                  type="button" 
                  onClick={handleAutoFillOtp}
                  className="text-[10px] text-primary hover:underline font-bold"
                >
                  Auto-fill OTP (884912)
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant">Sent to registered mobile +91 98765 43210 &amp; soumya@finedge.bank</p>
              <div className="flex justify-center gap-2 pt-1">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`hs-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    autoComplete="one-time-code"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-9 h-9 text-center text-lg font-bold bg-surface-container-high border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-teal-400"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <button type="button" onClick={() => setStep("DIFF")} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Back</button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-400 text-black font-bold rounded-xl text-xs hover:bg-teal-300 flex items-center gap-1.5 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying &amp; Saving...
                  </>
                ) : (
                  <>
                    Verify &amp; Save Changes <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
