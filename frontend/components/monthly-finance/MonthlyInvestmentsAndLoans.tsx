"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, Landmark, ShieldCheck, ArrowUpRight, 
  Clock, CheckCircle2, AlertCircle, ChevronRight, Sparkles 
} from 'lucide-react';
import { InvestmentDetail, LoanDetail } from './monthlyFinanceData';

interface MonthlyInvestmentsAndLoansProps {
  investments: InvestmentDetail[];
  loans: LoanDetail[];
  totalInvestments: number;
  totalLoansEmi: number;
}

export default function MonthlyInvestmentsAndLoans({
  investments,
  loans,
  totalInvestments,
  totalLoansEmi,
}: MonthlyInvestmentsAndLoansProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'investments' | 'loans'>('all');

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-on-surface flex items-center gap-2">
            <span>Investments &amp; Debt Commitments</span>
          </h2>
          <p className="text-[12px] text-on-surface-variant">
            Track wealth-building allocations and active loan amortization schedules
          </p>
        </div>

        <div className="flex items-center bg-surface-container-low border border-white/10 rounded-xl p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Commitments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('investments')}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === 'investments'
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Investments (${totalInvestments.toLocaleString()})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loans')}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === 'loans'
                ? 'bg-primary text-on-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Loans &amp; EMIs (${totalLoansEmi.toLocaleString()})
          </button>
        </div>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Investments Card */}
        {(activeTab === 'all' || activeTab === 'investments') && (
          <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-on-surface">Monthly Investments</h3>
                    <p className="text-[11px] text-on-surface-variant">Allocated to growth assets</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[16px] font-bold text-sky-400">${totalInvestments.toLocaleString()}</span>
                  <p className="text-[10px] text-on-surface-variant">5 Active Allocations</p>
                </div>
              </div>

              {/* Investment Items */}
              <div className="space-y-2 mt-3">
                {investments.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-surface-container/60 border border-white/5 hover:bg-surface-container transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-sky-400/50" />
                      <div>
                        <div className="text-[13px] font-semibold text-on-surface">{inv.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                            {inv.category}
                          </span>
                          <span>·</span>
                          <span className="text-emerald-400 font-medium">{inv.returnsYTD} YTD</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[13px] font-bold text-on-surface">
                        ${inv.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-400 mt-0.5">
                        <CheckCircle2 size={11} />
                        <span>{inv.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[12px]">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" />
                Portfolio growing at an average of 18.2% CAGR
              </span>
              <a href="/investments" className="text-primary hover:underline font-medium flex items-center gap-1">
                Portfolio Hub <ChevronRight size={13} />
              </a>
            </div>
          </div>
        )}

        {/* Loans & EMIs Card */}
        {(activeTab === 'all' || activeTab === 'loans') && (
          <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Landmark size={16} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-on-surface">Active Loans &amp; EMIs</h3>
                    <p className="text-[11px] text-on-surface-variant">Scheduled monthly obligations</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[16px] font-bold text-amber-400">${totalLoansEmi.toLocaleString()}</span>
                  <p className="text-[10px] text-on-surface-variant">2 Active Loans</p>
                </div>
              </div>

              {/* Loan Items */}
              <div className="space-y-2 mt-3">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3.5 rounded-xl bg-surface-container/60 border border-white/5 hover:bg-surface-container transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13px] font-semibold text-on-surface">{loan.loanName}</div>
                        <div className="text-[11px] text-on-surface-variant">{loan.accountNo} · {loan.loanType}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-bold text-amber-400">
                          ${loan.emiAmount.toLocaleString()}<span className="text-[11px] text-on-surface-variant font-normal">/mo</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
                          Auto-Debit Active
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                      <div>
                        <span className="text-on-surface-variant block">Principal</span>
                        <span className="text-on-surface font-medium">{loan.principalAmount}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Interest</span>
                        <span className="text-on-surface font-medium">{loan.interestRate}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Remaining</span>
                        <span className="text-on-surface font-medium">{loan.remainingTenure}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[12px]">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                All payments scheduled on auto-debit; zero delinquency
              </span>
              <a href="/loans" className="text-primary hover:underline font-medium flex items-center gap-1">
                Loan Center <ChevronRight size={13} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
