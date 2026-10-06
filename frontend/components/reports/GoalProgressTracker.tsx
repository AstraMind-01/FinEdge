"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Target, Sparkles } from 'lucide-react';

const GOALS = [
  { label: 'Emergency Fund', current: 85000, target: 100000, color: '#57f1db', deadline: 'Dec 2026' },
  { label: 'Vacation Fund', current: 32000, target: 60000, color: '#ffd481', deadline: 'Mar 2027' },
  { label: 'New Laptop', current: 60000, target: 60000, color: '#c6bfff', deadline: 'Completed! 🎉' },
  { label: 'Home Renovation', current: 180000, target: 500000, color: '#57f1db', deadline: 'Jun 2028' },
];

export default function GoalProgressTracker() {
  const [visible, setVisible] = useState(false);
  const [celebrated, setCelebrated] = useState<Record<number, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true);
          // Trigger celebration for 100% goals after bars animate
          const fullGoals = GOALS.map((g, i) => ({ i, full: g.current >= g.target }));
          fullGoals.forEach(({ i, full }) => {
            if (full) setTimeout(() => setCelebrated(prev => ({ ...prev, [i]: true })), 900 + i * 100);
          });
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="bg-surface-container-low border border-white/5 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <Target size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="text-[17px] font-headline-lg font-semibold text-on-surface">Goal Progress</h3>
          <p className="text-[13px] text-on-surface-variant">Track your savings milestones</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {GOALS.map((goal, i) => {
          const pct = Math.min((goal.current / goal.target) * 100, 100);
          const isComplete = pct >= 100;

          return (
            <div key={goal.label} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-on-surface">{goal.label}</span>
                  {celebrated[i] && (
                    <Sparkles size={14} className="text-primary animate-[pulse_1s_ease-in-out_3]" />
                  )}
                </div>
                <span className={`text-[12px] font-semibold ${isComplete ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 bg-surface-container-highest rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all ease-out relative overflow-hidden"
                  style={{
                    width: visible ? `${pct}%` : '0%',
                    backgroundColor: goal.color,
                    transitionDuration: `${700 + i * 100}ms`,
                    transitionDelay: `${i * 120}ms`,
                    boxShadow: `0 0 10px ${goal.color}60`,
                  }}
                >
                  {isComplete && celebrated[i] && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_ease_2]" />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[12px] text-on-surface-variant">
                  ₹{(goal.current / 1000).toFixed(0)}K of ₹{(goal.target / 1000).toFixed(0)}K
                </span>
                <span className={`text-[11px] ${isComplete ? 'text-primary font-medium' : 'text-on-surface-variant/60'}`}>
                  {goal.deadline}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
