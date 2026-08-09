"use client";
import React, { useEffect, useState } from 'react';
import { Landmark, TrendingUp, CalendarClock, ShieldCheck } from 'lucide-react';
import { MockApi } from '../../lib/mockApi';
import { Deposit } from '../../types';

export default function DepositSummary() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const data = await MockApi.getDeposits();
        setDeposits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[120px] bg-surface-container rounded-xl border border-surface-container-highest animate-pulse"></div>
        ))}
      </div>
    );
  }

  const activeFDs = deposits.filter(d => d.type === "FD" && d.status === "ACTIVE");
  const activeRDs = deposits.filter(d => d.type === "RD" && d.status === "ACTIVE");
  
  const totalFdValue = activeFDs.reduce((sum, fd) => sum + fd.principalAmount, 0);
  const totalRdValue = activeRDs.reduce((sum, rd) => sum + (rd.accumulatedAmount || 0), 0);
  const totalValue = totalFdValue + totalRdValue;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Total Value */}
      <div className="bg-gradient-to-br from-[#1E293B] to-surface-container rounded-xl border border-surface-container-highest p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-[20px] group-hover:bg-primary/20 transition-all duration-500 pointer-events-none"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Landmark size={20} />
          </div>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant mb-1">Total Deposit Value</p>
          <h2 className="text-2xl font-bold text-on-surface m-0 tracking-tight">
            ₹ {totalValue.toLocaleString('en-IN')}
          </h2>
        </div>
      </div>

      {/* Active FDs */}
      <div className="bg-surface-container rounded-xl border border-surface-container-highest p-5 group hover:border-outline-variant transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface">
            <ShieldCheck size={20} />
          </div>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant mb-1">Active Fixed Deposits</p>
          <div className="flex items-end gap-3">
            <h2 className="text-2xl font-bold text-on-surface m-0 tracking-tight">{activeFDs.length}</h2>
            <span className="text-sm text-primary font-medium mb-0.5 border-b border-primary/30 pb-0.5">View Details</span>
          </div>
        </div>
      </div>

      {/* Active RDs */}
      <div className="bg-surface-container rounded-xl border border-surface-container-highest p-5 group hover:border-outline-variant transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface">
            <TrendingUp size={20} />
          </div>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant mb-1">Active Recurring Deposits</p>
          <div className="flex items-end gap-3">
            <h2 className="text-2xl font-bold text-on-surface m-0 tracking-tight">{activeRDs.length}</h2>
            <span className="text-sm text-primary font-medium mb-0.5 border-b border-primary/30 pb-0.5">View Details</span>
          </div>
        </div>
      </div>

      {/* Upcoming Maturity */}
      <div className="bg-surface-container rounded-xl border border-surface-container-highest p-5 group hover:border-outline-variant transition-colors relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/5 rounded-tl-full pointer-events-none"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <CalendarClock size={20} />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">Next 12M</span>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant mb-1">Upcoming Maturity</p>
          <h2 className="text-xl font-bold text-on-surface m-0 tracking-tight">₹ 1,35,000</h2>
          <p className="text-xs text-on-surface-variant mt-1">Due on 10 Jun 2026</p>
        </div>
      </div>
    </div>
  );
}
