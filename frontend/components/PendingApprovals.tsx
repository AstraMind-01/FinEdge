import React from 'react';

export default function PendingApprovals() {
  return (
    <div className="lg:col-span-3 bg-surface-container rounded-xl p-6 shadow-sm border border-white/5 flex flex-col h-full">
      <h3 className="font-title-md text-[16px] font-semibold text-on-surface mb-4 truncate">Pending Approvals</h3>
      <div className="flex flex-col gap-3 flex-1 justify-between">
        <div className="flex flex-col gap-1 p-3 bg-surface-high rounded-lg border-l-2 border-primary">
          <div className="flex justify-between items-center w-full">
            <span className="text-[13px] font-medium text-on-surface truncate">Beneficiary Addition</span>
            <span className="text-[10px] text-on-surface-variant shrink-0 ml-2">2 hrs ago</span>
          </div>
          <span className="text-[12px] text-on-surface-variant truncate">Amit Sharma - HDFC Bank</span>
          <div className="flex justify-end mt-1">
            <button className="text-[11px] bg-primary/10 text-primary px-3 py-1 rounded hover:bg-primary/20 transition-colors font-medium">Approve</button>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-surface-high rounded-lg border-l-2 border-secondary">
          <div className="flex justify-between items-center w-full">
            <span className="text-[13px] font-medium text-on-surface truncate">Loan Application</span>
            <span className="text-[10px] text-on-surface-variant shrink-0 ml-2">1 day ago</span>
          </div>
          <span className="text-[12px] text-on-surface-variant truncate">Personal Loan - ₹5,00,000</span>
          <div className="flex justify-end mt-1">
            <button className="text-[11px] bg-secondary/10 text-secondary px-3 py-1 rounded hover:bg-secondary/20 transition-colors font-medium">Review</button>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-surface-high rounded-lg border-l-2 border-error">
          <div className="flex justify-between items-center w-full">
            <span className="text-[13px] font-medium text-on-surface truncate">High Value Transfer</span>
            <span className="text-[10px] text-on-surface-variant shrink-0 ml-2">Just now</span>
          </div>
          <span className="text-[12px] text-on-surface-variant truncate">RTGS Transfer to TechCorp</span>
          <div className="flex justify-end mt-1">
            <button className="text-[11px] bg-error/10 text-error px-3 py-1 rounded hover:bg-error/20 transition-colors font-medium">Verify OTP</button>
          </div>
        </div>
      </div>
    </div>
  );
}
