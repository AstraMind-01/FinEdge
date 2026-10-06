"use client";

import React, { useState } from 'react';
import { useAccounts } from '../context/AccountContext';
import PendingApprovalDialog from './modals/PendingApprovalDialog';

export default function PendingApprovals() {
  const { pendingApprovals, approvePendingItem } = useAccounts();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const getBorderColor = (type: string) => {
    if (type === 'BENEFICIARY') return 'border-primary';
    if (type === 'LOAN') return 'border-secondary';
    return 'border-error';
  };

  const getBtnClasses = (type: string) => {
    if (type === 'BENEFICIARY') return 'bg-primary/10 text-primary hover:bg-primary/20';
    if (type === 'LOAN') return 'bg-secondary/10 text-secondary hover:bg-secondary/20';
    return 'bg-error/10 text-error hover:bg-error/20';
  };

  const getBtnLabel = (type: string) => {
    if (type === 'BENEFICIARY') return 'Approve';
    if (type === 'LOAN') return 'Review';
    return 'Verify OTP';
  };

  return (
    <>
      <div className="lg:col-span-3 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col h-full">
        <h3 className="font-title-md text-[16px] font-semibold text-on-surface mb-4 truncate">Pending Approvals</h3>
        <div className="flex flex-col gap-3 flex-1 justify-between">
          {pendingApprovals.length === 0 ? (
            <div className="flex items-center justify-center h-full text-on-surface-variant text-xs py-8 text-center">
              All pending approvals cleared!
            </div>
          ) : (
            pendingApprovals.map(item => (
              <div key={item.id} className={`flex flex-col gap-1 p-3 bg-surface-high rounded-lg border-l-2 ${getBorderColor(item.type)}`}>
                <div className="flex justify-between items-center w-full">
                  <span className="text-[13px] font-medium text-on-surface truncate">{item.title}</span>
                  <span className="text-[10px] text-on-surface-variant shrink-0 ml-2">{item.timeAgo}</span>
                </div>
                <span className="text-[12px] text-on-surface-variant truncate">{item.subtitle}</span>
                <div className="flex justify-end mt-1">
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className={`text-[11px] px-3 py-1 rounded transition-colors font-medium ${getBtnClasses(item.type)}`}
                  >
                    {getBtnLabel(item.type)}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PendingApprovalDialog
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onApprove={approvePendingItem}
      />
    </>
  );
}
