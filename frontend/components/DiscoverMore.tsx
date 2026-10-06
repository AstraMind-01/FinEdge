"use client";

import React, { useState } from 'react';
import { Home, Sparkles, ShieldCheck, CreditCard, Headphones } from 'lucide-react';
import ElevateFinancesModal, { ElevateServiceType } from './modals/ElevateFinancesModal';

export default function DiscoverMore() {
  const [activeService, setActiveService] = useState<ElevateServiceType | null>(null);

  return (
    <>
      <section className="relative w-full rounded-2xl overflow-hidden shadow-xl group">
        <div className="absolute inset-0 bg-cover bg-center w-full h-full z-0 transition-transform duration-1000 group-hover:scale-105" style={{"backgroundImage": "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCTF_tAQ_QXh_NOIKy4eKkXJTJAqVV3XYCnGCiJyklCAelNwFKYoGCEYbG5SFHegvSDrZv7cmlYEY4cAqB6S0-EjNhUQRc8WKOAApV8cZaIjqRBU9QNxlxt4ciE_drGXjYW6ToJZluoCRTI2PxLHwrcWagPDJ_w-Fr_JWRRmuKi4WJ7fbRdrjyYBnnJE-WvmIC_veB3RhUcq6X6wCS1OUaBrU73c-YPGorKhtBASqx16-dQimbt_vk6WQ')"}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-surface-dim/80 to-surface-dim/40 z-10 backdrop-blur-[2px]"></div>
        <div className="relative z-20 flex flex-col p-6 lg:p-8 gap-6 h-full justify-end">
          <div className="flex flex-col gap-1 max-w-xl">
            <span className="text-primary text-[11px] uppercase tracking-[0.15em] font-bold">Discover More</span>
            <h2 className="text-[28px] lg:text-[32px] text-on-surface font-bold drop-shadow-lg leading-tight mt-1">Elevate Your Finances</h2>
            <p className="text-[14px] text-on-surface-variant mt-1">Explore premium services tailored for your wealth management needs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
            <div 
              onClick={() => setActiveService("HOME_LOANS")}
              className="bg-surface/60 backdrop-blur-md p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group/tile flex flex-col items-center text-center gap-2"
            >
              <Home className="text-on-surface group-hover/tile:text-primary transition-colors" size={24} />
              <span className="text-[13px] text-on-surface font-medium">Home Loans</span>
            </div>

            <div 
              onClick={() => setActiveService("WEALTH_MGMT")}
              className="bg-surface/60 backdrop-blur-md p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group/tile flex flex-col items-center text-center gap-2"
            >
              <Sparkles className="text-on-surface group-hover/tile:text-primary transition-colors" size={24} />
              <span className="text-[13px] text-on-surface font-medium">Wealth Mgmt</span>
            </div>

            <div 
              onClick={() => setActiveService("INSURANCE")}
              className="bg-surface/60 backdrop-blur-md p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group/tile flex flex-col items-center text-center gap-2"
            >
              <ShieldCheck className="text-on-surface group-hover/tile:text-primary transition-colors" size={24} />
              <span className="text-[13px] text-on-surface font-medium">Insurance</span>
            </div>

            <div 
              onClick={() => setActiveService("PREMIUM_CARDS")}
              className="bg-surface/60 backdrop-blur-md p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group/tile flex flex-col items-center text-center gap-2"
            >
              <CreditCard className="text-on-surface group-hover/tile:text-primary transition-colors" size={24} />
              <span className="text-[13px] text-on-surface font-medium">Premium Cards</span>
            </div>

            <div 
              onClick={() => setActiveService("CONCIERGE")}
              className="bg-surface/60 backdrop-blur-md p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors cursor-pointer group/tile flex flex-col items-center text-center gap-2"
            >
              <Headphones className="text-on-surface group-hover/tile:text-primary transition-colors" size={24} />
              <span className="text-[13px] text-on-surface font-medium">Concierge</span>
            </div>
          </div>
        </div>
      </section>

      {/* Elevate Finances Modal */}
      <ElevateFinancesModal
        serviceType={activeService}
        isOpen={Boolean(activeService)}
        onClose={() => setActiveService(null)}
      />
    </>
  );
}
