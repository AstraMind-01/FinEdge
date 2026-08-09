import React from 'react';

export default function SpendingAnalytics() {
  return (
    <div className="lg:col-span-4 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col h-full items-center">
      <h3 className="font-title-md text-[16px] font-semibold text-on-surface mb-6 self-start w-full truncate">Spending Analytics</h3>
      <div className="relative w-full max-w-[160px] aspect-square flex items-center justify-center shrink-0 mt-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle className="text-secondary opacity-20" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="12"></circle>
          <circle className="text-secondary transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="100.5 251.2" strokeDashoffset="0" strokeWidth="12"></circle>
          <circle className="text-tertiary transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="62.8 251.2" strokeDashoffset="-100.5" strokeWidth="12"></circle>
          <circle className="text-error transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="37.6 251.2" strokeDashoffset="-163.3" strokeWidth="12"></circle>
          <circle className="text-primary transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="25.1 251.2" strokeDashoffset="-200.9" strokeWidth="12"></circle>
          <circle className="text-outline-variant transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="25.1 251.2" strokeDashoffset="-226" strokeWidth="12"></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider truncate">Total Spent</span>
          <span className="font-title-md text-on-surface font-semibold text-[16px] mt-0.5 truncate">₹45,210</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-auto w-full pt-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Shopping</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">40%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Bills</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">25%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-error shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Food</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">15%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Travel</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">10%</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <div className="w-2.5 h-2.5 rounded-full bg-outline-variant shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Others</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">10%</span>
        </div>
      </div>
    </div>
  );
}
