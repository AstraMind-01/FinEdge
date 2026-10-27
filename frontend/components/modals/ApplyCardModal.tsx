"use client";

import React, { useState } from "react";
import { X, CreditCard, Smartphone, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Sparkles, Lock, Shield, ArrowRight, ArrowLeft, KeyRound, Palette, User } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";
import { MockApi } from "../../lib/mockApi";
import { BankCard } from "../../types";

interface ApplyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSubmitted?: (newCard?: BankCard) => void;
}

const CARD_CATEGORIES = [
  {
    type: "CREDIT",
    title: "Credit Card",
    desc: "Earn 5x rewards, lounge access & lifestyle perks",
    icon: CreditCard,
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    variants: ["Signature Infinite", "Titanium Cashback", "Millennia Rewards"]
  },
  {
    type: "DEBIT",
    title: "Debit Card",
    desc: "Zero international markup & instant ATM access",
    icon: CreditCard,
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    variants: ["Platinum Privilege", "Classic Rewards", "Business Debit"]
  },
  {
    type: "VIRTUAL",
    title: "Virtual Pass",
    desc: "Instantly generated for secure online shopping",
    icon: Smartphone,
    color: "text-teal-400 bg-teal-400/10 border-teal-400/20",
    variants: ["Cyber Instant Pass", "One-Time Burner", "Subscription Shield"]
  },
  {
    type: "FOREX",
    title: "Prepaid Forex",
    desc: "Multi-currency pass for international travel",
    icon: ShieldCheck,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    variants: ["Global Multi-Currency Pass", "USD World Pass", "EUR EuroTraveler"]
  }
];

const CARD_THEMES = [
  { id: "purple-gold", name: "Signature Obsidian", bg: "bg-gradient-to-br from-[#1c1536] via-[#2a1b4e] to-[#0d0a1a]", border: "border-amber-500/40", badge: "Obsidian", colorCircle: "from-purple-600 to-amber-400" },
  { id: "gold", name: "Gold Elite Metallic", bg: "bg-gradient-to-br from-[#4a3b10] via-[#85671d] to-[#261e05]", border: "border-yellow-300/50", badge: "Gold", colorCircle: "from-yellow-400 to-amber-600" },
  { id: "teal-silver", name: "Cyber Neon Teal", bg: "bg-gradient-to-br from-[#0b2b28] via-[#124d47] to-[#041412]", border: "border-teal-400/40", badge: "Teal", colorCircle: "from-teal-400 to-cyan-600" },
  { id: "navy-gold", name: "Royal Sapphire", bg: "bg-gradient-to-br from-[#0f1c3f] via-[#1a2f66] to-[#070e20]", border: "border-indigo-400/40", badge: "Sapphire", colorCircle: "from-blue-600 to-indigo-400" },
  { id: "silver", name: "Titanium Minimal", bg: "bg-gradient-to-br from-[#27272a] via-[#3f3f46] to-[#18181b]", border: "border-zinc-300/30", badge: "Titanium", colorCircle: "from-zinc-400 to-slate-200" }
];

