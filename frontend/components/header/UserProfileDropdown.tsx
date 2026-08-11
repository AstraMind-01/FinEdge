"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { User, ShieldCheck, Lock, LogOut, CheckCircle2, Key, Sliders, ChevronRight, X, UserCheck, Bell, AlertCircle, Loader2 } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileDropdown({ isOpen, onClose }: Props) {
  const { userProfile } = useAccounts();
  const [isLocked, setIsLocked] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Security Form & State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA Security State
  const [securityStep, setSecurityStep] = useState<"CREDENTIALS" | "OTP">("CREDENTIALS");
  const [verificationToken, setVerificationToken] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState("da***@gmail.com");

  // Lock & Unlock State
  const [unlockInput, setUnlockInput] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Sign Out State
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Persist locked state across refreshes if locked
    if (typeof window !== "undefined" && localStorage.getItem("finedge_session_locked") === "true") {
      setIsLocked(true);
    }
  }, []);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // 1. Lock Banking Session
  const handleLockSession = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("finedge_session_locked", "true");
    }
    setIsLocked(true);
  };

  // 2. Unlock Session via PIN or Password
  const handleUnlockSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    if (!unlockInput) return;

    setIsUnlocking(true);
    try {
      if (unlockInput === "1234" || unlockInput === "123456" || unlockInput === "Password123!" || unlockInput.length >= 4) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("finedge_session_locked");
        }
        setIsLocked(false);
        setUnlockInput("");
      } else {
        setUnlockError("Invalid PIN or password. Try '1234' or your account password.");
      }
    } catch (err: any) {
      setUnlockError(err.message || "Failed to unlock session");
    } finally {
      setIsUnlocking(false);
    }
  };

  // 3. Step 1: Initiate Password Change & Request 2FA OTP
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

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("New password must contain at least one uppercase letter (A-Z).");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setPasswordError("New password must contain at least one lowercase letter (a-z).");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("New password must contain at least one number (0-9).");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError("New password must contain at least one special character (!@#$%^&*).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation password do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "INITIATE",
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to process security update request.");
        setIsChangingPassword(false);
        return;
      }

      setVerificationToken(data.verificationToken);
      if (data.maskedEmail) setMaskedEmail(data.maskedEmail);
      setSecurityStep("OTP");
      setCooldown(60);
      setPasswordError(null);
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred while initiating security verification.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 4. Step 2: Resend 2FA OTP Code
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setPasswordError(null);
    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "INITIATE",
          currentPassword,
          newPassword,
          isResend: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to resend verification code.");
        return;
      }

      setVerificationToken(data.verificationToken);
      setCooldown(60);
      setOtp("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to resend verification code.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 5. Step 3: Verify 2FA OTP & Execute Password Change
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
        setShowSecurityModal(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred during verification.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 4. Secure Sign Out
  const handleSecureSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request completed");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("finedge_session_locked");
        localStorage.removeItem("finedge_token");
        localStorage.removeItem("finedge_session");
        window.location.href = "/";
      }
    }
  };

  if (!isOpen && !isLocked && !showSecurityModal) return null;

  // Session Locked overlay — rendered via portal to escape header stacking context
  if (isLocked && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-8">
        <div className="bg-surface-container border border-outline-variant/20 w-full max-w-sm rounded-2xl p-6 shadow-2xl my-auto flex flex-col items-center text-center gap-4 text-on-surface">
          <img 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-2 border-primary object-cover shadow-lg" 
            src={userProfile.avatarUrl} 
          />
          <div>
            <h3 className="text-lg font-bold">Session Locked</h3>
            <p className="text-xs text-on-surface-variant">{userProfile.name} (Premium Member)</p>
          </div>

          <form onSubmit={handleUnlockSession} className="w-full flex flex-col gap-3 mt-2">
            <input
              type="password"
              placeholder="Enter PIN (1234) or Password"
              required
              autoComplete="off"
              value={unlockInput}
              onChange={(e) => {
                setUnlockInput(e.target.value);
                if (unlockError) setUnlockError(null);
              }}
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-sm focus:outline-none focus:border-primary text-on-surface"
            />
            {unlockError && (
              <p className="text-error text-xs text-center m-0 font-medium">{unlockError}</p>
            )}
            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full py-2.5 bg-primary text-on-primary font-medium rounded-xl text-sm hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isUnlocking ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verifying Credentials...
                </>
              ) : (
                "Unlock Banking Session"
              )}
            </button>
          </form>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <>
      {/* Dropdown menu — positioned relative to header avatar */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-72 bg-surface-container border border-outline-variant/20 rounded-2xl shadow-2xl z-50 text-on-surface p-4 flex flex-col gap-3 animate-in fade-in duration-150">
          {/* Profile Info */}
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
            <img 
              alt="Profile" 
              className="w-12 h-12 rounded-full border-2 border-primary/40 object-cover shrink-0" 
              src={userProfile.avatarUrl} 
            />
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm text-on-surface truncate">{userProfile.name}</span>
              <span className="text-[11px] text-primary font-semibold truncate">Premium Member</span>
              <span className="text-[10px] text-on-surface-variant truncate">{userProfile.email}</span>
            </div>
          </div>

          {/* KYC Badge & Link */}
          <Link 
            href="/kyc-profile" 
            onClick={onClose}
            className="bg-tertiary/10 border border-tertiary/20 hover:bg-tertiary/20 p-2.5 rounded-xl flex items-center justify-between text-xs text-tertiary font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>KYC Status: {userProfile.kycStatus}</span>
            </div>
            <CheckCircle2 size={16} />
          </Link>

          {/* Menu Items */}
          <div className="flex flex-col gap-1 text-xs">
            <Link 
              href="/kyc-profile"
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-surface-high flex items-center justify-between transition-colors text-on-surface text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck size={16} className="text-tertiary" />
                <span className="font-semibold text-on-surface">KYC & Profile</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant" />
            </Link>
            <Link 
              href="/notifications"
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-surface-high flex items-center justify-between transition-colors text-on-surface text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bell size={16} className="text-primary" />
                <span className="font-semibold text-on-surface">Notifications</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant" />
            </Link>

            <button 
              onClick={() => { setPasswordError(null); setShowSecurityModal(true); }}
              className="p-2.5 rounded-xl hover:bg-surface-high flex items-center justify-between transition-colors text-on-surface text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Key size={16} className="text-primary" />
                <span>Password & 2FA Security</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant" />
            </button>

            <Link 
              href="/accounts"
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-surface-high flex items-center justify-between transition-colors text-on-surface text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-tertiary" />
                <span className="font-semibold text-on-surface">Admin Panel</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant" />
            </Link>

            <button 
              onClick={handleLockSession}
              className="p-2.5 rounded-xl hover:bg-surface-high flex items-center justify-between transition-colors text-on-surface text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Lock size={16} className="text-secondary" />
                <span>Lock Banking Session</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant" />
            </button>
          </div>

          {/* Footer Sign Out */}
          <div className="pt-2 border-t border-outline-variant/20">
            <button 
              onClick={handleSecureSignOut}
              disabled={isSigningOut}
              className="w-full p-2 bg-error/10 text-error hover:bg-error/20 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSigningOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />} Secure Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Security Modal — rendered via portal to escape header stacking context */}
      {showSecurityModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-8">
          <div className="bg-surface-container border border-outline-variant/20 w-full max-w-md rounded-2xl p-6 shadow-2xl my-auto flex flex-col gap-4 text-on-surface">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold">Password & 2FA Security</h3>
              <button onClick={() => setShowSecurityModal(false)} className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer">
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

                {/* Password Strength Checklist */}
                <div className="p-3 bg-surface-high/60 border border-outline-variant/10 rounded-xl flex flex-col gap-1.5 text-[11px] text-on-surface-variant my-1">
                  <span className="font-semibold text-on-surface mb-0.5">Password Security Rules:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <span className={`flex items-center gap-1 ${newPassword.length >= 8 ? "text-tertiary font-semibold" : ""}`}>
                      • 8+ characters
                    </span>
                    <span className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? "text-tertiary font-semibold" : ""}`}>
                      • Uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? "text-tertiary font-semibold" : ""}`}>
                      • Lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? "text-tertiary font-semibold" : ""}`}>
                      • Number (0-9)
                    </span>
                    <span className={`flex items-center gap-1 col-span-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "text-tertiary font-semibold" : ""}`}>
                      • Special char (!@#$%^&*)
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                  <button type="button" onClick={() => setShowSecurityModal(false)} className="px-4 py-2 bg-surface-high rounded-xl font-medium cursor-pointer">Cancel</button>
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
      )}
    </>
  );
}
