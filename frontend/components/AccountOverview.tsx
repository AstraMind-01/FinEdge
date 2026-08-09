"use client";
import React from 'react';
import { Eye, ArrowLeftRight, Settings, Globe, Snowflake } from 'lucide-react';
import { useAccounts } from '../context/AccountContext';

export default function AccountOverview() {
  const { accounts, selectedAccountId, verificationStates } = useAccounts();
  const account = accounts.find(a => a.id === selectedAccountId);

  if (!account) return null;

  const isVerified = verificationStates[account.id] === "VERIFIED";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <div className="lg:col-span-8 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col md:flex-row gap-8 items-center h-full">
      <div className="relative w-full max-w-[320px] aspect-[1.586] rounded-xl overflow-hidden shadow-xl shrink-0 group">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black z-0"></div>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay z-10" style={{"backgroundImage": "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"}}></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/40 transition-all duration-700"></div>
        <div className="relative z-20 flex flex-col justify-between h-full p-5">
          <div className="flex justify-between items-start w-full">
            <span className="text-white font-headline-lg tracking-wider text-[16px] font-bold">{account.type === 'SAVINGS' ? 'SAVINGS' : account.type === 'CURRENT' ? 'CURRENT' : 'FD'}</span>
          </div>
          <div className="mt-auto flex flex-col gap-1.5">
            <span className="font-mono text-white/90 text-[16px] tracking-[0.15em] drop-shadow-sm">{account.maskedNumber}</span>
            <div className="flex justify-between items-end w-full mt-1">
              <div className="flex flex-col">
                <span className="text-[9px] text-white/60 uppercase tracking-widest">Account Holder</span>
                <span className="font-title-md text-white/90 text-[12px] tracking-wider uppercase mt-0.5">{account.accountHolder}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 w-full gap-4 justify-center">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {account.status === 'ACTIVE' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${account.status === 'ACTIVE' ? 'bg-tertiary' : 'bg-error'}`}></span>
            </span>
            <h3 className="font-title-md text-[16px] font-semibold text-on-surface truncate">{account.name} {account.status === 'ACTIVE' ? 'Active' : 'Frozen'}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2 mb-2 p-3 bg-surface-high rounded-lg border border-outline-variant/10">
            <div className="flex flex-col">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Available Balance</span>
              <span className="text-[16px] font-bold text-on-surface mt-0.5">{isVerified ? formatCurrency(account.balance) : "••••••••"}</span>
            </div>
            {account.type === 'FIXED_DEPOSIT' ? (
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Maturity Date</span>
                <span className="text-[14px] font-medium text-on-surface mt-0.5">{account.maturityDate || "N/A"}</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Current Balance</span>
                <span className="text-[16px] font-bold text-on-surface mt-0.5">{isVerified ? formatCurrency(account.balance) : "••••••••"}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-1">
          <button className="bg-surface-high text-on-surface px-4 py-2 rounded-lg hover:bg-surface-highest transition-colors text-[13px] font-medium border border-outline-variant/30 flex items-center gap-1.5 h-[36px]">
            <Eye size={16} />
            Full Details
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow text-[13px] font-medium flex items-center gap-1.5 h-[36px]" disabled={account.status !== 'ACTIVE'}>
            <ArrowLeftRight size={16} />
            Quick Transfer
          </button>
        </div>
        <div className="flex gap-6 mt-2 pt-4 border-t border-outline-variant/20">
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Settings className="text-on-surface-variant group-hover:text-primary transition-colors" size={18} />
            </div>
            <span className="text-[11px] text-on-surface-variant group-hover:text-on-surface font-medium">Limits</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Globe className="text-on-surface-variant group-hover:text-primary transition-colors" size={18} />
            </div>
            <span className="text-[11px] text-on-surface-variant group-hover:text-on-surface font-medium">Statements</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center group-hover:bg-error/20 transition-colors">
              <Snowflake className="text-on-surface-variant group-hover:text-error transition-colors" size={18} />
            </div>
            <span className="text-[11px] text-on-surface-variant group-hover:text-on-surface font-medium">Freeze</span>
          </div>
        </div>
      </div>
    </div>
  );
}
