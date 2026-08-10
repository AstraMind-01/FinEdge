import React from 'react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadCount: number;
}

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'security', label: 'Security' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'offers', label: 'Offers & Updates' }
];

export default function FilterBar({ activeTab, setActiveTab, searchQuery, setSearchQuery, unreadCount }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-xl border border-white/5 shadow-sm">
      <div className="flex items-center overflow-x-auto w-full md:w-auto scrollbar-hide gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-primary/10 text-primary' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'}
            `}
          >
            {tab.label}
            {tab.id === 'unread' && unreadCount > 0 && (
              <span className={`ml-2 inline-flex items-center justify-center h-5 px-1.5 min-w-[20px] rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative w-full md:w-[280px] shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container-high border border-white/10 rounded-lg pl-9 pr-4 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
        />
      </div>
    </div>
  );
}
