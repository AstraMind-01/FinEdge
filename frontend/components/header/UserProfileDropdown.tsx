"use client";

import React, { useState } from "react";
import { User, ShieldCheck, Lock, LogOut, CheckCircle2, Key, Sliders, ChevronRight, X } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileDropdown({ isOpen, onClose }: Props) {
  const { userProfile } = useAccounts();
  const [isLocked, setIsLocked] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLockSession = () => {
    setIsLocked(true);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLocked(false);
    onClose();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowSecurityModal(false);
    }, 1500);
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
        <div className="bg-surface-container border border-outline-variant/20 w-full max-w-sm rounded-2xl p-6 shadow-2xl z-[10000] my-auto flex flex-col items-center text-center gap-4 text-on-surface">
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
              placeholder="Enter Password / PIN to Unlock"
              required
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-center text-sm focus:outline-none focus:border-primary text-on-surface"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-on-primary font-medium rounded-xl text-sm hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer"
            >
              Unlock Banking Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
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

        {/* KYC Badge */}
        <div className="bg-tertiary/10 border border-tertiary/20 p-2.5 rounded-xl flex items-center justify-between text-xs text-tertiary font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>KYC Status: {userProfile.kycStatus}</span>
          </div>
          <CheckCircle2 size={16} />
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-1 text-xs">
          <button 
            onClick={() => setShowSecurityModal(true)}
            className="p-2.5 rounded-xl hover:bg-surface-high flex items-center justify-between transition-colors text-on-surface text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Key size={16} className="text-primary" />
              <span>Password & 2FA Security</span>
            </div>
            <ChevronRight size={14} className="text-on-surface-variant" />
          </button>

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
            onClick={() => { handleLockSession(); }}
            className="w-full p-2 bg-error/10 text-error hover:bg-error/20 font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={14} /> Secure Sign Out
          </button>
        </div>
      </div>

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
          <div className="bg-surface-container border border-outline-variant/20 w-full max-w-md rounded-2xl p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-4 text-on-surface">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold">Password & 2FA Security</h3>
              <button onClick={() => setShowSecurityModal(false)} className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
                <X size={18} />
              </button>
            </div>
            {passwordSuccess && (
              <div className="p-3 bg-tertiary/10 border border-tertiary/20 rounded-xl text-tertiary text-xs font-medium flex items-center gap-2">
                <CheckCircle2 size={16} /> Security credentials updated!
              </div>
            )}
            <form onSubmit={handleChangePassword} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">Current Password</label>
                <input type="password" required className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-medium">New Password</label>
                <input type="password" required className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowSecurityModal(false)} className="px-4 py-2 bg-surface-high rounded-xl font-medium cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
