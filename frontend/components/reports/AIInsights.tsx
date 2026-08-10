"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, Coffee, ShoppingBag, Send } from 'lucide-react';

const INSIGHTS = [
  {
    icon: TrendingUp,
    iconColor: 'text-tertiary',
    iconBg: 'bg-tertiary/10',
    text: 'You spent 18% more on dining this month compared to last month. Consider setting a dining budget.',
    delay: 400,
  },
  {
    icon: AlertTriangle,
    iconColor: 'text-error',
    iconBg: 'bg-error/10',
    text: 'Your utility bills increased by ₹2,100 this month. Check for unusual consumption patterns.',
    delay: 2000,
  },
  {
    icon: ShoppingBag,
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
    text: 'You could save ₹5,200/month by reducing impulse shopping. 3 transactions flagged as unplanned.',
    delay: 3600,
  },
  {
    icon: Coffee,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    text: 'Your savings rate is 43.8% — that\'s better than 82% of FinEdge users in your income bracket! 🎉',
    delay: 5200,
  },
];

function TypewriterText({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, ++i));
      } else {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, active]);

  return <span>{displayed}{active && displayed.length < text.length && <span className="inline-block w-0.5 h-4 bg-primary/70 animate-pulse ml-0.5 align-text-bottom" />}</span>;
}

export default function AIInsights() {
  const [visibleInsights, setVisibleInsights] = useState<number[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    INSIGHTS.forEach((ins, i) => {
      setTimeout(() => setVisibleInsights(prev => [...prev, i]), ins.delay);
    });
  }, []);

  return (
    <div className="bg-surface-container-low border border-white/5 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <span className="text-[14px]">✨</span>
        </div>
        <div>
          <h3 className="text-[16px] font-headline-lg font-semibold text-on-surface">AI Insights</h3>
          <p className="text-[12px] text-on-surface-variant">Powered by your spending data</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        {INSIGHTS.map((ins, i) => {
          const Icon = ins.icon;
          const isVisible = visibleInsights.includes(i);
          return (
            <div
              key={i}
              className={`flex gap-3 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${ins.iconBg} transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-75'}`}>
                <Icon size={15} className={ins.iconColor} />
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed pt-1">
                <TypewriterText text={ins.text} active={isVisible} />
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 bg-surface-container-high rounded-xl px-4 py-3 border border-white/5 focus-within:border-primary/40 transition-colors">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI about your spending..."
            className="flex-1 bg-transparent text-[13px] text-on-surface placeholder:text-on-surface-variant/50 outline-none"
          />
          <button className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center transition-all hover:shadow-[0_0_12px_rgba(255,212,129,0.5)] hover:scale-105 active:scale-95">
            <Send size={13} className="text-on-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}
