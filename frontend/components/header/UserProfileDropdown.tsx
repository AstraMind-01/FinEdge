"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, ShieldCheck, Lock, LogOut, CheckCircle2, Key, Sliders, ChevronRight, UserCheck, Bell, Loader2 } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";
import SessionLockModal from "./SessionLockModal";
import ChangePasswordModal from "./ChangePasswordModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileDropdown({ isOpen, onClose }: Props) {
  const { userProfile } = useAccounts();
  const [isLocked, setIsLocked] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem("finedge_session_locked") === "true") {
      setIsLocked(true);
    }
  }, []);

  const handleLockSession = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("finedge_session_locked", "true");
    }
    setIsLocked(true);
  };

  const handleUnlockSession = () => {
    setIsLocked(false);
  };

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

  return (
    <>
      {isLocked && mounted && (
        <SessionLockModal
          isOpen={isLocked}
          userProfile={userProfile}
          onUnlock={handleUnlockSession}
          onSignOut={handleSecureSignOut}
        />
      )}

      {isOpen && (
        <div className="absolute right-0 top-14 w-80 bg-surface-container border border-outline-variant/20 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Header Profile Info */}
          <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
            <div className="relative">
              <img 
                alt="Profile" 
                className="w-11 h-11 rounded-full border border-primary/40 object-cover" 
                src={userProfile.avatarUrl} 
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary border-2 border-surface-container rounded-full" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-on-surface truncate text-sm">{userProfile.name}</span>
              <span className="text-on-surface-variant text-[11px] truncate">{userProfile.email}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded-full font-semibold">
                  {userProfile.customerID}
                </span>
                <span className="text-[10px] text-tertiary flex items-center gap-0.5 font-medium">
                  <CheckCircle2 size={10} /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Menu Options */}
          <div className="flex flex-col gap-1">
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
              onClick={() => { setShowSecurityModal(true); }}
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

      {showSecurityModal && mounted && (
        <ChangePasswordModal
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          userEmail={userProfile.email}
        />
      )}
    </>
  );
}
