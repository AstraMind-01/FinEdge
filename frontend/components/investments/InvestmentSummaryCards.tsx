"use client";

import React from "react";
import { Wallet, BarChart3, TrendingUp, ArrowUpRight } from "lucide-react";

interface InvestmentSummaryCardsProps {
  totalCurrent: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPct: string;
  todayChange: number;
  todayChangePct: number;
}

export default function InvestmentSummaryCards({
  totalCurrent,
  totalInvested,
  totalReturn,
  totalReturnPct,
  todayChange,
  todayChangePct
}: InvestmentSummaryCardsProps) {
  const summaryCards = [
    { title: "Portfolio Value", value: `₹${totalCurrent.toLocaleString('en-IN')}`, icon: <Wallet size={20} />, iconBg: "bg-primary/10 text-primary" },
    { title: "Total Invested", value: `₹${totalInvested.toLocaleString('en-IN')}`, icon: <BarChart3 size={20} />, iconBg: "bg-blue-500/10 text-blue-400" },
    { title: "Total Returns", value: `₹${totalReturn.toLocaleString('en-IN')}`, subtitle: `+${totalReturnPct}%`, icon: <TrendingUp size={20} />, iconBg: "bg-green-500/10 text-green-400", valueColor: "text-green-400" },
    { title: "Today's Change", value: `+₹${todayChange.toLocaleString('en-IN')}`, subtitle: `+${todayChangePct}%`, icon: <ArrowUpRight size={20} />, iconBg: "bg-green-500/10 text-green-400", valueColor: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {summaryCards.map((card, i) => (
        <div key={i} className="bg-surface-container-low rounded-2xl p-5 border border-white/5 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>{card.icon}</div>
          <div className="min-w-0">
            <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1 truncate">{card.title}</p>
            <p className={`font-bold text-lg truncate ${card.valueColor || 'text-on-surface'}`}>{card.value}</p>
            {card.subtitle && <p className="text-green-400 text-[11px] mt-0.5 flex items-center gap-0.5"><ArrowUpRight size={10} />{card.subtitle}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
