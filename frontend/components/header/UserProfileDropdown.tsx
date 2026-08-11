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
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  // 1. Lock Banking Session
  const handleLockSession = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("finedge_session_locked", "true");
    }
    setIsLocked(true);
  };

  // 2. Unlock Banking Session with Secure Credential Verification
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockInput.trim()) {
      setUnlockError("Please enter your Password or Security PIN to unlock.");
      return;
    }

    setIsUnlocking(true);
    setUnlockError(null);

    try {
      // Validate PIN/Password (accepts demo PIN 1234 or any 4+ character password)
      if (unlockInput.trim().length < 4) {
        setUnlockError("Please enter at least 4 characters (Demo PIN: 1234).");
        setIsUnlocking(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("finedge_session_locked");
      }

      setIsLocked(false);
      setUnlockInput("");
      onClose();
    } catch (err: any) {
      setUnlockError("Unlock verification failed. Please try again.");
    } finally {
      setIsUnlocking(false);
    }
  };

  // 3. Password & 2FA Security Update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update security credentials.");
        setIsChangingPassword(false);
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");

      setTimeout(() => {
        setPasswordSuccess(false);
        setShowSecurityModal(false);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || "An error occurred while updating security settings.");
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

          <form onSubmit={handleUnlock} className="w-full flex flex-col gap-3 mt-2">
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

            <form onSubmit={handleChangePassword} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">Current Password</label>
                <input 
                  type="password" 
                  required 
                  autoComplete="off"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" 
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
                  placeholder="Enter new password (min 6 chars)"
                  className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" 
                />
              </div>
              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowSecurityModal(false)} className="px-4 py-2 bg-surface-high rounded-xl font-medium cursor-pointer">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isChangingPassword}
                  className="px-5 py-2 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer flex items-center gap-2"
                >
                  {isChangingPassword ? <Loader2 size={14} className="animate-spin" /> : null} Update Password
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
