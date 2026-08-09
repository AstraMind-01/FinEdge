"use client";

import React, { useState } from "react";
import { Account } from "../../types";
import { X, Landmark, Briefcase, Lock, PiggyBank, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

interface ProductType {
  id: "savings" | "current" | "fd" | "rd";
  title: string;
  description: string;
  rate: string;
  minBal: string;
  features: string[];
}

const PRODUCTS: Record<string, ProductType> = {
  savings: {
    id: "savings",
    title: "High-Yield Savings Account",
    description: "Earn up to 4.00% p.a. interest with zero minimum balance requirements and instant virtual debit card issuance.",
    rate: "4.00% p.a.",
    minBal: "₹0 (Zero Balance)",
    features: [
      "Daily interest calculation & quarterly payout",
      "Free virtual Visa Platinum Debit Card",
      "Unlimited free IMPS / NEFT / UPI transactions",
      "DICGC deposit insurance protection up to ₹5,00,000"
    ]
  },
  current: {
    id: "current",
    title: "Business Current Account",
    description: "Designed for high-volume corporate transactions, POS merchant integration, and automated vendor payouts.",
    rate: "N/A (Business Account)",
    minBal: "₹10,000 / month",
    features: [
      "Unlimited free daily RTGS / NEFT / IMPS transfers",
      "Free POS Terminal & Payment Gateway integration",
      "Multi-user corporate internet banking access",
      "Customized Overdraft limit facility against receivables"
    ]
  },
  fd: {
    id: "fd",
    title: "High Yield Fixed Deposit",
    description: "Lock in guaranteed returns up to 7.25% p.a. with flexible tenure choices from 7 days to 10 years.",
    rate: "Up to 7.25% p.a.",
    minBal: "₹10,000 initial deposit",
    features: [
      "Guaranteed fixed returns backed by DICGC",
      "Premature withdrawal allowed with 0.5% penalty",
      "Loan against FD up to 90% of principal value",
      "Auto-renewal and monthly/quarterly payout options"
    ]
  },
  rd: {
    id: "rd",
    title: "Wealth Builder Recurring Deposit",
    description: "Build a solid wealth reserve by investing fixed monthly amounts from ₹1,000 to ₹50,000 at attractive rates.",
    rate: "Up to 7.10% p.a.",
    minBal: "₹1,000 / month",
    features: [
      "Automated monthly auto-debit from linked Savings account",
      "Tenure choices from 12 months to 60 months",
      "Compound interest calculated quarterly",
      "No penalty on late deposit up to 5 days grace period"
    ]
  }
};

interface Props {
  productId: "savings" | "current" | "fd" | "rd" | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAccount: (type: "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT" | "RECURRING_DEPOSIT") => Promise<void>;
}

export default function AccountProductModal({ productId, isOpen, onClose, onOpenAccount }: Props) {
  const [isOpening, setIsOpening] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !productId) return null;

  const product = PRODUCTS[productId] || PRODUCTS.savings;

  const handleOpenAccount = async () => {
    setIsOpening(true);
    try {
      const typeMap: Record<string, "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT" | "RECURRING_DEPOSIT"> = {
        savings: "SAVINGS",
        current: "CURRENT",
        fd: "FIXED_DEPOSIT",
        rd: "RECURRING_DEPOSIT"
      };
      await onOpenAccount(typeMap[productId]);
      setSuccessMsg(`New ${product.title} has been successfully provisioned & activated!`);
      setTimeout(() => {
        setSuccessMsg(null);
        setIsOpening(false);
        onClose();
      }, 1800);
    } catch (e) {
      setIsOpening(false);
    }
  };

  const getIcon = (id: string) => {
    if (id === "savings") return <Landmark size={22} className="text-tertiary" />;
    if (id === "current") return <Briefcase size={22} className="text-secondary" />;
    if (id === "fd") return <Lock size={22} className="text-primary-fixed" />;
    return <PiggyBank size={22} className="text-tertiary-fixed" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-surface-high rounded-xl">
              {getIcon(product.id)}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">{product.title}</h2>
              <p className="text-xs text-on-surface-variant">FinEdge Digital Account Offering</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg ? (
          <div className="p-4 bg-tertiary/10 border border-tertiary/20 rounded-xl flex items-center gap-3 text-tertiary text-xs font-medium my-2">
            <CheckCircle2 size={20} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-xs">
            {/* Rates Banner */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-surface-high/60 rounded-xl border border-outline-variant/10">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">Interest Yield</span>
                <p className="font-bold text-lg text-primary font-mono mt-0.5">{product.rate}</p>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium">Min. Balance Requirement</span>
                <p className="font-bold text-sm text-on-surface font-mono mt-0.5">{product.minBal}</p>
              </div>
            </div>

            <p className="text-on-surface-variant leading-relaxed">
              {product.description}
            </p>

            {/* Features List */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/10">
              <span className="font-semibold text-on-surface text-xs uppercase tracking-wider">Key Benefits</span>
              {product.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-on-surface-variant">
                  <CheckCircle2 size={16} className="text-tertiary shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Insurance Badge */}
            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant pt-2">
              <ShieldCheck size={16} className="text-tertiary shrink-0" />
              <span>Government backed DICGC Insurance Protection up to ₹5 Lakhs per depositor.</span>
            </div>

            {/* Footer Action */}
            <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleOpenAccount}
                disabled={isOpening}
                className="px-6 py-2.5 bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] font-medium rounded-xl text-sm transition-all flex items-center gap-2"
              >
                {isOpening ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Provisioning Account...
                  </>
                ) : (
                  <>
                    Open Account Now <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
