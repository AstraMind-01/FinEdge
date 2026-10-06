"use client";

import React, { useState } from "react";
import { X, CreditCard, Sparkles, KeyRound, Palette, User, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";
import { MockApi } from "../../lib/mockApi";
import { BankCard } from "../../types";
import { CARD_CATEGORIES, CARD_THEMES } from "./cardApplication/cardConfig";
import CardLivePreview from "./cardApplication/CardLivePreview";
import CardResultView from "./cardApplication/CardResultView";

interface ApplyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSubmitted?: (newCard?: BankCard) => void;
}

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
      const generatedLast4 = Math.floor(1000 + Math.random() * 9000).toString();
      const generatedFullCardNumber = `4092 8821 7744 ${generatedLast4}`;
      const generatedCvv = Math.floor(100 + Math.random() * 900).toString();
      const cardTypeFormatted = selectedCategory.type as "CREDIT" | "DEBIT" | "FOREX" | "VIRTUAL";

      const newBankCard: BankCard = {
        id: `CARD-${Date.now()}`,
        cardNumber: generatedFullCardNumber,
        lastFour: generatedLast4,
        cardholderName: engravedName || userProfile.name.toUpperCase(),
        expiryMonth: "08",
        expiryYear: "31",
        cvv: generatedCvv,
        type: cardTypeFormatted,
        variant: selectedVariant,
        theme: selectedTheme.id,
        status: "ACTIVE",
        isContactless: true,
        isInternational: true,
        isOnline: true,
        dailyLimit: Number(requestedLimit) || 100000,
        monthlyLimit: (Number(requestedLimit) || 100000) * 3,
        spendingByCategory: { Shopping: 0, Travel: 0, Dining: 0, Others: 0 },
        linkedAccount: selectedAccountId,
        rewardsPoints: 500
      };

      await MockApi.addCard(newBankCard);

      const finalResultData = {
        status: "APPROVED",
        applicationId: `APP-CRD-${Math.floor(100000 + Math.random() * 900000)}`,
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

        {step === "RESULT" && resultData && (
          <CardResultView
            resultData={resultData}
            createdCard={createdCard}
            selectedTheme={selectedTheme}
            selectedVariant={selectedVariant}
            engravedName={engravedName}
            onDone={handleCloseModal}
          />
        )}

        {step === "PIN_VERIFICATION" && (
          <form onSubmit={handleFinalSubmit} className="flex flex-col gap-5 text-xs py-2">
            <div className="p-4 bg-surface-high/60 border border-outline-variant/10 rounded-xl flex flex-col gap-2">
              <span className="font-semibold text-on-surface">Card Order Summary</span>
              <div className="flex justify-between text-on-surface-variant">
                <span>Card Type &amp; Variant:</span>
                <span className="font-bold text-on-surface">{selectedCategory.title} ({selectedVariant})</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Engraved Name:</span>
                <span className="font-bold text-on-surface">{engravedName}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Requested Limit:</span>
                <span className="font-bold text-primary font-mono">₹{Number(requestedLimit).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-on-surface text-center">
                Enter your 4-Digit Security PIN (Default: 1234)
              </label>
              <input 
                type="password"
                required
                maxLength={4}
                autoFocus
                autoComplete="off"
                placeholder="••••"
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                className="w-full max-w-[200px] mx-auto bg-surface border border-outline-variant/30 rounded-xl py-3 text-center text-2xl font-mono tracking-[1em] focus:outline-none focus:border-primary text-primary"
              />
            </div>

            {errorMsg && (
              <p className="text-error text-center font-medium m-0">{errorMsg}</p>
            )}

            <div className="flex gap-3 pt-2 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={() => setStep("FORM")}
                className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || securityPin.length < 4}
                className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null} Authorize &amp; Issue Card
              </button>
            </div>
          </form>
        )}

        {step === "FORM" && (
          <form onSubmit={handleGoToPin} className="flex flex-col gap-5 text-xs">
            {/* Category Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-on-surface">1. Select Card Type</label>
              <div className="grid grid-cols-2 gap-2.5">
                {CARD_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory.type === cat.type;
                  return (
                    <div
                      key={cat.type}
                      onClick={() => handleCategorySelect(cat)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected 
                          ? 'bg-primary/10 border-primary shadow-sm' 
                          : 'bg-surface-high/40 border-outline-variant/20 hover:border-outline-variant/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={isSelected ? 'text-primary' : 'text-on-surface-variant'} />
                        <span className={`font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{cat.title}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant m-0 leading-relaxed">{cat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Variant Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-bold text-on-surface">2. Select Card Tier &amp; Edition</label>
              <div className="grid grid-cols-3 gap-2">
                {selectedCategory.variants.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer ${
                      selectedVariant === v
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface border-outline-variant/20 text-on-surface hover:bg-surface-high'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme / Styling */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-on-surface flex items-center gap-1.5">
                  <Palette size={14} className="text-primary" /> 3. Card Visual Styling
                </label>
                <span className="text-[11px] text-primary font-semibold">{selectedTheme.name}</span>
              </div>
              <div className="flex gap-2">
                {CARD_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`flex-1 p-2 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      selectedTheme.id === theme.id ? 'border-primary ring-2 ring-primary/30' : 'border-outline-variant/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${theme.colorCircle}`} />
                    <span className="text-[9px] text-on-surface font-semibold">{theme.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Visual Card */}
            <CardLivePreview
              theme={selectedTheme}
              variant={selectedVariant}
              engravedName={engravedName}
            />

            {/* Name Customization */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-on-surface-variant flex items-center gap-1.5">
                <User size={13} /> Name to Engrave on Card
              </label>
              <input
                type="text"
                required
                maxLength={24}
                value={engravedName}
                onChange={(e) => setEngravedName(e.target.value.toUpperCase())}
                placeholder="YOUR NAME"
                className="bg-surface border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface uppercase font-mono tracking-wider focus:outline-none focus:border-primary font-bold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer flex items-center gap-2"
              >
                Proceed to Security Authorization <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
