"use client";

import React, { useState } from "react";
import { X, RefreshCw, CheckCircle2, Loader2, ShieldCheck, Camera, ArrowRight, UserCheck } from "lucide-react";

interface ReKycWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReKycCompleted: () => void;
}

export default function ReKycWizardModal({
  isOpen,
  onClose,
  onReKycCompleted
}: ReKycWizardModalProps) {
  const [step, setStep] = useState(1);
  const [isLivenessActive, setIsLivenessActive] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStartLiveness = () => {
    setIsLivenessActive(true);
    setTimeout(() => {
      setIsLivenessActive(false);
      setLivenessPassed(true);
    }, 1500);
  };

  const handleCompleteReKyc = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onReKycCompleted();
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <RefreshCw size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Full Re-KYC Verification</h2>
              <p className="text-xs text-on-surface-variant">Step {step} of 3 • RBI Compliance Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: DIGILOCKER AADHAAR & PAN FETCH */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-3 font-mono">
              <div className="flex justify-between items-center text-teal-400 font-bold border-b border-white/5 pb-2">
                <span>DigiLocker Integration</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-teal-400/10 border border-teal-400/20">Govt Verified</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Account Holder:</span>
                <span className="font-bold text-on-surface">Soumya Ranjan</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Aadhaar Number:</span>
                <span className="font-bold text-on-surface">•••• •••• 9912</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>PAN Number:</span>
                <span className="font-bold text-on-surface">ABCDE1234F</span>
              </div>
            </div>

            <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
              <ShieldCheck size={16} className="text-tertiary shrink-0" />
              <span>DigiLocker data auto-fetched. 100% paperless &amp; secure.</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]">
                Next: Face Liveness Check <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FACE LIVENESS & PHOTO MATCH */}
        {step === 2 && (
          <div className="space-y-4 text-xs flex flex-col items-center text-center">
            <div className="w-36 h-36 rounded-full border-4 border-dashed border-primary/50 flex flex-col items-center justify-center p-2 relative bg-surface overflow-hidden">
              {isLivenessActive ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <span className="text-[10px] font-bold text-primary animate-pulse">Scanning Liveness...</span>
                </div>
              ) : livenessPassed ? (
                <div className="flex flex-col items-center gap-1 text-teal-400">
                  <CheckCircle2 size={36} />
                  <span className="text-[10px] font-bold">Face Match 99.8%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                  <Camera size={28} className="text-primary" />
                  <span className="text-[10px]">Position face inside circle</span>
                </div>
              )}
            </div>

            {!livenessPassed && (
              <button 
                type="button" 
                onClick={handleStartLiveness}
                disabled={isLivenessActive}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
              >
                <Camera size={16} /> Start Liveness Scan
              </button>
            )}

            {livenessPassed && (
              <div className="flex justify-between items-center w-full pt-4 border-t border-white/5">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Back</button>
                <button 
                  type="button" 
                  disabled={isSubmitting}
                  onClick={handleCompleteReKyc}
                  className="px-6 py-2.5 bg-teal-400 text-black font-bold rounded-xl text-xs hover:bg-teal-300 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      Complete Re-KYC <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
