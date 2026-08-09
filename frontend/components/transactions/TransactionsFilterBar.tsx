"use client";
import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

export default function TransactionsFilterBar() {
  const quickFilters = ["This Month", "Last 7 Days", "Credits Only", "Debits Only"];
  const [activeFilter, setActiveFilter] = React.useState("This Month");

  return (
    <div className="flex flex-col gap-4 w-full bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
      
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-on-surface-variant" />
          </div>
          <input
            type="text"
            className="w-full h-[44px] bg-surface pl-10 pr-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            placeholder="Search transactions by name, amount, or reference..."
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
          <div className="w-[150px] shrink-0">
            <Select defaultValue="all">
              <SelectTrigger className="bg-surface border-outline-variant/20 h-[44px]">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="savings">Savings Account</SelectItem>
                <SelectItem value="current">Current Account</SelectItem>
                <SelectItem value="fd">Fixed Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-[150px] shrink-0">
            <Select defaultValue="any">
              <SelectTrigger className="bg-surface border-outline-variant/20 h-[44px]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-on-surface-variant" />
                  <SelectValue placeholder="Date Range" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Date</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="custom">Custom Range...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[130px] shrink-0">
            <Select defaultValue="all">
              <SelectTrigger className="bg-surface border-outline-variant/20 h-[44px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[130px] shrink-0">
            <Select defaultValue="all">
              <SelectTrigger className="bg-surface border-outline-variant/20 h-[44px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="bills">Bills</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/10">
        <div className="flex items-center gap-2 text-on-surface-variant text-[12px] font-medium mr-2">
          <Filter size={14} /> Quick Filters:
        </div>
        {quickFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-primary/10 text-primary border border-primary/20'
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
