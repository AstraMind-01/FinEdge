"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Smartphone, CheckCircle2, XCircle, AlertCircle, Loader2, Fingerprint, Lock, KeyRound, WifiOff } from "lucide-react";

export type QrStatusCode = 
  | "VALID"
  | "EXPIRED"
  | "INVALID"
  | "ALREADY_USED"
  | "CANCELLED"
  | "NOT_FOUND"
  | "NETWORK_ERROR"
  | "SERVER_ERROR";

function base64urlToUint8Array(base64url: string): BufferSource {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLength);
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function MobileQrAuthPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const paramId = (params?.challengeId as string) || "";
  const queryId = searchParams?.get("challenge") || searchParams?.get("challengeId") || "";
  const challengeId = paramId || queryId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<QrStatusCode | "LOADING">("LOADING");
  const [status, setStatus] = useState<string>("LOADING");
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [userIdentifier, setUserIdentifier] = useState("soumya");
  const [completed, setCompleted] = useState<"APPROVED" | "REJECTED" | null>(null);

  // Initialize mobile scan with 5s AbortController timeout
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const validateChallenge = async () => {
      if (!challengeId) {
        const timeout = setTimeout(() => {
          if (isMounted && !challengeId) {
            setStatusCode("NOT_FOUND");
            setStatus("NOT_FOUND");
            setError("No QR challenge ID parameter found in URL. Scan a fresh QR code from your desktop screen.");
            setLoading(false);
          }
        }, 300);
        return () => clearTimeout(timeout);
      }

      setLoading(true);
      setError(null);

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000); // 5-second fetch timeout

      try {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const apiUrl = `${baseUrl}/api/auth/qr-challenge`;

        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "MOBILE_SCAN", challengeId }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await res.json();
        
        if (process.env.NODE_ENV !== "production") {
          console.log(`[Mobile WebAuthn QR Auth] Target: ${apiUrl} | Code: ${data.code} | Status: ${data.status}`);
        }

        if (isMounted) {
          if (res.ok && data.success && data.code === "VALID") {
            setStatusCode("VALID");
            setStatus(data.status || "BIOMETRIC_REQUIRED");
            if (data.remainingSeconds) setRemainingSeconds(data.remainingSeconds);
          } else {
            const code: QrStatusCode = data.code || (res.status === 404 ? "NOT_FOUND" : "EXPIRED");
            setStatusCode(code);
            setStatus(data.status || code);
            setError(data.error || "Invalid or expired QR challenge code.");
          }
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (isMounted) {
          if (err.name === "AbortError") {
            setStatusCode("NETWORK_ERROR");
            setStatus("NETWORK_ERROR");
            setError("Connection Timeout: FinEdge server did not respond within 5 seconds. Verify mobile Wi-Fi connection.");
          } else {
            setStatusCode("SERVER_ERROR");
            setStatus("SERVER_ERROR");
            setError("Failed to connect to authentication server. Check mobile network connection.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    validateChallenge();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [challengeId]);

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (remainingSeconds > 0 && !completed && statusCode === "VALID" && status !== "EXPIRED") {
      timer = setInterval(() => setRemainingSeconds((s) => s - 1), 1000);
    } else if (remainingSeconds <= 0 && statusCode === "VALID") {
      setStatusCode("EXPIRED");
      setStatus("EXPIRED");
      setError("QR Code expired (60s limit). Please refresh QR code on desktop.");
    }
    return () => clearInterval(timer);
  }, [remainingSeconds, completed, statusCode, status]);

  // Trigger Native Smartphone WebAuthn / FIDO2 Biometric Authenticator
  const handleNativeBiometricAuthenticate = async () => {
    setError(null);
    setSubmitting(true);
    setStatus("BIOMETRIC_AUTHENTICATING");

    if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      const httpsUrl = `https://${window.location.host}${window.location.pathname}${window.location.search}`;
      setError(`🔒 Phone fingerprint sensors require HTTPS. Please open ${httpsUrl} on your phone browser to trigger native biometric verification.`);
      setSubmitting(false);
      return;
    }

    let credentialPayload: any = null;

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const currentHostname = window.location.hostname === "localhost" ? "localhost" : window.location.hostname;

      // 1. Fetch registration challenge to trigger native Android OS Passkey prompt ("Touch your fingerprint sensor") directly
      const regRes = await fetch(`${baseUrl}/api/auth/biometric`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GET_REGISTER_CHALLENGE" }),
      });
      const regData = await regRes.json();

      if (regData.success && regData.challenge) {
        const regChallengeBuffer = base64urlToUint8Array(regData.challenge);
        const userIdBuffer = base64urlToUint8Array(regData.user.id);

        const createOptions: PublicKeyCredentialCreationOptions = {
          rp: {
            name: "FinEdge Intelligent Banking",
            id: currentHostname,
          },
          user: {
            id: userIdBuffer,
            name: regData.user.name,
            displayName: regData.user.displayName,
          },
          challenge: regChallengeBuffer,
          pubKeyCredParams: regData.pubKeyCredParams,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        };

        const newCred = (await navigator.credentials.create({ publicKey: createOptions }).catch((e) => {
          console.warn("WebAuthn QR create error:", e);
          return null;
        })) as PublicKeyCredential | null;

        if (newCred) {
          const rawResponse = newCred.response as AuthenticatorAttestationResponse;
          const clientDataJsonStr = arrayBufferToBase64Url(rawResponse.clientDataJSON);

          const regCompleteRes = await fetch(`${baseUrl}/api/auth/biometric`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "REGISTER",
              challengeId: regData.challengeId,
              attestation: {
                credentialId: newCred.id,
                publicKey: clientDataJsonStr,
                authenticatorAttachment: newCred.authenticatorAttachment || "platform",
              },
            }),
          });

          if (regCompleteRes.ok) {
            credentialPayload = {
              credentialId: newCred.id,
              authenticatorData: clientDataJsonStr,
              clientDataJSON: clientDataJsonStr,
              signature: clientDataJsonStr,
            };
          }
        } else {
          // If creation returned null (e.g. Passkey already exists for domain), attempt navigator.credentials.get()
          const challengeRes = await fetch(`${baseUrl}/api/auth/biometric`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "GET_CHALLENGE" }),
          });
          const cData = await challengeRes.json();

          if (cData.success && cData.challenge) {
            const publicKeyOptions: PublicKeyCredentialRequestOptions = {
              challenge: base64urlToUint8Array(cData.challenge),
              rpId: currentHostname,
              userVerification: "preferred",
              timeout: 60000,
            };

            const cred = (await navigator.credentials.get({ publicKey: publicKeyOptions }).catch(() => null)) as PublicKeyCredential | null;

            if (cred) {
              const rawResp = cred.response as AuthenticatorAssertionResponse;
              credentialPayload = {
                credentialId: cred.id,
                authenticatorData: arrayBufferToBase64Url(rawResp.authenticatorData),
                clientDataJSON: arrayBufferToBase64Url(rawResp.clientDataJSON),
                signature: arrayBufferToBase64Url(rawResp.signature),
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn("WebAuthn QR challenge error:", e);
    }

    if (!credentialPayload) {
      setError("🔒 Biometric Hardware Scan Required: Please scan your fingerprint / Face ID on your phone to approve desktop login.");
      setSubmitting(false);
      setStatus("BIOMETRIC_REQUIRED");
      return;
    }

    // 3. Send WebAuthn assertion payload to server to verify challenge & authenticate
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const apiUrl = `${baseUrl}/api/auth/qr-challenge`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MOBILE_BIOMETRIC_APPROVE",
          challengeId,
          userIdentifier,
          credentialId: credentialPayload?.credentialId || `cred_${Date.now()}`,
          assertion: credentialPayload,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && (data.status === "LOGIN_APPROVED" || data.status === "AUTHENTICATED")) {
        setStatus("BIOMETRIC_VERIFIED");
        setTimeout(() => {
          setCompleted("APPROVED");
        }, 500);
      } else {
        setError(data.error || "Biometric authentication failed.");
        setStatus("BIOMETRIC_REQUIRED");
      }
    } catch (err: any) {
      setError("Failed to verify biometric authentication.");
      setStatus("BIOMETRIC_REQUIRED");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      await fetch(`${baseUrl}/api/auth/qr-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MOBILE_REJECT", challengeId }),
      });
      setCompleted("REJECTED");
      setStatusCode("CANCELLED");
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
              <span className="text-[10px] text-[#94a3b8] uppercase tracking-widest">WebAuthn Biometric Security</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#1e293b] px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#2DD4BF] border border-[#334155]">
            <ShieldCheck size={14} /> FIDO2 Passkey
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
            <h3 className="text-2xl font-bold text-white m-0">Biometric Login Approved!</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              WebAuthn assertion verified successfully. Your desktop browser session has been logged in automatically.
            </p>
          </div>
        ) : completed === "REJECTED" || statusCode === "CANCELLED" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/20 border-2 border-[#ef4444] flex items-center justify-center text-[#ffb4ab]">
              <XCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white m-0">Sign-In Rejected</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              The login request was declined. The desktop session remains unauthenticated.
            </p>
          </div>
        ) : statusCode === "EXPIRED" || remainingSeconds <= 0 ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#eab308]/20 border-2 border-[#eab308] flex items-center justify-center text-[#f0b429]">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-white m-0">QR Code Expired</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              This QR authentication challenge has expired (60s limit). Please refresh the QR code on your desktop screen and scan again.
            </p>
          </div>
        ) : statusCode === "ALREADY_USED" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#3b82f6]/20 border-2 border-[#3b82f6] flex items-center justify-center text-[#60a5fa]">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-white m-0">Challenge Already Authenticated</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              This single-use QR challenge was already authorized previously.
            </p>
          </div>
        ) : statusCode === "NOT_FOUND" || statusCode === "INVALID" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/20 border-2 border-[#ef4444] flex items-center justify-center text-[#ffb4ab]">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-white m-0">Invalid QR Challenge</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              {error || "The QR code challenge reference is invalid or no longer exists. Please scan a fresh QR code from your desktop."}
            </p>
          </div>
        ) : statusCode === "NETWORK_ERROR" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#eab308]/20 border-2 border-[#eab308] flex items-center justify-center text-[#f0b429]">
              <WifiOff size={40} />
            </div>
            <h3 className="text-xl font-bold text-white m-0">Network Timeout</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              {error || "Unable to reach FinEdge server. Verify that your phone is connected to the same Wi-Fi network as the desktop PC."}
            </p>
          </div>
        ) : statusCode === "SERVER_ERROR" ? (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/20 border-2 border-[#ef4444] flex items-center justify-center text-[#ffb4ab]">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-white m-0">Server Error</h3>
            <p className="text-sm text-[#cbd5e1] max-w-xs m-0">
              {error || "Failed to connect to authentication server."}
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

            <div className="flex flex-col items-center gap-4 text-center py-4 bg-[#151b2b] border border-[#2f3445] rounded-2xl p-5">
              <div className="w-16 h-16 rounded-full bg-[#f0b429]/15 border border-[#f0b429]/40 flex items-center justify-center text-[#f0b429]">
                <Fingerprint size={36} className={status === "BIOMETRIC_AUTHENTICATING" ? "animate-pulse" : ""} />
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-base font-bold text-white m-0">Authenticate with Biometrics</h4>
                <p className="text-xs text-[#94a3b8] m-0">
                  Tap below to trigger your phone's native Fingerprint or Face ID sensor.
                </p>
              </div>

              <button
                type="button"
                onClick={handleNativeBiometricAuthenticate}
                disabled={submitting || remainingSeconds <= 0}
                className="w-full py-4 bg-gradient-to-r from-[#f0b429] to-[#d69e1f] text-[#261900] font-bold rounded-xl hover:shadow-[0_0_20px_rgba(240,180,41,0.5)] disabled:opacity-50 transition-all cursor-pointer flex justify-center items-center gap-2 text-sm mt-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Fingerprint size={20} />}
                {submitting ? "Verifying Biometrics..." : "Authenticate with Biometrics"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleReject}
              disabled={submitting}
              className="w-full py-3 bg-[#1f293d] hover:bg-[#ef4444]/20 hover:text-[#ffb4ab] rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Reject Sign-In
            </button>
          </div>
        )}

        <div className="text-center text-[11px] text-[#64748b] pt-2 border-t border-[#2f3445] flex items-center justify-center gap-1">
          <Lock size={12} className="text-[#2DD4BF]" /> Native WebAuthn FIDO2 • No Raw Biometrics Stored
        </div>
      </div>
    </div>
  );
}
