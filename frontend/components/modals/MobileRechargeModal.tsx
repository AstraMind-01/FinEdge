"use client";

import React, { useState, useEffect } from "react";
import { Account } from "../../types";
import { X, Smartphone, CheckCircle2, AlertCircle, Loader2, Zap, Radio, Sparkles, Search, ArrowLeft } from "lucide-react";
import { RechargePlan } from "../../app/api/recharge/plans/route";

import { useAccounts } from "../../context/AccountContext";

interface MobileRechargeModalProps {
  accounts: Account[];
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (accountId: string, mobileNumber: string, operator: string, amount: number) => Promise<void>;
}

const CIRCLES = [
  "Mumbai",
  "Delhi NCR",
  "Kolkata",
  "Maharashtra & Goa",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "Andhra Pradesh",
  "UP East",
  "UP West & UK",
  "West Bengal",
  "Punjab"
];

const INITIAL_FALLBACK_PLANS: RechargePlan[] = [
  { id: "jio-299", name: "Jio True 5G Unlimited", price: 299, validity: "28 Days", data: "1.5 GB/Day + 5G", calls: "Unlimited", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data + 100 SMS/day + JioTV, JioCinema" },
  { id: "jio-349", name: "Jio 2GB/Day Hero", price: 349, validity: "28 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data + 100 SMS/day + JioCloud" },
  { id: "jio-749", name: "Jio 84 Days Value Pack", price: 749, validity: "84 Days", data: "2.0 GB/Day + 5G", calls: "Unlimited", category: "TRULY_UNLIMITED", description: "Unlimited 5G Data for 84 days + Jio Apps" },
  { id: "jio-859", name: "Jio 84 Days Super Value", price: 859, validity: "84 Days", data: "2.5 GB/Day + 5G", calls: "Unlimited", category: "TRULY_UNLIMITED", description: "2.5GB/Day + Unlimited 5G Data + Disney+ Hotstar" },
  { id: "jio-149", name: "Jio Data Booster 12GB", price: 149, validity: "Active Pack", data: "12 GB High Speed", calls: "NA", category: "DATA", description: "High Speed Data add-on for existing pack" },
  { id: "jio-219", name: "Jio Data Booster 25GB", price: 219, validity: "Active Pack", data: "25 GB High Speed", calls: "NA", category: "DATA", description: "Bulk high speed data add-on" },
  { id: "jio-449", name: "Jio Cinema Premium Combo", price: 449, validity: "28 Days", data: "3.0 GB/Day + 5G", calls: "Unlimited", category: "ENTERTAINMENT", description: "Includes JioCinema Premium Subscription" },
  { id: "jio-3599", name: "Jio Annual 365 Days Plan", price: 3599, validity: "365 Days", data: "2.5 GB/Day + 5G", calls: "Unlimited", category: "ANNUAL", description: "365 Days Validity + Unlimited 5G + FanCode" }
];

export default function MobileRechargeModal({ accounts, isOpen, onClose, onRecharge }: MobileRechargeModalProps) {
  const { isAccountVerified } = useAccounts();
  const activeAccounts = accounts.filter(a => a.type === "SAVINGS" || a.type === "CURRENT");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [operator, setOperator] = useState("Jio 5G Prepaid");
  const [circle, setCircle] = useState("Mumbai");
  
  const [plans, setPlans] = useState<RechargePlan[]>(INITIAL_FALLBACK_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan | null>(INITIAL_FALLBACK_PLANS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  const [sourceAccountId, setSourceAccountId] = useState(activeAccounts[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto sync sourceAccountId when accounts load or open
  useEffect(() => {
    if (isOpen && activeAccounts.length > 0 && (!sourceAccountId || !activeAccounts.some(a => a.id === sourceAccountId))) {
      setSourceAccountId(activeAccounts[0].id);
    }
  }, [isOpen, accounts, activeAccounts, sourceAccountId]);

  // Fetch plans dynamically from PlanAPI backend route when operator or circle changes
  useEffect(() => {
    if (!isOpen) return;

    async function fetchPlans() {
      setIsLoadingPlans(true);
      setErrorMsg(null);

      try {
        const query = new URLSearchParams({ operator, circle });
        const res = await fetch(`/api/recharge/plans?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.plans) && data.plans.length > 0) {
            setPlans(data.plans);
            setSelectedPlan(prev => {
              const matched = data.plans.find((p: RechargePlan) => p.price === prev?.price);
              return matched || data.plans[0];
            });
          }
        }
      } catch (err: any) {
        console.error("PlanAPI fetch error:", err);
      } finally {
        setIsLoadingPlans(false);
      }
    }

    fetchPlans();
  }, [isOpen, operator, circle]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const targetAccountId = sourceAccountId || activeAccounts[0]?.id || "";

    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!selectedPlan) {
      setErrorMsg("Please select a recharge plan.");
      return;
    }
    if (!targetAccountId) {
      setErrorMsg("Please select a source account.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onRecharge(targetAccountId, mobileNumber, `${operator} (${circle})`, selectedPlan.price);
      setSuccessMsg(`Mobile recharge of ₹${selectedPlan.price} for ${mobileNumber} (${operator} - ${circle}) successful!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Recharge failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  const filteredPlans = plans.filter(p => {
    // 1. Category Filter
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) {
      return false;
    }
    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchPrice = String(p.price).includes(q) || `₹${p.price}`.includes(q);
      const matchData = p.data.toLowerCase().includes(q);
      const matchVal = p.validity.toLowerCase().includes(q);
      const matchCalls = p.calls.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q) || false;
      return matchName || matchPrice || matchData || matchVal || matchCalls || matchDesc;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-5xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight font-headline-lg">Instant Mobile Recharge</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                  <Sparkles size={10} /> PlanAPI Live
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">Real-time Indian mobile prepaid plans by operator &amp; circle</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => { setErrorMsg(null); setSuccessMsg(null); onClose(); }}
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Mobile, Operator & Circle Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Mobile Number</label>
              <input
                type="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-on-surface font-mono font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Operator</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-on-surface"
              >
                <option value="Jio 5G Prepaid" className="bg-[#191f2f] text-[#dde2f8]">Jio 5G Prepaid</option>
                <option value="Airtel 5G" className="bg-[#191f2f] text-[#dde2f8]">Airtel 5G</option>
                <option value="Vi Prepaid" className="bg-[#191f2f] text-[#dde2f8]">Vi Prepaid</option>
                <option value="BSNL Special" className="bg-[#191f2f] text-[#dde2f8]">BSNL Special</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Telecom Circle</label>
              <select
                value={circle}
                onChange={(e) => setCircle(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-on-surface"
              >
                {CIRCLES.map(c => (
                  <option key={c} value={c} className="bg-[#191f2f] text-[#dde2f8]">{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Plan Search Input Bar */}
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans by price (e.g. 299), data (1.5GB), validity, or features..."
              className="w-full bg-surface-high/60 border border-outline-variant/20 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-on-surface-variant hover:text-on-surface p-1 rounded-md cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Plan Category Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 text-xs">
            {[
              { id: "ALL", label: "All Packs" },
              { id: "TRULY_UNLIMITED", label: "Truly Unlimited" },
              { id: "DATA", label: "Data Packs" },
              { id: "ENTERTAINMENT", label: "Entertainment" },
              { id: "ANNUAL", label: "Annual" },
              { id: "TOPUP", label: "TopUp" }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-on-surface-variant hover:text-on-surface bg-surface-high/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Select Plan List */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs text-on-surface-variant">
              <span className="font-medium">
                {isLoadingPlans ? "Refreshing PlanAPI..." : `Available Plans (${filteredPlans.length})`}
              </span>
              <span className="font-mono text-[10px] text-tertiary">{operator} • {circle}</span>
            </div>

            {filteredPlans.length === 0 ? (
              <div className="p-6 bg-surface-high/20 rounded-xl border border-outline-variant/10 text-center text-xs text-on-surface-variant">
                No matching plans found for &quot;{searchQuery || selectedCategory}&quot;. Try a different amount or search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredPlans.map(plan => {
                  const isSel = selectedPlan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSel 
                          ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                          : 'bg-surface-high/40 border-outline-variant/10 text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-bold text-on-surface line-clamp-1">{plan.name}</span>
                        <span className="text-xs font-mono font-bold text-primary shrink-0">₹{plan.price}</span>
                      </div>
                      
                      {plan.description && (
                        <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2 leading-tight">
                          {plan.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center text-[10px] mt-2 pt-1 border-t border-white/5 text-on-surface-variant font-mono">
                        <span>Val: {plan.validity}</span>
                        <span>{plan.data}</span>
                      </div>
                      {(plan.sms && plan.sms !== "NA" || plan.talktime) && (
                        <div className="flex justify-between text-[9px] mt-1 text-primary/80 font-mono">
                          {plan.sms && plan.sms !== "NA" && <span>SMS: {plan.sms}</span>}
                          {plan.talktime && <span>TT: {plan.talktime}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Source Account */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-on-surface-variant">Pay From Account</label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-on-surface"
            >
              {activeAccounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-[#191f2f] text-[#dde2f8]">
                  {acc.name} ({acc.maskedNumber}) {isAccountVerified(acc.id) ? `- ${formatCurrency(acc.balance)}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedPlan}
              className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Recharging...
                </>
              ) : (
                `Recharge ₹${selectedPlan?.price || 0}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
