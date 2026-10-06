"use client";

import React, { useEffect, useRef, useState } from 'react';

const CATEGORIES = [
  { label: 'Shopping', pct: 32, amount: 15552, color: '#c6bfff' },
  { label: 'Food & Dining', pct: 24, amount: 11676, color: '#57f1db' },
  { label: 'Bills & Utilities', pct: 19, amount: 9243, color: '#ffd481' },
  { label: 'Travel', pct: 14, amount: 6811, color: '#ffb4ab' },
  { label: 'Health', pct: 7, amount: 3405, color: '#62fae3' },
  { label: 'Others', pct: 4, amount: 1946, color: '#9c8f7a' },
];

const TOTAL = 48633;
const CIRC = 2 * Math.PI * 56;

function DonutChart({ activeIdx, onHover }: { activeIdx: number | null; onHover: (i: number | null) => void }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  let offset = 0;
  const segments = CATEGORIES.map((cat, i) => {
    const dash = (cat.pct / 100) * CIRC;
    const seg = { ...cat, dash, offset, index: i };
    offset += dash;
    return seg;
  });

  return (
    <div className="relative w-[200px] h-[200px] shrink-0">
      <svg width="200" height="200" viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
        {segments.map((seg, i) => {
          const isActive = activeIdx === i;
          const isDimmed = activeIdx !== null && activeIdx !== i;
          return (
            <circle
              key={seg.label}
              cx="64" cy="64" r="56"
              fill="none"
              stroke={seg.color}
              strokeWidth={isActive ? 18 : 14}
              strokeDasharray={animated ? `${seg.dash} ${CIRC}` : `0 ${CIRC}`}
              strokeDashoffset={-seg.offset}
              opacity={isDimmed ? 0.3 : 1}
              className="cursor-pointer"
              style={{
                transition: `stroke-dasharray 700ms ease-out ${i * 80}ms, opacity 300ms ease, stroke-width 200ms ease`,
                filter: isActive ? `drop-shadow(0 0 8px ${seg.color}80)` : 'none',
              }}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0 text-center">
        <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">Total Spent</span>
        <span className="text-[18px] font-headline-lg font-bold text-on-surface mt-0.5">
          ₹{(TOTAL / 1000).toFixed(1)}K
        </span>
      </div>
    </div>
  );
}

export default function SpendingBreakdown() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [barsVisible, setBarsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBarsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-surface-container-low border border-white/5 rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-[17px] font-headline-lg font-semibold text-on-surface">Spending Breakdown</h3>
        <p className="text-[13px] text-on-surface-variant mt-0.5">Where your money went this month</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6">
        <DonutChart activeIdx={activeIdx} onHover={setActiveIdx} />

        <div className="flex flex-col gap-2.5 flex-1 w-full">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 w-full text-left ${
                activeIdx === i ? 'bg-surface-container-high' : 'hover:bg-surface-container-high/50'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className={`text-[13px] flex-1 truncate transition-colors ${activeIdx === i ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                {cat.label}
              </span>
              <span className="text-[12px] text-on-surface-variant font-medium">₹{cat.amount.toLocaleString('en-IN')}</span>
              <span className="text-[12px] font-semibold w-8 text-right" style={{ color: cat.color }}>{cat.pct}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar breakdown table */}
      <div className="border-t border-white/5 pt-5 flex flex-col gap-3">
        <h4 className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Breakdown</h4>
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.label}
            className={`transition-all duration-300 ${
              activeIdx !== null && activeIdx !== i ? 'opacity-40' : 'opacity-100'
            }`}
            style={{ transitionDelay: barsVisible ? `${i * 60}ms` : '0ms' }}
          >
            <div className="flex justify-between mb-1">
              <span className="text-[13px] text-on-surface-variant">{cat.label}</span>
              <span className="text-[13px] font-medium text-on-surface">₹{cat.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: barsVisible ? `${cat.pct}%` : '0%',
                  backgroundColor: cat.color,
                  transitionDelay: `${i * 80 + 200}ms`,
                  boxShadow: `0 0 8px ${cat.color}60`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
