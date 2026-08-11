"use client";

import React, { useState, useEffect } from "react";
import { X, KeyRound, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Mail } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"REQUEST" | "RESET">("REQUEST");
  const [customerId, setCustomerId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId.trim()) {
      setError("Please enter your Customer ID or email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REQUEST_OTP", customerId: customerId.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process password reset request.");
        return;
      }

      setVerificationToken(data.verificationToken);
      setStep("RESET");
      setCooldown(60);
      setSuccessMsg("If your account exists, a 6-digit security code has been sent to your registered email.");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit security code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter (A-Z).");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter (a-z).");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number (0-9).");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError("Password must contain at least one special character (!@#$%^&*).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_PASSWORD",
          verificationToken,
          otp: otp.trim(),
          newPassword,
          customerId: customerId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setSuccessMsg("Password reset successfully! You can now log in with your new password.");
      setTimeout(() => {
        onClose();
        setStep("REQUEST");
        setCustomerId("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccessMsg(null);
      }, 2200);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8 overflow-y-auto">
      <div className="bg-[#131b2e] border border-[#2f3445] w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-white my-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#2f3445] pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="text-[#ffd481]" size={20} />
            <h3 className="text-lg font-bold tracking-tight">Forgot Password</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-3 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-xl text-[#2DD4BF] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#ffb4ab] text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "REQUEST" ? (
          <form onSubmit={handleRequestResetOtp} className="flex flex-col gap-4 text-xs">
            <p className="text-sm text-[#d4c5ad] leading-relaxed m-0">
              Enter your registered Customer ID or Email address. We will send a 6-digit verification code to reset your password.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#d4c5ad] font-semibold uppercase tracking-wider">Customer ID / Email</label>
              <input
                type="text"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Enter Customer ID or email"
                className="bg-[#141B2D] border border-[#2f3445] p-3 rounded-xl text-white outline-none focus:border-[#f0b429]/60 font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#2f3445]">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2.5 bg-[#1f293d] hover:bg-[#2c374e] rounded-xl font-medium cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !customerId.trim()}
                className="px-5 py-2.5 bg-[#f0b429] text-[#261900] font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 text-xs"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Send Security Code
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-[#1e293b] border border-[#334155] rounded-xl text-xs flex flex-col gap-1 text-[#cbd5e1]">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#f0b429]" /> Security Code Dispatched
              </span>
              <span className="text-[11px] text-[#94a3b8]">
                Enter the 6-digit code sent to your email to verify your identity and set a new password.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#d4c5ad] font-semibold uppercase tracking-wider">6-Digit Security Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="bg-[#141B2D] border border-[#2f3445] p-3 rounded-xl text-white text-center font-mono text-lg tracking-[8px] outline-none focus:border-[#f0b429]/60 font-bold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#d4c5ad] font-semibold uppercase tracking-wider">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
                className="bg-[#141B2D] border border-[#2f3445] p-3 rounded-xl text-white outline-none focus:border-[#f0b429]/60 font-mono text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#d4c5ad] font-semibold uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="bg-[#141B2D] border border-[#2f3445] p-3 rounded-xl text-white outline-none focus:border-[#f0b429]/60 font-mono text-sm"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#2f3445]">
              <button
                type="button"
                onClick={() => { setStep("REQUEST"); setError(null); }}
                className="px-4 py-2.5 bg-[#1f293d] hover:bg-[#2c374e] rounded-xl font-medium cursor-pointer text-xs"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="px-5 py-2.5 bg-[#f0b429] text-[#261900] font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 text-xs"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null} Reset Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
