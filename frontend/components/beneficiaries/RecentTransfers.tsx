"use client";

import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { RecentBeneficiaryTransfer } from '../../types';

interface RecentTransfersProps {
  transfers: RecentBeneficiaryTransfer[];
  onQuickResend: (transfer: RecentBeneficiaryTransfer) => void;
}

export default function RecentTransfers({ transfers, onQuickResend }: RecentTransfersProps) {
  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold m-0 flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Recent Transfers
        </h3>
        <button type="button" className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors cursor-pointer">View All</button>
      </div>

      <div className="flex flex-col gap-3">
        {transfers.length === 0 ? (
          <div className="text-xs text-on-surface-variant text-center py-4">No recent transfers recorded.</div>
        ) : (
          transfers.map((transfer) => (
            <div 
              key={transfer.id} 
              onClick={() => onQuickResend(transfer)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-highest transition-colors group cursor-pointer border border-transparent hover:border-outline-variant/20"
              title="Click to quick re-send money"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center">
                  {transfer.avatarUrl ? (
                    <img src={transfer.avatarUrl} alt={transfer.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-on-surface-variant">{transfer.name.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{transfer.name}</span>
                  <span className="text-xs text-on-surface-variant">{transfer.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-semibold text-on-surface">{transfer.formattedAmount}</span>
                <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
