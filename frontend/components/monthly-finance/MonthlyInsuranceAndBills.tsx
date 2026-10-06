"use client";

import React from 'react';
import { 
  ShieldCheck, Repeat, CalendarClock, CreditCard, 
  ExternalLink, ChevronRight, Zap, CheckCircle 
} from 'lucide-react';
import { InsuranceDetail, SubscriptionDetail } from './monthlyFinanceData';

interface MonthlyInsuranceAndBillsProps {
  insurance: InsuranceDetail[];
  subscriptions: SubscriptionDetail[];
  totalInsurance: number;
  totalSubscriptions: number;
}

export default function MonthlyInsuranceAndBills({
  insurance,
  subscriptions,
  totalInsurance,
  totalSubscriptions,
}: MonthlyInsuranceAndBillsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Insurance Protection Section */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-on-surface">Insurance Coverage &amp; Premiums</h3>
                <p className="text-[11px] text-on-surface-variant">Active policies protecting health and assets</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[16px] font-bold text-indigo-400">
                ${totalInsurance.toLocaleString()}<span className="text-[11px] text-on-surface-variant font-normal">/mo</span>
              </span>
              <p className="text-[10px] text-on-surface-variant">3 Active Policies</p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {insurance.map((ins) => (
              <div
                key={ins.id}
                className="p-3 rounded-xl bg-surface-container/60 border border-white/5 hover:bg-surface-container transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-[13px] font-semibold text-on-surface">{ins.policyName}</div>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                      {ins.policyType}
                    </span>
                    <span>·</span>
                    <span>Sum Insured: {ins.sumInsured}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[13px] font-bold text-on-surface">
                    ${ins.premiumAmount.toLocaleString()}<span className="text-[10px] text-on-surface-variant font-normal">/mo</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    ins.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {ins.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[12px]">
          <span className="text-on-surface-variant flex items-center gap-1.5">
            <CheckCircle size={13} className="text-emerald-400" />
            All policies up to date; health coverage valid nationwide
          </span>
          <span className="text-indigo-400 font-medium">Claims Protected</span>
        </div>
      </div>

      {/* Subscriptions & Recurring Bills Section */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Repeat size={16} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-on-surface">Subscriptions &amp; Recurring Bills</h3>
                <p className="text-[11px] text-on-surface-variant">Scheduled monthly auto-pay commitments</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[16px] font-bold text-purple-400">
                ${totalSubscriptions.toLocaleString()}<span className="text-[11px] text-on-surface-variant font-normal">/mo</span>
              </span>
              <p className="text-[10px] text-on-surface-variant">5 Subscriptions</p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-xl bg-surface-container/60 border border-white/5 hover:bg-surface-container transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-[13px] font-semibold text-on-surface">{sub.serviceName}</div>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                    <span className="text-on-surface-variant font-medium">{sub.category}</span>
                    <span>·</span>
                    <span>Via {sub.paymentMethod}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[13px] font-bold text-on-surface">
                    ${sub.amount.toLocaleString()}<span className="text-[10px] text-on-surface-variant font-normal">/mo</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-400 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Auto-Pay: {sub.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[12px]">
          <span className="text-on-surface-variant flex items-center gap-1.5">
            <Zap size={13} className="text-primary" />
            Auto-pay saves you from accidental overdue penalties
          </span>
          <button type="button" className="text-primary hover:underline font-medium flex items-center gap-1">
            Manage Mandates <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
