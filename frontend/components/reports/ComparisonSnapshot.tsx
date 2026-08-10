"use client";

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const COMPARISONS = [
  { label: 'Income', thisMonth: 86500, lastMonth: 76800, isPositiveGood: true },
  { label: 'Expenses', thisMonth: 48650, lastMonth: 50200, isPositiveGood: false },
  { label: 'Savings', thisMonth: 37850, lastMonth: 26600, isPositiveGood: true },
];

export default function ComparisonSnapshot() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-surface-container-low border border-white/5 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[16px] font-headline-lg font-semibold text-on-surface">Month Comparison</h3>
        <span className="text-[12px] text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-lg">Jul vs Jun</span>
      </div>

      <div className="flex flex-col gap-5">
        {COMPARISONS.map((item, i) => {
          const maxVal = Math.max(item.thisMonth, item.lastMonth);
          const thisPct = (item.thisMonth / maxVal) * 100;
          const lastPct = (item.lastMonth / maxVal) * 100;
          const change = ((item.thisMonth - item.lastMonth) / item.lastMonth) * 100;
          const isPositive = change > 0;
          const isGood = isPositive === item.isPositiveGood;
          const chipColor = isGood ? 'text-tertiary bg-tertiary/10' : 'text-error bg-error/10';
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-on-surface-variant">{item.label}</span>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-all duration-500 ${chipColor} ${
                    visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                  style={{ transitionDelay: `${i * 150 + 600}ms` }}
                >
                  <TrendIcon size={11} />
                  {Math.abs(change).toFixed(1)}%
                </div>
              </div>

              {/* This Month */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] text-on-surface-variant/70 w-20 shrink-0">This month</span>
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all ease-out"
                    style={{
                      width: visible ? `${thisPct}%` : '0%',
                      backgroundColor: '#ffd481',
                      transitionDuration: `${600 + i * 80}ms`,
                      transitionDelay: `${i * 100}ms`,
                      boxShadow: '0 0 8px rgba(255,212,129,0.4)',
                    }}
                  />
                </div>
                <span className="text-[12px] font-medium text-on-surface w-16 text-right shrink-0">
                  ₹{(item.thisMonth / 1000).toFixed(1)}K
                </span>
              </div>

              {/* Last Month */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-on-surface-variant/70 w-20 shrink-0">Last month</span>
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all ease-out"
                    style={{
                      width: visible ? `${lastPct}%` : '0%',
                      backgroundColor: '#504534',
                      transitionDuration: `${600 + i * 80}ms`,
                      transitionDelay: `${i * 100 + 80}ms`,
                    }}
                  />
                </div>
                <span className="text-[12px] text-on-surface-variant w-16 text-right shrink-0">
                  ₹{(item.lastMonth / 1000).toFixed(1)}K
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
