import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DepositsHeader() {
  return (
    <div className="pt-4 pb-8 flex flex-col gap-6 relative z-10">
      
      {/* Top Row: Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 tracking-wider uppercase font-medium">
            <Link href="/accounts" className="hover:text-primary transition-colors cursor-pointer">My Accounts</Link>
            <ChevronRight size={14} />
            <span className="text-primary font-bold">Deposits</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface m-0 leading-tight">My Deposits</h1>
          <p className="text-base text-on-surface-variant mt-2">Manage your Fixed and Recurring Deposits in one place.</p>
        </div>
        
        <button className="group flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-primary text-on-primary bg-primary hover:bg-primary-fixed hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <Plus size={20} className="relative z-10" />
          <span className="font-semibold text-sm relative z-10">Open New Deposit</span>
        </button>
      </div>
      
    </div>
  );
}
