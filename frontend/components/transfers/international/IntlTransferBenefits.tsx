import React from 'react';
import { RefreshCw, Zap, ShieldCheck, MapPin } from 'lucide-react';

export default function IntlTransferBenefits() {
  const benefits = [
    { icon: <RefreshCw size={24} />, title: "Competitive Rates", desc: "Real-time exchange rates with no hidden markups." },
    { icon: <Zap size={24} />, title: "Fast Delivery", desc: "Most transfers arrive in 2-4 business days." },
    { icon: <ShieldCheck size={24} />, title: "Bank-Grade Security", desc: "Your money is protected by enterprise-level encryption." },
    { icon: <MapPin size={24} />, title: "Track 24/7", desc: "Know exactly where your money is at all times." }
  ];

  return (
    <div className="w-full mt-12 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h3 className="font-headline-sm text-[20px] font-bold text-on-surface">Why Transfer with FinEdge?</h3>
        <div className="h-px bg-outline-variant/20 flex-1"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((b, i) => (
          <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-surface border border-outline-variant/10 hover:border-primary/30 hover:bg-surface-high transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              {b.icon}
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <span className="font-bold text-[15px] text-on-surface">{b.title}</span>
              <span className="text-[13px] text-on-surface-variant leading-relaxed">{b.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
