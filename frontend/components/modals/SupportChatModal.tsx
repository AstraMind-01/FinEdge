"use client";

import React, { useState } from "react";
import { X, Send, Bot, User, ShieldCheck, Headphones, Sparkles } from "lucide-react";

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
}

export default function SupportChatModal({ isOpen, onClose }: SupportChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello Soumya! 👋 I'm your FinEdge AI Support Assistant. How can I assist you with your fund transfer today?",
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "Thank you for reaching out! Your transfer is protected by FinEdge 256-bit encryption. Is there anything specific about limits or account details I can clarify?";
      
      const lower = userText.toLowerCase();
      if (lower.includes("limit") || lower.includes("maximum")) {
        botReply = "Your daily transfer limit is ₹2,00,000 for Savings Account and ₹5,00,000 for Business Current Account. You can request a limit increase directly from the transfers sidebar!";
      } else if (lower.includes("fee") || lower.includes("charge")) {
        botReply = "NEFT, RTGS, and UPI transfers are 100% free! IMPS transfers over ₹50,000 carry a nominal bank fee of ₹5.";
      } else if (lower.includes("failed") || lower.includes("stuck") || lower.includes("problem")) {
        botReply = "If a transfer fails or times out, funds remain safe and are automatically reversed to your account within 2-24 hours under RBI guidelines. Reference ticket #TKT-8891 has been logged.";
      } else if (lower.includes("otp") || lower.includes("pin")) {
        botReply = "FinEdge staff will NEVER ask for your OTP or PIN over call, SMS, or email. Please keep your credentials secure.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-on-surface h-[540px] z-[10000]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight font-headline-lg flex items-center gap-1.5">
                FinEdge Support Assistant <Sparkles size={14} className="text-primary" />
              </h2>
              <span className="text-xs text-tertiary font-medium">● Online 24/7 Priority Desk</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Bot size={14} />
                </div>
              )}
              <div className={`flex flex-col gap-1 max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-on-primary font-medium rounded-tr-none' 
                    : 'bg-surface-high border border-outline-variant/10 text-on-surface rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-on-surface-variant px-1 font-mono">{msg.time}</span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Bot size={14} className="animate-pulse text-primary" />
              <span>FinEdge AI is typing...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question (e.g. transfer limit, fees)..."
            className="flex-1 bg-surface-high border border-outline-variant/20 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-primary text-on-primary rounded-xl hover:shadow-[0_0_12px_rgba(240,180,41,0.4)] disabled:opacity-40 transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
