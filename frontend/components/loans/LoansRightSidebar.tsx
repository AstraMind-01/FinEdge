import React from 'react';
import { Loan } from '../../types';
import { CalendarDays, ShieldCheck, Calculator, Percent, ExternalLink, Home, User, Car, GraduationCap } from 'lucide-react';

interface LoansRightSidebarProps {
  loans: Loan[];
}

export default function LoansRightSidebar({ loans }: LoansRightSidebarProps) {
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
                <p className="text-on-surface text-sm font-medium truncate">{emi.name.split(' - ')[0]}</p>
                <p className="text-on-surface-variant text-[11px]">{emi.date}</p>
              </div>
              <p className="text-on-surface font-bold text-sm shrink-0">₹{emi.amount.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loan Eligibility Check */}
      <div className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-2xl p-5 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none"></div>
        <h3 className="text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary" />
          Pre-Approved Offers
        </h3>
        <p className="text-on-surface-variant text-sm mb-4">Check your pre-approved loan offers instantly based on your credit score.</p>
        <button className="w-full bg-primary text-on-primary font-medium py-2.5 rounded-lg hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all text-sm">
          Check Eligibility
        </button>
      </div>

      {/* Prepayment Savings Calculator */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <Calculator size={16} className="text-primary" />
          Prepayment Savings
        </h3>
        <div className="bg-surface-container rounded-xl p-4 border border-white/5 mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant text-[12px]">Extra Payment</span>
            <span className="text-on-surface font-bold">₹50,000</span>
          </div>
          <div className="h-px bg-white/5 my-2"></div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant text-[12px]">Interest Saved</span>
            <span className="text-green-400 font-bold">₹12,340</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-[12px]">Tenure Reduced</span>
            <span className="text-primary font-bold">3 months</span>
          </div>
        </div>
        <button className="w-full text-primary text-sm font-medium hover:underline flex items-center justify-center gap-1">
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
            <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-surface-container border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <Percent size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface text-sm font-medium">{offer.type}</p>
                <p className="text-on-surface-variant text-[11px]">{offer.desc}</p>
              </div>
              <span className="text-primary font-bold text-sm shrink-0">{offer.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
