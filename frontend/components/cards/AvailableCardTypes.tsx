"use client";

import React, { useState } from 'react';
import { CreditCard, Smartphone, ShieldCheck, ArrowRight, X, CheckCircle2, Sparkles, Globe, Lock } from 'lucide-react';

interface AvailableCardTypesProps {
  onCardApplied?: (cardType: string) => void;
}

interface OptionItem {
  title: string;
  type: string;
  icon: React.ReactNode;
  desc: string;
  bg: string;
  borderColor: string;
  variants: string[];
}

export default function AvailableCardTypes({ onCardApplied }: AvailableCardTypesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<OptionItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('Signature');
  const [selectedAccount, setSelectedAccount] = useState('ACC-001');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const options = [
    {
      title: "Credit Cards",
      type: "CREDIT",
      icon: <CreditCard className="text-[#a379c9]" size={24} />,
      desc: "Earn 5x rewards, airport lounge access, and exclusive lifestyle benefits.",
      bg: "from-[#2D1B4E]/40 to-transparent",
      borderColor: "border-[#4A2B7F]/50",
      variants: ["Signature Infinite", "Titanium Cashback", "Millennia Rewards"]
    },
    {
      title: "Debit Cards",
      type: "DEBIT",
      icon: <CreditCard className="text-blue-400" size={24} />,
      desc: "Zero markup on international spends and instant ATM withdrawals.",
      bg: "from-[#1A2E4C]/40 to-transparent",
      borderColor: "border-[#2A4B7C]/50",
      variants: ["Platinum Privilege", "Classic Rewards", "Business Debit"]
    },
    {
      title: "Virtual Cards",
      type: "VIRTUAL",
      icon: <Smartphone className="text-teal-400" size={24} />,
      desc: "Instantly generated for secure, one-time online shopping.",
      bg: "from-[#14494E]/40 to-transparent",
      borderColor: "border-[#1B656C]/50",
      variants: ["Cyber Instant Pass", "One-Time Burner", "Subscription Shield"]
    },
    {
      title: "Prepaid Forex",
      type: "FOREX",
      icon: <ShieldCheck className="text-green-400" size={24} />,
      desc: "Load multiple currencies and travel the world cashless.",
      bg: "from-green-900/30 to-transparent",
      borderColor: "border-green-800/50",
      variants: ["Global Multi-Currency Pass", "USD World Pass", "EUR EuroTraveler"]
    }
  ];

  const handleOpenApplyModal = (opt: typeof options[0]) => {
    setSelectedCardType(opt);
    setSelectedVariant(opt.variants[0]);
    setModalOpen(true);
    setApplySuccess(false);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setApplySuccess(true);
      if (onCardApplied && selectedCardType) {
        onCardApplied(selectedCardType.title);
      }
      setTimeout(() => {
        setApplySuccess(false);
        setModalOpen(false);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="mt-8">
      <h3 className="text-base sm:text-lg font-bold text-on-surface mb-4">Available Card Types</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((opt, i) => (
          <div 
            key={i} 
            onClick={() => handleOpenApplyModal(opt)}
            className={`bg-gradient-to-br ${opt.bg} rounded-2xl p-5 border ${opt.borderColor} hover:border-primary/50 transition-all group cursor-pointer flex flex-col justify-between hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)]`}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                {opt.icon}
              </div>
              <h4 className="text-on-surface font-bold text-sm mb-2">{opt.title}</h4>
              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{opt.desc}</p>
            </div>
            
            <button 
              type="button"
              className="text-primary text-xs font-bold hover:underline flex items-center gap-1.5 group-hover:translate-x-1 transition-transform self-start mt-auto"
            >
              Apply Now <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Apply Card Modal */}
      {modalOpen && selectedCardType && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4">
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000]">
            
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  {selectedCardType.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Apply for {selectedCardType.title}</h3>
                  <p className="text-[11px] text-on-surface-variant">Instant digital approval &amp; issuance</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={18} />
              </button>
            </div>

            {applySuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 size={48} className="text-tertiary animate-bounce" />
                <span className="text-sm font-bold text-on-surface">Application Approved &amp; Issued!</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your new <strong>{selectedVariant}</strong> ({selectedCardType.title}) is generated instantly and ready for use.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                
                {/* Select Variant */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Select Card Variant</label>
                  <select 
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
                  >
                    {selectedCardType.variants.map((v, idx) => (
                      <option key={idx} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Linked Account */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-on-surface-variant">Linked Bank Account</label>
                  <select 
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary font-mono"
                  >
                    <option value="ACC-001">Primary Savings Account (ACC-001 •••• 8812)</option>
                    <option value="ACC-002">Business Current Account (ACC-002 •••• 3341)</option>
                  </select>
                </div>

                {/* Card Perks */}
                <div className="p-3.5 bg-surface rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-on-surface font-semibold text-[11px]">
                    <Sparkles size={14} className="text-primary shrink-0" />
                    <span>Instant Digital Activation &amp; Zero Joining Fee</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
                    <Lock size={14} className="text-tertiary shrink-0" />
                    <span>Includes 256-bit Tokenization for UPI &amp; Tap-To-Pay</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3">
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 bg-surface-high text-on-surface font-semibold rounded-xl hover:bg-surface-highest text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] disabled:opacity-40 transition-all text-xs"
                  >
                    {isSubmitting ? "Processing..." : "Submit Application"}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
