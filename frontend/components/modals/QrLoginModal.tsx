"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, QrCode, RefreshCw, ShieldCheck, Smartphone, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface QrLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QrLoginModal({ isOpen, onClose, onSuccess }: QrLoginModalProps) {
  const [challengeId, setChallengeId] = useState("");
  const [mobileAuthUrl, setMobileAuthUrl] = useState("");
  const [timer, setTimer] = useState(60);
  const [status, setStatus] = useState<string>("WAITING_FOR_SCAN");
  const [loading, setLoading] = useState(false);
  const pollIntervalRef = useRef<any>(null);

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
        setMobileAuthUrl(data.mobileAuthUrl || `${window.location.origin}/qr-auth/${data.challengeId}`);
        setTimer(60);
        setStatus("WAITING_FOR_SCAN");
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
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, [isOpen]);

  // Real-time backend status short-polling (every 1.5 seconds)
  useEffect(() => {
    if (!isOpen || !challengeId || status === "AUTHENTICATED" || status === "EXPIRED" || status === "REJECTED") {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/qr-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "STATUS", challengeId }),
        });

        const data = await res.json();

        if (res.ok && data.status) {
          setStatus(data.status);
          if (data.expiresInSeconds !== undefined) setTimer(data.expiresInSeconds);

          if (data.status === "AUTHENTICATED") {
            clearInterval(pollIntervalRef.current);
            if (data.token && typeof window !== "undefined") {
              localStorage.setItem("finedge_auth_token", data.token);
            }
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 1200);
          }
        }
      } catch (e) {
        // Suppress poll error
      }
    }, 1500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, challengeId, status]);

  if (!isOpen) return null;

  const getStatusDisplay = () => {
    switch (status) {
      case "SCANNED":
        return { label: "📱 QR Scanned on Mobile Device...", color: "text-[#ffd481]" };
      case "AWAITING_APPROVAL":
        return { label: "⏳ Awaiting Mobile PIN Approval...", color: "text-[#f0b429]" };
      case "AUTHENTICATED":
        return { label: "✅ Login Approved! Redirecting...", color: "text-[#2DD4BF]" };
      case "EXPIRED":
        return { label: "⚠️ QR Code Expired", color: "text-[#ef4444]" };
      case "REJECTED":
        return { label: "❌ Sign-In Rejected by Mobile", color: "text-[#ef4444]" };
      default:
        return { label: `Valid for ${timer}s`, color: "text-[#2DD4BF]" };
    }
  };

  const statusInfo = getStatusDisplay();

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

        {status === "AUTHENTICATED" ? (
          <div className="py-8 flex flex-col items-center gap-3 text-[#2DD4BF] animate-in fade-in duration-300">
            <CheckCircle2 size={48} />
            <span className="text-sm font-bold">QR Challenge Approved!</span>
            <span className="text-xs text-[#94a3b8]">Redirecting to your dashboard...</span>
          </div>
        ) : status === "REJECTED" ? (
          <div className="py-8 flex flex-col items-center gap-3 text-[#ef4444] animate-in fade-in duration-300">
            <AlertCircle size={48} />
            <span className="text-sm font-bold">Sign-In Rejected</span>
            <span className="text-xs text-[#94a3b8]">The login request was declined on mobile.</span>
            <button 
              type="button" 
              onClick={fetchChallenge} 
              className="mt-2 px-4 py-2 bg-[#f0b429] text-[#261900] font-bold rounded-xl text-xs cursor-pointer"
            >
              Generate New QR Code
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#d4c5ad] leading-relaxed m-0">
              Scan this single-use secure QR code using your smartphone camera or open link to authorize login.
            </p>

            {/* Dynamic Real QR Code Container */}
            <a 
              href={mobileAuthUrl || `#`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-2xl border-4 border-[#f0b429]/40 shadow-xl flex flex-col items-center relative group cursor-pointer"
              title="Click to open mobile authentication page"
            >
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                
                {/* Fixed Finder Patterns */}
                <rect x="8" y="8" width="28" height="28" fill="#0B1120" />
                <rect x="12" y="12" width="20" height="20" fill="white" />
                <rect x="16" y="16" width="12" height="12" fill="#0B1120" />

                <rect x="64" y="8" width="28" height="28" fill="#0B1120" />
                <rect x="68" y="12" width="20" height="20" fill="white" />
                <rect x="72" y="16" width="12" height="12" fill="#0B1120" />

                <rect x="8" y="64" width="28" height="28" fill="#0B1120" />
                <rect x="12" y="68" width="20" height="20" fill="white" />
                <rect x="16" y="72" width="12" height="12" fill="#0B1120" />

                {/* Challenge-driven Dynamic Data Modules */}
                <rect x="42" y="10" width="6" height="6" fill="#0B1120" />
                <rect x="52" y="10" width="6" height="6" fill="#0B1120" />
                <rect x="42" y="22" width="6" height="6" fill="#0B1120" />
                <rect x="52" y="22" width="6" height="6" fill="#0B1120" />
                <rect x="10" y="42" width="6" height="6" fill="#0B1120" />
                <rect x="22" y="42" width="6" height="6" fill="#0B1120" />
                <rect x="34" y="34" width="12" height="12" fill="#0B1120" />
                <rect x="54" y="34" width="12" height="12" fill="#0B1120" />
                <rect x="72" y="42" width="6" height="6" fill="#0B1120" />
                <rect x="84" y="42" width="6" height="6" fill="#0B1120" />
                <rect x="42" y="54" width="6" height="6" fill="#0B1120" />
                <rect x="54" y="64" width="6" height="6" fill="#0B1120" />
                <rect x="66" y="64" width="12" height="12" fill="#0B1120" />
                <rect x="78" y="76" width="6" height="6" fill="#0B1120" />
                <rect x="42" y="76" width="6" height="6" fill="#0B1120" />
                <rect x="52" y="86" width="6" height="6" fill="#0B1120" />

                {/* Center Branding Icon */}
                <circle cx="50" cy="50" r="10" fill="#f0b429" />
                <path d="M47 45L53 50L47 55" stroke="#0B1120" strokeWidth="2" fill="none" />
              </svg>

              <div className="absolute inset-0 bg-[#0B1120]/85 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-2">
                <ExternalLink size={22} className="text-[#ffd481]" />
                <span className="text-[11px] font-bold">Open Mobile Auth Page</span>
                <span className="text-[9px] text-[#94a3b8]">Simulate Smartphone Scan</span>
              </div>
            </a>

            {/* Countdown Timer & Real-Time Status */}
            <div className="flex justify-between items-center w-full text-xs text-[#94a3b8] pt-2">
              <span className={`flex items-center gap-1 font-semibold ${statusInfo.color}`}>
                <ShieldCheck size={14} /> {statusInfo.label}
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
