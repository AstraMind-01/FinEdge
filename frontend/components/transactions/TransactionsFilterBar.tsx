"use client";

import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Account } from '../../types';

export interface TransactionFilters {
  searchQuery: string;
  accountId: string;
  dateRange: string;
  type: string;
  category: string;
  quickFilter: string | null;
}

interface TransactionsFilterBarProps {
  filters: TransactionFilters;
  onFilterChange: (updated: Partial<TransactionFilters>) => void;
  accounts: Account[];
}

export default function TransactionsFilterBar({ filters, onFilterChange, accounts }: TransactionsFilterBarProps) {
  const quickFilters = ["This Month", "Last 7 Days", "Credits Only", "Debits Only"];

  const handleQuickFilterClick = (filter: string) => {
    if (filters.quickFilter === filter) {
      // Toggle off
      onFilterChange({ quickFilter: null, type: "all", dateRange: "any" });
    } else {
      let updated: Partial<TransactionFilters> = { quickFilter: filter };
      if (filter === "Credits Only") updated.type = "credit";
      else if (filter === "Debits Only") updated.type = "debit";
      else if (filter === "This Month") updated.dateRange = "this_month";
      else if (filter === "Last 7 Days") updated.dateRange = "last_7_days";
      onFilterChange(updated);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
      
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-on-surface-variant" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full h-[44px] bg-surface pl-10 pr-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            placeholder="Search transactions by name, amount, or reference..."
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
          
          {/* Accounts Dropdown */}
          <div className="w-[160px] shrink-0">
            <select
              value={filters.accountId}
              onChange={(e) => onFilterChange({ accountId: e.target.value })}
              className="w-full h-[44px] bg-surface border border-outline-variant/20 rounded-xl px-3 text-[13px] text-on-surface focus:outline-none focus:border-primary/50"
            >
              <option value="all" className="bg-[#191f2f] text-[#dde2f8]">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-[#191f2f] text-[#dde2f8]">
                  {acc.name} ({acc.maskedNumber})
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Range Dropdown */}
          <div className="w-[140px] shrink-0">
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value, quickFilter: null })}
              className="w-full h-[44px] bg-surface border border-outline-variant/20 rounded-xl px-3 text-[13px] text-on-surface focus:outline-none focus:border-primary/50"
            >
              <option value="any" className="bg-[#191f2f] text-[#dde2f8]">Any Date</option>
              <option value="today" className="bg-[#191f2f] text-[#dde2f8]">Today</option>
              <option value="yesterday" className="bg-[#191f2f] text-[#dde2f8]">Yesterday</option>
              <option value="this_month" className="bg-[#191f2f] text-[#dde2f8]">This Month</option>
              <option value="last_7_days" className="bg-[#191f2f] text-[#dde2f8]">Last 7 Days</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="w-[130px] shrink-0">
            <select
              value={filters.type}
              onChange={(e) => onFilterChange({ type: e.target.value, quickFilter: null })}
              className="w-full h-[44px] bg-surface border border-outline-variant/20 rounded-xl px-3 text-[13px] text-on-surface focus:outline-none focus:border-primary/50"
            >
              <option value="all" className="bg-[#191f2f] text-[#dde2f8]">All Types</option>
              <option value="credit" className="bg-[#191f2f] text-[#dde2f8]">Credit</option>
              <option value="debit" className="bg-[#191f2f] text-[#dde2f8]">Debit</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="w-[140px] shrink-0">
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="w-full h-[44px] bg-surface border border-outline-variant/20 rounded-xl px-3 text-[13px] text-on-surface focus:outline-none focus:border-primary/50"
            >
              <option value="all" className="bg-[#191f2f] text-[#dde2f8]">All Categories</option>
              <option value="Shopping" className="bg-[#191f2f] text-[#dde2f8]">Shopping</option>
              <option value="Bills" className="bg-[#191f2f] text-[#dde2f8]">Bills</option>
              <option value="Food" className="bg-[#191f2f] text-[#dde2f8]">Food</option>
              <option value="Transfer" className="bg-[#191f2f] text-[#dde2f8]">Transfer</option>
              <option value="Salary" className="bg-[#191f2f] text-[#dde2f8]">Salary</option>
              <option value="Investment" className="bg-[#191f2f] text-[#dde2f8]">Investment</option>
              <option value="Others" className="bg-[#191f2f] text-[#dde2f8]">Others</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Filters Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/10">
        <div className="flex items-center gap-2 text-on-surface-variant text-[12px] font-medium mr-2">
          <Filter size={14} /> Quick Filters:
        </div>
        {quickFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleQuickFilterClick(filter)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
              filters.quickFilter === filter
                ? 'bg-primary text-on-primary font-semibold shadow-[0_0_10px_rgba(240,180,41,0.3)]'
                : 'bg-surface text-on-surface-variant border border-outline-variant/20 hover:bg-surface-high hover:text-on-surface'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

    </div>
  );
}
