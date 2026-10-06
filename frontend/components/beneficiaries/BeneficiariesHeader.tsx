import React from 'react';
import { ChevronRight, Plus, Search, Filter } from 'lucide-react';

interface BeneficiariesHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddBeneficiaryClick: () => void;
}

export default function BeneficiariesHeader({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onAddBeneficiaryClick
}: BeneficiariesHeaderProps) {
  return (
    <div className="pt-4 pb-8 flex flex-col gap-6 relative z-10">
      
      {/* Top Row: Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 tracking-wider uppercase font-medium">
            <span className="hover:text-primary transition-colors cursor-pointer">Transfers</span>
            <ChevronRight size={14} />
            <span className="text-primary font-bold">Beneficiaries</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface m-0 leading-tight">Manage Beneficiaries</h1>
          <p className="text-base text-on-surface-variant mt-2">Add, edit, or manage the people and accounts you send money to.</p>
        </div>
        
        <button 
          type="button"
          onClick={onAddBeneficiaryClick}
          className="group flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-primary text-on-primary bg-primary hover:bg-primary-fixed hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all duration-300 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <Plus size={20} className="relative z-10" />
          <span className="font-semibold text-sm relative z-10">Add New Beneficiary</span>
        </button>
      </div>

      {/* Bottom Row: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder="Search by name, bank, or account..." 
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-surface-container border border-surface-container-highest text-on-surface text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {["All", "Domestic", "International"].map(tab => (
            <button 
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'bg-surface-container border border-surface-container-highest text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
              }`}
            >
              {tab}
            </button>
          ))}
          <button 
            type="button"
            className="px-4 py-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-colors text-sm font-medium ml-auto flex items-center gap-2 cursor-pointer"
          >
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </div>
      
    </div>
  );
}