export default function ApplyCardModal({ isOpen, onClose, onCardSubmitted }: ApplyCardModalProps) {
  const { userProfile, accounts } = useAccounts();
  const activeAccounts = accounts.filter(a => a.type === "SAVINGS" || a.type === "CURRENT");

  const [step, setStep] = useState<"FORM" | "PIN_VERIFICATION" | "RESULT">("FORM");
  const [selectedCategory, setSelectedCategory] = useState(CARD_CATEGORIES[0]);
  const [selectedVariant, setSelectedVariant] = useState(CARD_CATEGORIES[0].variants[0]);
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [engravedName, setEngravedName] = useState(userProfile.name ? userProfile.name.toUpperCase() : "SOUMYA RANJAN");
  const [selectedAccountId, setSelectedAccountId] = useState(activeAccounts[0]?.id || "ACC-001");
  const [monthlyIncome, setMonthlyIncome] = useState("65000");
  const [requestedLimit, setRequestedLimit] = useState("150000");
  const [securityPin, setSecurityPin] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any | null>(null);
  const [createdCard, setCreatedCard] = useState<BankCard | null>(null);

  if (!isOpen) return null;

  const handleCategorySelect = (cat: typeof CARD_CATEGORIES[0]) => {
    setSelectedCategory(cat);
    setSelectedVariant(cat.variants[0]);
    setErrorMsg(null);
  };

  const handleGoToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSecurityPin("");
    setStep("PIN_VERIFICATION");
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityPin.length < 4) {
      setErrorMsg("Please enter your valid 4-digit Security PIN.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Submit backend authorization request
      let backendData: any = null;
      try {
        const res = await fetch("/api/cards/apply", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-Security-PIN": securityPin
          },
          body: JSON.stringify({
            cardType: selectedCategory.type,
            cardVariant: selectedVariant,
            cardTheme: selectedTheme.id,
            engravedName: engravedName || "SOUMYA RANJAN",
            accountId: selectedAccountId,
            monthlyIncome: Number(monthlyIncome),
            requestedLimit: Number(requestedLimit),
            securityPin
          })
        });

        if (res.status === 409) {
          const d = await res.json();
          setErrorMsg(d.error || "An application for this card type is already under review.");
          setIsSubmitting(false);
          return;
        }

        if (res.ok) {
          backendData = await res.json();
        }
      } catch (err) {
        console.warn("Backend API unavailable, executing local card issuance:", err);
      }

      // 2. Build newly issued BankCard object that REALLY appears in cards carousel & list
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const prefix = selectedCategory.type === "CREDIT" ? "5412" : "4532";
      const fullCardNum = `${prefix} 8812 3456 ${randomSuffix}`;

      const newBankCard: BankCard = {
        id: backendData?.issuedCard?.cardId || `CARD-${Date.now()}`,
        name: `FinEdge ${selectedVariant}`,
        cardHolderName: engravedName || "SOUMYA RANJAN",
        cardholderName: engravedName || "SOUMYA RANJAN",
        cardNumber: backendData?.issuedCard?.cardNumber || `${prefix} •••• •••• ${randomSuffix}`,
        fullNumber: fullCardNum,
        maskedNumber: `•••• ${randomSuffix}`,
        expiryDate: `${backendData?.issuedCard?.expiryMonth || '08'}/${backendData?.issuedCard?.expiryYear || '31'}`,
        expiry: `${backendData?.issuedCard?.expiryMonth || '08'}/${backendData?.issuedCard?.expiryYear || '31'}`,
        cvv: backendData?.issuedCard?.cvv || String(Math.floor(100 + Math.random() * 900)),
        type: selectedCategory.type === "CREDIT" ? "CREDIT" : "DEBIT",
        variant: selectedVariant,
        tier: selectedVariant.split(" ")[0],
        theme: selectedTheme.id,
        status: "ACTIVE",
        network: selectedCategory.type === "CREDIT" ? "VISA" : "MASTERCARD",
        linkedAccountId: selectedAccountId,
        creditLimit: Number(requestedLimit) || 150000,
        availableCredit: Number(requestedLimit) || 150000,
        spentThisMonth: 0,
        rewardPoints: 1000,
        rewardsPoints: 1000,
        isDefault: false,
        controls: {
          onlineTransactions: true,
          internationalTx: true,
          internationalUsage: true,
          contactless: true,
          contactlessPayments: true,
          atmWithdrawals: true,
          posTransactions: true,
          dailyLimit: 100000,
          atmLimit: 25000,
          dailyAtmLimit: 25000,
          dailyPosLimit: 75000,
          onlineLimit: 100000
        }
      };

      // Persist in MockApi store so it REALLY appears on the Cards page
      await MockApi.addCard(newBankCard);

      const finalResultData = backendData || {
        applicationId: `CRD-APP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "APPROVED",
        cardType: selectedCategory.type,
        cardVariant: selectedVariant,
        issuedCard: {
          cardNumber: newBankCard.cardNumber,
          cvv: newBankCard.cvv,
          expiryMonth: "08",
          expiryYear: "31"
        }
      };

      setResultData(finalResultData);
      setCreatedCard(newBankCard);
      setStep("RESULT");

      if (onCardSubmitted) {
        onCardSubmitted(newBankCard);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setStep("FORM");
    setErrorMsg(null);
    setSecurityPin("");
    setResultData(null);
    setCreatedCard(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6 animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl z-[10060] my-auto flex flex-col gap-5 text-on-surface max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary flex items-center justify-center border border-primary/20">
              {step === "PIN_VERIFICATION" ? <KeyRound size={22} /> : <CreditCard size={22} />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg m-0">
                {step === "PIN_VERIFICATION" ? "Security PIN Authorization" : "Apply for New FinEdge Card"}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5 m-0">
                {step === "PIN_VERIFICATION" ? "2FA Authentication Barrier" : "Custom design & instant card issuance"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleCloseModal}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP 3: RESULT VIEW */}
        {step === "RESULT" && resultData && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-on-surface">
                {resultData.status === "APPROVED" ? "Application Approved & Card Issued!" : "Application Submitted under Review"}
              </h3>
              <p className="text-xs font-mono text-primary font-semibold">
                Application ID: {resultData.applicationId}
              </p>
            </div>

            {/* Issued Card Preview */}
            <div className={`relative w-full h-44 rounded-2xl p-5 border shadow-xl flex flex-col justify-between overflow-hidden text-left ${selectedTheme.bg} ${selectedTheme.border}`}>
              <div className="flex justify-between items-start z-10">
                <span className="font-headline-lg font-bold text-base text-primary">FinEdge</span>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">{selectedVariant}</span>
              </div>
              <div className="my-1 z-10">
                <p className="font-mono text-sm tracking-[0.25em] text-on-surface font-bold">
                  {createdCard?.cardNumber || "•••• •••• •••• 4599"}
                </p>
              </div>
              <div className="flex justify-between items-end z-10">
                <div className="flex flex-col">
                  <span className="text-[8px] text-on-surface-variant uppercase">Engraved Name</span>
                  <span className="font-mono text-xs font-bold text-on-surface uppercase">{engravedName}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-on-surface-variant uppercase">Expiry / CVV</span>
                  <span className="font-mono text-xs font-bold text-on-surface">08/31 • {createdCard?.cvv || "782"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer mt-2"
            >
              Done &amp; View Cards
            </button>
          </div>
        )}

        {/* STEP 2: SECURITY PIN VERIFICATION */}
        {step === "PIN_VERIFICATION" && (
          <form onSubmit={handleFinalSubmit} className="flex flex-col gap-5 text-xs py-2">
            <div className="p-4 bg-surface-high/60 border border-outline-variant/10 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Selected Card:</span>
                <span className="font-bold text-on-surface">{selectedCategory.title} ({selectedVariant})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Design Theme:</span>
                <span className="font-semibold text-primary">{selectedTheme.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Engraved Name:</span>
                <span className="font-mono font-bold text-on-surface">{engravedName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-center text-center">
              <label className="font-bold text-on-surface text-sm">Enter 4-Digit Security PIN / MPIN</label>
              <p className="text-[11px] text-on-surface-variant">
                Authorize instant card tokenization and digital issuance.
              </p>
              
              <input
                type="password"
                maxLength={4}
                value={securityPin}
                onChange={(e) => {
                  setSecurityPin(e.target.value.replace(/\D/g, ""));
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="••••"
                autoFocus
                className="w-48 bg-surface-high border border-outline-variant/30 rounded-xl p-3.5 text-center text-2xl font-mono font-bold tracking-[0.4em] focus:outline-none focus:border-primary text-on-surface mt-2"
              />
              <span className="text-[11px] text-on-surface-variant mt-1">Demo Security PIN: <strong className="text-primary font-mono">1234</strong></span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-error text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setStep("FORM")}
                className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || securityPin.length < 4}
                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-40 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Issuing Card...
                  </>
                ) : (
                  <>
                    Authorize &amp; Issue Card <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 1: CARD APPLICATION FORM WITH LIVE PREVIEW & ENGRAVING */}
        {step === "FORM" && (
          <form onSubmit={handleGoToPin} className="flex flex-col gap-4 text-xs">
            
            {/* Live Interactive Card Preview */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface-variant flex items-center justify-between">
                <span>Live Card Preview</span>
                <span className="text-[10px] text-primary font-mono uppercase tracking-wider">Custom Design &amp; Engraving</span>
              </label>
              
              <div className={`relative w-full h-44 rounded-2xl p-5 border shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${selectedTheme.bg} ${selectedTheme.border}`}>
                {/* Metallic Sheen Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -rotate-45 pointer-events-none"></div>

                {/* Top Row: Logo & Variant */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-lg font-bold text-base text-primary tracking-tight">FinEdge</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface/40 border border-white/10 text-on-surface-variant font-mono uppercase">
                      {selectedCategory.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400/90 tracking-widest uppercase">
                    {selectedVariant}
                  </span>
                </div>

                {/* Middle Row: Chip & Card Number */}
                <div className="flex justify-between items-center z-10 my-1">
                  <div className="w-9 h-7 rounded-md bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-300/60 rounded-sm"></div>
                  </div>
                  <p className="font-mono text-sm tracking-[0.25em] text-on-surface font-bold">
                    •••• •••• •••• 4599
                  </p>
                </div>

                {/* Bottom Row: Custom Engraved Name & Expiry */}
                <div className="flex justify-between items-end z-10">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-on-surface-variant uppercase tracking-wider">Engraved Name</span>
                    <span className="font-mono text-xs font-bold text-on-surface tracking-wider truncate max-w-[220px]">
                      {engravedName || "YOUR NAME HERE"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-on-surface-variant uppercase tracking-wider">Expiry</span>
                    <span className="font-mono text-xs font-bold text-on-surface">08/31</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-on-surface-variant uppercase tracking-wider text-[11px]">Select Card Type</label>
              <div className="grid grid-cols-2 gap-2.5">
                {CARD_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.type === cat.type;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary/10 shadow-sm' 
                          : 'border-outline-variant/10 bg-surface-high/40 hover:bg-surface-high'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${cat.color}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface m-0 text-xs">{cat.title}</p>
                        <p className="text-[10px] text-on-surface-variant leading-tight m-0 mt-0.5 line-clamp-2">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Choose Card Design Theme */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-on-surface-variant flex items-center justify-between">
                <span>Choose Card Design Theme</span>
                <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                  <Palette size={12} /> {selectedTheme.name}
                </span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CARD_THEMES.map((theme) => {
                  const isSel = selectedTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${theme.bg} ${
                        isSel ? 'border-primary shadow-[0_0_12px_rgba(240,180,41,0.4)] ring-1 ring-primary' : 'border-outline-variant/20 hover:border-outline-variant/40'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border border-white/30 shadow-inner bg-gradient-to-r ${theme.colorCircle}`}></div>
                      <span className="text-[10px] font-semibold text-on-surface truncate w-full text-center">{theme.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Name Engraving Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface-variant flex justify-between items-center">
                <span>Custom Name Engraving</span>
                <span className="text-[10px] text-on-surface-variant/70 font-mono">Real-time live preview</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-on-surface-variant" />
                <input
                  type="text"
                  value={engravedName}
                  onChange={(e) => setEngravedName(e.target.value.toUpperCase())}
                  placeholder="ENTER CUSTOM ENGRAVED NAME"
                  maxLength={26}
                  className="w-full bg-surface-high border border-outline-variant/20 rounded-xl py-2.5 pl-10 pr-3 text-xs text-on-surface font-mono font-bold tracking-wider focus:outline-none focus:border-primary uppercase"
                />
              </div>
            </div>

            {/* Select Card Variant */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface-variant">Card Variant</label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
              >
                {selectedCategory.variants.map((v, idx) => (
                  <option key={idx} value={v} className="bg-[#191f2f] text-[#dde2f8]">
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Linked Bank Account */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface-variant">Link to Bank Account</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-xs text-on-surface font-medium focus:outline-none focus:border-primary font-mono"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="bg-[#191f2f] text-[#dde2f8]">
                    {acc.name} ({acc.maskedNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Income & Limit Fields for Credit Cards */}
            {selectedCategory.type === "CREDIT" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                    placeholder="65000"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Requested Limit (₹)</label>
                  <input
                    type="number"
                    value={requestedLimit}
                    onChange={(e) => setRequestedLimit(e.target.value)}
                    className="w-full bg-surface-high border border-outline-variant/20 rounded-xl p-3 text-xs text-on-surface font-semibold focus:outline-none focus:border-primary"
                    placeholder="150000"
                  />
                </div>
              </div>
            )}

            {/* Perks & Security Info */}
            <div className="p-3 bg-surface-high/40 rounded-xl border border-outline-variant/10 space-y-1.5">
              <div className="flex items-center gap-2 text-on-surface font-semibold text-[11px]">
                <Sparkles size={14} className="text-primary shrink-0" />
                <span>Instant Digital Tokenization &amp; Custom Laser Engraving</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
                <Shield size={14} className="text-tertiary shrink-0" />
                <span>Requires 4-Digit Security PIN Verification</span>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all text-xs flex items-center gap-2 cursor-pointer"
              >
                Continue to Verification <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
