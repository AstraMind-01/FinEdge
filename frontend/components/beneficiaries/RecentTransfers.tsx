import React from 'react';
import { History, ArrowRight } from 'lucide-react';

export default function RecentTransfers() {
  const recents = [
    { name: "Priya Sharma", amount: "₹ 15,000", date: "Today", avatarUrl: "https://i.pravatar.cc/150?u=priya" },
    { name: "Rahul Verma", amount: "₹ 8,500", date: "Yesterday", avatarUrl: null },
    { name: "Neha Gupta", amount: "₹ 25,000", date: "12 Aug", avatarUrl: "https://i.pravatar.cc/150?u=neha" },
  ];

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold m-0 flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Recent Transfers
        </h3>
        <button className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors">View All</button>
      </div>

      <div className="flex flex-col gap-4">
        {recents.map((transfer, i) => (
          <div key={i} className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-container-highest transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden shrink-0 flex items-center justify-center">
                {transfer.avatarUrl ? (
                  <img src={transfer.avatarUrl} alt={transfer.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-on-surface-variant">{transfer.name.substring(0,2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-on-surface">{transfer.name}</span>
                <span className="text-xs text-on-surface-variant">{transfer.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm font-semibold text-on-surface">{transfer.amount}</span>
              <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
