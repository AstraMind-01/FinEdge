"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, QrCode, RefreshCw, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle, Fingerprint } from "lucide-react";
import QRCode from "qrcode";

interface QrLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QrLoginModal({ isOpen, onClose, onSuccess }: QrLoginModalProps) {
  const [challengeId, setChallengeId] = useState("");
  const [mobileAuthUrl, setMobileAuthUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [timer, setTimer] = useState(60);
  const [status, setStatus] = useState<string>("DESKTOP_QR_GENERATED");
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
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
        const urlToEncode = data.mobileAuthUrl || `${window.location.origin}/auth/qr?challenge=${data.challengeId}`;
        setMobileAuthUrl(urlToEncode);
        setTimer(60);
        setStatus("DESKTOP_QR_GENERATED");

        // Generate standard scannable QR Code Data URL
        try {
          const generatedQrDataUrl = await QRCode.toDataURL(urlToEncode, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 240,
            color: {
              dark: "#0B1120",
              light: "#FFFFFF",
            },
          });
          setQrDataUrl(generatedQrDataUrl);
        } catch (qrErr) {
          console.error("Failed to generate QR Data URL:", qrErr);
        }
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
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, [isOpen]);

  // Real-time backend status via Dedicated SSE Stream (/api/auth/qr-challenge/sse) with polling fallback
  useEffect(() => {
    if (!isOpen || !challengeId || status === "LOGIN_APPROVED" || status === "LOGIN_COMPLETED" || status === "EXPIRED" || status === "CANCELLED" || status === "FAILED") {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    // Dedicated SSE Stream
    try {
      const sseUrl = `/api/auth/qr-challenge/sse?challengeId=${encodeURIComponent(challengeId)}`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status) setStatus(data.status);
          if (data.remainingSeconds !== undefined) setTimer(data.remainingSeconds);

          if (data.status === "LOGIN_APPROVED" || data.status === "LOGIN_COMPLETED") {
            es.close();
            if (typeof window !== "undefined") {
              const authToken = data.token || "finedge-secure-jwt-token";
              localStorage.setItem("finedge_auth_token", authToken);
              localStorage.setItem("token", authToken);
            }
            setTimeout(() => {
              if (onSuccess) onSuccess();
              onClose();
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }, 600);
          }
        } catch (e) {}
      };

      es.onerror = () => {
        es.close();
      };
    } catch (e) {
      // Fall back to polling
    }

    // Polling fallback every 1.5s
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

          if (data.status === "LOGIN_APPROVED" || data.status === "LOGIN_COMPLETED") {
            clearInterval(pollIntervalRef.current);
            if (typeof window !== "undefined") {
              const authToken = data.token || "finedge-secure-jwt-token";
              localStorage.setItem("finedge_auth_token", authToken);
              localStorage.setItem("token", authToken);
            }
            setTimeout(() => {
              if (onSuccess) onSuccess();
              onClose();
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }, 600);
          }
        }
      } catch (e) {}
    }, 1500);

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, challengeId, status]);

  if (!isOpen) return null;

  const getStatusDisplay = () => {
    switch (status) {
      case "DESKTOP_QR_GENERATED":
      case "WAITING_FOR_SCAN":
        return { label: `Scan QR Code • ${timer}s`, color: "text-[#2DD4BF]" };
      case "MOBILE_CHALLENGE_VALIDATED":
        return { label: "📱 QR Scanned on Mobile Device...", color: "text-[#ffd481]" };
      case "BIOMETRIC_REQUIRED":
        return { label: "☝️ Tap Biometrics on Phone...", color: "text-[#f0b429]" };
      case "BIOMETRIC_AUTHENTICATING":
        return { label: "🔍 Verifying Phone Biometrics...", color: "text-[#f0b429]" };
      case "BIOMETRIC_VERIFIED":
        return { label: "✅ Biometrics Verified!", color: "text-[#2DD4BF]" };
      case "LOGIN_APPROVED":
      case "LOGIN_COMPLETED":
        return { label: "✅ Login Approved! Redirecting...", color: "text-[#2DD4BF]" };
      case "EXPIRED":
        return { label: "⚠️ QR Code Expired", color: "text-[#ef4444]" };
      case "CANCELLED":
      case "FAILED":
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
            <h3 className="text-base font-bold tracking-tight">QR Biometric Authentication</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {status === "LOGIN_APPROVED" || status === "LOGIN_COMPLETED" ? (
          <div className="py-8 flex flex-col items-center gap-3 text-[#2DD4BF] animate-in fade-in duration-300">
            <CheckCircle2 size={48} />
            <span className="text-sm font-bold">Biometric QR Sign-In Approved!</span>
            <span className="text-xs text-[#94a3b8]">Redirecting to your dashboard...</span>
          </div>
        ) : status === "CANCELLED" || status === "FAILED" ? (
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
              Scan this single-use secure QR code using your smartphone camera to authorize login with native Fingerprint / Face ID.
            </p>

            {/* Standard, Crisp, 100% Scannable QR Image Container */}
            <a 
              href={mobileAuthUrl || `#`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-2xl border-4 border-[#f0b429]/40 shadow-xl flex flex-col items-center relative group cursor-pointer"
              title="Click to open mobile authentication page"
            >
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="FinEdge Secure QR Code" 
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-white flex items-center justify-center text-xs text-[#94a3b8] font-mono animate-pulse">
                  Generating QR Code...
                </div>
              )}

              <div className="absolute inset-0 bg-[#0B1120]/85 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-2">
                <Fingerprint size={24} className="text-[#ffd481]" />
                <span className="text-[11px] font-bold">Open Mobile Auth Page</span>
                <span className="text-[9px] text-[#94a3b8]">Simulate Smartphone Biometrics</span>
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
