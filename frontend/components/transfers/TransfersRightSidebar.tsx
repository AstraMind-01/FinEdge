"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Star, History, CalendarClock, TrendingUp, Send, Edit2, XCircle } from 'lucide-react';
import { MockApi } from '../../lib/mockApi';
import { Beneficiary, Transaction, ScheduledTransfer } from '../../types';
import { Skeleton } from '../ui/skeleton';

export default function TransfersRightSidebar() {
  const [favorites, setFavorites] = useState<Beneficiary[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]);
  const [scheduledTransfers, setScheduledTransfers] = useState<ScheduledTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [bens, txns, sched] = await Promise.all([
        MockApi.getBeneficiaries(),
        MockApi.getTransactions("ALL"),
        MockApi.getScheduledTransfers()
      ]);
      setFavorites(bens.slice(0, 4));
      // filter to only transfer type and sort by date
      setRecentTransfers(txns.filter(t => t.category === "Transfer" && t.type === "DEBIT").slice(0, 4));
      setScheduledTransfers(sched);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.abs(val));
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'SUCCESS') return <span className="text-[10px] font-bold text-tertiary">Success</span>;
    if (status === 'PENDING') return <span className="text-[10px] font-bold text-secondary">Pending</span>;
    if (status === 'FAILED') return <span className="text-[10px] font-bold text-error">Failed</span>;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
        <Skeleton className="h-[250px] rounded-xl" />
        <Skeleton className="h-[250px] rounded-xl" />
        <Skeleton className="h-[250px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full lg:w-[320px] xl:w-[380px] shrink-0">
      
      {/* Favorite Beneficiaries */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
          <Star size={16} className="text-primary" />
          <h3 className="font-title-md font-semibold text-on-surface">Favorite Beneficiaries</h3>
        </div>
        <div className="flex flex-col gap-3">
          {favorites.map(ben => (
            <div key={ben.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-[13px] font-bold text-on-surface-variant">
                  {ben.name.charAt(0)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold text-on-surface truncate w-[140px]">{ben.name}</span>
                  <span className="text-[11px] text-on-surface-variant font-mono">{ben.bankName}</span>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                <Send size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Transfers */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <History size={16} className="text-primary" />
            <h3 className="font-title-md font-semibold text-on-surface">Recent Transfers</h3>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {recentTransfers.map(t => (
            <div key={t.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-on-surface truncate w-[140px]">{t.merchantName}</span>
                <span className="text-[11px] text-on-surface-variant">{t.date}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[14px] font-bold text-on-surface">{formatCurrency(t.amount)}</span>
                {getStatusBadge(t.status)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scheduled Transfers */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
          <CalendarClock size={16} className="text-primary" />
          <h3 className="font-title-md font-semibold text-on-surface">Scheduled Transfers</h3>
        </div>
        <div className="flex flex-col gap-4">
          {scheduledTransfers.map(sch => (
            <div key={sch.id} className="flex flex-col gap-2 bg-surface-container-low p-3 rounded-lg border border-outline-variant/5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-on-surface">{sch.beneficiaryName}</span>
                <span className="text-[13px] font-bold text-primary">{formatCurrency(sch.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant flex items-center gap-1.5"><CalendarClock size={12}/> {sch.nextDate}</span>
                <span className="text-[11px] text-on-surface-variant bg-surface px-1.5 py-0.5 rounded border border-outline-variant/10">{sch.frequency}</span>
              </div>
              <div className="flex items-center justify-end gap-3 mt-1 pt-2 border-t border-outline-variant/5">
                <button className="text-[11px] font-medium text-primary flex items-center gap-1 hover:underline"><Edit2 size={10}/> Edit</button>
                <button className="text-[11px] font-medium text-error flex items-center gap-1 hover:underline"><XCircle size={10}/> Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Transfer Limits */}
      <Card className="p-5 flex flex-col gap-4 bg-surface-container shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <h3 className="font-title-md font-semibold text-on-surface">Daily Transfer Limit</h3>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-on-surface font-medium">₹45,000 used</span>
            <span className="text-on-surface-variant">₹2,00,000</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '22.5%' }}></div>
          </div>
          <button className="text-[12px] text-primary font-semibold mt-2 hover:underline text-left">Request Limit Increase</button>
        </div>
      </Card>

    </div>
  );
}
