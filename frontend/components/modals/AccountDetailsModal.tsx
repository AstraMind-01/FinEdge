"use client";

import React, { useState, useEffect } from "react";
import { Account } from "../../types";
import { X, Copy, Check, ShieldCheck, Landmark, CreditCard, Calendar, User, Percent, AlertCircle, Clock, Lock } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";

interface AccountDetailsModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  isVerified?: boolean;
}

export default function AccountDetailsModal({ account, isOpen, onClose, isVerified: propIsVerified }: AccountDetailsModalProps) {
  const { isAccountVerified, getAccountSessionRemainingTime, requestVerification, verificationStates } = useAccounts();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [remSeconds, setRemSeconds] = useState<number>(0);

  const accountId = account?.id || "";
  const isVerified = Boolean(
    propIsVerified || (accountId ? (verificationStates[accountId] === "VERIFIED" || isAccountVerified(accountId)) : false)
  );

  useEffect(() => {
    if (!isOpen || !accountId) return;

    setRemSeconds(getAccountSessionRemainingTime(accountId));
    const interval = setInterval(() => {
      const remaining = getAccountSessionRemainingTime(accountId);
      setRemSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, accountId, getAccountSessionRemainingTime]);

  if (!isOpen || !account) return null;

  const copyToClipboard = (text: string, label: string) => {
    if (!isVerified) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const fullAccNumber = account.accountNumber || (account.lastFour ? `4092 8812 ${account.lastFour}` : "4092 8812 8812");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6 animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-2xl rounded-2xl p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-6 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Landmark size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight font-headline-lg">{account.name} Details</h2>
              <p className="text-xs text-on-surface-variant">Complete account configuration &amp; security specs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status & Session Security Strip */}
        <div className="bg-surface-high/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-outline-variant/10">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${account.status === 'ACTIVE' ? 'bg-tertiary shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></span>
            <span className="text-sm font-medium">Status: <strong className="uppercase">{account.status}</strong></span>
          </div>

          {isVerified ? (
            <div className="flex items-center gap-2 text-xs bg-tertiary/10 border border-tertiary/20 text-tertiary px-3 py-1.5 rounded-lg font-medium">
              <Clock size={14} className="animate-pulse" />
              <span>Security Session Active • Expires in {formatTime(remSeconds)}</span>
            </div>
          ) : (
            <button 
              onClick={() => requestVerification(accountId)}
              className="flex items-center gap-2 text-xs bg-error/10 border border-error/30 text-error hover:bg-error/20 px-3.5 py-1.5 rounded-lg font-medium cursor-pointer transition-all hover:scale-[1.02]"
              title="Click to Authenticate Account"
            >
              <Lock size={14} />
              <span>Security Barrier: Re-authentication Required (Click to Authenticate)</span>
            </button>
          )}
        </div>

        {/* Detail Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div 
            onClick={() => !isVerified && requestVerification(accountId)}
            className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
          >
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              Account Number
            </span>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-base font-semibold">
                {isVerified ? fullAccNumber : account.maskedNumber}
              </span>
              {isVerified && (
                <button 
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(fullAccNumber, "accNum"); }}
                  className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-md cursor-pointer"
                  title="Copy Account Number"
                >
                  {copiedField === "accNum" ? <Check size={16} className="text-tertiary" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          <div 
            onClick={() => !isVerified && requestVerification(accountId)}
            className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
          >
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              IFSC Code
            </span>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-base font-semibold">
                {isVerified ? (account.ifsc || "HDFC0001234") : "HDFC••••••"}
              </span>
              {isVerified && (
                <button 
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(account.ifsc || "HDFC0001234", "ifsc"); }}
                  className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-md cursor-pointer"
                  title="Copy IFSC Code"
                >
                  {copiedField === "ifsc" ? <Check size={16} className="text-tertiary" /> : <Copy size={16} />}
                </button>
              )}
            </div>
          </div>

          <div 
            onClick={() => !isVerified && requestVerification(accountId)}
            className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
          >
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              Account Balance
            </span>
            <span className="text-base font-bold text-primary mt-1">
              {isVerified ? formatCurrency(account.balance) : "•••••••• (Access Required)"}
            </span>
          </div>

          <div 
            onClick={() => !isVerified && requestVerification(accountId)}
            className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
          >
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              Branch Location
            </span>
            <span className="font-medium truncate mt-1">
              {isVerified ? (account.branch || "Connaught Place, New Delhi") : "••••••••••••••••"}
            </span>
          </div>

          <div 
            onClick={() => !isVerified && requestVerification(accountId)}
            className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
          >
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              <User size={14} /> Account Holder
            </span>
            <span className="font-medium mt-1 uppercase">
              {isVerified ? account.accountHolder : "••••••••••••"}
            </span>
          </div>

          <div 
            onClick={() => !isVerified && requestVerification(accountId)}
            className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
          >
            <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
              <Calendar size={14} /> Opening Date
            </span>
            <span className="font-medium mt-1">
              {isVerified ? (account.openingDate || "2020-01-15") : "••••-••-••"}
            </span>
          </div>

          {account.nominee && (
            <div 
              onClick={() => !isVerified && requestVerification(accountId)}
              className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
            >
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
                Registered Nominee
              </span>
              <span className="font-medium mt-1">
                {isVerified ? `${account.nominee} (${account.nomineeRelation || "Relative"})` : "••••••••••••"}
              </span>
            </div>
          )}

          {account.linkedCard && (
            <div 
              onClick={() => !isVerified && requestVerification(accountId)}
              className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
            >
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
                <CreditCard size={14} /> Linked Card
              </span>
              <span className="font-medium mt-1">
                {isVerified ? account.linkedCard : "•••• •••• •••• 4412"}
              </span>
            </div>
          )}

          {account.dailyLimit && (
            <div 
              onClick={() => !isVerified && requestVerification(accountId)}
              className={`bg-surface-high/40 p-3.5 rounded-xl border border-outline-variant/10 flex flex-col justify-between ${!isVerified ? 'cursor-pointer hover:border-primary/30 transition-all' : ''}`}
            >
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider font-medium">
                <AlertCircle size={14} /> Daily Transfer Limit
              </span>
              <span className="font-medium text-tertiary mt-1">
                {isVerified ? formatCurrency(account.dailyLimit) : "••••••••"}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
          {!isVerified ? (
            <button
              onClick={() => requestVerification(accountId)}
              className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-fixed-dim font-medium rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <Lock size={14} /> Authenticate to Unmask Details
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-sm transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
