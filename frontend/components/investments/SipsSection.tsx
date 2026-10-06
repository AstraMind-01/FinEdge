"use client";

import React from "react";
import { BarChart3, Pause, Play, Edit3 } from "lucide-react";
import { SIP } from "../../types";

interface SipsSectionProps {
  sips: SIP[];
  onToggleStatus: (id: string) => void;
  onOpenEdit: (sip: SIP) => void;
}

export default function SipsSection({ sips, onToggleStatus, onOpenEdit }: SipsSectionProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-5 border border-white/5">
      <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-primary" /> SIP Overview
      </h3>
      <div className="space-y-3">
        {sips.map(sip => {
          const sipStatus = sip.status || 'ACTIVE';
          const sipMonthly = sip.monthlyAmount || sip.amount;
          const isPaused = sipStatus === 'PAUSED';
          return (
            <div key={sip.id} className="p-3.5 rounded-xl bg-surface-container border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <p className="text-on-surface text-xs font-bold truncate pr-2">{sip.fundName}</p>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${isPaused ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>{sipStatus}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div>
                  <p className="text-on-surface font-bold text-xs font-mono">₹{sipMonthly.toLocaleString('en-IN')}<span className="text-on-surface-variant font-normal text-[11px]">/mo</span></p>
                  <p className="text-on-surface-variant text-[11px] mt-0.5">Next: {sip.nextDebitDate}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    title={isPaused ? "Resume SIP" : "Pause SIP"}
                    onClick={() => onToggleStatus(sip.id)}
                    className="w-7 h-7 rounded-lg bg-surface-container-high border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                  >
                    {isPaused ? <Play size={13} className="text-tertiary" /> : <Pause size={13} />}
                  </button>
                  <button 
                    type="button"
                    title="Edit SIP Amount"
                    onClick={() => onOpenEdit(sip)}
                    className="w-7 h-7 rounded-lg bg-surface-container-high border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
