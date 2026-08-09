"use client";
import React from 'react';
import { Wallet, Landmark, Briefcase, Lock, TrendingUp, CheckCircle, EyeOff, Eye } from 'lucide-react';
import { useAccounts } from '../context/AccountContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export default function SummaryCards() {
  const { accounts, totalBalance, isLoading, verificationStates, requestVerification, hideBalance, selectAccount } = useAccounts();

  const getIcon = (type: string) => {
    if (type === 'SAVINGS') return <Landmark className="text-tertiary bg-tertiary/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />;
    if (type === 'CURRENT') return <Briefcase className="text-secondary bg-secondary/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />;
    if (type === 'FIXED_DEPOSIT') return <Lock className="text-primary-fixed bg-primary-fixed/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />;
    return <Wallet />;
  };

  const getThemeClass = (type: string) => {
    if (type === 'SAVINGS') return 'group-hover:bg-tertiary/20 border-white/5 hover:border-tertiary/30';
    if (type === 'CURRENT') return 'group-hover:bg-secondary/20 border-white/5 hover:border-secondary/30';
    if (type === 'FIXED_DEPOSIT') return 'group-hover:bg-primary-fixed/20 border-white/5 hover:border-primary-fixed/30';
    return 'group-hover:bg-primary/20 border-white/5 hover:border-primary/30';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card className="p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px]">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">Total Balance</span>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <span className="font-display-lg text-[20px] xl:text-[24px] text-on-surface font-bold tracking-tight truncate">
                {formatCurrency(totalBalance)}
              </span>
            )}
          </div>
          <Wallet className="text-primary bg-primary/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[12px]">
          <TrendingUp className="text-tertiary shrink-0" size={14} />
          <span className="text-tertiary font-medium">+2.4%</span>
          <span className="text-on-surface-variant truncate">vs last month</span>
        </div>
      </Card>

      {isLoading && accounts.length === 0 ? (
        <>
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </>
      ) : (
        accounts.map((account) => {
          const vState = verificationStates[account.id] || "NOT_VERIFIED";
          const isVerified = vState === "VERIFIED";

          return (
            <Card key={account.id} className={`p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px] cursor-pointer transition-colors ${getThemeClass(account.type)}`} onClick={() => selectAccount(account.id)}>
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl transition-all duration-500"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">{account.name}</span>
                  
                  {isVerified ? (
                    <span className="font-display-lg text-[20px] xl:text-[24px] text-on-surface font-bold tracking-tight truncate mt-0.5">
                      {formatCurrency(account.balance)}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 mt-1" onClick={(e) => { e.stopPropagation(); requestVerification(account.id); selectAccount(account.id); }}>
                      <span className="font-mono text-on-surface text-lg tracking-widest hover:text-primary transition-colors">{account.maskedNumber}</span>
                    </div>
                  )}
                </div>
                {getIcon(account.type)}
              </div>
              
              <div className="flex items-center justify-between mt-4 relative z-10">
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="relative flex h-2 w-2">
                    {account.status === 'ACTIVE' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${account.status === 'ACTIVE' ? 'bg-tertiary' : 'bg-error'}`}></span>
                  </span>
                  <span className="text-on-surface-variant truncate capitalize">{account.status.toLowerCase()}</span>
                </div>

                {isVerified ? (
                  <Button className="h-6 text-[11px] px-2 bg-surface-high hover:bg-surface-highest text-on-surface-variant hover:text-on-surface" onClick={(e) => { e.stopPropagation(); hideBalance(account.id); }}>
                    <EyeOff className="w-3 h-3 mr-1" /> Hide Balance
                  </Button>
                ) : (
                  <Button className="h-6 text-[11px] px-2 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none" onClick={(e) => { e.stopPropagation(); requestVerification(account.id); selectAccount(account.id); }}>
                    <Eye className="w-3 h-3 mr-1" /> View Balance
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}
    </section>
  );
}
