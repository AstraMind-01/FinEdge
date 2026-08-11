"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, Smartphone, CheckCircle2, XCircle, AlertCircle, Loader2, KeyRound } from "lucide-react";

export default function MobileQrAuthPage() {
  const params = useParams();
  const challengeId = params?.challengeId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("LOADING");
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [userIdentifier, setUserIdentifier] = useState("soumya");
  const [pin, setPin] = useState("1234");
  const [completed, setCompleted] = useState<"APPROVED" | "REJECTED" | null>(null);

  // Initialize mobile scan
  useEffect(() => {
    if (!challengeId) return;

    const initMobileScan = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/qr-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "MOBILE_SCAN", challengeId }),
        });

        const data = await res.json();
        if (res.ok && data.status) {
          setStatus(data.status);
          if (data.remainingSeconds) setRemainingSeconds(data.remainingSeconds);
        } else {
          setError(data.error || "Invalid or expired QR code.");
          setStatus("EXPIRED");
        }
      } catch (err: any) {
        setError("Failed to validate QR challenge.");
        setStatus("EXPIRED");
      } finally {
        setLoading(false);
      }
    };

    initMobileScan();
  }, [challengeId]);

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (remainingSeconds > 0 && !completed && status !== "EXPIRED") {
      timer = setInterval(() => setRemainingSeconds((s) => s - 1), 1000);
    } else if (remainingSeconds <= 0) {
      setStatus("EXPIRED");
    }
    return () => clearInterval(timer);
  }, [remainingSeconds, completed, status]);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pin || pin.length < 4) {
      setError("Please enter your 4-digit Security PIN (Demo: 1234).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/qr-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MOBILE_APPROVE",
          challengeId,
          userIdentifier,
          pin,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === "AUTHENTICATED") {
        setCompleted("APPROVED");
      } else {
        setError(data.error || "Approval failed.");
      }
    } catch (err: any) {
      setError("An error occurred during approval.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/auth/qr-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MOBILE_REJECT", challengeId }),
      });
      setCompleted("REJECTED");
    } catch (e) {
      setError("Failed to send rejection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#131b2e] border border-[#2f3445] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        {/* Top Branding Banner */}
        <div className="flex items-center justify-between border-b border-[#2f3445] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5c960, #d69e1f)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#0B1120]" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" />
                <path d="M12 8l-4 2.5v4L12 17l4-2.5v-4L12 8z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#ffd481] tracking-tight leading-none">FinEdge</h2>
              <span className="text-[10px] text-[#94a3b8] uppercase tracking-widest">Mobile Auth Security</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#1e293b] px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#2DD4BF] border border-[#334155]">
            <ShieldCheck size={14} /> 256-Bit SSL
          </div>
        </div>

        {/* Content based on state */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#d4c5ad]">
            <Loader2 size={36} className="animate-spin text-[#f0b429]" />
            <span className="text-sm font-medium">Validating QR Code Challenge...</span>
          </div>
        ) : completed === "APPROVED" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#16a34a]/20 border-2 border-[#16a34a] flex items-center justify-center text-[#2DD4BF]">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white m-0">Sign-In Approved!</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              Your desktop browser session has been logged in automatically. You can safely close this page.
            </p>
          </div>
        ) : completed === "REJECTED" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/20 border-2 border-[#ef4444] flex items-center justify-center text-[#ffb4ab]">
              <XCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white m-0">Sign-In Rejected</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              The login request was declined. The desktop session will remain unauthenticated.
            </p>
          </div>
        ) : status === "EXPIRED" || remainingSeconds <= 0 ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#eab308]/20 border-2 border-[#eab308] flex items-center justify-center text-[#f0b429]">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-white m-0">QR Code Expired</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              This QR authentication challenge has expired (60s limit). Please refresh the QR code on your desktop screen and scan again.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="bg-[#1e293b] border border-[#334155] p-4 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Smartphone size={24} className="text-[#f0b429]" />
                <div className="flex flex-col">
                  <span className="font-bold text-white">Desktop Sign-In Request</span>
                  <span className="text-[#94a3b8] text-[11px]">FinEdge Web Portal • Chrome / Windows</span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#f0b429] bg-[#0f172a] px-2.5 py-1 rounded-lg border border-[#f0b429]/30">
                {remainingSeconds}s
              </span>
            </div>

            {error && (
              <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl text-[#ffb4ab] text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleApprove} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[#d4c5ad] font-semibold uppercase tracking-wider">Account Username / ID</label>
                <input
                  type="text"
                  required
                  value={userIdentifier}
                  onChange={(e) => setUserIdentifier(e.target.value)}
                  placeholder="Enter Customer ID or username"
                  className="bg-[#141B2D] border border-[#2f3445] p-3 rounded-xl text-white outline-none focus:border-[#f0b429]/60 font-mono text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[#d4c5ad] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <KeyRound size={12} className="text-[#f0b429]" /> Security PIN Verification
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit Security PIN (Demo: 1234)"
                  className="bg-[#141B2D] border border-[#2f3445] p-3 rounded-xl text-white outline-none focus:border-[#f0b429]/60 font-mono text-sm"
                />
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  type="submit"
                  disabled={submitting || remainingSeconds <= 0}
                  className="w-full py-3.5 bg-[#f0b429] text-[#261900] font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-50 transition-all cursor-pointer flex justify-center items-center gap-2 text-sm"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null} Approve Sign-In
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submitting}
                  className="w-full py-3 bg-[#1f293d] hover:bg-[#ef4444]/20 hover:text-[#ffb4ab] rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  Reject Sign-In
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center text-[11px] text-[#64748b] pt-2 border-t border-[#2f3445]">
          FinEdge Passwordless Auth • Encrypted & Non-Replayable
        </div>
      </div>
    </div>
  );
}
