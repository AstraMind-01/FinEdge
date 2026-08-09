"use client";

import React, { useState } from "react";
import { Mail, ShieldCheck, Trash2 } from "lucide-react";
import { useAccounts, AppInboxMessage } from "../../context/AccountContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeaderInboxDropdown({ isOpen, onClose }: Props) {
  const { inboxMessages, inboxCount, markInboxRead, markAllInboxRead, deleteInboxMessage } = useAccounts();
  const [selectedMsg, setSelectedMsg] = useState<AppInboxMessage | null>(null);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteInboxMessage(id);
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-surface-container border border-outline-variant/20 rounded-2xl shadow-2xl z-50 text-on-surface p-4 flex flex-col gap-3 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-primary" />
          <span className="font-title-md font-bold text-sm">Secure Bank Inbox</span>
          {inboxCount > 0 && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full">
              {inboxCount} New
            </span>
          )}
        </div>
        {inboxCount > 0 && (
          <button 
            onClick={markAllInboxRead}
            className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Detail View or List */}
      {selectedMsg ? (
        <div className="flex flex-col gap-3 p-3.5 bg-surface-high/60 rounded-xl border border-outline-variant/10 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-on-surface block text-sm">{selectedMsg.subject}</span>
              <span className="text-[10px] text-on-surface-variant">{selectedMsg.sender} • {selectedMsg.timeAgo}</span>
            </div>
            <button 
              onClick={() => setSelectedMsg(null)}
              className="text-[11px] text-primary font-medium hover:underline cursor-pointer"
            >
              Back to list
            </button>
          </div>
          <p className="text-on-surface-variant leading-relaxed pt-2 border-t border-outline-variant/10 text-[11px]">
            {selectedMsg.content}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 divide-y divide-outline-variant/10">
          {inboxMessages.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center gap-2">
              <Mail size={32} className="text-on-surface-variant opacity-30" />
              <span className="text-xs font-bold text-on-surface">Inbox is Empty</span>
              <p className="text-[11px] text-on-surface-variant max-w-xs m-0">
                Official transaction advice, statements, and security notices will be delivered here automatically upon system events.
              </p>
            </div>
          ) : (
            inboxMessages.map(m => (
              <div 
                key={m.id}
                onClick={() => {
                  markInboxRead(m.id);
                  setSelectedMsg(m);
                }}
                className={`pt-2.5 pb-2.5 px-2 rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-3 ${m.read ? 'hover:bg-surface-high/40' : 'bg-primary/5 hover:bg-primary/10'}`}
              >
                <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                    <span className={`text-xs truncate ${m.read ? 'text-on-surface font-medium' : 'text-on-surface font-bold'}`}>
                      {m.subject}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant truncate">{m.content}</span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">{m.sender} • {m.timeAgo}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(m.id, e)}
                  className="text-on-surface-variant hover:text-red-400 transition-colors p-1 shrink-0 cursor-pointer"
                  title="Delete message"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-1">
          <ShieldCheck size={14} className="text-tertiary" />
          <span>Encrypted Bank Message Stream</span>
        </div>
        <button onClick={onClose} className="hover:text-on-surface font-medium cursor-pointer">Close</button>
      </div>
    </div>
  );
}
