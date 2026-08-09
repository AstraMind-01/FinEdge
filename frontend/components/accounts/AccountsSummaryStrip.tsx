"use client";
import React from 'react';
import { Wallet, Landmark, Activity, Coins, TrendingUp } from 'lucide-react';
import { useAccounts } from '../../context/AccountContext';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function AccountsSummaryStrip() {
  const { accounts, totalBalance, isLoading } = useAccounts();

  const activeAccounts = accounts.filter(a => a.status === 'ACTIVE').length;
  const totalInterest = accounts.reduce((acc, a) => acc + (a.interestEarned || 0), 0);

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

      <Card className="p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px]">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">Total Accounts</span>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <span className="font-display-lg text-[20px] xl:text-[24px] text-on-surface font-bold tracking-tight truncate">
                {accounts.length}
              </span>
            )}
          </div>
          <Landmark className="text-secondary bg-secondary/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[12px]">
          <span className="text-on-surface-variant truncate">Across all relationships</span>
        </div>
      </Card>

      <Card className="p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px]">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">Active Accounts</span>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <span className="font-display-lg text-[20px] xl:text-[24px] text-on-surface font-bold tracking-tight truncate">
                {activeAccounts}
              </span>
            )}
          </div>
          <Activity className="text-tertiary bg-tertiary/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[12px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
          </span>
          <span className="text-on-surface-variant truncate">Currently active</span>
        </div>
      </Card>

      <Card className="p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px]">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-fixed/10 rounded-full blur-2xl group-hover:bg-primary-fixed/20 transition-all duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">Interest Earned</span>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <span className="font-display-lg text-[20px] xl:text-[24px] text-on-surface font-bold tracking-tight truncate">
                {formatCurrency(totalInterest)}
              </span>
            )}
          </div>
          <Coins className="text-primary-fixed bg-primary-fixed/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[12px]">
          <span className="text-on-surface-variant truncate">This Year</span>
        </div>
      </Card>
    </section>
  );
}
