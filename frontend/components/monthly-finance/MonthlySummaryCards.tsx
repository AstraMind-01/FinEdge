"use client";

import React from 'react';
import { 
  ArrowDownRight, ArrowUpRight, Wallet, TrendingUp, 
  Landmark, ShieldCheck, Repeat, Percent, PiggyBank
} from 'lucide-react';
import { MonthlyFinanceData } from './monthlyFinanceData';

interface MonthlySummaryCardsProps {
  data: MonthlyFinanceData;
}

export default function MonthlySummaryCards({ data }: MonthlySummaryCardsProps) {
  const cards = [
    {
      title: "Total Monthly Income",
      amount: `$${data.totalIncome.toLocaleString()}`,
      subtext: "+10.6% vs previous month",
      icon: Wallet,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      trend: "up",
    },
    {
      title: "Total Living Spending",
      amount: `$${data.totalSpending.toLocaleString()}`,
      subtext: "42.2% of monthly earnings",
      icon: ArrowDownRight,
      iconColor: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      trend: "down",
    },
    {
      title: "Net Retained Savings",
      amount: `$${data.netSavings.toLocaleString()}`,
      subtext: `${data.savingsRate}% total retention rate`,
      icon: PiggyBank,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      trend: "up",
    },
    {
      title: "Wealth Investments",
      amount: `$${data.totalInvestments.toLocaleString()}`,
      subtext: "5 SIPs & asset allocations",
      icon: TrendingUp,
      iconColor: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      trend: "neutral",
    },
    {
      title: "Active Loans / EMIs",
      amount: `$${data.totalLoansEmi.toLocaleString()}`,
      subtext: "2 active accounts (Auto-debited)",
      icon: Landmark,
      iconColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      trend: "neutral",
    },
    {
      title: "Insurance & Subscriptions",
      amount: `$${(data.totalInsurance + data.totalSubscriptions).toLocaleString()}`,
      subtext: "Protection + 5 recurring bills",
      icon: ShieldCheck,
      iconColor: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      trend: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-surface-container-low border ${card.borderColor} flex flex-col justify-between hover:bg-surface-container transition-all group shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-on-surface-variant truncate">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl ${card.bgColor} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={card.iconColor} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[20px] font-bold text-on-surface tracking-tight">
                {card.amount}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5 truncate flex items-center gap-1">
                {card.trend === "up" && <ArrowUpRight size={12} className="text-emerald-400 shrink-0" />}
                {card.trend === "down" && <ArrowDownRight size={12} className="text-rose-400 shrink-0" />}
                <span>{card.subtext}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
