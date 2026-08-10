"use client";

import React, { useState } from 'react';
import { Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

const SCHEDULED = [
  { label: 'Weekly Summary', desc: 'Every Monday, 8:00 AM', next: 'Mon, 12 Aug 2026', enabled: true },
  { label: 'Monthly Statement', desc: 'Every 1st of the month', next: 'Fri, 1 Sep 2026', enabled: true },
  { label: 'Tax Insights', desc: 'Quarterly report', next: 'Wed, 1 Oct 2026', enabled: false },
];

export default function ScheduledReports() {
  const [toggles, setToggles] = useState<Record<number, boolean>>(
    Object.fromEntries(SCHEDULED.map((s, i) => [i, s.enabled]))
  );

  return (
    <div className="bg-surface-container-low border border-white/5 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Calendar size={18} className="text-on-surface-variant" />
        <h3 className="text-[16px] font-headline-lg font-semibold text-on-surface">Scheduled Reports</h3>
      </div>

      <div className="flex flex-col divide-y divide-white/5">
        {SCHEDULED.map((r, i) => (
          <div key={r.label} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-on-surface truncate">{r.label}</p>
              <p className="text-[12px] text-on-surface-variant/70">{r.desc}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar size={11} className="text-on-surface-variant/50" />
                <span className="text-[11px] text-on-surface-variant/50">Next: {r.next}</span>
              </div>
            </div>
            <button
              onClick={() => setToggles(prev => ({ ...prev, [i]: !prev[i] }))}
              className={`relative w-10 h-5.5 rounded-full transition-all duration-300 shrink-0 ${
                toggles[i] ? 'bg-primary shadow-[0_0_10px_rgba(255,212,129,0.4)]' : 'bg-surface-container-high'
              }`}
              aria-label={`Toggle ${r.label}`}
            >
              <div className={`absolute top-0.5 bottom-0.5 w-4.5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                toggles[i] ? 'left-[20px]' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
