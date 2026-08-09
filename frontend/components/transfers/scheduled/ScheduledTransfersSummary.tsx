import React from 'react';
import { Card } from '../../ui/card';
import { ScheduledTransfer } from '../../../types';
import { CalendarClock, IndianRupee, Bell, AlertTriangle } from 'lucide-react';

interface ScheduledTransfersSummaryProps {
  transfers: ScheduledTransfer[];
}

export default function ScheduledTransfersSummary({ transfers }: ScheduledTransfersSummaryProps) {
  
  const activeCount = transfers.filter(t => t.status === 'ACTIVE').length;
  
  // Calculate total amount for this month (simplified logic for demo: just sum all active)
  const totalAmount = transfers.filter(t => t.status === 'ACTIVE').reduce((sum, t) => sum + t.amount, 0);
  
  // Find next due
  const upcoming = transfers
    .filter(t => t.status === 'ACTIVE' && new Date(t.nextDate) >= new Date())
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
  const nextDue = upcoming.length > 0 ? upcoming[0] : null;

  const failedCount = transfers.filter(t => t.status === 'FAILED').length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      
      {/* Active Count */}
      <Card className="p-5 flex flex-col justify-between gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-on-surface-variant">Active Schedules</span>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarClock size={16} className="text-primary" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[24px] font-display-sm font-bold text-on-surface">{activeCount}</span>
          <span className="text-[11px] text-on-surface-variant mt-1">Transfers running automatically</span>
        </div>
      </Card>

      {/* Total Amount */}
      <Card className="p-5 flex flex-col justify-between gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-on-surface-variant">Total Scheduled</span>
          <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center">
            <IndianRupee size={16} className="text-tertiary" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[24px] font-display-sm font-bold text-on-surface">{formatCurrency(totalAmount)}</span>
          <span className="text-[11px] text-on-surface-variant mt-1">Estimated debit this month</span>
        </div>
      </Card>

      {/* Next Due */}
      <Card className="p-5 flex flex-col justify-between gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-on-surface-variant">Next Transfer Due</span>
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <Bell size={16} className="text-secondary" />
          </div>
        </div>
        <div className="flex flex-col">
          {nextDue ? (
            <>
              <span className="text-[14px] font-bold text-on-surface truncate">{nextDue.beneficiaryName}</span>
              <span className="text-[12px] text-on-surface-variant mt-1">
                {nextDue.nextDate} • {formatCurrency(nextDue.amount)}
              </span>
            </>
          ) : (
            <span className="text-[13px] text-on-surface-variant">No upcoming transfers</span>
          )}
        </div>
      </Card>

      {/* Failed Count */}
      <Card className={`p-5 flex flex-col justify-between gap-4 shadow-sm border ${failedCount > 0 ? 'bg-error/5 border-error/20' : 'bg-surface-container border-outline-variant/10'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[13px] font-medium ${failedCount > 0 ? 'text-error' : 'text-on-surface-variant'}`}>Failed / Retries</span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${failedCount > 0 ? 'bg-error/20 text-error' : 'bg-outline-variant/10 text-on-surface-variant'}`}>
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className={`text-[24px] font-display-sm font-bold ${failedCount > 0 ? 'text-error' : 'text-on-surface'}`}>{failedCount}</span>
          <span className={`text-[11px] mt-1 ${failedCount > 0 ? 'text-error/80' : 'text-on-surface-variant'}`}>Action required</span>
        </div>
      </Card>

    </div>
  );
}
