"use client";

import React, { useState } from 'react';
import { 
  History, Search, Filter, ArrowDownLeft, ArrowUpRight, 
  CheckCircle2, Clock, Download, ChevronRight 
} from 'lucide-react';
import { MonthlyTransactionItem } from './monthlyFinanceData';

interface MonthlyTransactionTimelineProps {
  transactions: MonthlyTransactionItem[];
  monthLabel: string;
}

export default function MonthlyTransactionTimeline({
  transactions,
  monthLabel,
}: MonthlyTransactionTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.method.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || t.category.toUpperCase().includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold text-on-surface flex items-center gap-2">
            <History size={18} className="text-primary" />
            <span>Monthly Activity Timeline</span>
          </h2>
          <p className="text-[12px] text-on-surface-variant">
            Full chronological statement of financial events in {monthLabel}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-surface-container border border-white/10 rounded-xl text-[12px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 w-44"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-container border border-white/10 rounded-xl text-[12px] text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="INCOME">Income &amp; Credits</option>
            <option value="HOUSING">Housing &amp; Rent</option>
            <option value="INVESTMENT">Investments &amp; SIPs</option>
            <option value="LOAN">Loans &amp; EMIs</option>
            <option value="INSURANCE">Insurance</option>
            <option value="GROCERIES">Groceries &amp; Food</option>
            <option value="UTILITIES">Utilities &amp; Bills</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2 mt-1 max-h-[380px] overflow-y-auto pr-1">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const isCredit = item.type === 'CREDIT';
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-surface-container/60 border border-white/5 hover:bg-surface-container transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCredit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                      <span className="font-medium text-on-surface/80">{item.date}</span>
                      <span>·</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant">
                        {item.category}
                      </span>
                      <span>·</span>
                      <span>{item.method}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-[14px] font-bold ${isCredit ? 'text-emerald-400' : 'text-on-surface'}`}>
                    {isCredit ? '+' : '-'}${item.amount.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] text-on-surface-variant mt-0.5">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span>{item.status}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-surface-container/30 rounded-xl border border-dashed border-white/10 text-on-surface-variant text-[13px]">
            No activity matches your search criteria.
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[12px] text-on-surface-variant">
        <span>Showing {filtered.length} transactions for {monthLabel}</span>
        <a href="/transactions" className="text-primary hover:underline font-medium flex items-center gap-1">
          Complete Banking Statement <ChevronRight size={13} />
        </a>
      </div>
    </div>
  );
}
