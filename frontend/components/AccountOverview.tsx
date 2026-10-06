"use client";

import React, { useState } from 'react';
import { Eye, ArrowLeftRight, Settings, Globe, Snowflake, RotateCw, Copy, Check, ShieldCheck, Wifi, Cpu } from 'lucide-react';
import { useAccounts } from '../context/AccountContext';
import AccountDetailsModal from './modals/AccountDetailsModal';
import QuickTransferModal from './modals/QuickTransferModal';
import AccountLimitsModal from './modals/AccountLimitsModal';
import AccountStatementsModal from './modals/AccountStatementsModal';
import FreezeAccountModal from './modals/FreezeAccountModal';

export default function AccountOverview() {
  const { 
    accounts, 
    selectedAccountId, 
    verificationStates, 
    requestVerification,
    isAccountVerified,
    executeTransfer, 
    updateAccountLimits, 
    toggleAccountFreeze,
    transactions 
  } = useAccounts();

  const account = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  const [activeModal, setActiveModal] = useState<"details" | "transfer" | "limits" | "statements" | "freeze" | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedBack, setCopiedBack] = useState(false);

  if (!account) return null;

  const isVerified = isAccountVerified(account.id);

  const handleOpenDetails = () => {
    if (!isAccountVerified(account.id)) {
      requestVerification(account.id);
      return;
    }
    setActiveModal("details");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  const handleCopyBackDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    const info = `Account: ${account.accountNumber || account.lastFour}\nIFSC: ${account.ifsc || 'HDFC0001234'}\nBranch: ${account.branch || 'Connaught Place'}`;
    navigator.clipboard.writeText(info);
    setCopiedBack(true);
    setTimeout(() => setCopiedBack(false), 2000);
  };

  return (
    <>
      <div className="lg:col-span-8 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col md:flex-row gap-8 items-center h-full">
        {/* 3D Flip Card Container */}
        <div 
          className="relative w-full max-w-[320px] aspect-[1.586] shrink-0 group cursor-pointer"
          style={{ perspective: "1000px" }}
          onClick={() => setIsFlipped(!isFlipped)}
          title="Click card to flip 3D view"
        >
          <div 
            className="w-full h-full relative rounded-xl shadow-2xl transition-transform duration-700 ease-out"
            style={{ 
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            {/* FRONT FACE */}
            <div 
              className="absolute inset-0 w-full h-full rounded-xl overflow-hidden p-5 flex flex-col justify-between"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black z-0"></div>
              <div className="absolute inset-0 opacity-30 mix-blend-overlay z-10" style={{"backgroundImage": "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"}}></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/40 transition-all duration-700"></div>
              
              {/* Top Row: Account Type & NFC Icon */}
              <div className="relative z-20 flex justify-between items-center w-full">
                <span className="text-white font-headline-lg tracking-wider text-[15px] font-bold">
                  {account.type === 'SAVINGS' ? 'SAVINGS' : account.type === 'CURRENT' ? 'CURRENT' : account.type === 'FIXED_DEPOSIT' ? 'FD' : 'RD'}
                </span>
                <div className="flex items-center gap-2 text-white/80">
                  <Wifi size={18} className="rotate-90" />
                  <span className="text-[10px] font-mono tracking-widest text-primary font-bold">FINEDGE</span>
                </div>
              </div>

              {/* EMV Chip */}
              <div className="relative z-20 my-1">
                <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-200 border border-amber-500/50 flex items-center justify-center shadow-inner">
                  <Cpu size={16} className="text-amber-800 opacity-60" />
                </div>
              </div>

              {/* Account Number & Holder */}
              <div className="relative z-20 mt-auto flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-white/95 text-[15px] tracking-[0.18em] drop-shadow-sm font-semibold">
                    {isVerified ? (account.accountNumber || account.maskedNumber) : account.maskedNumber}
                  </span>
                  <RotateCw size={14} className="text-white/40 group-hover:text-primary transition-colors animate-pulse" />
                </div>
                <div className="flex justify-between items-end w-full mt-0.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/60 uppercase tracking-widest font-mono">Account Holder</span>
                    <span className="font-title-md text-white/90 text-[11px] tracking-wider uppercase font-semibold">{account.accountHolder}</span>
                  </div>
                  <span className="text-[9px] text-white/50 font-mono">3D Interactive</span>
                </div>
              </div>
            </div>

            {/* BACK FACE */}
            <div 
              className="absolute inset-0 w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 text-white p-4 flex flex-col justify-between shadow-2xl"
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              {/* Magnetic Stripe */}
              <div className="-mx-4 -mt-4 bg-black h-9 w-[calc(100%+2rem)] border-b border-white/10 flex items-center justify-end px-4">
                <span className="text-[9px] font-mono text-white/40 tracking-widest">MAGNETIC STRIPE</span>
              </div>

              {/* CVV & Signature Strip */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 bg-white/90 h-7 rounded px-3 flex items-center justify-between text-black text-[11px] font-mono italic">
                  <span className="opacity-60 font-semibold">Authorized Signature</span>
                </div>
                <div className="bg-amber-300 text-black font-mono font-bold text-xs px-2.5 py-1.5 rounded shadow-sm">
                  CVV 389
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-white/80 bg-white/5 p-2.5 rounded-lg border border-white/10">
                <div>
                  <span className="text-[9px] text-white/50 block uppercase">IFSC Code</span>
                  <strong className="text-primary font-bold text-xs">{account.ifsc || 'HDFC0001234'}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-white/50 block uppercase">Branch</span>
                  <span className="truncate block font-medium">{account.branch || 'Connaught Place'}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/10">
                <button
                  onClick={handleCopyBackDetails}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedBack ? <Check size={12} className="text-tertiary" /> : <Copy size={12} />}
                  {copiedBack ? "Copied!" : "Copy Details"}
                </button>
                <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                  <RotateCw size={12} />
                  <span>Click to Flip Back</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Action Controls */}
        <div className="flex flex-col flex-1 w-full gap-4 justify-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {account.status === 'ACTIVE' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${account.status === 'ACTIVE' ? 'bg-tertiary' : 'bg-error'}`}></span>
              </span>
              <h3 className="font-title-md text-[16px] font-semibold text-on-surface truncate">
                {account.name} <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${account.status === 'ACTIVE' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>{account.status}</span>
              </h3>
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-1">
            <button 
              onClick={handleOpenDetails}
              className="bg-surface-high text-on-surface px-4 py-2 rounded-lg hover:bg-surface-highest transition-colors text-[13px] font-medium border border-outline-variant/30 flex items-center gap-1.5 h-[36px] cursor-pointer"
            >
              <Eye size={16} /> Account Details
            </button>
            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className="bg-surface-high text-on-surface px-4 py-2 rounded-lg hover:bg-surface-highest transition-colors text-[13px] font-medium border border-outline-variant/30 flex items-center gap-1.5 h-[36px] cursor-pointer"
            >
              <RotateCw size={16} className={`transition-transform duration-500 ${isFlipped ? 'rotate-180 text-primary' : ''}`} />
              {isFlipped ? 'Show Front' : 'Flip Card'}
            </button>

            <button 
              onClick={() => setActiveModal("transfer")}
              disabled={account.status !== 'ACTIVE'}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow text-[13px] font-medium flex items-center gap-1.5 h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight size={16} />
              Quick Transfer
            </button>
          </div>

          {/* Quick Config Row */}
          <div className="flex gap-6 mt-2 pt-4 border-t border-outline-variant/20">
            {/* Limits */}
            <div 
              onClick={() => setActiveModal("limits")}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Settings className="text-on-surface-variant group-hover:text-primary transition-colors" size={18} />
              </div>
              <span className="text-[11px] text-on-surface-variant group-hover:text-on-surface font-medium">Limits</span>
            </div>

            {/* Statements */}
            <div 
              onClick={() => setActiveModal("statements")}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Globe className="text-on-surface-variant group-hover:text-primary transition-colors" size={18} />
              </div>
              <span className="text-[11px] text-on-surface-variant group-hover:text-on-surface font-medium">Statements</span>
            </div>

            {/* Freeze */}
            <div 
              onClick={() => setActiveModal("freeze")}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${account.status === 'FROZEN' ? 'bg-error/20' : 'bg-surface-high group-hover:bg-error/20'}`}>
                <Snowflake className={`${account.status === 'FROZEN' ? 'text-error animate-pulse' : 'text-on-surface-variant group-hover:text-error'} transition-colors`} size={18} />
              </div>
              <span className="text-[11px] text-on-surface-variant group-hover:text-on-surface font-medium">
                {account.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AccountDetailsModal
        account={account}
        isOpen={activeModal === "details"}
        onClose={() => setActiveModal(null)}
        isVerified={isVerified}
      />

      <QuickTransferModal
        fromAccount={account}
        accounts={accounts}
        isOpen={activeModal === "transfer"}
        onClose={() => setActiveModal(null)}
        onTransfer={executeTransfer}
      />

      <AccountLimitsModal
        account={account}
        isOpen={activeModal === "limits"}
        onClose={() => setActiveModal(null)}
        onSaveLimits={updateAccountLimits}
      />

      <AccountStatementsModal
        account={account}
        transactions={transactions}
        isOpen={activeModal === "statements"}
        onClose={() => setActiveModal(null)}
      />

      <FreezeAccountModal
        account={account}
        isOpen={activeModal === "freeze"}
        onClose={() => setActiveModal(null)}
        onToggleFreeze={toggleAccountFreeze}
      />
    </>
  );
}
