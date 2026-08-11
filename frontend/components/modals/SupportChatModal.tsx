"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Send, Bot, User, ShieldCheck, Headphones, Sparkles, ExternalLink, ArrowRight } from "lucide-react";

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  contextPage?: string;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  quickActions?: string[];
  actionRedirectUrl?: string;
}

export default function SupportChatModal({ isOpen, onClose, initialQuestion, contextPage }: SupportChatModalProps) {
  const router = useRouter();
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello Soumya! 👋 I'm Ayesha, your FinEdge AI Support Assistant. How can I assist you with your accounts, transfers, cards, or security today?",
      time: "Just now",
      quickActions: ["View Accounts", "Transfer Money", "View Cards", "Manage Watchlist"]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const initialQuestionSentRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && initialQuestion && initialQuestionSentRef.current !== initialQuestion) {
      initialQuestionSentRef.current = initialQuestion;
      const timer = setTimeout(() => {
        sendMessage(initialQuestion);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialQuestion]);

  if (!isOpen) return null;

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText.trim(),
          conversationId,
          userId: "usr_soumya_01",
          userName: "Soumya",
          contextPage: contextPage || "FinEdge Banking Platform",
          history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.reply || "Thank you for reaching out to FinEdge Priority Desk.",
          time: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickActions: data.quickActions || ["View Accounts", "Transfer Money", "Contact Support"],
          actionRedirectUrl: data.actionRedirectUrl
        }]);
      } else {
        throw new Error("Service response error");
      }
    } catch (err) {
      console.error("Support Assistant error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Thank you for reaching out! Ayesha is here to help. Your transfers are protected by FinEdge 256-bit encryption. Check your [Accounts](/accounts) or [Fund Transfers](/transfers/fund-transfer).",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        quickActions: ["View Accounts", "Transfer Money", "View Cards"]
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (actionLabel: string) => {
    const cleanLabel = actionLabel.trim().toLowerCase();

    // Map navigation quick actions directly to authenticated FinEdge routes
    if (cleanLabel === "view accounts" || cleanLabel === "check statement" || cleanLabel === "account details") {
      router.push("/accounts");
      onClose();
      return;
    }
    if (cleanLabel === "check transactions" || cleanLabel === "transaction history") {
      router.push("/transactions");
      onClose();
      return;
    }
    if (cleanLabel === "transfer money" || cleanLabel === "fund transfer") {
      router.push("/transfers/fund-transfer");
      onClose();
      return;
    }
    if (cleanLabel === "recharge mobile" || cleanLabel === "pay bills") {
      router.push("/transfers");
      onClose();
      return;
    }
    if (cleanLabel === "check kyc" || cleanLabel === "kyc profile") {
      router.push("/kyc-profile");
      onClose();
      return;
    }
    if (cleanLabel === "dispute transaction") {
      router.push("/disputes");
      onClose();
      return;
    }
    if (cleanLabel === "manage watchlist") {
      router.push("/investments");
      onClose();
      return;
    }
    if (cleanLabel === "view cards" || cleanLabel === "apply for new card" || cleanLabel === "freeze card") {
      router.push("/cards");
      onClose();
      return;
    }

    // Default: submit as prompt to Ayesha
    sendMessage(actionLabel);
  };

  // Helper to parse markdown links like [Label](url) into clickable Next.js router elements
  const renderFormattedText = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <button
          key={match.index}
          onClick={() => {
            router.push(url);
            onClose();
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold hover:bg-primary/20 transition-all cursor-pointer underline underline-offset-2"
        >
          {label} <ExternalLink size={11} className="shrink-0" />
        </button>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-on-surface h-[560px] z-[10000]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight font-headline-lg flex items-center gap-1.5 m-0">
                Ayesha — FinEdge AI Assistant <Sparkles size={14} className="text-primary" />
              </h2>
              <span className="text-xs text-tertiary font-medium">● Online 24/7 Priority Desk</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 custom-scrollbar">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5 font-bold text-xs">
                    A
                  </div>
                )}
                <div className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-on-primary font-medium rounded-tr-none' 
                      : 'bg-surface-high border border-outline-variant/10 text-on-surface rounded-tl-none whitespace-pre-line'
                  }`}>
                    {renderFormattedText(msg.text)}
                  </div>
                  <span className="text-[10px] text-on-surface-variant px-1 font-mono">{msg.time}</span>
                </div>
              </div>

              {/* Dynamic Quick Action Pills below Bot Messages */}
              {msg.sender === 'bot' && msg.quickActions && msg.quickActions.length > 0 && index === messages.length - 1 && (
                <div className="flex flex-wrap gap-1.5 pl-9 mt-1 animate-in fade-in duration-300">
                  {msg.quickActions.map((action, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickAction(action)}
                      className="px-3 py-1.5 rounded-full bg-surface-high hover:bg-primary/20 text-on-surface border border-outline-variant/20 hover:border-primary/40 text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:text-primary"
                    >
                      {action} <ArrowRight size={10} className="opacity-60 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant pl-9">
              <Bot size={14} className="animate-pulse text-primary" />
              <span>Ayesha is typing...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Ayesha about accounts, transfers, cards, fees..."
            className="flex-1 bg-surface-high border border-outline-variant/20 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-primary text-on-primary rounded-xl hover:shadow-[0_0_12px_rgba(240,180,41,0.4)] disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
