"use client";
import React, { useEffect, useState } from 'react';
import { ShieldCheck, TrendingUp, MoreVertical, ArrowRight } from 'lucide-react';
import { MockApi } from '../../lib/mockApi';
import { Deposit } from '../../types';

export default function ActiveDepositsList() {
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
      <div className="flex flex-col gap-6 w-full">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface-container rounded-xl border border-surface-container-highest p-6 h-48 animate-pulse"></div>
        ))}
      </div>
    );
  }

  const fds = deposits.filter(d => d.type === "FD");
  const rds = deposits.filter(d => d.type === "RD");

  // Helper to calculate progress
  const getProgress = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const n = new Date().getTime();
    if (n < s) return 0;
    if (n > e) return 100;
    return ((n - s) / (e - s)) * 100;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* FDs Section */}
      {fds.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold m-0 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Fixed Deposits
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {fds.map(fd => (
              <div key={fd.id} className="bg-surface-container rounded-xl border border-surface-container-highest p-5 group hover:border-primary/50 transition-colors relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-on-surface m-0 group-hover:text-primary transition-colors">{fd.name}</h4>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider">{fd.id}</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container-highest transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-center mb-5 bg-[#1E293B] p-4 rounded-lg border border-surface-container-highest">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Principal Amount</p>
                    <p className="text-sm font-semibold text-on-surface tracking-wide">₹ {fd.principalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant mb-1">Interest Rate</p>
                    <p className="text-sm font-semibold text-primary">{fd.interestRate}% p.a.</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-on-surface-variant">Started: {formatDate(fd.startDate)}</span>
                    <span className="text-on-surface font-medium">Matures: {formatDate(fd.maturityDate)}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 mb-2 overflow-hidden">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${getProgress(fd.startDate, fd.maturityDate)}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-on-surface-variant">
                    Maturity Amount: <span className="font-semibold text-on-surface tracking-wide">₹ {fd.maturityAmount.toLocaleString('en-IN')}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 border border-surface-container-highest text-on-surface text-sm py-2 rounded-lg hover:bg-surface-container-highest transition-colors font-medium">
                    View Details
                  </button>
                  <button className="flex-1 bg-surface-container-highest text-on-surface text-sm py-2 rounded-lg hover:bg-surface-container-highest/80 transition-colors font-medium text-error hover:text-error/90">
                    Break FD
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RDs Section */}
      {rds.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold m-0 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Recurring Deposits
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rds.map(rd => (
              <div key={rd.id} className="bg-surface-container rounded-xl border border-surface-container-highest p-5 group hover:border-primary/50 transition-colors relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-on-surface m-0 group-hover:text-primary transition-colors">{rd.name}</h4>
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider">{rd.id}</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container-highest transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-center mb-5 bg-[#1E293B] p-4 rounded-lg border border-surface-container-highest">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-1">Monthly Installment</p>
                    <p className="text-sm font-semibold text-on-surface tracking-wide">₹ {rd.monthlyInstallment?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant mb-1">Accumulated</p>
                    <p className="text-sm font-semibold text-primary">₹ {rd.accumulatedAmount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-on-surface-variant">Next Due: {rd.nextDueDate ? formatDate(rd.nextDueDate) : '-'}</span>
                    <span className="text-on-surface font-medium">Matures: {formatDate(rd.maturityDate)}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 mb-2 overflow-hidden">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${getProgress(rd.startDate, rd.maturityDate)}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-on-surface-variant">
                    Maturity Amount: <span className="font-semibold text-on-surface tracking-wide">₹ {rd.maturityAmount.toLocaleString('en-IN')}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-surface-container-highest border border-surface-container-highest text-on-surface text-sm py-2 rounded-lg hover:bg-surface-container-highest/80 transition-colors font-medium flex items-center justify-center gap-2">
                    Pay Installment
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
