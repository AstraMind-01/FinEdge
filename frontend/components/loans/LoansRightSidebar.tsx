"use client";

import React, { useState } from 'react';
import { Loan } from '../../types';
import { CalendarDays, ShieldCheck, Calculator, Percent, ExternalLink, Home, User, Car, GraduationCap } from 'lucide-react';

interface LoansRightSidebarProps {
  loans: Loan[];
  onCheckEligibility?: () => void;
  onApplyOffer?: (type: string, rate: string) => void;
  onOpenFullCalculator?: () => void;
}

export default function LoansRightSidebar({ loans, onCheckEligibility, onApplyOffer, onOpenFullCalculator }: LoansRightSidebarProps) {
  const [extraPayment, setExtraPayment] = useState<number>(115000);

  // Dynamic Prepayment Calculator Math
  const interestSaved = Math.round(extraPayment * 0.2468);
  const tenureReduced = Math.max(1, Math.round(extraPayment / 15000));

  // Gather upcoming EMIs across all loans
  const upcomingEmis = loans
    .filter(l => l.status !== 'CLOSED')
    .map(l => ({ name: l.name, type: l.type, amount: l.nextEmiAmount, date: l.nextEmiDate }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const typeIcons: Record<string, React.ReactNode> = {
    HOME: <Home size={14} />,
    PERSONAL: <User size={14} />,
    CAR: <Car size={14} />,
    EDUCATION: <GraduationCap size={14} />,
  };

  return (
    <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">

      {/* EMI Calendar */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          EMI Calendar
        </h3>
        <div className="space-y-3">
          {upcomingEmis.map((emi, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {typeIcons[emi.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface text-xs font-bold truncate">{emi.name.split(' - ')[0]}</p>
                <p className="text-on-surface-variant text-[11px] font-mono">{emi.date}</p>
              </div>
              <p className="text-on-surface font-bold text-xs shrink-0 font-mono">₹{emi.amount.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loan Eligibility Check */}
      <div className="bg-gradient-to-br from-surface-container-low via-surface-container-low to-surface-container rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          Pre-Approved Offers
        </h3>
        <p className="text-on-surface-variant text-xs mb-4 leading-relaxed">Check pre-approved credit line up to ₹15,00,000 instantly with 0 processing fee.</p>
        <button 
          type="button"
          onClick={onCheckEligibility}
          className="w-full bg-primary text-on-primary font-bold py-2.5 rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all text-xs"
        >
          Check Eligibility
        </button>
      </div>

      {/* Prepayment Savings Calculator */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <Calculator size={16} className="text-primary" />
          Prepayment Savings
        </h3>
        <div className="bg-surface-container rounded-xl p-4 border border-white/5 mb-3 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Extra Payment</span>
            <span className="text-on-surface font-mono font-bold">₹{extraPayment.toLocaleString('en-IN')}</span>
          </div>

          <input 
            type="range" 
            min={10000} 
            max={200000} 
            step={5000}
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer h-1.5 bg-surface-container-highest rounded-lg"
          />

          <div className="h-px bg-white/5 my-1"></div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Interest Saved</span>
            <span className="text-green-400 font-mono font-bold">₹{interestSaved.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Tenure Reduced</span>
            <span className="text-primary font-mono font-bold">{tenureReduced} months</span>
          </div>
        </div>
        <button 
          type="button"
          onClick={onOpenFullCalculator || onCheckEligibility}
          className="w-full text-primary text-xs font-bold hover:underline flex items-center justify-center gap-1"
        >
          Open Full Calculator <ExternalLink size={12} />
        </button>
      </div>

      {/* Loan Offers */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <Percent size={16} className="text-primary" />
          Loan Offers
        </h3>
        <div className="space-y-3">
          {[
            { type: "Personal Loan", rate: "10.25%", desc: "Instant approval, minimal docs" },
            { type: "Home Top-up", rate: "8.75%", desc: "Extend your existing home loan" },
            { type: "Education Loan", rate: "7.50%", desc: "Moratorium till course completion" },
          ].map((offer, i) => (
            <div 
              key={i} 
              onClick={() => onApplyOffer && onApplyOffer(offer.type, offer.rate)}
              className="flex gap-3 items-center p-3 rounded-xl bg-surface-container border border-white/5 hover:border-primary/40 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <Percent size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface text-xs font-bold">{offer.type}</p>
                <p className="text-on-surface-variant text-[11px]">{offer.desc}</p>
              </div>
              <span className="text-primary font-mono font-bold text-xs shrink-0">{offer.rate}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
