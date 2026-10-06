"use client";

import React, { useState } from "react";
import { Transaction, Account } from "../../types";
import { X, Search, Download, Filter, ArrowDownLeft, ArrowUpRight, ShoppingBag, Utensils, Briefcase, User } from "lucide-react";

interface ViewAllTransactionsModalProps {
  transactions: Transaction[];
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export default function ViewAllTransactionsModal({ transactions, account, isOpen, onClose, onSelectTransaction }: ViewAllTransactionsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);
  };

  const getIcon = (category: string, type: string) => {
    if (category === 'Shopping') return <ShoppingBag className="text-secondary" size={18} />;
    if (category === 'Food') return <Utensils className="text-on-surface-variant" size={18} />;
    if (category === 'Transfer' && type === 'CREDIT') return <ArrowDownLeft className="text-tertiary" size={18} />;
    if (category === 'Transfer' && type === 'DEBIT') return <ArrowUpRight className="text-error" size={18} />;
    if (category === 'Salary') return <Briefcase className="text-tertiary" size={18} />;
    return <User className="text-primary" size={18} />;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-3xl rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-on-surface max-h-[85vh] z-[10000]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight font-headline-lg">Complete Transaction History</h2>
            <p className="text-xs text-on-surface-variant">
              Showing records for {account ? `${account.name} (${account.maskedNumber})` : 'All Accounts'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 text-on-surface-variant" size={16} />
            <input
              type="text"
              placeholder="Search merchant, category, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-high border border-outline-variant/20 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          <div className="flex bg-surface-high/40 p-1 rounded-xl border border-outline-variant/10 text-xs w-full md:w-auto">
            {(["ALL", "CREDIT", "DEBIT"] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all ${filterType === type ? 'bg-primary text-on-primary font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {type === "ALL" ? "All Txns" : type === "CREDIT" ? "Credits (+)" : "Debits (-)"}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="flex-1 overflow-y-auto max-h-[400px] border border-outline-variant/10 rounded-xl bg-surface-high/20 divide-y divide-outline-variant/10">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm">
              No transactions match your search filter.
            </div>
          ) : (
            filteredTransactions.map(tx => (
              <div 
                key={tx.id}
                onClick={() => { onSelectTransaction(tx); }}
                className="p-3.5 flex items-center justify-between hover:bg-surface-high/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-high flex items-center justify-center shrink-0">
                    {getIcon(tx.category, tx.type)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">{tx.merchantName}</span>
                    <span className="text-[11px] text-on-surface-variant">{tx.date} • <strong className="font-normal">{tx.category}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono text-xs font-bold block ${tx.type === 'CREDIT' ? 'text-tertiary' : 'text-on-surface'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">{tx.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20 text-xs">
          <span className="text-on-surface-variant font-mono">Showing {filteredTransactions.length} of {transactions.length} records</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
