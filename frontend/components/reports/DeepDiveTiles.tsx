"use client";

import React from 'react';
import { Receipt, TrendingUp, Landmark, CreditCard, ArrowRight } from 'lucide-react';

const TILES = [
  {
    label: 'Tax Report',
    desc: 'AY 2025-26 insights & deductions',
    icon: Receipt,
    iconBg: 'bg-error/10',
    iconColor: 'text-error',
    accent: '#ffb4ab',
  },
  {
    label: 'Investment Performance',
    desc: 'Portfolio returns & asset allocation',
    icon: TrendingUp,
    iconBg: 'bg-tertiary/10',
    iconColor: 'text-tertiary',
    accent: '#57f1db',
  },
  {
    label: 'Loan Summary',
    desc: 'Outstanding balance & repayments',
    icon: Landmark,
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
    accent: '#c6bfff',
  },
  {
    label: 'Credit Score History',
    desc: 'Score trend & improvement tips',
    icon: CreditCard,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    accent: '#ffd481',
  },
];

export default function DeepDiveTiles() {
  return (
    <div className="bg-surface-container-low border border-white/5 rounded-xl p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-[17px] font-headline-lg font-semibold text-on-surface">Deep Dive Reports</h3>
        <p className="text-[13px] text-on-surface-variant mt-0.5">Detailed analysis across all financial categories</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className="group relative flex flex-col p-5 bg-surface-container rounded-xl border border-white/5 cursor-pointer
                         hover:border-primary/30 transition-all duration-300
                         hover:shadow-[0_0_24px_rgba(255,212,129,0.08),0_4px_16px_rgba(0,0,0,0.3)]
                         hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 rounded-xl ${tile.iconBg} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110`}
                   style={{ boxShadow: `0 0 0 0 ${tile.accent}00` }}>
                <Icon size={20} className={tile.iconColor} />
              </div>
              <h4 className="text-[14px] font-semibold text-on-surface mb-1">{tile.label}</h4>
              <p className="text-[12px] text-on-surface-variant/70 flex-1">{tile.desc}</p>
              <div className="flex items-center gap-1.5 mt-4 text-[13px] font-medium group-hover:gap-2.5 transition-all duration-200"
                   style={{ color: tile.accent }}>
                View Report
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </div>

              {/* Gold border glow on hover */}
              <div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/20 transition-all duration-300 pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
