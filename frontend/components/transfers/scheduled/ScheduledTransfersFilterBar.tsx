import React from 'react';
import { Search, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../ui/button';

interface ScheduledTransfersFilterBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ScheduledTransfersFilterBar({
  activeTab, setActiveTab, searchQuery, setSearchQuery
}: ScheduledTransfersFilterBarProps) {
  
  const tabs = ["All", "Upcoming", "Recurring", "One-Time", "Paused", "Failed"];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 justify-between bg-surface-container-low p-2 rounded-2xl border border-outline-variant/20">
      
      {/* Scrollable Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-1 p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-surface shadow-sm text-on-surface border border-outline-variant/10' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar p-1">
        
        <Button variant="outline" className="h-9 px-3 bg-surface border-outline-variant/20 text-on-surface-variant hover:bg-surface-high font-medium text-[12px] flex items-center gap-2 rounded-xl shrink-0">
          Frequency <ChevronDown size={14} />
        </Button>
        
        <Button variant="outline" className="h-9 px-3 bg-surface border-outline-variant/20 text-on-surface-variant hover:bg-surface-high font-medium text-[12px] flex items-center gap-2 rounded-xl shrink-0">
          <CalendarIcon size={14} /> Date Range <ChevronDown size={14} />
        </Button>

        <div className="relative w-full min-w-[200px] max-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-on-surface-variant" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-surface pl-9 pr-4 rounded-xl border border-outline-variant/20 text-[13px] text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            placeholder="Search recipient..."
          />
        </div>
      </div>

    </div>
  );
}
