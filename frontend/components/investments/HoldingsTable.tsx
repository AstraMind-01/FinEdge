"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Holding } from "../../types";
import { categoryColors } from "./investmentData";

interface HoldingsTableProps {
  holdings: Holding[];
  onOpenBuyRedeem: (holding: Holding, type: 'BUY' | 'REDEEM') => void;
}

export default function HoldingsTable({ holdings, onOpenBuyRedeem }: HoldingsTableProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-6 pb-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-on-surface">My Holdings</h3>
        <span className="text-xs text-on-surface-variant">{holdings.length} Assets</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-wider">
              <th className="text-left px-6 py-3 font-medium">Fund / Stock</th>
              <th className="text-center px-4 py-3 font-medium">Category</th>
              <th className="text-right px-4 py-3 font-medium">Invested</th>
              <th className="text-right px-4 py-3 font-medium">Current Value</th>
              <th className="text-right px-4 py-3 font-medium">Returns</th>
              <th className="text-center px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => {
              const retAmt = h.returnAmount ?? (h.currentValue - h.investedAmount);
              const retPct = h.returnPercent ?? Number(((retAmt / (h.investedAmount || 1)) * 100).toFixed(2));
              const isProfit = retAmt >= 0;
              const hType = h.type ? h.type.replace('_', ' ') : 'Mutual Fund';
              return (
                <tr key={h.id} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container/30'} hover:bg-surface-container/50 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${categoryColors[h.category] || 'bg-primary/10 text-primary'}`}>
                        {h.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="text-on-surface font-bold text-xs">{h.name}</p>
                        <p className="text-on-surface-variant text-[11px]">{hType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${categoryColors[h.category] || 'border-white/10 text-on-surface'}`}>{h.category}</span>
                  </td>
                  <td className="px-4 py-4 text-right text-on-surface font-mono">₹{h.investedAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-right font-bold text-on-surface font-mono">₹{h.currentValue.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-right font-mono">
                    <div className={`flex items-center justify-end gap-1 font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {isProfit ? '+' : ''}{retPct}%
                    </div>
                    <p className={`text-[11px] ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>
                      {isProfit ? '+' : ''}₹{retAmt.toLocaleString('en-IN')}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        type="button"
                        onClick={() => onOpenBuyRedeem(h, 'BUY')}
                        className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[11px] font-bold hover:bg-primary/20 transition-colors"
                      >
                        Buy More
                      </button>
                      <button 
                        type="button"
                        onClick={() => onOpenBuyRedeem(h, 'REDEEM')}
                        className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-lg text-[11px] font-bold hover:text-on-surface transition-colors border border-white/5"
                      >
                        Redeem
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
