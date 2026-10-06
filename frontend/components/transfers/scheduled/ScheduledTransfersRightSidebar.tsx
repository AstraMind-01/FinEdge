"use client";

import React from 'react';
import { Card } from '../../ui/card';
import { ScheduledTransfer } from '../../../types';
import { Calendar, Home, RefreshCw, AlertTriangle, Lightbulb, TrendingUp, ChevronRight } from 'lucide-react';

interface ScheduledTransfersRightSidebarProps {
  transfers: ScheduledTransfer[];
  onQuickSchedule: (purpose: string) => void;
}

export default function ScheduledTransfersRightSidebar({ transfers, onQuickSchedule }: ScheduledTransfersRightSidebarProps) {
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const upcomingThisWeek = transfers
    .filter(t => t.status === 'ACTIVE')
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
    .slice(0, 3);

  const failedTransfers = transfers.filter(t => t.status === 'FAILED');

  return (
    <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
      
      {/* Failed Alerts (Conditional) */}
      {failedTransfers.length > 0 && (
        <Card className="p-4 flex flex-col gap-3 bg-error/5 shadow-sm border border-error/20">
          <div className="flex items-center gap-2 text-error">
            <AlertTriangle size={16} />
            <span className="font-bold text-[13px]">Action Required: Failed Transfers</span>
          </div>
          <div className="flex flex-col gap-2">
            {failedTransfers.map(t => (
              <div key={t.id} className="flex flex-col gap-1 p-2 bg-surface/50 rounded-lg border border-error/10">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-on-surface">{t.beneficiaryName}</span>
                  <span className="font-bold text-on-surface font-mono">{formatCurrency(t.amount)}</span>
                </div>
                <button 
                  onClick={() => onQuickSchedule(t.purpose)}
                  className="text-[11px] font-bold text-error bg-error/10 px-2.5 py-1 rounded-lg w-fit mt-1 hover:bg-error/20 transition-colors"
                >
                  Retry Now
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming This Week */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <h3 className="font-title-md font-semibold text-on-surface">Upcoming This Week</h3>
          </div>
        </div>
        
        <div className="flex flex-col gap-0 relative">
          {upcomingThisWeek.map((t, idx) => (
            <div key={t.id} className="flex gap-4 relative">
              {idx !== upcomingThisWeek.length - 1 && (
                <div className="absolute left-2.5 top-6 bottom-0 w-px bg-outline-variant/20"></div>
              )}
              <div className="flex flex-col items-center shrink-0 w-5 relative z-10 pt-1">
                <div className="w-5 h-5 rounded-full bg-surface-container-high border-2 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
              </div>
              <div className="flex flex-col gap-1 pb-6 w-full">
                <span className="text-[11px] font-bold text-primary tracking-wider uppercase font-mono">{t.nextDate}</span>
                <div 
                  onClick={() => onQuickSchedule(t.purpose)}
                  className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 mt-1 cursor-pointer hover:border-primary/40 hover:bg-surface-high/60 transition-all group"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[13px] text-on-surface group-hover:text-primary transition-colors">{t.beneficiaryName}</span>
                    <span className="text-[11px] text-on-surface-variant">{t.purpose}</span>
                  </div>
                  <span className="font-bold text-[14px] text-on-surface font-mono">{formatCurrency(t.amount)}</span>
                </div>
              </div>
            </div>
          ))}
          {upcomingThisWeek.length === 0 && (
            <span className="text-[12px] text-on-surface-variant text-center py-4">No transfers scheduled for this week.</span>
          )}
        </div>
      </Card>

      {/* Quick Schedule */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <h3 className="font-title-md font-semibold text-on-surface">Quick Schedule</h3>
        <div className="flex flex-col gap-2.5">
          
          <button 
            onClick={() => onQuickSchedule('EMI')}
            className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/20 bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors border border-outline-variant/10">
                <Home size={16} />
              </div>
              <span className="text-[13px] font-semibold text-on-surface">Schedule EMI</span>
            </div>
            <ChevronRight size={16} className="text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            onClick={() => onQuickSchedule('Rent')}
            className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/20 bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors border border-outline-variant/10">
                <RefreshCw size={16} />
              </div>
              <span className="text-[13px] font-semibold text-on-surface">Schedule Rent</span>
            </div>
            <ChevronRight size={16} className="text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            onClick={() => onQuickSchedule('SIP')}
            className="flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/20 bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 transition-colors border border-outline-variant/10">
                <TrendingUp size={16} />
              </div>
              <span className="text-[13px] font-semibold text-on-surface">Schedule SIP</span>
            </div>
            <ChevronRight size={16} className="text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>

        </div>
      </Card>

      {/* Tips */}
      <Card className="p-4 flex gap-3 bg-surface-container-low shadow-sm border border-outline-variant/10">
        <Lightbulb size={18} className="text-tertiary shrink-0 mt-0.5" />
        <p className="text-[12px] text-on-surface-variant leading-relaxed">
          Set up recurring transfers to automate bill payments, EMIs, and SIPs so you never miss a due date or pay a late fee!
        </p>
      </Card>

    </div>
  );
}
