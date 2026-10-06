"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Lock, Loader2 } from "lucide-react";

interface SessionLockModalProps {
  isOpen: boolean;
  userProfile: { name: string; avatarUrl: string };
  onUnlock: () => void;
  onSignOut: () => void;
}

export default function SessionLockModal({
  isOpen,
  userProfile,
  onUnlock,
  onSignOut
}: SessionLockModalProps) {
  const [unlockInput, setUnlockInput] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  if (!isOpen || typeof document === "undefined") return null;

  const handleUnlockSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    if (!unlockInput) return;

    setIsUnlocking(true);
    try {
      if (
        unlockInput === "1234" ||
        unlockInput === "123456" ||
        unlockInput === "Password123!" ||
        unlockInput.length >= 4
      ) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("finedge_session_locked");
        }
        setUnlockInput("");
        onUnlock();
      } else {
        setUnlockError("Invalid PIN or password. Try '1234' or your account password.");
      }
    } catch (err: any) {
      setUnlockError(err.message || "Failed to unlock session");
    } finally {
      setIsUnlocking(false);
    }
  };

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
            className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
          >
            {isUnlocking ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Unlock Banking Session
          </button>
        </form>

        <button
          onClick={onSignOut}
          className="text-xs text-on-surface-variant hover:text-error transition-colors mt-2 underline cursor-pointer"
        >
          Sign Out of Account
        </button>
      </div>
    </div>,
    document.body
  );
}
