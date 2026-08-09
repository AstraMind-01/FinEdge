"use client";

import React from 'react';
import { useAccounts } from '../context/AccountContext';

export default function SpendingAnalytics() {
  const { transactions } = useAccounts();

  // Filter DEBIT transactions
  const debitTxns = transactions.filter(t => t.type === 'DEBIT' || t.amount < 0);
  const totalSpent = debitTxns.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Group by category
  const categoryTotals: Record<string, number> = {
    Shopping: 0,
    Bills: 0,
    Food: 0,
    Travel: 0,
    Others: 0
  };

  debitTxns.forEach(t => {
    const cat = t.category;
    if (categoryTotals[cat] !== undefined) {
      categoryTotals[cat] += Math.abs(t.amount);
    } else {
      categoryTotals.Others += Math.abs(t.amount);
    }
  });

  const getPct = (amount: number) => {
    if (totalSpent === 0) return 0;
    return Math.round((amount / totalSpent) * 100);
  };

  const shoppingPct = getPct(categoryTotals.Shopping);
  const billsPct = getPct(categoryTotals.Bills);
  const foodPct = getPct(categoryTotals.Food);
  const travelPct = getPct(categoryTotals.Travel);
  const othersPct = getPct(categoryTotals.Others);

  // Fallback defaults if 0 spent
  const displayTotal = totalSpent > 0 ? totalSpent : 45210;
  const dispShopping = totalSpent > 0 ? shoppingPct : 40;
  const dispBills = totalSpent > 0 ? billsPct : 25;
  const dispFood = totalSpent > 0 ? foodPct : 15;
  const dispTravel = totalSpent > 0 ? travelPct : 10;
  const dispOthers = totalSpent > 0 ? othersPct : 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  // Circumference = 2 * PI * r = 2 * 3.14159 * 40 = 251.32
  const circ = 251.32;
  const sDash = (dispShopping / 100) * circ;
  const bDash = (dispBills / 100) * circ;
  const fDash = (dispFood / 100) * circ;
  const tDash = (dispTravel / 100) * circ;
  const oDash = (dispOthers / 100) * circ;

  const bOffset = -sDash;
  const fOffset = bOffset - bDash;
  const tOffset = fOffset - fDash;
  const oOffset = tOffset - tDash;

  return (
    <div className="lg:col-span-4 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col h-full items-center">
      <h3 className="font-title-md text-[16px] font-semibold text-on-surface mb-6 self-start w-full truncate">Spending Analytics</h3>
      
      <div className="relative w-full max-w-[160px] aspect-square flex items-center justify-center shrink-0 mt-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle className="text-surface-highest" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="12"></circle>
          
          {/* Shopping */}
          <circle 
            className="text-secondary transition-all duration-700 ease-out" 
            cx="50" cy="50" fill="transparent" r="40" 
            stroke="currentColor" strokeWidth="12" 
            strokeDasharray={`${sDash} ${circ}`} 
            strokeDashoffset="0"
          ></circle>

          {/* Bills */}
          <circle 
            className="text-tertiary transition-all duration-700 ease-out" 
            cx="50" cy="50" fill="transparent" r="40" 
            stroke="currentColor" strokeWidth="12" 
            strokeDasharray={`${bDash} ${circ}`} 
            strokeDashoffset={bOffset}
          ></circle>

          {/* Food */}
          <circle 
            className="text-error transition-all duration-700 ease-out" 
            cx="50" cy="50" fill="transparent" r="40" 
            stroke="currentColor" strokeWidth="12" 
            strokeDasharray={`${fDash} ${circ}`} 
            strokeDashoffset={fOffset}
          ></circle>

          {/* Travel */}
          <circle 
            className="text-primary transition-all duration-700 ease-out" 
            cx="50" cy="50" fill="transparent" r="40" 
            stroke="currentColor" strokeWidth="12" 
            strokeDasharray={`${tDash} ${circ}`} 
            strokeDashoffset={tOffset}
          ></circle>

          {/* Others */}
          <circle 
            className="text-outline-variant transition-all duration-700 ease-out" 
            cx="50" cy="50" fill="transparent" r="40" 
            stroke="currentColor" strokeWidth="12" 
            strokeDasharray={`${oDash} ${circ}`} 
            strokeDashoffset={oOffset}
          ></circle>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider truncate">Total Spent</span>
          <span className="font-title-md text-on-surface font-semibold text-[16px] mt-0.5 truncate">
            {formatCurrency(displayTotal)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-auto w-full pt-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Shopping</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">{dispShopping}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Bills</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">{dispBills}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-error shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Food</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">{dispFood}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Travel</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">{dispTravel}%</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <div className="w-2.5 h-2.5 rounded-full bg-outline-variant shrink-0"></div>
          <span className="text-[12px] text-on-surface-variant flex-1 truncate">Others</span>
          <span className="text-[12px] text-on-surface font-medium shrink-0">{dispOthers}%</span>
        </div>
      </div>
    </div>
  );
}
