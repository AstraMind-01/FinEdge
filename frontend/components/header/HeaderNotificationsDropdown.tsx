"use client";

import React from "react";
import { Bell, ArrowRightLeft, ShieldAlert, Sparkles, Check, CreditCard, Lock } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeaderNotificationsDropdown({ isOpen, onClose }: Props) {
  const { notifications, notificationsCount } = useAccounts();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    if (type === "DEBIT" || type === "CREDIT") return <ArrowRightLeft size={16} className="text-primary" />;
    if (type === "SECURITY") return <ShieldAlert size={16} className="text-teal-400" />;
    if (type === "CARD") return <CreditCard size={16} className="text-amber-400" />;
    return <Sparkles size={16} className="text-secondary" />;
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-surface-container border border-outline-variant/20 rounded-2xl shadow-2xl z-50 text-on-surface p-4 flex flex-col gap-3 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <span className="font-title-md font-bold text-sm">Notifications Stream</span>
          {notificationsCount > 0 && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full">
              {notificationsCount} New
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 divide-y divide-outline-variant/10">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-on-surface-variant">
            No notifications available.
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id}
              className={`pt-2.5 pb-2.5 px-2 rounded-lg transition-colors flex items-start gap-3 ${n.unread ? 'bg-primary/5' : 'hover:bg-surface-high/40'}`}
            >
              <div className="p-2 bg-surface-high rounded-lg shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${n.unread ? 'text-on-surface font-bold' : 'text-on-surface font-medium'}`}>
                    {n.title}
                  </span>
                  <span className="text-[10px] text-on-surface-variant shrink-0">{n.timeAgo}</span>
                </div>
                <span className="text-[11px] text-on-surface-variant truncate" title={n.subtitle}>{n.subtitle}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-2 border-t border-outline-variant/20 text-[11px]">
        <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface font-medium cursor-pointer">Close</button>
      </div>
    </div>
  );
}
