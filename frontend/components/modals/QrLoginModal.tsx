"use client";

import React, { useState, useEffect } from "react";
import { X, QrCode, RefreshCw, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";

interface QrLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QrLoginModal({ isOpen, onClose, onSuccess }: QrLoginModalProps) {
  const [challengeId, setChallengeId] = useState("");
  const [timer, setTimer] = useState(60);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/qr-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE" }),
      });
      const data = await res.json();
      if (data.challengeId) {
        setChallengeId(data.challengeId);
        setTimer(60);
        setScanned(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChallenge();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (isOpen && timer > 0 && !scanned) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer, scanned]);

  if (!isOpen) return null;

  const handleSimulateScanApproval = async () => {
    setScanned(true);
    try {
      const res = await fetch("/api/auth/qr-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY", challengeId }),
      });
      if (res.ok) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8 overflow-y-auto">
      <div className="bg-[#131b2e] border border-[#2f3445] w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 text-white my-auto">
        {/* Header */}
        <div className="w-full flex justify-between items-center border-b border-[#2f3445] pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="text-[#ffd481]" size={20} />
            <h3 className="text-base font-bold tracking-tight">QR Code Authentication</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {scanned ? (
          <div className="py-8 flex flex-col items-center gap-3 text-[#2DD4BF] animate-in fade-in duration-300">
            <CheckCircle2 size={48} />
            <span className="text-sm font-bold">QR Challenge Approved!</span>
            <span className="text-xs text-[#94a3b8]">Redirecting to your dashboard...</span>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#d4c5ad] leading-relaxed m-0">
              Scan this single-use secure QR code using your FinEdge Mobile App to log in instantly.
            </p>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl border-4 border-[#f0b429]/40 shadow-xl flex flex-col items-center relative group cursor-pointer" onClick={handleSimulateScanApproval}>
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                {/* Outer corners */}
                <rect x="10" y="10" width="25" height="25" fill="#0B1120" />
                <rect x="14" y="14" width="17" height="17" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="#0B1120" />

                <rect x="65" y="10" width="25" height="25" fill="#0B1120" />
                <rect x="69" y="14" width="17" height="17" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="#0B1120" />

                <rect x="10" y="65" width="25" height="25" fill="#0B1120" />
                <rect x="14" y="69" width="17" height="17" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="#0B1120" />

                {/* Pattern Data */}
                <rect x="40" y="12" width="6" height="6" fill="#0B1120" />
                <rect x="50" y="12" width="6" height="6" fill="#0B1120" />
                <rect x="40" y="24" width="6" height="6" fill="#0B1120" />
                <rect x="12" y="42" width="6" height="6" fill="#0B1120" />
                <rect x="24" y="42" width="6" height="6" fill="#0B1120" />
                <rect x="36" y="36" width="12" height="12" fill="#0B1120" />
                <rect x="54" y="36" width="12" height="12" fill="#0B1120" />
                <rect x="72" y="42" width="6" height="6" fill="#0B1120" />
                <rect x="42" y="54" width="6" height="6" fill="#0B1120" />
                <rect x="54" y="66" width="6" height="6" fill="#0B1120" />
                <rect x="66" y="66" width="12" height="12" fill="#0B1120" />
                <rect x="78" y="78" width="6" height="6" fill="#0B1120" />
                {/* Center Branding Icon */}
                <circle cx="50" cy="50" r="10" fill="#f0b429" />
                <path d="M47 45L53 50L47 55" stroke="#0B1120" strokeWidth="2" fill="none" />
              </svg>
              <div className="absolute inset-0 bg-[#0B1120]/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-2">
                <Smartphone size={20} className="text-[#ffd481]" />
                <span className="text-[11px] font-bold">Simulate Mobile Scan Approval</span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex justify-between items-center w-full text-xs text-[#94a3b8] pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-[#2DD4BF]" /> Valid for {timer}s
              </span>
              <button 
                type="button" 
                onClick={fetchChallenge}
                disabled={loading}
                className="text-[#ffd481] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh QR
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
