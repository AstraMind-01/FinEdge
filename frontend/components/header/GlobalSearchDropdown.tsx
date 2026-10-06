"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Transaction, Account } from "../../types";
import { 
  Landmark, ReceiptText, Search, ChevronRight, Sparkle
} from "lucide-react";
import { ALL_FEATURES, FeatureItem } from "./searchData";

interface Props {
  query: string;
  accounts: Account[];
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (id: string) => void;
  onOpenSupport?: () => void;
}

type TabType = "all" | "features" | "pages" | "accounts" | "transactions" | "cards-loans" | "security";

export default function GlobalSearchDropdown({ 
  query, 
  accounts, 
  transactions, 
  isOpen, 
  onClose, 
  onSelectAccount,
  onOpenSupport 
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cleanQuery = query.trim().toLowerCase();

  // 1. Filtered Features
  const matchedFeatures = useMemo(() => {
    if (!cleanQuery) return ALL_FEATURES.slice(0, 8); // show recommended when query is empty

    const terms = cleanQuery.split(/\s+/).filter(Boolean);

    return ALL_FEATURES.filter(item => {
      const targetText = `${item.title} ${item.description} ${item.category} ${item.badge} ${item.keywords.join(" ")}`.toLowerCase();
      // Match if all terms are present anywhere in the item metadata
      return terms.every(term => targetText.includes(term));
    });
  }, [cleanQuery]);

  // 2. Filtered Accounts
  const matchedAccounts = useMemo(() => {
    if (!cleanQuery) return [];
    return accounts.filter(a => 
      a.name.toLowerCase().includes(cleanQuery) || 
      a.maskedNumber.includes(cleanQuery) ||
      (a.accountNumber && a.accountNumber.includes(cleanQuery)) ||
      a.type.toLowerCase().includes(cleanQuery) ||
      (a.accountHolder && a.accountHolder.toLowerCase().includes(cleanQuery))
    );
  }, [accounts, cleanQuery]);

  // 3. Filtered Transactions
  const matchedTxns = useMemo(() => {
    if (!cleanQuery) return [];
    return transactions.filter(t => 
      t.merchantName.toLowerCase().includes(cleanQuery) ||
      t.category.toLowerCase().includes(cleanQuery) ||
      t.id.toLowerCase().includes(cleanQuery) ||
      (t.referenceId && t.referenceId.toLowerCase().includes(cleanQuery)) ||
      t.type.toLowerCase().includes(cleanQuery) ||
      String(t.amount).includes(cleanQuery)
    );
  }, [transactions, cleanQuery]);

  // Tab filtering logic
  const filteredFeatures = useMemo(() => {
    if (activeTab === "all") return matchedFeatures;
    if (activeTab === "features") return matchedFeatures.filter(f => f.badge === "Action" || f.badge === "Feature" || f.badge === "Calculator" || f.badge === "Apply");
    if (activeTab === "pages") return matchedFeatures.filter(f => f.badge === "Page");
    if (activeTab === "cards-loans") return matchedFeatures.filter(f => f.category === "Cards" || f.category === "Loans");
    if (activeTab === "security") return matchedFeatures.filter(f => f.category === "Security" || f.category === "Profile" || f.badge === "Security");
    return [];
  }, [matchedFeatures, activeTab]);

  const showAccounts = (activeTab === "all" || activeTab === "accounts") && matchedAccounts.length > 0;
  const showTransactions = (activeTab === "all" || activeTab === "transactions") && matchedTxns.length > 0;

  // Flatten active items for keyboard navigation
  const allSelectableItems = useMemo(() => {
    const list: Array<{ type: "feature" | "account" | "transaction"; data: any }> = [];
    filteredFeatures.forEach(f => list.push({ type: "feature", data: f }));
    if (showAccounts) matchedAccounts.forEach(a => list.push({ type: "account", data: a }));
    if (showTransactions) matchedTxns.forEach(t => list.push({ type: "transaction", data: t }));
    return list;
  }, [filteredFeatures, showAccounts, matchedAccounts, showTransactions, matchedTxns]);

  // Reset selected index on query or tab change
  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanQuery, activeTab]);

  // Keyboard navigation listener (ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1 < allSelectableItems.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : allSelectableItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const current = allSelectableItems[selectedIndex];
        if (current) {
          executeItemSelection(current);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allSelectableItems, selectedIndex]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const executeItemSelection = (item: { type: "feature" | "account" | "transaction"; data: any }) => {
    if (item.type === "feature") {
      const feat = item.data as FeatureItem;
      if (feat.path === "#support") {
        if (onOpenSupport) onOpenSupport();
        else window.dispatchEvent(new CustomEvent("open-support-chat"));
        onClose();
      } else {
        router.push(feat.path);
        onClose();
      }
    } else if (item.type === "account") {
      const acc = item.data as Account;
      onSelectAccount(acc.id);
      router.push("/accounts");
      onClose();
    } else if (item.type === "transaction") {
      router.push("/transactions");
      onClose();
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const getBadgeStyle = (badge: FeatureItem["badge"]) => {
    switch (badge) {
      case "Action":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Calculator":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Security":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Apply":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "AI Help":
        return "bg-primary/20 text-primary border-primary/30";
      case "Admin":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-surface-high/70 text-on-surface-variant border-outline-variant/30";
    }
  };

  if (!isOpen) return null;

  const totalResults = filteredFeatures.length + (showAccounts ? matchedAccounts.length : 0) + (showTransactions ? matchedTxns.length : 0);

  return (
    <div 
      ref={dropdownRef}
      className="absolute left-0 top-14 w-[350px] sm:w-[520px] md:w-[600px] bg-[#121316]/98 backdrop-blur-2xl border border-outline-variant/30 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-50 text-on-surface flex flex-col max-h-[520px] overflow-hidden animate-in fade-in duration-150"
    >
      {/* ── Category Filter Pills Bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all shrink-0 ${
            activeTab === "all" ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(240,180,41,0.3)]" : "bg-surface-high/50 text-on-surface-variant hover:text-on-surface"
          }`}
        >
          All Results
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all shrink-0 ${
            activeTab === "features" ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(240,180,41,0.3)]" : "bg-surface-high/50 text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Actions &amp; Features ({matchedFeatures.filter(f => f.badge !== "Page").length})
        </button>
        <button
          onClick={() => setActiveTab("pages")}
          className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all shrink-0 ${
            activeTab === "pages" ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(240,180,41,0.3)]" : "bg-surface-high/50 text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Pages ({matchedFeatures.filter(f => f.badge === "Page").length})
        </button>
        <button
          onClick={() => setActiveTab("cards-loans")}
          className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all shrink-0 ${
            activeTab === "cards-loans" ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(240,180,41,0.3)]" : "bg-surface-high/50 text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Cards &amp; Loans
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all shrink-0 ${
            activeTab === "security" ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(240,180,41,0.3)]" : "bg-surface-high/50 text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Security &amp; KYC
        </button>
        {matchedAccounts.length > 0 && (
          <button
            onClick={() => setActiveTab("accounts")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all shrink-0 ${
              activeTab === "accounts" ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(240,180,41,0.3)]" : "bg-surface-high/50 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Accounts ({matchedAccounts.length})
          </button>
        )}
        {matchedTxns.length > 0 && (
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide transition-all shrink-0 ${
              activeTab === "transactions" ? "bg-primary text-on-primary shadow-[0_0_10px_rgba(240,180,41,0.3)]" : "bg-surface-high/50 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Txns ({matchedTxns.length})
          </button>
        )}
      </div>

      {/* ── Scrollable Results Container ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[420px] custom-scrollbar">
        {totalResults === 0 ? (
          <div className="py-10 px-6 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-high/60 border border-outline-variant/30 flex items-center justify-center text-on-surface-variant">
              <Search size={22} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-on-surface">No exact match for &quot;{query}&quot;</span>
              <span className="text-xs text-on-surface-variant">Try searching for keywords like <b className="text-primary">monthly finance, loan, emi, transfer, freeze, sip, fd, passkey</b></span>
            </div>
          </div>
        ) : (
          <>
            {/* Features & Actions List */}
            {filteredFeatures.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <span>Features, Options &amp; Services ({filteredFeatures.length})</span>
                  <span>Press ↵ to jump</span>
                </div>

                <div className="space-y-1">
                  {filteredFeatures.map((feat, idx) => {
                    const Icon = feat.icon;
                    const isSelected = selectedIndex === idx;

                    return (
                      <div
                        key={feat.id}
                        onClick={() => executeItemSelection({ type: "feature", data: feat })}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? "bg-primary/10 border border-primary/30 shadow-[0_0_15px_rgba(240,180,41,0.1)]" 
                            : "bg-surface-high/30 hover:bg-surface-high/60 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "bg-primary text-on-primary" : "bg-surface-high text-primary"
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold truncate ${isSelected ? "text-primary" : "text-on-surface"}`}>
                                {feat.title}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${getBadgeStyle(feat.badge)}`}>
                                {feat.badge}
                              </span>
                            </div>
                            <span className="text-[11px] text-on-surface-variant/80 truncate">
                              {feat.description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-on-surface-variant hidden sm:inline-block">
                            {feat.category}
                          </span>
                          <ChevronRight size={14} className={`transition-transform ${isSelected ? "translate-x-0.5 text-primary" : "text-on-surface-variant/40"}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matching Accounts */}
            {showAccounts && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Matching Bank Accounts ({matchedAccounts.length})
                </span>
                <div className="space-y-1">
                  {matchedAccounts.map((acc, aIdx) => {
                    const globalIdx = filteredFeatures.length + aIdx;
                    const isSelected = selectedIndex === globalIdx;

                    return (
                      <div
                        key={acc.id}
                        onClick={() => executeItemSelection({ type: "account", data: acc })}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? "bg-primary/10 border border-primary/30" 
                            : "bg-surface-high/30 hover:bg-surface-high/60 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center text-primary shrink-0">
                            <Landmark size={16} />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-on-surface">{acc.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30">
                                {acc.type}
                              </span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              {acc.maskedNumber} • IFSC: {acc.ifsc || "FIN0008492"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-xs font-mono font-bold text-primary">
                            {formatCurrency(acc.balance)}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-bold uppercase">
                            {acc.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matching Transactions */}
            {showTransactions && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Matching Transactions ({matchedTxns.length})
                </span>
                <div className="space-y-1">
                  {matchedTxns.slice(0, 5).map((tx, tIdx) => {
                    const globalIdx = filteredFeatures.length + (showAccounts ? matchedAccounts.length : 0) + tIdx;
                    const isSelected = selectedIndex === globalIdx;

                    return (
                      <div
                        key={tx.id}
                        onClick={() => executeItemSelection({ type: "transaction", data: tx })}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? "bg-primary/10 border border-primary/30" 
                            : "bg-surface-high/30 hover:bg-surface-high/60 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === "CREDIT" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          }`}>
                            <ReceiptText size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-on-surface">{tx.merchantName}</span>
                            <span className="text-[10px] text-on-surface-variant">
                              {tx.date} • {tx.category} • Ref: {tx.id.slice(0, 10)}
                            </span>
                          </div>
                        </div>

                        <span className={`font-mono text-xs font-bold ${tx.type === "CREDIT" ? "text-emerald-400" : "text-on-surface"}`}>
                          {tx.type === "CREDIT" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Dropdown Footer with Quick Shortcuts ──────────────────────────────── */}
      <div className="px-4 py-2.5 bg-surface-high/40 border-t border-white/5 flex items-center justify-between text-[11px] text-on-surface-variant shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-[10px] font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-[10px] font-mono">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-[10px] font-mono">Esc</kbd>
            Close
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-primary/80 font-medium">
          <Sparkle size={12} />
          <span>Universal Banking Command</span>
        </div>
      </div>
    </div>
  );
}
