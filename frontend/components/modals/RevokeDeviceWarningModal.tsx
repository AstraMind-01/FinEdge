"use client";

import React, { useState, useEffect } from "react";
import { X, LogOut, Lock, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface RevokeDeviceWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: { id: number; name: string; time: string; isCurrent: boolean } | null;
  onConfirmRevoke: (deviceId: number) => void;
}

export default function RevokeDeviceWarningModal({
  isOpen,
  onClose,
  device,
  onConfirmRevoke
}: RevokeDeviceWarningModalProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (error) setError(null);

    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`dev-pin-${index + 1}`);
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
      onConfirmRevoke(device.id);
      setIsSubmitting(false);
      setPin(["", "", "", ""]);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <LogOut size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Revoke Device Session</h2>
              <p className="text-xs text-on-surface-variant font-mono">{device.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Warning Box */}
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle size={16} /> Session Termination Advisory
          </div>
          <p className="text-on-surface font-semibold leading-relaxed">
            Revoking access for <span className="text-red-400 font-bold">{device.name}</span> will immediately invalidate its active session JWT tokens.
          </p>
          <p className="text-on-surface-variant text-[11px] leading-relaxed">
            Any active web or mobile sessions on this device will be logged out instantly and forced to re-authenticate with 2FA.
          </p>
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
                  id={`dev-pin-${idx}`}
                  type="password"
                  maxLength={1}
                  autoComplete="one-time-code"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-bold bg-surface border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              ))}
            </div>
            {error && (
              <p className="text-[11px] text-red-400 text-center font-semibold mt-1">{error}</p>
            )}
            <p className="text-[10px] text-on-surface-variant text-center">Default Demo Security PIN: <span className="font-mono font-bold text-primary">1234</span></p>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 flex items-center gap-1.5 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Revoking...
                </>
              ) : (
                <>
                  Revoke Device <LogOut size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
