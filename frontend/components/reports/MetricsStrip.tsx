"use client";

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: 'up' | 'down' | 'neutral';
  trendPct: number;
  sparkData: number[];
  color: string;
  delay?: number;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const [progress, setProgress] = useState(0);
  const w = 100, h = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v: number) => ((v - min) / (max - min || 1)) * (h - 6) + 3;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - norm(v)}`).join(' ');

  useEffect(() => {
    const t = setTimeout(() => {
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 800, 1);
        setProgress(p);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <clipPath id={`clip-${color.replace('#','')}`}>
          <rect x="0" y="0" width={w * progress} height={h} />
        </clipPath>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        clipPath={`url(#clip-${color.replace('#','')})`}
        opacity="0.8"
      />
    </svg>
  );
}

function CountUp({ target, prefix = '', suffix = '', duration = 1200, delay = 0 }: {
  target: number; prefix?: string; suffix?: string; duration?: number; delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(target * ease));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);

  return (
    <span>
      {prefix}{display >= 1000 ? (display / 1000).toFixed(1) + 'K' : display.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

export default function MetricsStrip() {
  const metrics: MetricCardProps[] = [
    { label: 'Total Income', value: 86500, prefix: '₹', trend: 'up', trendPct: 12.4, sparkData: [55, 60, 58, 72, 68, 80, 86.5], color: '#57f1db', delay: 0 },
    { label: 'Total Expenses', value: 48650, prefix: '₹', trend: 'down', trendPct: 3.2, sparkData: [42, 45, 51, 47, 50, 48, 48.65], color: '#ffb4ab', delay: 150 },
    { label: 'Net Savings', value: 37850, prefix: '₹', trend: 'up', trendPct: 8.7, sparkData: [18, 22, 15, 28, 24, 35, 37.85], color: '#ffd481', delay: 300 },
    { label: 'Investments', value: 124000, prefix: '₹', trend: 'up', trendPct: 5.1, sparkData: [95, 98, 103, 108, 115, 119, 124], color: '#c6bfff', delay: 450 },
    { label: 'Credit Score', value: 782, prefix: '', trend: 'up', trendPct: 2.3, sparkData: [745, 751, 758, 762, 770, 777, 782], color: '#ffd481', delay: 600 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((m) => {
        const TrendIcon = m.trend === 'up' ? TrendingUp : m.trend === 'down' ? TrendingDown : Minus;
        const trendColor = m.trend === 'up' ? 'text-tertiary' : m.trend === 'down' ? 'text-error' : 'text-on-surface-variant';
        return (
          <div
            key={m.label}
            className="bg-surface-container-low border border-white/5 rounded-xl p-4 flex flex-col gap-3 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(255,212,129,0.07)] transition-all duration-300 group"
            style={{ animationDelay: `${m.delay}ms` }}
          >
            <p className="text-[12px] text-on-surface-variant uppercase tracking-wider font-medium">{m.label}</p>
            <p className="text-[22px] font-headline-lg font-bold text-on-surface leading-none">
              {m.prefix}<CountUp target={m.value} duration={1200} delay={m.delay} />
            </p>
            <div className="flex items-center gap-2">
              <TrendIcon size={13} className={`${trendColor} animate-[pulse_2s_ease_1]`} />
              <span className={`text-[12px] font-semibold ${trendColor}`}>
                {m.trend !== 'neutral' ? (m.trend === 'up' ? '+' : '-') : ''}{m.trendPct}%
              </span>
              <span className="text-[11px] text-on-surface-variant/60">vs last mo.</span>
            </div>
            <div className="mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <Sparkline data={m.sparkData} color={m.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
