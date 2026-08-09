"use client";
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ReceiptText, LineChart } from 'lucide-react';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Transaction } from '../../types';
import { MockApi } from '../../lib/mockApi';

export default function TransactionsSummaryStrip() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await MockApi.getTransactions("ALL");
        setTransactions(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalCredited = transactions.filter(t => t.type === 'CREDIT').reduce((acc, t) => acc + t.amount, 0);
  const totalDebited = transactions.filter(t => t.type === 'DEBIT').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const avgDailySpend = transactions.length > 0 ? totalDebited / 30 : 0; // Rough mock estimate

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card className="p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px]">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">Total Credited</span>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <span className="font-display-lg text-[20px] xl:text-[24px] text-tertiary font-bold tracking-tight truncate">
                +{formatCurrency(totalCredited)}
              </span>
            )}
          </div>
          <TrendingUp className="text-tertiary bg-tertiary/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[12px]">
          <span className="text-on-surface-variant truncate">This month</span>
        </div>
      </Card>

      <Card className="p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px]">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-error/10 rounded-full blur-2xl group-hover:bg-error/20 transition-all duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">Total Debited</span>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <span className="font-display-lg text-[20px] xl:text-[24px] text-error font-bold tracking-tight truncate">
                -{formatCurrency(totalDebited)}
              </span>
            )}
          </div>
          <TrendingDown className="text-error bg-error/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[12px]">
          <span className="text-on-surface-variant truncate">This month</span>
        </div>
      </Card>

      <Card className="p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px]">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">Total Transactions</span>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <span className="font-display-lg text-[20px] xl:text-[24px] text-on-surface font-bold tracking-tight truncate">
                {transactions.length}
              </span>
            )}
          </div>
          <ReceiptText className="text-primary bg-primary/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[12px]">
          <span className="text-on-surface-variant truncate">Across all accounts</span>
        </div>
      </Card>

      <Card className="p-5 flex flex-col justify-between relative overflow-hidden group min-h-[120px]">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all duration-500"></div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium truncate">Avg. Daily Spend</span>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <span className="font-display-lg text-[20px] xl:text-[24px] text-on-surface font-bold tracking-tight truncate">
                {formatCurrency(avgDailySpend)}
              </span>
            )}
          </div>
          <LineChart className="text-secondary bg-secondary/10 p-2 rounded-lg shrink-0 w-[36px] h-[36px]" />
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[12px]">
          <span className="text-on-surface-variant truncate">Estimated based on debits</span>
        </div>
      </Card>
    </section>
  );
}
