"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [securityStep, setSecurityStep] = useState<"CREDENTIALS" | "OTP">("CREDENTIALS");
  const [verificationToken, setVerificationToken] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const maskedEmail = userEmail ? userEmail.replace(/(^.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length)) : "da***@gmail.com";

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleInitiatePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Password must include uppercase, lowercase, and numbers.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password confirmation does not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "INITIATE", currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to initiate password change.");
        setIsChangingPassword(false);
        return;
      }

      setVerificationToken(data.verificationToken || "MOCK-TOKEN-SEC");
      setSecurityStep("OTP");
      setCooldown(60);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to initiate verification.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setPasswordError(null);
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESEND_OTP", verificationToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to resend security code.");
      } else {
        setCooldown(60);
      }
    } catch (err: any) {
      setPasswordError("Failed to resend code.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!otp || otp.trim().length !== 6) {
      setPasswordError("Please enter the complete 6-digit security code.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_AND_CHANGE",
          verificationToken,
          otp: otp.trim(),
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Invalid verification code.");
        setIsChangingPassword(false);
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");

      setTimeout(() => {
        setPasswordSuccess(false);
        setSecurityStep("CREDENTIALS");
        onClose();
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred during verification.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-8">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-md rounded-2xl p-6 shadow-2xl my-auto flex flex-col gap-4 text-on-surface">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold">Password & 2FA Security</h3>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} /> Security credentials updated!
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} /> {passwordError}
          </div>
        )}

        {securityStep === "CREDENTIALS" ? (
          <form onSubmit={handleInitiatePasswordChange} className="flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant font-medium">Current Password</label>
              <input 
                type="password" 
                required 
                autoComplete="off"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary font-medium" 
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant font-medium">New Password</label>
              <input 
                type="password" 
                required 
                autoComplete="off"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
                className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary font-medium" 
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant font-medium">Confirm New Password</label>
              <input 
                type="password" 
                required 
                autoComplete="off"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary font-medium" 
              />
            </div>

            <div className="p-3 bg-surface-high/60 border border-outline-variant/10 rounded-xl flex flex-col gap-1.5 text-[11px] text-on-surface-variant my-1">
              <span className="font-semibold text-on-surface mb-0.5">Password Security Rules:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <span className={`flex items-center gap-1 ${newPassword.length >= 8 ? "text-tertiary font-semibold" : ""}`}>• 8+ characters</span>
                <span className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? "text-tertiary font-semibold" : ""}`}>• Uppercase (A-Z)</span>
                <span className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? "text-tertiary font-semibold" : ""}`}>• Lowercase (a-z)</span>
                <span className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? "text-tertiary font-semibold" : ""}`}>• Number (0-9)</span>
                <span className={`flex items-center gap-1 col-span-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-tertiary font-semibold" : ""}`}>• Special char (!@#$%^&*)</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-surface-high rounded-xl font-medium cursor-pointer">Cancel</button>
              <button 
                type="submit" 
                disabled={isChangingPassword}
                className="px-5 py-2 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer flex items-center gap-2"
              >
                {isChangingPassword ? <Loader2 size={14} className="animate-spin" /> : null} Send 2FA Code
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 text-xs">
            <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-medium flex flex-col gap-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={16} /> 2FA Email Code Sent
              </span>
              <span className="text-[11px] text-on-surface-variant">
                We've sent a 6-digit security code to <strong className="text-on-surface font-semibold">{maskedEmail}</strong>. Code expires in 5 minutes.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-on-surface-variant font-semibold text-xs">6-Digit Security Code</label>
              <input 
                type="text" 
                required 
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="bg-surface border border-outline-variant/30 p-3 rounded-xl text-on-surface text-center font-mono text-lg tracking-[8px] focus:outline-none focus:border-primary font-bold" 
              />
            </div>

            <div className="flex justify-between items-center text-xs text-on-surface-variant pt-1">
              <span>Didn't get the code?</span>
              <button 
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || isChangingPassword}
                className="text-primary font-bold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Security Code"}
              </button>
            </div>

            <div className="flex justify-between items-center gap-2 mt-2 pt-3 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => { setSecurityStep("CREDENTIALS"); setPasswordError(null); }} 
                className="px-4 py-2 bg-surface-high rounded-xl font-medium cursor-pointer"
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={isChangingPassword || otp.length !== 6}
                className="px-5 py-2 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
              >
                {isChangingPassword ? <Loader2 size={14} className="animate-spin" /> : null} Verify & Complete Change
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
