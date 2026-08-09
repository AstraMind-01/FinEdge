"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldAlert, Lock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface SecurityToggleWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  optionKey: string;
  optionTitle: string;
  currentStatus: boolean;
  onConfirmChange: (optionKey: string, newStatus: boolean) => void;
}

const RISK_WARNINGS: Record<string, { warningText: string; impactText: string }> = {
  twoFa: {
    warningText: "Disabling Two-Factor Authentication (2FA) significantly lowers your account defense.",
    impactText: "Unrecognized device logins and high-value transfers will no longer require a 6-digit authenticator TOTP code."
  },
  biometric: {
    warningText: "Disabling Biometric Login removes instant FaceID / TouchID verification.",
    impactText: "You will be required to enter your full account password on every mobile session sign-in."
  },
  loginAlerts: {
    warningText: "Disabling Login Alerts silences real-time fraud monitoring notifications.",
    impactText: "You will not receive instant SMS or email notifications if your account is accessed from a new IP address or location."
  },
  txnNotifications: {
    warningText: "Disabling Transaction Notifications silences instant debit push alerts.",
    impactText: "You will no longer receive push notifications for high-value account debits, wire transfers, or debit card transactions."
  }
};

export default function SecurityToggleWarningModal({
  isOpen,
  onClose,
  optionKey,
  optionTitle,
  currentStatus,
  onConfirmChange
}: SecurityToggleWarningModalProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetStatus = !currentStatus;
  const riskInfo = RISK_WARNINGS[optionKey] || {
    warningText: `Modifying ${optionTitle} changes your account security configuration.`,
    impactText: "Please verify your 4-digit Security PIN to confirm this change."
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (error) setError(null);

    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`sec-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pinStr = pin.join("");
    if (pinStr.length < 4) {
      setError("Please enter all 4 digits of your Security PIN.");
      return;
    }
    if (pinStr !== "1234") {
      setError("Invalid Security PIN code (Demo PIN: 1234).");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmChange(optionKey, targetStatus);
      setIsSubmitting(false);
      setPin(["", "", "", ""]);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-amber-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Security Alert: {optionTitle}</h2>
              <p className="text-xs text-on-surface-variant">
                Changing status from <span className="font-bold text-teal-400">{currentStatus ? "ENABLED" : "DISABLED"}</span> to <span className="font-bold text-amber-400">{targetStatus ? "ENABLED" : "DISABLED"}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Warning Box */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertTriangle size={16} /> Potential Risk Advisory
          </div>
          <p className="text-on-surface font-semibold leading-relaxed">{riskInfo.warningText}</p>
          <p className="text-on-surface-variant text-[11px] leading-relaxed">{riskInfo.impactText}</p>
        </div>

        {/* Form Verification */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant block flex items-center gap-1.5 justify-center">
              <Lock size={14} className="text-primary" /> Enter 4-Digit Security PIN to Confirm
            </label>
            <div className="flex justify-center gap-3 py-1">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`sec-pin-${idx}`}
                  type="password"
                  maxLength={1}
                  autoComplete="one-time-code"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-bold bg-surface border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              ))}
            </div>
            {error && (
              <p className="text-[11px] text-red-400 text-center font-semibold mt-1">{error}</p>
            )}
            <p className="text-[10px] text-on-surface-variant text-center">Default Demo Security PIN: <span className="font-mono font-bold text-primary">1234</span></p>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel &amp; Keep Secured</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 flex items-center gap-1.5 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Confirm Security Change <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
