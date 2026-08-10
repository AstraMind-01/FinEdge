"use client";

import React, { useState } from "react";
import { X, Home, Sparkles, ShieldCheck, CreditCard, Headphones, CheckCircle2, Loader2, AlertCircle, ArrowRight, Shield, Award, PhoneCall, Building } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";

export type ElevateServiceType = "HOME_LOANS" | "WEALTH_MGMT" | "INSURANCE" | "PREMIUM_CARDS" | "CONCIERGE";

interface ElevateFinancesModalProps {
  serviceType: ElevateServiceType | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ElevateFinancesModal({ serviceType, isOpen, onClose }: ElevateFinancesModalProps) {
  const { userProfile, addNotification, addInboxMessage } = useAccounts();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  // Home Loan Form State
  const [loanAmount, setLoanAmount] = useState(7500000);
  const [tenureYears, setTenureYears] = useState(20);

  const handleClose = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setResultData(null);
    onClose();
  };

  if (!isOpen || !serviceType) return null;

  const handleApply = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: any = {};
      if (serviceType === "HOME_LOANS") {
        payload.requestedAmount = loanAmount;
        payload.tenureYears = tenureYears;
      }

      const res = await fetch("/api/discover/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: serviceType, payload })
      });
      const data = await res.json();

      if (data.success) {
        setResultData(data);
        setSuccessMsg(data.message);

        // Notifications & Inbox Advice
        const titleMap: Record<ElevateServiceType, string> = {
          HOME_LOANS: "Home Loan Application Submitted",
          WEALTH_MGMT: "Wealth Consultation Scheduled",
          INSURANCE: "Insurance Policy Pre-Approved",
          PREMIUM_CARDS: "Metal Credit Card Application Created",
          CONCIERGE: "24/7 Concierge Booking Confirmed"
        };

        addNotification(titleMap[serviceType], `Ref: ${data.referenceId}. ${data.message}`, "LOAN");
        addInboxMessage(
          "Elevate Finances",
          `${titleMap[serviceType]}: ${data.referenceId}`,
          `Your request for ${serviceType.replace("_", " ")} under reference ${data.referenceId} was processed successfully.`
        );
      } else {
        setErrorMsg(data.error || "Failed to process request");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              {serviceType === "HOME_LOANS" && <Home size={22} />}
              {serviceType === "WEALTH_MGMT" && <Sparkles size={22} />}
              {serviceType === "INSURANCE" && <ShieldCheck size={22} />}
              {serviceType === "PREMIUM_CARDS" && <CreditCard size={22} />}
              {serviceType === "CONCIERGE" && <Headphones size={22} />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">
                {serviceType === "HOME_LOANS" && "Pre-Approved Home Loans"}
                {serviceType === "WEALTH_MGMT" && "Private Wealth Management"}
                {serviceType === "INSURANCE" && "Comprehensive Health & Life Insurance"}
                {serviceType === "PREMIUM_CARDS" && "FinEdge Infinite Metal Card"}
                {serviceType === "CONCIERGE" && "24/7 Priority Banking Concierge"}
              </h2>
              <p className="text-xs text-on-surface-variant">Elevate Your Finances — Premium Banking Services</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-xs font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3 text-tertiary text-xs font-medium">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SERVICE 1: Home Loans */}
        {serviceType === "HOME_LOANS" && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-on-surface-variant text-[11px]">Instant Pre-Approved Loan Limit</span>
                <h3 className="text-2xl font-extrabold text-primary font-mono">{formatCurrency(loanAmount)}</h3>
                <span className="text-[10px] text-tertiary font-medium">Special Interest Rate: 8.35% p.a. • Zero Processing Fee</span>
              </div>
              <Building size={36} className="text-primary/40 shrink-0" />
            </div>

            <div className="flex flex-col gap-3 p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant font-medium">Required Loan Amount</span>
                <span className="font-mono font-bold text-on-surface text-sm">{formatCurrency(loanAmount)}</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="30000000"
                step="500000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />

              <div className="flex justify-between items-center mt-2">
                <span className="text-on-surface-variant font-medium">Tenure (Years)</span>
                <span className="font-mono font-bold text-on-surface text-sm">{tenureYears} Years</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {resultData?.loanDetails && (
              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-surface-high/60 rounded-xl border border-outline-variant/20">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-[10px]">Application ID</span>
                  <span className="font-mono font-bold text-on-surface">{resultData.loanDetails.applicationId}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-[10px]">Estimated Monthly EMI</span>
                  <span className="font-mono font-bold text-primary">{formatCurrency(resultData.loanDetails.estimatedEmi)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SERVICE 2: Wealth Management */}
        {serviceType === "WEALTH_MGMT" && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
              <Sparkles size={28} className="text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-on-surface">Tailored Portfolio &amp; Wealth Advisory</h3>
                <p className="text-[11px] text-on-surface-variant">Dedicated Relationship Manager &amp; Custom Asset Allocation</p>
              </div>
            </div>

            <div className="p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Assigned Senior Advisor</span>
                <span className="font-bold text-on-surface">Rajesh Verma (SVP - Wealth)</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Recommended Allocation</span>
                <span className="font-mono text-tertiary">60% Equity / 30% Debt / 10% Gold</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Consultation Format</span>
                <span className="font-medium text-on-surface">1-on-1 Video Call / Direct Visit</span>
              </div>
            </div>
          </div>
        )}

        {/* SERVICE 3: Insurance */}
        {serviceType === "INSURANCE" && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3">
              <Shield size={28} className="text-tertiary shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-tertiary">100% Cashless Worldwide Coverage</h3>
                <p className="text-[11px] text-on-surface-variant">Health Cover ₹1 Cr + Term Life Cover ₹2 Cr</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex flex-col gap-1">
                <span className="text-on-surface-variant text-[10px]">Health Cover</span>
                <span className="font-mono font-bold text-base text-primary">₹ 1,00,00,000</span>
                <span className="text-[10px] text-on-surface-variant">10,000+ Cashless Hospitals</span>
              </div>
              <div className="p-3.5 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex flex-col gap-1">
                <span className="text-on-surface-variant text-[10px]">Term Life Cover</span>
                <span className="font-mono font-bold text-base text-tertiary">₹ 2,00,00,000</span>
                <span className="text-[10px] text-on-surface-variant">Instant Claim Settlement</span>
              </div>
            </div>
          </div>
        )}

        {/* SERVICE 4: Premium Metal Cards */}
        {serviceType === "PREMIUM_CARDS" && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 bg-gradient-to-r from-amber-500/20 via-primary/10 to-transparent border border-primary/30 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-primary tracking-wider">Pre-Approved Upgrade</span>
                <h3 className="font-extrabold text-base text-on-surface">FinEdge Infinite Metal Credit Card</h3>
                <p className="text-[11px] text-tertiary font-mono font-bold">Credit Limit: ₹ 10,00,000</p>
              </div>
              <Award size={36} className="text-primary shrink-0" />
            </div>

            <div className="p-3.5 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex flex-col gap-2">
              <span className="font-bold text-on-surface">Infinite Privileges:</span>
              <ul className="list-disc list-inside text-on-surface-variant space-y-1 text-[11px]">
                <li>Zero Foreign Exchange Markup Fee on international spends</li>
                <li>Unlimited International &amp; Domestic Airport Lounge access</li>
                <li>5x Reward Points on flights, hotels, and luxury dining</li>
                <li>Complimentary Golf rounds &amp; airport VIP concierge</li>
              </ul>
            </div>
          </div>
        )}

        {/* SERVICE 5: Concierge */}
        {serviceType === "CONCIERGE" && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
              <PhoneCall size={28} className="text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-on-surface">24/7 Dedicated Priority Banking Concierge</h3>
                <p className="text-[11px] text-on-surface-variant">Direct Direct Line to Senior Relationship Manager</p>
              </div>
            </div>

            <div className="p-4 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Priority Hotline</span>
                <span className="font-mono font-bold text-primary">+91 1800 200 9999 (Toll-Free)</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Senior Relationship Manager</span>
                <span className="font-bold text-on-surface">Vikramaditya Rao</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Response Time</span>
                <span className="font-mono text-tertiary font-bold">Callback within 15 mins</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20 mt-1">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all cursor-pointer"
          >
            {resultData ? "Close" : "Cancel"}
          </button>
          {!resultData && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApply}
              className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Confirm Request <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
