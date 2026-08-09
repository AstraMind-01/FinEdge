"use client";

import React, { useState } from "react";
import { Mail, Check, Trash2, ShieldCheck, ArrowRight } from "lucide-react";

interface MessageItem {
  id: string;
  sender: string;
  subject: string;
  time: string;
  read: boolean;
  content: string;
}

const INITIAL_MESSAGES: MessageItem[] = [
  { id: "M1", sender: "FinEdge Security", subject: "Annual KYC Verification Verified", time: "10 mins ago", read: false, content: "Your CKYC profile has been re-verified successfully." },
  { id: "M2", sender: "Bank Alerts", subject: "Monthly E-Statement Available", time: "2 hrs ago", read: false, content: "Your primary account statement for last month is ready for download." },
  { id: "M3", sender: "Wealth Advisor", subject: "Q3 Investment Report Published", time: "1 day ago", read: true, content: "Your mutual fund portfolio generated 18.4% annual returns." }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HeaderInboxDropdown({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [selectedMsg, setSelectedMsg] = useState<MessageItem | null>(null);

  if (!isOpen) return null;

  const unreadCount = messages.filter(m => !m.read).length;

  const markAllAsRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  const deleteMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-surface-container border border-outline-variant/20 rounded-2xl shadow-2xl z-50 text-on-surface p-4 flex flex-col gap-3 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-primary" />
          <span className="font-title-md font-bold text-sm">Secure Bank Inbox</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-[11px] text-primary hover:underline font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Detail View or List */}
      {selectedMsg ? (
        <div className="flex flex-col gap-3 p-3 bg-surface-high/60 rounded-xl border border-outline-variant/10 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-on-surface block text-sm">{selectedMsg.subject}</span>
              <span className="text-[10px] text-on-surface-variant">{selectedMsg.sender} • {selectedMsg.time}</span>
            </div>
            <button 
              onClick={() => setSelectedMsg(null)}
              className="text-[11px] text-primary font-medium hover:underline"
            >
              Back to list
            </button>
          </div>
          <p className="text-on-surface-variant leading-relaxed pt-1 border-t border-outline-variant/10">
            {selectedMsg.content}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 divide-y divide-outline-variant/10">
          {messages.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant">
              No inbox messages found.
            </div>
          ) : (
            messages.map(m => (
              <div 
                key={m.id}
                onClick={() => {
                  setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, read: true } : msg));
                  setSelectedMsg(m);
                }}
                className={`pt-2.5 pb-2.5 px-2 rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-3 ${m.read ? 'hover:bg-surface-high/40' : 'bg-primary/5 hover:bg-primary/10'}`}
              >
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  <div className="flex items-center gap-2">
                    {!m.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                    <span className={`text-xs truncate ${m.read ? 'text-on-surface font-medium' : 'text-on-surface font-bold'}`}>
                      {m.subject}
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant truncate">{m.content}</span>
                  <span className="text-[10px] text-on-surface-variant mt-0.5">{m.time}</span>
                </div>
                <button
                  onClick={(e) => deleteMessage(m.id, e)}
                  className="text-on-surface-variant hover:text-error transition-colors p-1 shrink-0"
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
          <span>Encrypted Message Stream</span>
        </div>
        <button onClick={onClose} className="hover:text-on-surface font-medium">Close</button>
      </div>
    </div>
  );
}
