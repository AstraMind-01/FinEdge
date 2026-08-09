import React from 'react';
import { Plus } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

export default function AccountsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
      <div className="flex flex-col">
        <h1 className="font-headline-lg text-[24px] lg:text-[28px] font-bold text-on-surface leading-tight">My Accounts</h1>
        <p className="text-[13px] text-on-surface-variant mt-1">Manage all your accounts in one place</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-[160px]">
          <Select defaultValue="all">
            <SelectTrigger className="bg-surface-container border-outline-variant/30 h-[40px]">
              <SelectValue placeholder="Filter Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="fd">Fixed Deposit</SelectItem>
              <SelectItem value="rd">Recurring Deposit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button className="bg-primary text-on-primary px-4 h-[40px] rounded-lg hover:shadow-[0_0_15px_rgba(240,180,41,0.3)] transition-shadow text-[13px] font-medium flex items-center gap-2">
          <Plus size={16} />
          Add New Account
        </button>
      </div>
    </div>
  );
}
